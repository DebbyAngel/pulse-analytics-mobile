import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session, User } from "@supabase/supabase-js";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { API_BASE_URL, Product, starterProducts, supabase } from "./backend";

type Item = { productId: string; quantity: number };
type Store = {
  products: Product[];
  cart: Item[];
  user: User | null;
  refreshProducts: () => Promise<void>;
  add: (id: string) => void;
  change: (id: string, delta: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  setError: (message: string | null) => void;
};

const Context = createContext<Store | null>(null);
const CART_KEY = "pulse-atelier-cart";
const cartStorageKey = (userId: string | null) => `${CART_KEY}:${userId ?? "guest"}`;

function parseCart(saved: string | null): Item[] {
  if (!saved) return [];
  try {
    const value: unknown = JSON.parse(saved);
    if (!Array.isArray(value)) return [];
    return value.filter(
      (item): item is Item =>
        typeof item?.productId === "string" &&
        Number.isInteger(item?.quantity) &&
        item.quantity >= 1 &&
        item.quantity <= 12,
    );
  } catch {
    return [];
  }
}

async function getServerCart(session: Session): Promise<{ items: Item[]; exists: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/cart`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "Could not load your saved cart.");
  return { items: parseCart(JSON.stringify(result.items ?? [])), exists: Boolean(result.exists) };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState(starterProducts);
  const [cart, setCart] = useState<Item[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [cartReady, setCartReady] = useState(false);
  const [cloudReady, setCloudReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hydrationId = useRef(0);
  const changedDuringHydration = useRef(false);

  const refreshProducts = useCallback(async () => {
    if (!supabase) return;
    const { data, error: fetchError } = await supabase
      .from("products")
      .select("id,name,slug,category,description,price,image_url,image_alt,badge,stock")
      .eq("active", true)
      .gt("stock", 0)
      .order("sort_order", { ascending: true });
    if (fetchError) throw fetchError;
    if (data) setProducts(data as Product[]);
  }, []);

  useEffect(() => {
    let active = true;
    const hydrate = async (session: Session | null) => {
      const version = ++hydrationId.current;
      changedDuringHydration.current = false;
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      setOwnerId(nextUser?.id ?? null);
      setCloudReady(false);

      const localKey = cartStorageKey(nextUser?.id ?? null);
      let localItems = parseCart(await AsyncStorage.getItem(localKey).catch(() => null));
      // Read carts from previous app versions as a guest cart only.
      if (!nextUser && localItems.length === 0) {
        localItems = parseCart(await AsyncStorage.getItem(CART_KEY).catch(() => null));
      }
      if (!active || version !== hydrationId.current) return;
      setCart(localItems);
      setCartReady(true);

      if (!session) {
        setCloudReady(true);
        return;
      }

      try {
        const serverCart = await getServerCart(session);
        if (!active || version !== hydrationId.current) return;
        if (!changedDuringHydration.current) {
          setCart(serverCart.exists ? serverCart.items : localItems);
        }
        setCloudReady(true);
        setError(null);
      } catch (cause) {
        if (!active || version !== hydrationId.current) return;
        setError(cause instanceof Error ? `Cart sync: ${cause.message}` : "Cart sync is unavailable.");
      }
    };

    const authListener = supabase?.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "SIGNED_OUT") {
        void hydrate(session);
      }
    });
    if (!supabase) void hydrate(null);

    const refreshTimer = setTimeout(() => {
      refreshProducts().catch((cause) => {
        if (active) setError(cause.message);
      });
    }, 0);
    return () => {
      active = false;
      clearTimeout(refreshTimer);
      authListener?.data.subscription.unsubscribe();
    };
  }, [refreshProducts]);

  useEffect(() => {
    if (!cartReady) return;
    const value = JSON.stringify(cart);
    AsyncStorage.setItem(cartStorageKey(ownerId), value).catch(() => {});
    if (!ownerId) AsyncStorage.setItem(CART_KEY, value).catch(() => {});
  }, [cart, cartReady, ownerId]);

  useEffect(() => {
    if (!cartReady || !user || !cloudReady || !supabase) return;
    const timer = setTimeout(() => {
      void (async () => {
        const { data } = await supabase!.auth.getSession();
        const session = data.session;
        if (!session || session.user.id !== user.id) return;
        try {
          const response = await fetch(`${API_BASE_URL}/api/cart`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ items: cart }),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error ?? "Could not save your cart.");
          setError(null);
        } catch (cause) {
          setError(cause instanceof Error ? `Cart sync: ${cause.message}` : "Cart sync is unavailable.");
        }
      })();
    }, 250);
    return () => clearTimeout(timer);
  }, [cart, cartReady, cloudReady, user]);

  const markCartChanged = useCallback(() => {
    changedDuringHydration.current = true;
  }, []);
  const add = useCallback((id: string) => {
    markCartChanged();
    setCart((items) => {
      const found = items.find((item) => item.productId === id);
      return found
        ? items.map((item) => item.productId === id ? { ...item, quantity: Math.min(12, item.quantity + 1) } : item)
        : [...items, { productId: id, quantity: 1 }];
    });
  }, [markCartChanged]);
  const change = useCallback((id: string, delta: number) => {
    markCartChanged();
    setCart((items) => items
      .map((item) => item.productId === id ? { ...item, quantity: Math.max(0, Math.min(12, item.quantity + delta)) } : item)
      .filter((item) => item.quantity > 0));
  }, [markCartChanged]);
  const remove = useCallback((id: string) => {
    markCartChanged();
    setCart((items) => items.filter((item) => item.productId !== id));
  }, [markCartChanged]);
  const clear = useCallback(() => {
    markCartChanged();
    setCart([]);
  }, [markCartChanged]);

  const signIn = async () => {
    if (!supabase) throw new Error("Sign-in needs the public Supabase settings in this app build.");
    const { makeRedirectUri } = await import("expo-auth-session");
    const WebBrowser = await import("expo-web-browser");
    WebBrowser.maybeCompleteAuthSession();
    const redirectTo = makeRedirectUri({ scheme: "pulseanalytics", path: "auth/callback" });
    const { data, error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, skipBrowserRedirect: true, queryParams: { access_type: "offline", prompt: "select_account" } },
    });
    if (authError || !data.url) throw authError ?? new Error("Google sign-in could not start.");
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== "success") throw new Error("Google sign-in was cancelled.");
    const code = new URL(result.url).searchParams.get("code");
    if (!code) throw new Error("Google sign-in did not return an authorization code.");
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) throw exchangeError;
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
  };

  const value = useMemo(
    () => ({ products, cart, user, refreshProducts, add, change, remove, clear, signIn, signOut, error, setError }),
    [products, cart, user, refreshProducts, error, add, change, clear, remove],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useStore() {
  const value = useContext(Context);
  if (!value) throw new Error("useStore must be used inside StoreProvider");
  return value;
}

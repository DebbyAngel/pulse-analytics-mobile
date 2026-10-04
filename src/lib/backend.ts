import "react-native-url-polyfill/auto";
import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const hasBackendConfig = Boolean(url && anonKey);
export const supabase = hasBackendConfig ? createClient(url, anonKey, { auth: {
  storage: { getItem: (key) => SecureStore.getItemAsync(key), setItem: (key, value) => SecureStore.setItemAsync(key, value), removeItem: (key) => SecureStore.deleteItemAsync(key) },
  autoRefreshToken: true, persistSession: true, detectSessionInUrl: false, flowType: "pkce",
} }) : null;
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://www.pulsetechanalytics.com";
export type Product = { id: string; name: string; slug: string; category: string; description: string; price: number; image_url: string; image_alt: string; badge: string | null; stock: number };
export const starterProducts: Product[] = [
  { id: "everyday-carryall", name: "Everyday backpack", slug: "everyday-backpack", category: "Travel", description: "A considered carryall for full days and spontaneous detours.", price: 35000, image_url: "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=1000&q=85", image_alt: "Blue backpack with tan leather details", badge: "Bestseller", stock: 24 },
  { id: "daylight-desk-lamp", name: "The Weekender", slug: "the-weekender", category: "Travel", description: "Room for a change of plans and everything that comes with it.", price: 40000, image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85", image_alt: "Minimal dark travel bag", badge: null, stock: 18 },
  { id: "slow-morning-mug", name: "Market day tote", slug: "market-day-tote", category: "Everyday", description: "An easy, roomy tote for errands that turn into afternoons.", price: 18000, image_url: "https://images.pexels.com/photos/7735446/pexels-photo-7735446.jpeg?auto=compress&cs=tinysrgb&w=1000&q=85", image_alt: "Everyday tote", badge: "New", stock: 30 },
  { id: "luxury-handbag", name: "Luxury handbag", slug: "luxury-handbag", category: "Crossbody", description: "A polished, structured handbag with a refined finish.", price: 45000, image_url: "https://images.pexels.com/photos/30975839/pexels-photo-30975839.jpeg?auto=compress&cs=tinysrgb&w=1000&q=85", image_alt: "Black textured luxury handbag", badge: null, stock: 12 },
  { id: "little-shoulder-bag", name: "Little shoulder bag", slug: "little-shoulder-bag", category: "Crossbody", description: "A just-right companion for the things you reach for most.", price: 28000, image_url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=85", image_alt: "Woven tan shoulder bag", badge: null, stock: 40 },
  { id: "canvas-carryall", name: "Canvas carryall", slug: "canvas-carryall", category: "Everyday", description: "A lightweight everyday bag for a lighter kind of packing.", price: 15000, image_url: "https://images.pexels.com/photos/17836626/pexels-photo-17836626/free-photo-of-woman-using-fabric-shopper-bag.jpeg?auto=compress&cs=tinysrgb&w=1000&q=85", image_alt: "Natural canvas carryall", badge: null, stock: 16 },
  { id: "heritage-luggage-set", name: "Classic 2-Piece Luggage Set", slug: "classic-luggage-set", category: "Travel", description: "A coordinated pair of cases for short breaks and long journeys.", price: 90000, image_url: "https://images.pexels.com/photos/7368305/pexels-photo-7368305.jpeg?auto=compress&cs=tinysrgb&w=1000&q=85", image_alt: "Coordinated light-coloured suitcases", badge: null, stock: 12 },
  { id: "modern-luggage-set", name: "Essential 2-Piece Luggage Set", slug: "essential-luggage-set", category: "Travel", description: "Two versatile travel cases for your essentials.", price: 80000, image_url: "https://images.pexels.com/photos/7368312/pexels-photo-7368312.jpeg?auto=compress&cs=tinysrgb&w=1000&q=85", image_alt: "Matching light-coloured luggage set", badge: null, stock: 12 },
];
export const formatPrice = (value: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);

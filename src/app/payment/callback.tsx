import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text } from "react-native";
import { API_BASE_URL } from "../../lib/backend";
import { useStore } from "../../lib/store";
import { colors } from "../../theme";
export default function PaymentCallback() {
  const { reference } = useLocalSearchParams<{ reference?: string }>();
  const { clear } = useStore();
  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState("Confirming your payment securely…");
  useEffect(() => {
    let active = true;
    if (reference) fetch(API_BASE_URL + "/api/paystack/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reference }) })
      .then(async (r) => { const body = await r.json(); if (!r.ok) throw new Error(body.error ?? "Payment verification failed."); return body; })
      .then((body) => { if (active) { setStatus(body.status ?? "paid"); setMessage(body.message ?? "Your order has been confirmed."); if (body.status === "paid") clear(); } })
      .catch((cause) => { if (active) { setStatus("error"); setMessage(cause.message); } });
    return () => { active = false; };
  }, [reference, clear]);
  const visibleStatus = reference ? status : "error";
  const visibleMessage = reference ? message : "A payment reference was not returned.";
  return <SafeAreaView style={styles.page}>{visibleStatus === "pending" ? <ActivityIndicator color={colors.sage} /> : <Text style={styles.icon}>{visibleStatus === "paid" ? "✓" : "·"}</Text>}<Text style={styles.title}>{visibleStatus === "paid" ? "A lovely choice." : "Payment update"}</Text><Text style={styles.message}>{visibleMessage}</Text><Pressable onPress={() => router.replace("/(tabs)/account")} style={styles.button}><Text style={styles.buttonText}>VIEW YOUR ACCOUNT</Text></Pressable></SafeAreaView>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: colors.paper, alignItems: "center", justifyContent: "center", padding: 28 }, icon: { color: colors.sage, fontSize: 40 }, title: { color: colors.ink, fontFamily: "Georgia", fontSize: 28, marginTop: 14 }, message: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: "center", marginTop: 10 }, button: { marginTop: 24, backgroundColor: colors.ink, height: 50, alignSelf: "stretch", alignItems: "center", justifyContent: "center" }, buttonText: { color: "white", fontSize: 10, letterSpacing: 1 } });

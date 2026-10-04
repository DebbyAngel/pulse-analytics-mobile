import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, Text } from "react-native";
import { supabase } from "../../lib/backend";
import { colors } from "../../theme";
export default function AuthCallback() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    if (code && supabase) supabase.auth.exchangeCodeForSession(code).then(({ error: authError }) => {
      if (!active) return;
      if (authError) setError(authError.message); else router.replace("/(tabs)/account");
    }).catch((cause) => { if (active) setError(cause.message); });
    return () => { active = false; };
  }, [code]);
  const message = error || (!code ? (!supabase ? "Supabase settings are missing from this build." : "No sign-in code was returned.") : "Finishing secure sign-in…");
  return <SafeAreaView style={styles.page}><ActivityIndicator color={colors.sage} /><Text style={styles.text}>{message}</Text><Text onPress={() => router.replace("/(tabs)/account")} style={styles.link}>Return to account</Text></SafeAreaView>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: colors.paper, alignItems: "center", justifyContent: "center", padding: 25 }, text: { color: colors.ink, fontSize: 14, marginTop: 17, textAlign: "center" }, link: { color: colors.sage, fontSize: 12, marginTop: 20 } });

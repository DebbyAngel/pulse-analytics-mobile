import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StoreProvider } from "../lib/store";
import { colors } from "../theme";
export default function RootLayout() { return <SafeAreaProvider><StoreProvider><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper }, animation: "slide_from_right" }}><Stack.Screen name="(tabs)" /><Stack.Screen name="product/[slug]" /><Stack.Screen name="checkout" /><Stack.Screen name="auth/callback" /><Stack.Screen name="payment/callback" /></Stack></StoreProvider></SafeAreaProvider>; }

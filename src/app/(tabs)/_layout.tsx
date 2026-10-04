import { Tabs } from "expo-router";
import React from "react";
import { Text } from "react-native";
import { colors } from "../../theme";
const Icon = ({ children, focused }: { children: string; focused: boolean }) => <Text style={{ fontSize: 19, color: focused ? colors.ink : colors.muted }}>{children}</Text>;
export default function TabsLayout() { return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.ink, tabBarInactiveTintColor: colors.muted, tabBarStyle: { height: 62, paddingTop: 7, paddingBottom: 7, backgroundColor: colors.paper, borderTopColor: colors.line }, tabBarLabelStyle: { fontSize: 10 } }}><Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ focused }) => <Icon focused={focused}>⌂</Icon> }} /><Tabs.Screen name="shop" options={{ title: "Shop", tabBarIcon: ({ focused }) => <Icon focused={focused}>⌕</Icon> }} /><Tabs.Screen name="cart" options={{ title: "Bag", tabBarIcon: ({ focused }) => <Icon focused={focused}>▱</Icon> }} /><Tabs.Screen name="account" options={{ title: "Account", tabBarIcon: ({ focused }) => <Icon focused={focused}>○</Icon> }} /></Tabs>; }

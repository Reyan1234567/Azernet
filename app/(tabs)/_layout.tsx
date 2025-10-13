import { Icon } from "@/components/ui/icon";
import { useColor } from "@/hooks/useColor";
import { PlatformPressable } from "@react-navigation/elements";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import {
  Home,
  ShoppingCart,
  DollarSign,
  Package,
  Building2,
} from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet } from "react-native";

export default function TabLayout() {
  const primary = useColor("primary");

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: primary,
        headerShown: false,
        tabBarButton: (props) => (
          <PlatformPressable
            {...props}
            onPressIn={(ev) => {
              if (process.env.EXPO_OS === "ios") {
                // Add a soft haptic feedback when pressing down on the tabs.
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              props.onPressIn?.(ev);
            }}
          />
        ),
        tabBarBackground: () => {
          if (Platform.OS === "ios") {
            return (
              <BlurView
                tint="systemChromeMaterial"
                intensity={100}
                style={StyleSheet.absoluteFill}
              />
            );
          }

          // On Android & Web: no background
          return null;
        },
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Icon
              name={Home}
              size={24}
              color={color}
              style={{ marginRight: 4 }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color }) => (
            <Icon
              name={ShoppingCart}
              size={24}
              color={color}
              style={{ marginRight: 4 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          title: "Sales",
          tabBarIcon: ({ color }) => (
            <Icon
              name={DollarSign}
              size={24}
              color={color}
              style={{ marginRight: 4 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="purchases"
        options={{
          title: "Purchases",
          tabBarIcon: ({ color }) => (
            <Icon
              name={Package}
              size={24}
              color={color}
              style={{ marginRight: 4 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="businesses"
        options={{
          title: "Businesses",
          tabBarIcon: ({ color }) => (
            <Icon
              name={Building2}
              size={24}
              color={color}
              style={{ marginRight: 4 }}
            />
          ),
        }}
      />
    </Tabs>
  );
}

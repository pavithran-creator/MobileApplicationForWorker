import React from "react";
import { Tabs } from "expo-router";
import { useLang } from "../../lib/i18n";
import { colors } from "../../lib/theme";
import { Home, Grid, Calendar, Clock } from "lucide-react-native";

export default function CustomerTabsLayout() {
  const { t } = useLang();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand.primary, // #0F5132
        tabBarInactiveTintColor: colors.text.muted,    // #64748B
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: colors.surface.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("nav.home", "Home"),
          tabBarLabel: t("nav.home", "Home"),
          tabBarIcon: ({ color, size }) => <Home size={size || 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: t("nav.services", "Services"),
          tabBarLabel: t("nav.services", "Services"),
          tabBarIcon: ({ color, size }) => <Grid size={size || 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="book"
        options={{
          title: t("nav.book_tab", "Book with AI"),
          tabBarLabel: t("nav.book_tab", "Book with AI"),
          tabBarIcon: ({ color, size }) => <Calendar size={size || 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: t("nav.bookings", "My Bookings"),
          tabBarLabel: t("nav.bookings", "My Bookings"),
          tabBarIcon: ({ color, size }) => <Clock size={size || 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="booking/[id]"
        options={{
          href: null, // Hidden from tab bar
        }}
      />
    </Tabs>
  );
}


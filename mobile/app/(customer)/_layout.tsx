import React from "react";
import { Tabs } from "expo-router";
import { Home, Search, Calendar, Clock, User } from "lucide-react-native";

export default function CustomerTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#059669",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e2e8f0",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size || 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: "Services",
          tabBarIcon: ({ color, size }) => <Search size={size || 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="book"
        options={{
          title: "Book with AI",
          tabBarIcon: ({ color, size }) => <Calendar size={size || 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "My Bookings",
          tabBarIcon: ({ color, size }) => <Clock size={size || 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="booking/[id]"
        options={{
          href: null, // Hidden from bottom bar, accessed via stack navigation
        }}
      />
    </Tabs>
  );
}

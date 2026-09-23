import React from "react";
import { Tabs } from "expo-router";
import { useLang } from "../../lib/i18n";
import { colors } from "../../lib/theme";
import { Briefcase, ShieldCheck, User } from "lucide-react-native";

export default function WorkerTabsLayout() {
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
          title: t("nav.jobs_tab", "Assigned Jobs"),
          tabBarLabel: t("nav.jobs_tab", "Assigned Jobs"),
          tabBarIcon: ({ color, size }) => (
            <Briefcase size={size || 20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="welfare"
        options={{
          title: t("nav.welfare_tab", "Welfare & ESI"),
          tabBarLabel: t("nav.welfare_tab", "Welfare & ESI"),
          tabBarIcon: ({ color, size }) => (
            <ShieldCheck size={size || 20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("nav.profile_tab", "My Profile"),
          tabBarLabel: t("nav.profile_tab", "My Profile"),
          tabBarIcon: ({ color, size }) => (
            <User size={size || 20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="job/[id]"
        options={{
          href: null, // Hidden from bottom bar
        }}
      />
    </Tabs>
  );
}


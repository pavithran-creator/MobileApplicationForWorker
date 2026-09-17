import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../lib/auth";
import { useLang } from "../lib/i18n";
import { Shield, AlertTriangle, Globe } from "lucide-react-native";

export default function MobileHeader({ title, showEmergency = true }: { title?: string; showEmergency?: boolean }) {
  const { user } = useAuth();
  const { lang, setLang } = useLang();
  const router = useRouter();

  const cycleLang = () => {
    if (lang === "en") setLang("ta");
    else if (lang === "ta") setLang("hi");
    else setLang("en");
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <View style={styles.logoBadge}>
          <Shield size={18} color="#065f46" />
        </View>
        <View>
          <Text style={styles.brandTitle}>{title || "ON-DEMAND"}</Text>
          <Text style={styles.brandSub}>
            {user ? `${user.name} (${user.role === "WORKER" ? "Trade Worker" : "Customer"})` : "Cooperative Marketplace"}
          </Text>
        </View>
      </View>

      <View style={styles.rightRow}>
        {/* Language Switcher */}
        <TouchableOpacity style={styles.langBtn} onPress={cycleLang} activeOpacity={0.7}>
          <Globe size={14} color="#065f46" />
          <Text style={styles.langText}>{lang.toUpperCase()}</Text>
        </TouchableOpacity>

        {/* SOS Emergency Dispatch Button */}
        {showEmergency && (
          <TouchableOpacity
            style={styles.sosBtn}
            onPress={() => router.push("/emergency")}
            activeOpacity={0.8}
          >
            <AlertTriangle size={14} color="#fff" />
            <Text style={styles.sosText}>SOS</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  brandSub: {
    fontSize: 11,
    color: "#059669",
    fontWeight: "600",
  },
  rightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: "#ecfdf5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  langText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#065f46",
  },
  sosBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#dc2626",
    borderRadius: 8,
  },
  sosText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
});

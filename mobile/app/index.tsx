import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../lib/auth";
import { useLang } from "../lib/i18n";
import { Shield, ArrowRight, UserCheck, Wrench, AlertTriangle, Globe } from "lucide-react-native";

export default function SplashScreen() {
  const { user, loading, quickLogin } = useAuth();
  const { t, lang, setLang } = useLang();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "WORKER") {
        router.replace("/(worker)");
      } else {
        router.replace("/(customer)");
      }
    }
  }, [user, loading]);

  const cycleLang = () => {
    if (lang === "en") setLang("ta");
    else if (lang === "ta") setLang("hi");
    else setLang("en");
  };

  const handleDemoCustomer = async () => {
    await quickLogin("CUSTOMER");
    router.replace("/(customer)");
  };

  const handleDemoWorker = async () => {
    await quickLogin("WORKER");
    router.replace("/(worker)");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Connecting to Cooperative Registry...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Bar with Language */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.langBtn} onPress={cycleLang} activeOpacity={0.7}>
          <Globe size={14} color="#065f46" />
          <Text style={styles.langText}>{lang.toUpperCase()} (Switch)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sosTopBtn} onPress={() => router.push("/emergency")}>
          <AlertTriangle size={13} color="#ffffff" />
          <Text style={styles.sosTopText}>Emergency 24/7</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Badge & Branding */}
      <View style={styles.heroSection}>
        <View style={styles.logoIcon}>
          <Shield size={38} color="#ffffff" />
        </View>
        <Text style={styles.appName}>{t("app.title", "ON-DEMAND")}</Text>
        <Text style={styles.tagline}>{t("app.tagline", "The right worker, at the right place, at the right time.")}</Text>
        <Text style={styles.subDescription}>
          {t("app.subtitle", "Cooperative-owned digital service marketplace providing verified household and community trade services with fair wages.")}
        </Text>
      </View>

      {/* Primary Role Entry Cards */}
      <View style={styles.roleSelectionBox}>
        <TouchableOpacity
          style={[styles.roleCard, styles.customerCard]}
          onPress={() => router.push("/(customer)")}
          activeOpacity={0.8}
        >
          <View style={styles.roleIconCircle}>
            <UserCheck size={22} color="#065f46" />
          </View>
          <View style={styles.roleTextCol}>
            <Text style={styles.roleTitle}>Book a Trade Service</Text>
            <Text style={styles.roleDesc}>Electrician, Plumber, Carpenter & Doorstep Services</Text>
          </View>
          <ArrowRight size={18} color="#065f46" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleCard, styles.workerCard]}
          onPress={() => router.push("/(worker)")}
          activeOpacity={0.8}
        >
          <View style={[styles.roleIconCircle, styles.workerIconCircle]}>
            <Wrench size={22} color="#0284c7" />
          </View>
          <View style={styles.roleTextCol}>
            <Text style={styles.roleTitle}>Tradesperson Portal</Text>
            <Text style={styles.roleDesc}>View job requests, 90% fair wage earnings & welfare</Text>
          </View>
          <ArrowRight size={18} color="#0284c7" />
        </TouchableOpacity>
      </View>

      {/* 1-Click Instant Demo Login */}
      <View style={styles.demoSection}>
        <Text style={styles.demoHeading}>Instant Test Personas (1-Click Login)</Text>
        <View style={styles.demoButtonsRow}>
          <TouchableOpacity style={styles.demoBtn} onPress={handleDemoCustomer} activeOpacity={0.8}>
            <Text style={styles.demoBtnText}>Customer Login (Meena)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.demoBtn, styles.demoWorkerBtn]} onPress={handleDemoWorker} activeOpacity={0.8}>
            <Text style={styles.demoWorkerBtnText}>Worker Login (Suresh)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Traditional Sign In / Register Links */}
      <View style={styles.footerLinks}>
        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.linkText}>Have an existing account? <Text style={styles.boldLink}>Sign In</Text></Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/(auth)/register")} style={{ marginTop: 8 }}>
          <Text style={styles.linkText}>New to ON-DEMAND? <Text style={styles.boldLink}>Register as Member</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#064e3b",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#064e3b",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#a7f3d0",
    fontSize: 13,
    marginTop: 12,
    fontWeight: "500",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  langText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  sosTopBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#dc2626",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sosTopText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#34d399",
  },
  appName: {
    fontSize: 28,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    color: "#a7f3d0",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 10,
  },
  subDescription: {
    fontSize: 11.5,
    color: "#d1fae5",
    textAlign: "center",
    lineHeight: 18,
    opacity: 0.9,
    paddingHorizontal: 10,
  },
  roleSelectionBox: {
    gap: 12,
    marginBottom: 26,
  },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#ffffff",
  },
  customerCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#059669",
  },
  workerCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#0284c7",
  },
  roleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ecfdf5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  workerIconCircle: {
    backgroundColor: "#f0f9ff",
  },
  roleTextCol: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0f172a",
  },
  roleDesc: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  demoSection: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 24,
  },
  demoHeading: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#a7f3d0",
    textAlign: "center",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  demoButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  demoBtn: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  demoBtnText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#065f46",
  },
  demoWorkerBtn: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  demoWorkerBtnText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#047857",
  },
  footerLinks: {
    alignItems: "center",
  },
  linkText: {
    color: "#a7f3d0",
    fontSize: 12,
  },
  boldLink: {
    color: "#ffffff",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

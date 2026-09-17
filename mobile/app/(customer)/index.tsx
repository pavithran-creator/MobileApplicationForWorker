import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import MobileHeader from "../../components/Header";
import { useAuth } from "../../lib/auth";
import { useLang } from "../../lib/i18n";
import {
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  Car,
  Sparkles,
  Flower2,
  HeartHandshake,
  ShieldCheck,
  Clock,
  ArrowRight,
  AlertTriangle,
} from "lucide-react-native";

export default function CustomerHomeScreen() {
  const { user } = useAuth();
  const { t } = useLang();
  const router = useRouter();

  const services = [
    { id: 1, title: "Electrician", icon: <Zap size={22} color="#d97706" />, eta: "30 mins", bg: "#fef3c7" },
    { id: 3, title: "Plumber", icon: <Droplets size={22} color="#2563eb" />, eta: "30 mins", bg: "#dbeafe" },
    { id: 5, title: "Carpenter", icon: <Hammer size={22} color="#b45309" />, eta: "45 mins", bg: "#fef3c7" },
    { id: 6, title: "Painting", icon: <Paintbrush size={22} color="#059669" />, eta: "Next day", bg: "#d1fae5" },
    { id: 7, title: "Driver", icon: <Car size={22} color="#4f46e5" />, eta: "45 mins", bg: "#e0e7ff" },
    { id: 8, title: "Cleaning", icon: <Sparkles size={22} color="#0891b2" />, eta: "45 mins", bg: "#cffafe" },
    { id: 9, title: "Gardening", icon: <Flower2 size={22} color="#16a34a" />, eta: "Same day", bg: "#dcfce7" },
    { id: 10, title: "Caregiver", icon: <HeartHandshake size={22} color="#e11d48" />, eta: "Certified", bg: "#ffe4e6" },
  ];

  return (
    <View style={styles.container}>
      <MobileHeader />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Welcome & Area Banner */}
        <View style={styles.welcomeBanner}>
          <Text style={styles.welcomeTitle}>
            Hello, {user ? user.name : "Cooperative Citizen"}
          </Text>
          <Text style={styles.welcomeSub}>
            {t("doorstep.headline", "Cooperative Trade Services at your Doorstep")}
          </Text>

          {/* Quick AI Assist CTA */}
          <TouchableOpacity
            style={styles.aiCard}
            onPress={() => router.push("/(customer)/book")}
            activeOpacity={0.8}
          >
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>AI Multimodal</Text>
            </View>
            <Text style={styles.aiTitle}>Snap a Live Photo or Speak your Issue</Text>
            <Text style={styles.aiSub}>
              Camera & voice assistant detects your trade service and auto-matches closest workers.
            </Text>
            <View style={styles.aiActionRow}>
              <Text style={styles.aiActionText}>Launch AI Assistant</Text>
              <ArrowRight size={14} color="#065f46" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Emergency SOS Banner */}
        <TouchableOpacity
          style={styles.sosCard}
          onPress={() => router.push("/emergency")}
          activeOpacity={0.85}
        >
          <View style={styles.sosIconBox}>
            <AlertTriangle size={20} color="#ffffff" />
          </View>
          <View style={styles.sosTextCol}>
            <Text style={styles.sosTitle}>24/7 Rapid Emergency Dispatch</Text>
            <Text style={styles.sosSub}>Burst pipe, electrical spark, or emergency lock &bull; 15-min arrival SLA</Text>
          </View>
        </TouchableOpacity>

        {/* Trade Service Categories Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cooperative Trade Categories</Text>
          <TouchableOpacity onPress={() => router.push("/(customer)/services")}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {services.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={styles.serviceItem}
              onPress={() => router.push(`/(customer)/book?service=${s.id}` as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.serviceIconCircle, { backgroundColor: s.bg }]}>
                {s.icon}
              </View>
              <Text style={styles.serviceName}>{s.title}</Text>
              <Text style={styles.serviceEta}>{s.eta}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Verified Maintenance Packages */}
        <Text style={styles.sectionTitle}>Cooperative Trade Packages</Text>
        <View style={styles.packageCard}>
          <View style={styles.packageLeft}>
            <View style={styles.packageIcon}>
              <Zap size={20} color="#d97706" />
            </View>
            <View>
              <Text style={styles.packageName}>Full House Wiring Inspection</Text>
              <Text style={styles.packageDesc}>Circuit breaker test, grounding & leakage safety</Text>
              <Text style={styles.packagePrice}>₹900 (Statutory Price)</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.bookPkgBtn}
            onPress={() => router.push("/(customer)/book?service=2")}
          >
            <Text style={styles.bookPkgBtnText}>Book</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.packageCard}>
          <View style={styles.packageLeft}>
            <View style={styles.packageIcon}>
              <Droplets size={20} color="#2563eb" />
            </View>
            <View>
              <Text style={styles.packageName}>Bathroom Plumbing Overhaul</Text>
              <Text style={styles.packageDesc}>Complete fixture check, joint sealing & drainage</Text>
              <Text style={styles.packagePrice}>₹1,200 (Statutory Price)</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.bookPkgBtn}
            onPress={() => router.push("/(customer)/book?service=4")}
          >
            <Text style={styles.bookPkgBtnText}>Book</Text>
          </TouchableOpacity>
        </View>

        {/* Cooperative Guarantee Pillars */}
        <View style={styles.pillarsBox}>
          <View style={styles.pillarItem}>
            <ShieldCheck size={18} color="#059669" />
            <Text style={styles.pillarTitle}>100% Aadhaar Verified</Text>
            <Text style={styles.pillarSub}>Vetted by registered cooperative societies</Text>
          </View>
          <View style={styles.pillarItem}>
            <Clock size={18} color="#059669" />
            <Text style={styles.pillarTitle}>30-Day Work Warranty</Text>
            <Text style={styles.pillarSub}>Free rework if unsatisfied</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 30,
  },
  welcomeBanner: {
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
  },
  welcomeSub: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
    marginBottom: 12,
  },
  aiCard: {
    backgroundColor: "#064e3b",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#059669",
  },
  aiBadge: {
    backgroundColor: "#10b981",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 8,
  },
  aiBadgeText: {
    color: "#064e3b",
    fontSize: 10,
    fontWeight: "bold",
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  aiSub: {
    fontSize: 11,
    color: "#a7f3d0",
    lineHeight: 16,
    marginBottom: 10,
  },
  aiActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fef3c7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  aiActionText: {
    fontSize: 11.5,
    fontWeight: "bold",
    color: "#065f46",
  },
  sosCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dc2626",
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
  },
  sosIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  sosTextCol: {
    flex: 1,
  },
  sosTitle: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "bold",
  },
  sosSub: {
    color: "#fee2e2",
    fontSize: 10,
    marginTop: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 10,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#059669",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  serviceItem: {
    width: "23%",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  serviceIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  serviceName: {
    fontSize: 10.5,
    fontWeight: "bold",
    color: "#0f172a",
    textAlign: "center",
  },
  serviceEta: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 2,
  },
  packageCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 10,
  },
  packageLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  packageIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
  },
  packageName: {
    fontSize: 12.5,
    fontWeight: "bold",
    color: "#0f172a",
  },
  packageDesc: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 1,
  },
  packagePrice: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#059669",
    marginTop: 2,
  },
  bookPkgBtn: {
    backgroundColor: "#065f46",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  bookPkgBtnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },
  pillarsBox: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  pillarItem: {
    flex: 1,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
  },
  pillarTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#065f46",
    marginTop: 4,
    textAlign: "center",
  },
  pillarSub: {
    fontSize: 9,
    color: "#047857",
    textAlign: "center",
    marginTop: 2,
  },
});

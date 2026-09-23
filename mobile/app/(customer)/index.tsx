import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import MobileHeader from "../../components/Header";
import { useAuth } from "../../lib/auth";
import { useLang } from "../../lib/i18n";
import { colors, radii, shadows } from "../../lib/theme";
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
  Camera,
  Mic,
  CheckCircle2,
} from "lucide-react-native";

export default function CustomerHomeScreen() {
  const { user } = useAuth();
  const { lang, t } = useLang();
  const router = useRouter();

  const services = useMemo(
    () => [
      {
        id: 1,
        title: t("doorstep.srv.electrician", "Electrician"),
        icon: <Zap size={20} color="#D97706" />,
        eta: `30 ${t("doorstep.mins", "mins")}`,
        bg: "#FFFBEB",
      },
      {
        id: 3,
        title: t("doorstep.srv.plumber", "Plumber"),
        icon: <Droplets size={20} color="#2563EB" />,
        eta: `30 ${t("doorstep.mins", "mins")}`,
        bg: "#EFF6FF",
      },
      {
        id: 5,
        title: t("doorstep.srv.carpenter", "Carpenter"),
        icon: <Hammer size={20} color="#B45309" />,
        eta: `45 ${t("doorstep.mins", "mins")}`,
        bg: "#FEF3C7",
      },
      {
        id: 6,
        title: t("doorstep.srv.painting", "House Painting"),
        icon: <Paintbrush size={20} color="#059669" />,
        eta: t("status.confirmed", "Scheduled"),
        bg: "#ECFDF5",
      },
      {
        id: 7,
        title: t("doorstep.srv.driver", "Driver 8h"),
        icon: <Car size={20} color="#4F46E5" />,
        eta: `45 ${t("doorstep.mins", "mins")}`,
        bg: "#EEF2FF",
      },
      {
        id: 8,
        title: t("doorstep.srv.cleaning", "Home Cleaning"),
        icon: <Sparkles size={20} color="#0891B2" />,
        eta: `45 ${t("doorstep.mins", "mins")}`,
        bg: "#ECFEFF",
      },
      {
        id: 9,
        title: t("services.gardening", "Gardening"),
        icon: <Flower2 size={20} color="#16A34A" />,
        eta: `30 ${t("doorstep.mins", "mins")}`,
        bg: "#DCFCE7",
      },
      {
        id: 10,
        title: t("doorstep.srv.caregiving", "Caregiver"),
        icon: <HeartHandshake size={20} color="#E11D48" />,
        eta: t("status.certified", "Certified"),
        bg: "#FFF1F2",
      },
    ],
    [lang, t]
  );

  return (
    <View style={styles.screen}>
      <MobileHeader />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Welcome & Area Banner */}
        <View style={styles.welcomeBanner}>
          <View style={styles.badgeRow}>
            <View style={styles.pillBadge}>
              <ShieldCheck size={11} color="#047857" />
              <Text style={styles.pillText}>
                {t("customer.fair_wage_banner", "Fair Wage Pricing • 90% Worker Retained")}
              </Text>
            </View>
          </View>

          <Text style={styles.welcomeTitle}>
            {t("customer.hello", "Hello, {name}", { name: user ? user.name : "Cooperative Citizen" })}
          </Text>
          <Text style={styles.welcomeSub}>
            {t("doorstep.headline", "Cooperative Trade Services at your Doorstep")}
          </Text>

          {/* Quick AI Assist Card */}
          <TouchableOpacity
            style={styles.aiCard}
            onPress={() => router.push("/(customer)/book")}
            activeOpacity={0.85}
          >
            <View style={styles.aiBadgeRow}>
              <View style={styles.aiPill}>
                <Text style={styles.aiPillText}>
                  {t("book.ai_title", "AI MULTIMODAL ASSISTANT")}
                </Text>
              </View>
              <View style={styles.aiIconCluster}>
                <Camera size={13} color="#065F46" />
                <Mic size={13} color="#065F46" />
              </View>
            </View>

            <Text style={styles.aiTitle}>
              {t("customer.snap_or_speak", "Snap a Live Photo or Speak your Issue")}
            </Text>
            <Text style={styles.aiSub}>
              {t(
                "customer.snap_or_speak_desc",
                "Camera & voice assistant detects your trade service and auto-matches closest workers."
              )}
            </Text>

            <View style={styles.aiActionRow}>
              <Text style={styles.aiActionText}>
                {t("customer.launch_ai", "Launch AI Assistant")}
              </Text>
              <ArrowRight size={13} color="#065F46" />
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
            <AlertTriangle size={20} color="#FFFFFF" />
          </View>
          <View style={styles.sosTextCol}>
            <View style={styles.sosHeaderRow}>
              <Text style={styles.sosTitle}>
                {t("doorstep.urgent_dispatch", "24/7 Rapid Emergency Dispatch")}
              </Text>
              <View style={styles.slaBadge}>
                <Text style={styles.slaText}>&lt; 30 MINS</Text>
              </View>
            </View>
            <Text style={styles.sosSub}>
              {t(
                "doorstep.urgent_desc",
                "Burst pipe, electrical spark, or lock breakdown • 15-min arrival SLA"
              )}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Trade Service Categories Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t("doorstep.categories", "Cooperative Trade Categories")}
          </Text>
          <TouchableOpacity onPress={() => router.push("/(customer)/services")}>
            <Text style={styles.seeAllText}>{t("doorstep.see_all", "View All")} &rarr;</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gridCard}>
          <View style={styles.grid}>
            {services.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.serviceItem}
                onPress={() => router.push(`/(customer)/book?serviceId=${s.id}` as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.serviceIconCircle, { backgroundColor: s.bg }]}>
                  {s.icon}
                  <View style={styles.etaPill}>
                    <Text style={styles.etaPillText}>{s.eta}</Text>
                  </View>
                </View>
                <Text style={styles.serviceName}>{s.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Cooperative Maintenance Packages */}
        <Text style={styles.sectionTitle}>
          {t("doorstep.packages_title", "Cooperative Trade Packages")}
        </Text>

        <View style={styles.packageCard}>
          <View style={styles.packageLeft}>
            <View style={[styles.packageIcon, { backgroundColor: "#FFFBEB" }]}>
              <Zap size={18} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <Text style={styles.packageName}>
                  {t("doorstep.pkg.wiring", "Full House Wiring Inspection")}
                </Text>
                <View style={styles.popBadge}>
                  <Text style={styles.popText}>{t("doorstep.popular", "POPULAR")}</Text>
                </View>
              </View>
              <Text style={styles.packageDesc}>
                {t("doorstep.tag_electrical", "Circuit breaker test, grounding & leakage safety")}
              </Text>
              <Text style={styles.packagePrice}>₹900 (Statutory Price)</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.bookPkgBtn}
            onPress={() => router.push("/(customer)/book?serviceId=2")}
          >
            <Text style={styles.bookPkgBtnText}>{t("doorstep.book_btn", "Book")}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.packageCard}>
          <View style={styles.packageLeft}>
            <View style={[styles.packageIcon, { backgroundColor: "#EFF6FF" }]}>
              <Droplets size={18} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.packageName}>
                {t("doorstep.pkg.plumbing", "Bathroom Plumbing Overhaul")}
              </Text>
              <Text style={styles.packageDesc}>
                {t("doorstep.tag_plumbing", "Complete fixture check, joint sealing & drainage")}
              </Text>
              <Text style={styles.packagePrice}>₹1,200 (Statutory Price)</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.bookPkgBtn}
            onPress={() => router.push("/(customer)/book?serviceId=4")}
          >
            <Text style={styles.bookPkgBtnText}>{t("doorstep.book_btn", "Book")}</Text>
          </TouchableOpacity>
        </View>

        {/* Wage Transparency Banner */}
        <View style={styles.transparencyCard}>
          <View style={styles.transparencyHeader}>
            <View style={styles.rupeeCircle}>
              <Text style={styles.rupeeSymbol}>₹</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.transparencyTitle}>
                {t("doorstep.trust_2_title", "Statutory Living Wage Guarantee")}
              </Text>
              <Text style={styles.transparencySub}>
                {t(
                  "doorstep.trust_2_desc",
                  "Every booking reserves 90% direct to the certified tradesperson with 10% social security allocation. Zero surge pricing."
                )}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface.pageBg, // #FAFAFA
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },
  welcomeBanner: {
    marginBottom: 14,
  },
  badgeRow: {
    marginBottom: 6,
  },
  pillBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: radii.full,
    alignSelf: "flex-start",
  },
  pillText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#047857",
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  welcomeSub: {
    fontSize: 12.5,
    color: colors.text.secondary,
    marginTop: 2,
    marginBottom: 12,
  },
  aiCard: {
    backgroundColor: "#ECFDF5",
    borderRadius: radii.xl,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#A7F3D0",
    ...shadows.card,
  },
  aiBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  aiPill: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  aiPillText: {
    color: "#065F46",
    fontSize: 8.5,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  aiIconCluster: {
    flexDirection: "row",
    gap: 6,
  },
  aiTitle: {
    fontSize: 13.5,
    fontWeight: "bold",
    color: colors.brand.dark,
  },
  aiSub: {
    fontSize: 11,
    color: colors.brand.emerald800,
    marginTop: 3,
    lineHeight: 15,
  },
  aiActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#A7F3D0",
  },
  aiActionText: {
    fontSize: 11.5,
    fontWeight: "bold",
    color: "#065F46",
  },
  sosCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.status.danger,
    borderRadius: radii.xl,
    padding: 14,
    marginBottom: 16,
    ...shadows.elevated,
  },
  sosIconBox: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  sosTextCol: {
    flex: 1,
  },
  sosHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sosTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  slaBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: radii.sm,
  },
  slaText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "900",
  },
  sosSub: {
    fontSize: 10.5,
    color: "#FEE2E2",
    marginTop: 2,
    lineHeight: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  seeAllText: {
    fontSize: 11.5,
    fontWeight: "bold",
    color: colors.brand.primary,
  },
  gridCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surface.border,
    ...shadows.card,
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  serviceItem: {
    width: "23%",
    alignItems: "center",
    marginBottom: 12,
  },
  serviceIconCircle: {
    width: 46,
    height: 46,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  etaPill: {
    position: "absolute",
    bottom: -6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  etaPillText: {
    fontSize: 7.5,
    fontWeight: "800",
    color: colors.text.secondary,
  },
  serviceName: {
    fontSize: 10.5,
    fontWeight: "600",
    color: colors.text.primary,
    marginTop: 9,
    textAlign: "center",
  },
  packageCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radii.xl,
    padding: 12,
    marginBottom: 8,
    ...shadows.card,
  },
  packageLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  packageIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  packageName: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  popBadge: {
    backgroundColor: "#DB2777",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: radii.sm,
  },
  popText: {
    color: "#FFFFFF",
    fontSize: 7.5,
    fontWeight: "900",
  },
  packageDesc: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 1,
  },
  packagePrice: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.brand.primary,
    marginTop: 2,
  },
  bookPkgBtn: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.md,
  },
  bookPkgBtnText: {
    color: "#FFFFFF",
    fontSize: 11.5,
    fontWeight: "bold",
  },
  transparencyCard: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: radii.xl,
    padding: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  transparencyHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  rupeeCircle: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  rupeeSymbol: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  transparencyTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.brand.dark,
  },
  transparencySub: {
    fontSize: 10.5,
    color: colors.brand.emerald800,
    marginTop: 2,
    lineHeight: 14,
  },
});

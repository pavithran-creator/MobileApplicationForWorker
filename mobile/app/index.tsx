import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../lib/auth";
import { useLang } from "../lib/i18n";
import MobileHeader from "../components/Header";
import { colors, radii, shadows } from "../lib/theme";
import {
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  Car,
  Sparkles,
  Flower2,
  HeartHandshake,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Users,
} from "lucide-react-native";

export default function MobileHomeScreen() {
  const { user, loading, quickLogin } = useAuth();
  const { lang, t } = useLang();
  const router = useRouter();

  // If already logged in, route automatically
  useEffect(() => {
    if (!loading && user) {
      if (user.role === "WORKER") {
        router.replace("/(worker)");
      } else {
        router.replace("/(customer)");
      }
    }
  }, [user, loading]);

  const handleDemoCustomer = async () => {
    await quickLogin("CUSTOMER");
    router.replace("/(customer)");
  };

  const handleDemoWorker = async () => {
    await quickLogin("WORKER");
    router.replace("/(worker)");
  };

  const offeredServices = useMemo(
    () => [
      {
        id: "emergency",
        title: t("doorstep.srv.emergency", "24/7 Emergency"),
        eta: `15 ${t("doorstep.mins", "mins")}`,
        icon: <AlertTriangle size={20} color="#DC2626" />,
        bg: "#FEF2F2",
        badgeColor: "#DC2626",
        route: "/emergency",
      },
      {
        id: "electrical",
        title: t("doorstep.srv.electrician", "Electrician"),
        eta: `30 ${t("doorstep.mins", "mins")}`,
        icon: <Zap size={20} color="#D97706" />,
        bg: "#FFFBEB",
        badgeColor: "#059669",
        route: "/(customer)/book?serviceId=1",
      },
      {
        id: "plumbing",
        title: t("doorstep.srv.plumber", "Plumber"),
        eta: `30 ${t("doorstep.mins", "mins")}`,
        icon: <Droplets size={20} color="#2563EB" />,
        bg: "#EFF6FF",
        badgeColor: "#059669",
        route: "/(customer)/book?serviceId=3",
      },
      {
        id: "carpentry",
        title: t("doorstep.srv.carpenter", "Carpenter"),
        eta: `45 ${t("doorstep.mins", "mins")}`,
        icon: <Hammer size={20} color="#B45309" />,
        bg: "#FEF3C7",
        badgeColor: "#059669",
        route: "/(customer)/book?serviceId=5",
      },
      {
        id: "painting",
        title: t("doorstep.srv.painting", "House Painting"),
        eta: t("status.confirmed", "Scheduled"),
        icon: <Paintbrush size={20} color="#059669" />,
        bg: "#ECFDF5",
        badgeColor: "#059669",
        route: "/(customer)/book?serviceId=6",
      },
      {
        id: "driving",
        title: t("doorstep.srv.driver", "Driver on Demand"),
        eta: `45 ${t("doorstep.mins", "mins")}`,
        icon: <Car size={20} color="#4F46E5" />,
        bg: "#EEF2FF",
        badgeColor: "#059669",
        route: "/(customer)/book?serviceId=7",
      },
      {
        id: "cleaning",
        title: t("doorstep.srv.cleaning", "Home Cleaning"),
        eta: `45 ${t("doorstep.mins", "mins")}`,
        icon: <Sparkles size={20} color="#0891B2" />,
        bg: "#ECFEFF",
        badgeColor: "#059669",
        route: "/(customer)/book?serviceId=8",
      },
      {
        id: "caregiving",
        title: t("doorstep.srv.caregiving", "Elderly Care"),
        eta: t("status.certified", "Certified"),
        icon: <HeartHandshake size={20} color="#E11D48" />,
        bg: "#FFF1F2",
        badgeColor: "#059669",
        route: "/(customer)/book?serviceId=10",
      },
    ],
    [lang, t]
  );

  const tradePackages = useMemo(
    () => [
      {
        title: t("doorstep.pkg.wiring", "Full House Wiring Inspection"),
        desc: t("doorstep.tag_electrical", "Circuit breaker test, grounding & leakage safety"),
        price: "₹900",
        popular: true,
        serviceId: 2,
      },
      {
        title: t("doorstep.pkg.plumbing", "Bathroom Plumbing Overhaul"),
        desc: t("doorstep.tag_plumbing", "Complete fixture check, joint sealing & drainage"),
        price: "₹1,200",
        popular: false,
        serviceId: 4,
      },
    ],
    [lang, t]
  );

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
        <Text style={styles.loadingText}>{t("common.loading", "Connecting to Cooperative Registry...")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <MobileHeader />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Doorstep Headline Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroTrustPill}>
            <ShieldCheck size={12} color="#047857" />
            <Text style={styles.heroTrustText}>TAMIL NADU LABOUR COOPERATIVE FEDERATION</Text>
          </View>
          <Text style={styles.heroTitle}>
            {t("doorstep.headline", "Home services at your doorstep")}
          </Text>
          <Text style={styles.heroSub}>
            {t(
              "app.subtitle",
              "Cooperative-owned digital service marketplace providing verified household and community trade services with fair wages."
            )}
          </Text>
        </View>

        {/* White Main Service Grid Card */}
        <View style={styles.whiteCard}>
          <Text style={styles.cardHeader}>{t("doorstep.categories", "Cooperative Trade Categories")}</Text>
          <View style={styles.servicesGrid}>
            {offeredServices.map((srv) => (
              <TouchableOpacity
                key={srv.id}
                style={styles.gridItem}
                onPress={() => router.push(srv.route as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconCircle, { backgroundColor: srv.bg }]}>
                  {srv.icon}
                  <View style={[styles.etaBadge, { borderColor: srv.badgeColor }]}>
                    <Text style={[styles.etaBadgeText, { color: srv.badgeColor }]}>
                      {srv.eta}
                    </Text>
                  </View>
                </View>
                <Text style={styles.gridLabel} numberOfLines={1}>{srv.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Verified Trade Maintenance Packages */}
          <View style={styles.pkgDivider} />
          <Text style={styles.pkgSectionTitle}>
            {t("doorstep.packages_title", "Comprehensive Home Maintenance Packages")}
          </Text>

          {tradePackages.map((pkg, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.pkgItem}
              onPress={() => router.push(`/(customer)/book?serviceId=${pkg.serviceId}` as any)}
              activeOpacity={0.8}
            >
              <View style={styles.pkgInfo}>
                <View style={styles.pkgTitleRow}>
                  <Text style={styles.pkgTitle}>{pkg.title}</Text>
                  {pkg.popular && (
                    <View style={styles.popBadge}>
                      <Text style={styles.popBadgeText}>{t("doorstep.popular", "POPULAR")}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.pkgDesc}>{pkg.desc}</Text>
                <Text style={styles.pkgPrice}>
                  {t("doorstep.starting_from", "Statutory Price")} {pkg.price}
                </Text>
              </View>
              <View style={styles.pkgBookBtn}>
                <Text style={styles.pkgBookBtnText}>{t("doorstep.book_btn", "Book")}</Text>
                <ArrowRight size={12} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Emergency SOS Banner Card */}
        <TouchableOpacity
          style={styles.sosCard}
          onPress={() => router.push("/emergency")}
          activeOpacity={0.85}
        >
          <View style={styles.sosIconBox}>
            <AlertTriangle size={22} color="#FFFFFF" />
          </View>
          <View style={styles.sosContent}>
            <View style={styles.sosHeadingRow}>
              <Text style={styles.sosHeading}>
                {t("doorstep.urgent_dispatch", "24/7 Rapid Emergency Dispatch")}
              </Text>
              <View style={styles.slaBadge}>
                <Text style={styles.slaBadgeText}>&lt; 30 MINS</Text>
              </View>
            </View>
            <Text style={styles.sosDesc}>
              {t(
                "doorstep.urgent_desc",
                "Urgent short-circuits, burst pipes, and emergency lockouts dispatched immediately."
              )}
            </Text>
          </View>
        </TouchableOpacity>

        {/* 1-Click Instant Demo Personas Section */}
        <View style={styles.demoSection}>
          <View style={styles.demoHeaderRow}>
            <Text style={styles.demoTitle}>{t("auth.demoTitle", "1-Click Demo Personas")}</Text>
            <View style={styles.instantAccessBadge}>
              <Text style={styles.instantAccessText}>{t("auth.instantAccess", "Instant Access")}</Text>
            </View>
          </View>

          <View style={styles.demoButtonsRow}>
            <TouchableOpacity
              style={styles.demoCustBtn}
              onPress={handleDemoCustomer}
              activeOpacity={0.8}
            >
              <View style={styles.demoAvatarCircle}>
                <Text style={styles.demoAvatarLetter}>M</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.demoRole}>{t("auth.customer", "Customer")}</Text>
                <Text style={styles.demoName}>Meena Sundaram</Text>
              </View>
              <ArrowRight size={15} color={colors.brand.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoWorkBtn}
              onPress={handleDemoWorker}
              activeOpacity={0.8}
            >
              <View style={[styles.demoAvatarCircle, styles.demoWorkerAvatar]}>
                <Text style={styles.demoAvatarLetter}>S</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.demoRole}>{t("auth.worker", "Tradesperson")}</Text>
                <Text style={styles.demoName}>Suresh (Electrician)</Text>
              </View>
              <ArrowRight size={15} color="#0284C7" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Why Trust Doorstep Services Trust Pillars */}
        <View style={styles.trustContainer}>
          <Text style={styles.trustMainHeading}>
            {t("doorstep.why_trust_title", "Why Millions Trust Our Services")}
          </Text>

          <View style={styles.trustGrid}>
            <View style={styles.trustItem}>
              <View style={styles.trustIconCircle}>
                <ShieldCheck size={18} color="#047857" />
              </View>
              <Text style={styles.trustItemTitle}>
                {t("doorstep.trust_1_title", "Verified Professionals")}
              </Text>
              <Text style={styles.trustItemDesc}>
                {t("doorstep.trust_1_desc", "Aadhaar checked and certified trade professionals vetted for quality.")}
              </Text>
            </View>

            <View style={styles.trustItem}>
              <View style={styles.trustIconCircle}>
                <CheckCircle2 size={18} color="#047857" />
              </View>
              <Text style={styles.trustItemTitle}>
                {t("doorstep.trust_2_title", "Transparent Pricing")}
              </Text>
              <Text style={styles.trustItemDesc}>
                {t("doorstep.trust_2_desc", "Upfront standard rates with zero hidden surge or extra charges.")}
              </Text>
            </View>

            <View style={styles.trustItem}>
              <View style={styles.trustIconCircle}>
                <Clock size={18} color="#047857" />
              </View>
              <Text style={styles.trustItemTitle}>
                {t("doorstep.trust_4_title", "On-Time Arrival")}
              </Text>
              <Text style={styles.trustItemDesc}>
                {t("doorstep.trust_4_desc", "Quick arrival under 30 minutes for urgent needs and guaranteed slots.")}
              </Text>
            </View>

            <View style={styles.trustItem}>
              <View style={styles.trustIconCircle}>
                <Users size={18} color="#047857" />
              </View>
              <Text style={styles.trustItemTitle}>
                {t("doorstep.trust_3_title", "30-Day Service Guarantee")}
              </Text>
              <Text style={styles.trustItemDesc}>
                {t("doorstep.trust_3_desc", "Free rework or dedicated assistance if you are not completely satisfied.")}
              </Text>
            </View>
          </View>
        </View>

        {/* Auth Navigation Links */}
        <View style={styles.authLinksBox}>
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.signInBtnText}>
              {t("nav.login", "Sign In to Existing Account")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.regLink}
            onPress={() => router.push("/(auth)/register")}
          >
            <Text style={styles.regLinkText}>
              {t("auth.noAccount", "New to ON-DEMAND?")}{" "}
              <Text style={styles.regBold}>{t("auth.registerHere", "Register as Member")}</Text>
            </Text>
          </TouchableOpacity>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  loadingBox: {
    flex: 1,
    backgroundColor: colors.brand.dark,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#A7F3D0",
    fontSize: 13,
    marginTop: 10,
    fontWeight: "600",
  },
  heroSection: {
    marginBottom: 14,
  },
  heroTrustPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
    alignSelf: "flex-start",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  heroTrustText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#047857",
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text.primary,
    letterSpacing: -0.8,
    lineHeight: 30,
  },
  heroSub: {
    fontSize: 12.5,
    color: colors.text.secondary,
    marginTop: 5,
    lineHeight: 18,
  },
  whiteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surface.border,
    ...shadows.card,
    marginBottom: 14,
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 12,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "23%",
    alignItems: "center",
    marginBottom: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  etaBadge: {
    position: "absolute",
    bottom: -6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: radii.full,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  etaBadgeText: {
    fontSize: 7.5,
    fontWeight: "800",
    textAlign: "center",
  },
  gridLabel: {
    fontSize: 10.5,
    fontWeight: "600",
    color: colors.text.primary,
    marginTop: 10,
    textAlign: "center",
  },
  pkgDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
  },
  pkgSectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 10,
  },
  pkgItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.surface.border,
    backgroundColor: "#F8FAFC",
    marginBottom: 8,
  },
  pkgInfo: {
    flex: 1,
    marginRight: 10,
  },
  pkgTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pkgTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  popBadge: {
    backgroundColor: "#DB2777",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radii.sm,
  },
  popBadgeText: {
    color: "#FFFFFF",
    fontSize: 7.5,
    fontWeight: "900",
  },
  pkgDesc: {
    fontSize: 10.5,
    color: colors.text.muted,
    marginTop: 2,
  },
  pkgPrice: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.brand.primary,
    marginTop: 3,
  },
  pkgBookBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.md,
  },
  pkgBookBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  sosCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.status.danger, // #DC2626
    borderRadius: radii.xl,
    padding: 14,
    marginBottom: 14,
    ...shadows.elevated,
  },
  sosIconBox: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  sosContent: {
    flex: 1,
  },
  sosHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sosHeading: {
    fontSize: 13.5,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  slaBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  slaBadgeText: {
    color: "#FFFFFF",
    fontSize: 8.5,
    fontWeight: "800",
  },
  sosDesc: {
    fontSize: 10.5,
    color: "#FEE2E2",
    marginTop: 2,
    lineHeight: 14,
  },
  demoSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surface.border,
    ...shadows.card,
    marginBottom: 14,
  },
  demoHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  demoTitle: {
    fontSize: 13.5,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  instantAccessBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  instantAccessText: {
    color: "#92400E",
    fontSize: 9,
    fontWeight: "800",
  },
  demoButtonsRow: {
    gap: 8,
  },
  demoCustBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radii.lg,
    padding: 10,
  },
  demoWorkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radii.lg,
    padding: 10,
  },
  demoAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  demoWorkerAvatar: {
    backgroundColor: "#0284C7",
  },
  demoAvatarLetter: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  demoRole: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  demoName: {
    fontSize: 10.5,
    color: colors.text.muted,
  },
  trustContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surface.border,
    ...shadows.card,
    marginBottom: 16,
  },
  trustMainHeading: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 12,
  },
  trustGrid: {
    gap: 12,
  },
  trustItem: {
    flexDirection: "column",
  },
  trustIconCircle: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: colors.brand.light,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  trustItemTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  trustItemDesc: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
    lineHeight: 15,
  },
  authLinksBox: {
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  signInBtn: {
    width: "100%",
    backgroundColor: colors.brand.primary,
    paddingVertical: 12,
    borderRadius: radii.lg,
    alignItems: "center",
    ...shadows.subtle,
  },
  signInBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  regLink: {
    paddingVertical: 4,
  },
  regLinkText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  regBold: {
    fontWeight: "bold",
    color: colors.brand.primary,
  },
});

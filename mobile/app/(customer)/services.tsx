import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import MobileHeader from "../../components/Header";
import { useLang } from "../../lib/i18n";
import { request } from "../../lib/api";
import { getCurrentDeviceLocation, getStoredLocation, setStoredLocation, onLocationChange } from "../../lib/location";
import { colors, radii, shadows } from "../../lib/theme";
import { ServiceItem, ServiceCategory } from "../../types";
import { Search, MapPin, ShieldCheck, ArrowRight, RefreshCw } from "lucide-react-native";

export default function ServicesScreen() {
  const router = useRouter();
  const { lang, t } = useLang();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Fast GPS location state
  const [activeLocName, setActiveLocName] = useState("Gandhipuram, Coimbatore");
  const [detectingGps, setDetectingGps] = useState(false);

  useEffect(() => {
    // 1. Initial cached location
    getStoredLocation().then((cached) => {
      if (cached?.name) setActiveLocName(cached.name);
    });

    // 2. Subscribe to location changes anywhere in the app
    const unsubscribe = onLocationChange((loc) => {
      if (loc?.name) setActiveLocName(loc.name);
    });

    // 3. Load services, categories & fresh device location
    Promise.all([
      request<ServiceItem[]>("/catalog/services").catch(() => []),
      request<ServiceCategory[]>("/catalog/categories").catch(() => []),
      getCurrentDeviceLocation().catch(() => null),
    ])
      .then(([srvs, cats, loc]) => {
        setServices(Array.isArray(srvs) ? srvs : []);
        setCategories(Array.isArray(cats) ? cats : []);
        if (loc?.name) {
          setActiveLocName(loc.name);
        }
      })
      .finally(() => setLoading(false));

    return () => {
      unsubscribe();
    };
  }, []);

  const handleDetectGps = async () => {
    setDetectingGps(true);
    try {
      const res = await getCurrentDeviceLocation();
      if (res?.name) {
        setActiveLocName(res.name);
        await setStoredLocation(res);
      }
    } catch (err) {
      console.warn("GPS extraction error in services:", err);
    } finally {
      setDetectingGps(false);
    }
  };

  const getCategoryLabel = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("electr")) return t("services.electrical", "Electrical");
    if (lower.includes("plumb")) return t("services.plumbing", "Plumbing");
    if (lower.includes("carpen")) return t("services.carpentry", "Carpentry");
    if (lower.includes("paint")) return t("services.painting", "Painting");
    if (lower.includes("driver") || lower.includes("mobil")) return t("services.mobility", "Driver / Mobility");
    if (lower.includes("clean")) return t("services.cleaning", "Cleaning");
    if (lower.includes("garden")) return t("services.gardening", "Gardening");
    if (lower.includes("care")) return t("services.caregiving", "Caregiving");
    return name;
  };

  const filteredServices = services.filter((s) => {
    const matchesCat = selectedCat === "all" || s.category_id === selectedCat;
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <View style={styles.screen}>
      <MobileHeader />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Title Header */}
        <View style={styles.headerBlock}>
          <View style={styles.badgeRow}>
            <View style={styles.pillBadge}>
              <ShieldCheck size={11} color="#047857" />
              <Text style={styles.pillText}>Transparent Upfront Rates &bull; Zero Surge</Text>
            </View>
          </View>
          <Text style={styles.pageTitle}>{t("services.title", "Browse Verified Trade Services")}</Text>
          <Text style={styles.pageSub}>
            {t(
              "services.subtitle",
              "Cooperative-verified tradespeople with transparent statutory pricing and 30-day work assurance."
            )}
          </Text>
        </View>

        {/* Wage Transparency Banner */}
        <View style={styles.wageCard}>
          <View style={styles.wageHeader}>
            <View style={styles.rupeeCircle}>
              <Text style={styles.rupeeText}>₹</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.wageTitle}>Transparent Pricing &bull; Fair Living Wages</Text>
              <Text style={styles.wageDesc}>
                Cooperative-guaranteed 90% direct earnings to tradespersons and 10% welfare fund.
              </Text>
            </View>
          </View>
        </View>

        {/* Fast GPS Location Hub Bar */}
        <View style={styles.gpsBar}>
          <View style={styles.gpsIconCircle}>
            <MapPin size={15} color="#047857" />
          </View>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.gpsLabel}>ACTIVE COOPERATIVE SERVICE HUB</Text>
            <Text style={styles.gpsValue} numberOfLines={1}>
              {detectingGps ? t("header.detecting_gps", "Detecting GPS...") : activeLocName}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.gpsRefreshBtn}
            onPress={handleDetectGps}
            disabled={detectingGps}
          >
            <RefreshCw size={11} color="#065F46" />
            <Text style={styles.gpsRefreshText}>{detectingGps ? "..." : t("header.detect_btn", "Detect")}</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={16} color={colors.text.muted} />
          <TextInput
            placeholder={t("services.search_placeholder", "Search by service title or trade...")}
            placeholderTextColor={colors.text.subtle}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

        {/* Category Pills Slider */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          <TouchableOpacity
            style={[
              styles.catPill,
              selectedCat === "all" && styles.catPillActive,
            ]}
            onPress={() => setSelectedCat("all")}
          >
            <Text
              style={[
                styles.catText,
                selectedCat === "all" && styles.catTextActive,
              ]}
            >
              {t("services.all", "All Services")} ({services.length})
            </Text>
          </TouchableOpacity>

          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.catPill,
                selectedCat === cat.id && styles.catPillActive,
              ]}
              onPress={() => setSelectedCat(cat.id)}
            >
              <Text
                style={[
                  styles.catText,
                  selectedCat === cat.id && styles.catTextActive,
                ]}
              >
                {getCategoryLabel(cat.name)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Services List */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.brand.primary} />
            <Text style={styles.loadingText}>{t("common.loading", "Loading trade catalog...")}</Text>
          </View>
        ) : filteredServices.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>
              {t("services.no_results", "No services found matching criteria")}
            </Text>
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => {
                setSelectedCat("all");
                setSearch("");
              }}
            >
              <Text style={styles.clearBtnText}>{t("services.clear_filters", "Clear filters")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.serviceCardsContainer}>
            {filteredServices.map((srv) => (
              <View key={srv.id} style={styles.serviceCard}>
                <View style={styles.cardTop}>
                  <Text style={styles.srvTitle}>{srv.name}</Text>
                  <View
                    style={[
                      styles.certBadge,
                      srv.requires_certification ? styles.certVerified : styles.certStandard,
                    ]}
                  >
                    <Text
                      style={[
                        styles.certText,
                        srv.requires_certification ? styles.certTextVerified : styles.certTextStandard,
                      ]}
                    >
                      {srv.requires_certification ? t("status.certified", "Certified Trade") : t("status.verified", "Verified")}
                    </Text>
                  </View>
                </View>

                <Text style={styles.srvDesc} numberOfLines={2}>
                  {srv.description}
                </Text>

                {/* Statutory Pricing Breakdown Box */}
                <View style={styles.priceBreakdownBox}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Total Payable Amount:</Text>
                    <Text style={styles.priceTotal}>₹{srv.base_price}</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.workerWageLabel}>&bull; Direct Worker Fair Wage (90%):</Text>
                    <Text style={styles.workerWageVal}>₹{srv.worker_earning}</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.coopFeeLabel}>&bull; Cooperative Welfare &amp; Ops (10%):</Text>
                    <Text style={styles.coopFeeVal}>₹{srv.coop_charge}</Text>
                  </View>
                </View>

                {/* Book Service Action Button */}
                <TouchableOpacity
                  style={styles.bookBtn}
                  onPress={() => router.push(`/(customer)/book?serviceId=${srv.id}` as any)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.bookBtnText}>{t("services.book_now", "Book Service")}</Text>
                  <ArrowRight size={13} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface.pageBg,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },
  headerBlock: {
    marginBottom: 12,
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
  pageTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  pageSub: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
    lineHeight: 16,
  },
  wageCard: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: radii.xl,
    padding: 12,
    marginBottom: 12,
  },
  wageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rupeeCircle: {
    width: 32,
    height: 32,
    borderRadius: radii.lg,
    backgroundColor: colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  rupeeText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  wageTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.brand.dark,
  },
  wageDesc: {
    fontSize: 10.5,
    color: colors.brand.emerald800,
    marginTop: 1,
  },
  gpsBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radii.xl,
    padding: 10,
    marginBottom: 12,
    ...shadows.card,
  },
  gpsIconCircle: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  gpsLabel: {
    fontSize: 8.5,
    fontWeight: "800",
    color: colors.text.subtle,
    letterSpacing: 0.5,
  },
  gpsValue: {
    fontSize: 11.5,
    fontWeight: "bold",
    color: colors.text.primary,
    marginTop: 1,
  },
  gpsRefreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  gpsRefreshText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#065F46",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: radii.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.surface.border,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12.5,
    color: colors.text.primary,
    padding: 0,
  },
  categoryScroll: {
    marginBottom: 14,
  },
  categoryContent: {
    gap: 6,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radii.lg,
  },
  catPillActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  catText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  catTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 8,
  },
  emptyBox: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  clearBtn: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.brand.primary,
    borderRadius: radii.md,
  },
  clearBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  serviceCardsContainer: {
    gap: 12,
  },
  serviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.xl,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.surface.border,
    ...shadows.card,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 4,
  },
  srvTitle: {
    fontSize: 14.5,
    fontWeight: "bold",
    color: colors.text.primary,
    flex: 1,
  },
  certBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  certVerified: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  certStandard: {
    backgroundColor: "#F1F5F9",
    borderColor: "#E2E8F0",
  },
  certText: {
    fontSize: 9.5,
    fontWeight: "700",
  },
  certTextVerified: {
    color: "#047857",
  },
  certTextStandard: {
    color: colors.text.secondary,
  },
  srvDesc: {
    fontSize: 11.5,
    color: colors.text.secondary,
    lineHeight: 16,
    marginBottom: 10,
  },
  priceBreakdownBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    borderRadius: radii.md,
    padding: 10,
    gap: 4,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.primary,
  },
  priceTotal: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.text.primary,
  },
  workerWageLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.brand.primary,
  },
  workerWageVal: {
    fontSize: 10.5,
    fontWeight: "bold",
    color: colors.brand.primary,
  },
  coopFeeLabel: {
    fontSize: 10,
    color: colors.text.muted,
  },
  coopFeeVal: {
    fontSize: 10.5,
    color: colors.text.muted,
  },
  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: colors.brand.primary,
    paddingVertical: 10,
    borderRadius: radii.lg,
  },
  bookBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
});

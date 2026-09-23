import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Switch, Platform, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../lib/auth";
import { useLang, SUPPORTED_LANGUAGES } from "../lib/i18n";
import {
  getCurrentDeviceLocation,
  getStoredLocation,
  setStoredLocation,
  onLocationChange,
  startLocationTracking,
  stopLocationTracking,
  isLocationTrackingActive,
  PRESET_LOCATIONS,
  LocationItem,
} from "../lib/location";
import { colors, radii, shadows } from "../lib/theme";
import { MapPin, AlertTriangle, Globe, LogOut, Check, Navigation, Activity, Search } from "lucide-react-native";

interface HeaderProps {
  title?: string;
  showEmergency?: boolean;
}

export default function MobileHeader({ title, showEmergency = true }: HeaderProps) {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLang();
  const router = useRouter();

  const [activeLoc, setActiveLoc] = useState<LocationItem | null>(null);
  const [activeLocName, setActiveLocName] = useState("Detecting Location...");
  const [detectingGps, setDetectingGps] = useState(false);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // 1. Initial cached location check (purge any old stale "Gandhipuram" if it was saved by default)
    getStoredLocation().then((cached) => {
      if (cached && !cached.area?.toLowerCase().includes("gandhipuram")) {
        setActiveLoc(cached);
        if (cached.name) setActiveLocName(cached.name);
      }
    });

    // 2. Subscribe to any location changes in the entire mobile app
    const unsubscribe = onLocationChange((loc) => {
      if (loc) {
        setActiveLoc(loc);
        if (loc.name) setActiveLocName(loc.name);
      }
    });

    // 3. Immediately trigger fresh real location detection
    setDetectingGps(true);
    getCurrentDeviceLocation()
      .then((loc) => {
        if (loc) {
          setActiveLoc(loc);
          if (loc.name) setActiveLocName(loc.name);
        }
      })
      .catch((err) => console.warn("Location auto-detection notice:", err))
      .finally(() => setDetectingGps(false));

    setIsLiveTracking(isLocationTrackingActive());

    return () => {
      unsubscribe();
    };
  }, []);

  const handleQuickGps = async () => {
    setDetectingGps(true);
    try {
      const res = await getCurrentDeviceLocation();
      if (res) {
        setActiveLoc(res);
        if (res.name) setActiveLocName(res.name);
      }
    } catch (err) {
      console.warn("GPS extraction error in mobile header:", err);
    } finally {
      setDetectingGps(false);
    }
  };

  const handleToggleLiveTracking = async () => {
    if (isLiveTracking) {
      stopLocationTracking();
      setIsLiveTracking(false);
    } else {
      setDetectingGps(true);
      await startLocationTracking((updatedLoc) => {
        setActiveLoc(updatedLoc);
        if (updatedLoc.name) setActiveLocName(updatedLoc.name);
        setDetectingGps(false);
      });
      setIsLiveTracking(true);
      setDetectingGps(false);
    }
  };

  const handleSelectPreset = async (loc: LocationItem) => {
    setActiveLoc(loc);
    setActiveLocName(loc.name);
    await setStoredLocation(loc);
    setShowLocationPicker(false);
  };

  return (
    <View style={styles.container}>
      {/* Top Main Row */}
      <View style={styles.navRow}>
        {/* Left: Brand Logo & Title */}
        <TouchableOpacity
          style={styles.brandRow}
          onPress={() => router.push("/")}
          activeOpacity={0.8}
        >
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>⚙</Text>
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.brandTitle}>ON-DEMAND</Text>
              <View style={styles.coopPill}>
                <Text style={styles.coopPillText}>{t("nav.cooperative", "COOPERATIVE")}</Text>
              </View>
            </View>
            {user ? (
              <Text style={styles.userSub} numberOfLines={1}>
                {user.name} &bull; <Text style={styles.userRole}>{user.role}</Text>
              </Text>
            ) : (
              <Text style={styles.userSub}>{t("header.verified_network", "Verified Trade Network")}</Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Right Controls: Language & SOS */}
        <View style={styles.rightRow}>
          {/* Language Switcher */}
          <TouchableOpacity
            style={styles.langBtn}
            onPress={() => setShowLangModal(true)}
            activeOpacity={0.7}
          >
            <Globe size={12} color="#A7F3D0" />
            <Text style={styles.langText}>{lang.toUpperCase()}</Text>
          </TouchableOpacity>

          {/* SOS Priority Button */}
          {showEmergency && (
            <TouchableOpacity
              style={styles.sosBtn}
              onPress={() => router.push("/emergency")}
              activeOpacity={0.8}
            >
              <AlertTriangle size={12} color="#FFFFFF" />
              <Text style={styles.sosText}>SOS</Text>
              <View style={styles.pulseDot} />
            </TouchableOpacity>
          )}

          {/* User Sign Out if authenticated */}
          {user && (
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={async () => {
                await logout();
                router.replace("/(auth)/login");
              }}
              activeOpacity={0.7}
            >
              <LogOut size={13} color="#A7F3D0" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sub Bar: Fast GPS Location Pill & Live Status */}
      <View style={styles.locBarRow}>
        <TouchableOpacity
          style={styles.gpsPill}
          onPress={() => setShowLocationPicker(true)}
          activeOpacity={0.8}
        >
          <View style={[styles.gpsDot, (detectingGps || isLiveTracking) && styles.gpsDotPulsing]} />
          <MapPin size={12} color="#6EE7B7" />
          <Text style={styles.locNameText} numberOfLines={1}>
            {detectingGps ? t("header.detecting_gps", "Detecting GPS...") : activeLocName}
          </Text>
          <View style={[styles.gpsTag, isLiveTracking && styles.gpsTagLive]}>
            <Text style={styles.gpsTagText}>
              {isLiveTracking ? "LIVE" : "GPS"}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.refreshGpsBtn, isLiveTracking && styles.liveTrackingActiveBtn]}
          onPress={handleQuickGps}
          disabled={detectingGps}
          activeOpacity={0.7}
        >
          <Text style={styles.refreshGpsText}>
            {detectingGps ? "..." : t("header.detect_btn", "Detect")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Location & GPS Tracking Modal */}
      <Modal visible={showLocationPicker} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.pickerCard}>
            <Text style={styles.modalHeading}>
              {t("header.hub_title", "Select Cooperative Service Hub")}
            </Text>
            <Text style={styles.modalSubheading}>
              {t(
                "header.hub_sub",
                "Nearest trade dispatch center will be assigned for minimum arrival time."
              )}
            </Text>

            {/* Live GPS Coordinates Banner */}
            {activeLoc?.lat && activeLoc?.lng && (
              <View style={styles.coordsCard}>
                <View style={styles.coordsHeader}>
                  <View style={styles.coordsIconRow}>
                    <Navigation size={13} color="#059669" />
                    <Text style={styles.coordsTitle}>{t("gps.signal_locked", "Satellite Signal Locked")}</Text>
                  </View>
                  {activeLoc.accuracy !== undefined && (
                    <Text style={styles.coordsAcc}>±{activeLoc.accuracy}m</Text>
                  )}
                </View>
                <Text style={styles.coordsText}>
                  {activeLoc.lat.toFixed(4)}° N, {activeLoc.lng.toFixed(4)}° E
                </Text>
                <Text style={styles.coordsAddress} numberOfLines={2}>
                  {activeLoc.address || activeLoc.name}
                </Text>
              </View>
            )}

            {/* Real-time Tracking Toggle Card */}
            <View style={styles.liveTrackingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.liveTrackingTitle}>
                  {isLiveTracking ? t("gps.tracking_active", "LIVE TRACKING ACTIVE") : t("gps.live_tracking", "GPS Live Tracking")}
                </Text>
                <Text style={styles.liveTrackingSub}>
                  {isLiveTracking
                    ? t("gps.stop_tracking", "Continuous GPS updates active as you move.")
                    : t("gps.start_tracking", "Enable real-time background location updates.")}
                </Text>
              </View>
              <Switch
                value={isLiveTracking}
                onValueChange={handleToggleLiveTracking}
                trackColor={{ false: "#CBD5E1", true: "#059669" }}
                thumbColor={isLiveTracking ? "#FFFFFF" : "#F8FAFC"}
              />
            </View>

            <TouchableOpacity
              style={styles.detectBtn}
              onPress={async () => {
                await handleQuickGps();
                setShowLocationPicker(false);
              }}
              disabled={detectingGps}
            >
              {detectingGps ? (
                <Activity size={15} color="#FFFFFF" />
              ) : (
                <MapPin size={15} color="#FFFFFF" />
              )}
              <Text style={styles.detectBtnText}>
                {detectingGps
                  ? t("header.detecting_gps", "Detecting Real Location...")
                  : t("header.use_live_gps", "📍 Detect My Exact Location Now")}
              </Text>
            </TouchableOpacity>

            {/* Search Input for manual selection */}
            <View style={styles.searchBox}>
              <Search size={14} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                placeholder={t("header.search_hub", "Search city or area (e.g. Salem, Fairlands, Fort)...")}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#94A3B8"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Text style={styles.clearSearch}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.presetList}>
              {PRESET_LOCATIONS.filter(
                (loc) =>
                  !searchQuery ||
                  loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  loc.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  loc.city.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((loc) => {
                const isSelected =
                  activeLocName.toLowerCase().includes(loc.area.toLowerCase()) ||
                  activeLocName.toLowerCase().includes(loc.name.toLowerCase());
                return (
                  <TouchableOpacity
                    key={loc.id || loc.name}
                    style={[styles.presetItem, isSelected && styles.presetItemActive]}
                    onPress={() => handleSelectPreset(loc)}
                  >
                    <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>
                      {loc.name}
                    </Text>
                    {isSelected && <Check size={14} color="#059669" />}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowLocationPicker(false)}
            >
              <Text style={styles.cancelBtnText}>{t("header.close", "Close")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Language Selection Modal */}
      <Modal visible={showLangModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.pickerCard}>
            <Text style={styles.modalHeading}>
              {t("header.select_lang", "Select Interface Language")}
            </Text>
            <Text style={styles.modalSubheading}>தமிழ்நாடு தொழிலாளர் கூட்டுறவு தளம்</Text>

            <View style={styles.presetList}>
              {SUPPORTED_LANGUAGES.map((item) => (
                <TouchableOpacity
                  key={item.code}
                  style={[styles.presetItem, lang === item.code && styles.presetItemActive]}
                  onPress={() => {
                    setLang(item.code);
                    setShowLangModal(false);
                  }}
                >
                  <View>
                    <Text style={[styles.presetText, lang === item.code && styles.presetTextActive]}>
                      {item.label}
                    </Text>
                    <Text style={styles.langNative}>{item.native}</Text>
                  </View>
                  {lang === item.code && <Check size={16} color="#059669" />}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowLangModal(false)}
            >
              <Text style={styles.cancelBtnText}>{t("header.close", "Close")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.brand.dark, // #064E3B (matches web navbar)
    borderBottomWidth: 1,
    borderBottomColor: colors.brand.darker, // #022C22
    paddingTop: 44, // Safe area top offset
    paddingBottom: 10,
    paddingHorizontal: 16,
    ...shadows.elevated,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: colors.brand.accent, // #198754
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  logoIcon: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  coopPill: {
    backgroundColor: colors.brand.emerald800,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radii.sm,
  },
  coopPillText: {
    color: "#A7F3D0",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  userSub: {
    fontSize: 11,
    color: "#A7F3D0",
    marginTop: 1,
    fontWeight: "500",
  },
  userRole: {
    color: "#6EE7B7",
    fontWeight: "700",
  },
  rightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 5,
    backgroundColor: "rgba(6, 78, 59, 0.8)",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.3)",
  },
  langText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  sosBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: colors.status.danger, // #DC2626
    borderRadius: radii.md,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  sosText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  pulseDot: {
    width: 5,
    height: 5,
    borderRadius: radii.full,
    backgroundColor: "#FECACA",
  },
  logoutBtn: {
    padding: 6,
    backgroundColor: "rgba(6, 78, 59, 0.8)",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.3)",
  },
  locBarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(4, 120, 87, 0.4)",
  },
  gpsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(2, 44, 34, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.4)",
    borderRadius: radii.full,
    paddingHorizontal: 9,
    paddingVertical: 4,
    flex: 1,
    marginRight: 8,
  },
  gpsDot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: "#34D399",
  },
  gpsDotPulsing: {
    backgroundColor: "#FBBF24",
  },
  locNameText: {
    fontSize: 11,
    color: "#ECFDF5",
    fontWeight: "600",
    flex: 1,
  },
  gpsTag: {
    backgroundColor: colors.brand.emerald800,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: radii.sm,
  },
  gpsTagText: {
    color: "#6EE7B7",
    fontSize: 8,
    fontWeight: "900",
  },
  refreshGpsBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(6, 78, 59, 0.9)",
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.3)",
  },
  refreshGpsText: {
    color: "#A7F3D0",
    fontSize: 10,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    justifyContent: "center",
    padding: 20,
  },
  pickerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.xl,
    padding: 20,
    ...shadows.elevated,
  },
  modalHeading: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  modalSubheading: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 3,
    marginBottom: 14,
  },
  gpsTagLive: {
    backgroundColor: "#047857",
  },
  liveTrackingActiveBtn: {
    borderColor: "#34D399",
    backgroundColor: "#065F46",
  },
  coordsCard: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: radii.lg,
    padding: 12,
    marginBottom: 12,
  },
  coordsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  coordsIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  coordsTitle: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#065F46",
    letterSpacing: 0.3,
  },
  coordsAcc: {
    fontSize: 10,
    fontWeight: "700",
    color: "#047857",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radii.sm,
  },
  coordsText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#064E3B",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    marginTop: 2,
  },
  coordsAddress: {
    fontSize: 11,
    color: "#047857",
    marginTop: 2,
  },
  liveTrackingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: radii.lg,
    padding: 12,
    marginBottom: 12,
    gap: 10,
  },
  liveTrackingTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: colors.text.primary,
  },
  liveTrackingSub: {
    fontSize: 10.5,
    color: colors.text.muted,
    marginTop: 2,
  },
  detectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.brand.primary,
    paddingVertical: 10,
    borderRadius: radii.lg,
    marginBottom: 14,
  },
  detectBtnText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "bold",
  },
  presetList: {
    gap: 6,
    marginBottom: 14,
  },
  presetItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  presetItemActive: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  presetText: {
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: "600",
  },
  presetTextActive: {
    color: colors.brand.primary,
    fontWeight: "700",
  },
  langNative: {
    fontSize: 10.5,
    color: colors.text.muted,
    marginTop: 1,
  },
  cancelBtn: {
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: radii.lg,
  },
  cancelBtnText: {
    fontSize: 12.5,
    fontWeight: "bold",
    color: colors.text.secondary,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: radii.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: colors.text.primary,
    padding: 0,
  },
  clearSearch: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "bold",
    paddingHorizontal: 4,
  },
});

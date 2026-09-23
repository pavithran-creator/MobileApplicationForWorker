import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import MobileHeader from "../components/Header";
import { useAuth } from "../lib/auth";
import { useLang } from "../lib/i18n";
import { request } from "../lib/api";
import {
  getCurrentDeviceLocation,
  getStoredLocation,
  setStoredLocation,
  onLocationChange,
} from "../lib/location";
import { colors, radii, shadows } from "../lib/theme";
import { ServiceItem, MatchedWorker } from "../types";
import {
  AlertTriangle,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  Zap,
  Droplets,
  Hammer,
  CheckCircle2,
  ArrowRight,
  X,
} from "lucide-react-native";

export default function EmergencyScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { lang, t } = useLang();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number>(1);
  const [address, setAddress] = useState("Gandhipuram, Coimbatore");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({ lat: 11.0168, lng: 76.9558 });
  const [description, setDescription] = useState("Urgent breakdown, immediate technician needed");

  // Search state
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [emergencyResult, setEmergencyResult] = useState<any | null>(null);

  // Dispatch state
  const [dispatchLoadingId, setDispatchLoadingId] = useState<number | null>(null);
  const [dispatchSuccess, setDispatchSuccess] = useState<any | null>(null);

  useEffect(() => {
    // 1. Fetch catalog services
    request<ServiceItem[]>("/catalog/services")
      .then((srvs) => {
        if (Array.isArray(srvs) && srvs.length > 0) {
          setServices(srvs);
          setSelectedServiceId(srvs[0].id);
        }
      })
      .catch(() => {});

    // 2. Fetch cached location first
    getStoredLocation().then((cached) => {
      if (cached) {
        if (cached.address) setAddress(cached.address);
        else if (cached.name) setAddress(cached.name);
        if (cached.lat && cached.lng) {
          setUserCoords({ lat: cached.lat, lng: cached.lng });
        }
      }
    });

    // 3. Listen to cross-app location updates
    const unsubscribe = onLocationChange((loc) => {
      if (loc) {
        if (loc.address) setAddress(loc.address);
        else if (loc.name) setAddress(loc.name);
        if (loc.lat && loc.lng) {
          setUserCoords({ lat: loc.lat, lng: loc.lng });
        }
      }
    });

    // 4. Fetch fresh device GPS
    getCurrentDeviceLocation()
      .then((loc) => {
        if (loc) {
          if (loc.address) setAddress(loc.address);
          else if (loc.name) setAddress(loc.name);
          if (loc.lat && loc.lng) {
            setUserCoords({ lat: loc.lat, lng: loc.lng });
          }
        }
      })
      .catch(() => {});

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSearchEmergency = async () => {
    setLoadingSearch(true);
    setEmergencyResult(null);
    setDispatchSuccess(null);

    try {
      const res: any = await request<any>("/emergency-requests", {
        method: "POST",
        body: JSON.stringify({
          service_id: selectedServiceId,
          address,
          description,
          lat: userCoords.lat,
          lng: userCoords.lng,
        }),
      });

      setEmergencyResult(res);
    } catch (err: any) {
      Alert.alert(t("common.error", "Emergency Error"), err.message || "Failed to find emergency workers");
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleDispatchWorker = async (workerId: number) => {
    setDispatchLoadingId(workerId);
    try {
      const res: any = await request<any>(`/emergency-requests/991/dispatch`, {
        method: "POST",
        body: JSON.stringify({
          worker_id: workerId,
          address,
          lat: userCoords.lat,
          lng: userCoords.lng,
        }),
      });

      setDispatchSuccess(res);
    } catch (err: any) {
      Alert.alert(t("common.error", "Dispatch Error"), err.message || "Failed to dispatch worker");
    } finally {
      setDispatchLoadingId(null);
    }
  };

  return (
    <View style={styles.screen}>
      <MobileHeader title="Emergency Dispatch" showEmergency={false} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Emergency Alert Header Banner */}
        <View style={styles.alertBanner}>
          <View style={styles.alertTopRow}>
            <View style={styles.alertPill}>
              <View style={styles.pulseDot} />
              <Text style={styles.alertPillText}>24/7 COOPERATIVE PRIORITY</Text>
            </View>
            <View style={styles.slaBadge}>
              <Text style={styles.slaText}>&lt; 30 MINS</Text>
            </View>
          </View>

          <Text style={styles.alertTitle}>
            {t("emergency.title", "24/7 Priority Emergency Dispatch")}
          </Text>
          <Text style={styles.alertSub}>
            {t(
              "emergency.subtitle",
              "Urgent short-circuits, burst pipes, and lock emergencies dispatched with guaranteed immediate arrival."
            )}
          </Text>
        </View>


        {/* Dispatch Confirmation Card if successfully dispatched */}
        {dispatchSuccess ? (
          <View style={styles.successCard}>
            <View style={styles.successHeader}>
              <CheckCircle2 size={24} color="#16A34A" />
              <View style={{ flex: 1 }}>
                <Text style={styles.successTitle}>Emergency Technician Dispatched!</Text>
                <Text style={styles.successSub}>
                  Assigned {dispatchSuccess.worker?.name || "Suresh Kumar"} &bull; On route
                </Text>
              </View>
            </View>

            <View style={styles.etaBox}>
              <Text style={styles.etaLabel}>ESTIMATED ARRIVAL TIME</Text>
              <Text style={styles.etaTime}>12 - 15 Minutes</Text>
              <Text style={styles.etaSub}>Direct priority GPS tracking active</Text>
            </View>

            <View style={styles.dispatchedWorkerBox}>
              <Text style={styles.workerLabel}>TECHNICIAN DETAILS</Text>
              <Text style={styles.dispatchedName}>
                {dispatchSuccess.worker?.name || "Suresh Kumar (Electrician)"}
              </Text>
              <Text style={styles.dispatchedPhone}>Phone: 9010000001</Text>
              <Text style={styles.dispatchedAddress}>Address: {address}</Text>
            </View>

            <TouchableOpacity
              style={styles.backHomeBtn}
              onPress={() => router.replace("/(customer)")}
            >
              <Text style={styles.backHomeBtnText}>Go to Home</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Request Form */
          <View style={styles.formCard}>
            <Text style={styles.formSectionTitle}>1. Select Emergency Trade</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {[
                { id: 1, name: "Electrical Breakdown", icon: <Zap size={14} color="#D97706" /> },
                { id: 3, name: "Burst Pipe & Plumbing", icon: <Droplets size={14} color="#2563EB" /> },
                { id: 5, name: "Lockout & Door Jam", icon: <Hammer size={14} color="#B45309" /> },
              ].map((tItem) => (
                <TouchableOpacity
                  key={tItem.id}
                  style={[
                    styles.tradeChip,
                    selectedServiceId === tItem.id && styles.tradeChipActive,
                  ]}
                  onPress={() => setSelectedServiceId(tItem.id)}
                >
                  {tItem.icon}
                  <Text
                    style={[
                      styles.tradeChipText,
                      selectedServiceId === tItem.id && styles.tradeChipTextActive,
                    ]}
                  >
                    {tItem.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.formSectionTitle}>2. Service Location</Text>
            <View style={styles.locBox}>
              <MapPin size={16} color={colors.status.danger} />
              <TextInput
                value={address}
                onChangeText={setAddress}
                style={styles.locInput}
                placeholder="Door No, Street, Landmark"
              />
            </View>

            <Text style={styles.formSectionTitle}>3. Emergency Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe emergency situation..."
              placeholderTextColor={colors.text.subtle}
              style={styles.descInput}
              multiline
            />

            <TouchableOpacity
              style={styles.findBtn}
              onPress={handleSearchEmergency}
              disabled={loadingSearch}
              activeOpacity={0.85}
            >
              {loadingSearch ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.findBtnText}>Find Available Emergency Workers</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Emergency Candidates List */}
        {emergencyResult && !dispatchSuccess && (
          <View style={styles.candidatesCard}>
            <View style={styles.candidatesHeader}>
              <Text style={styles.candidatesTitle}>Available Emergency Technicians</Text>
              <Text style={styles.candidatesSub}>Guaranteed on-call within your 5 km radius</Text>
            </View>

            {emergencyResult.candidates?.map((cand: MatchedWorker) => (
              <View key={cand.worker_id} style={styles.candItem}>
                <View style={styles.candLeft}>
                  <View style={styles.candAvatar}>
                    <Text style={styles.candAvatarText}>{cand.name.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.candName}>{cand.name}</Text>
                    <Text style={styles.candCoop}>{cand.cooperative_name}</Text>
                    <View style={styles.candMeta}>
                      <Text style={styles.candDist}>📍 {cand.distance_km || "1.2"} km away</Text>
                      <Text style={styles.candRating}>★ {cand.avg_rating || "4.9"}</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.dispatchBtn}
                  onPress={() => handleDispatchWorker(cand.worker_id)}
                  disabled={dispatchLoadingId === cand.worker_id}
                >
                  {dispatchLoadingId === cand.worker_id ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.dispatchBtnText}>Dispatch Now</Text>
                  )}
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
  alertBanner: {
    backgroundColor: "#DC2626", // Red
    borderRadius: radii.xl,
    padding: 16,
    ...shadows.elevated,
    marginBottom: 14,
  },
  alertTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  alertPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: "#FFFFFF",
  },
  alertPillText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  slaBadge: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  slaText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#DC2626",
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  alertSub: {
    fontSize: 11.5,
    color: "#FEE2E2",
    marginTop: 4,
    lineHeight: 16,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surface.border,
    ...shadows.card,
    marginBottom: 14,
  },
  formSectionTitle: {
    fontSize: 12.5,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 6,
  },
  chipScroll: {
    marginBottom: 12,
  },
  tradeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radii.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  tradeChipActive: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  tradeChipText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: colors.text.primary,
  },
  tradeChipTextActive: {
    color: "#B91C1C",
    fontWeight: "700",
  },
  locBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F8FAFC",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.surface.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  locInput: {
    flex: 1,
    fontSize: 12,
    color: colors.text.primary,
    padding: 0,
  },
  descInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.surface.border,
    padding: 10,
    fontSize: 12,
    color: colors.text.primary,
    minHeight: 50,
    textAlignVertical: "top",
    marginBottom: 14,
  },
  findBtn: {
    backgroundColor: "#DC2626",
    paddingVertical: 12,
    borderRadius: radii.lg,
    alignItems: "center",
    ...shadows.elevated,
  },
  findBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  candidatesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surface.border,
    ...shadows.card,
    marginBottom: 20,
  },
  candidatesHeader: {
    marginBottom: 12,
  },
  candidatesTitle: {
    fontSize: 13.5,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  candidatesSub: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 1,
  },
  candItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  candLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  candAvatar: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
  },
  candAvatarText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  candName: {
    fontSize: 12.5,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  candCoop: {
    fontSize: 10,
    color: colors.text.muted,
  },
  candMeta: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  candDist: {
    fontSize: 10.5,
    color: colors.brand.primary,
    fontWeight: "600",
  },
  candRating: {
    fontSize: 10.5,
    color: "#D97706",
    fontWeight: "bold",
  },
  dispatchBtn: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.md,
  },
  dispatchBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  successCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#A7F3D0",
    ...shadows.elevated,
    marginBottom: 20,
  },
  successHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.brand.dark,
  },
  successSub: {
    fontSize: 11.5,
    color: colors.brand.emerald800,
    marginTop: 1,
  },
  etaBox: {
    backgroundColor: "#ECFDF5",
    borderRadius: radii.lg,
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  etaLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.brand.primary,
    letterSpacing: 0.5,
  },
  etaTime: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.brand.dark,
    marginVertical: 2,
  },
  etaSub: {
    fontSize: 10.5,
    color: "#047857",
  },
  dispatchedWorkerBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: radii.lg,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.surface.border,
    marginBottom: 14,
    gap: 2,
  },
  workerLabel: {
    fontSize: 8.5,
    fontWeight: "800",
    color: colors.text.subtle,
    letterSpacing: 0.5,
  },
  dispatchedName: {
    fontSize: 12.5,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  dispatchedPhone: {
    fontSize: 11,
    color: colors.brand.primary,
  },
  dispatchedAddress: {
    fontSize: 10.5,
    color: colors.text.secondary,
  },
  backHomeBtn: {
    backgroundColor: colors.brand.primary,
    paddingVertical: 12,
    borderRadius: radii.lg,
    alignItems: "center",
  },
  backHomeBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
});

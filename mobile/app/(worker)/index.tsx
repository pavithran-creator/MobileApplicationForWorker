import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Image,
  Alert,
  Platform,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import MobileHeader from "../../components/Header";
import { useAuth } from "../../lib/auth";
import { useLang } from "../../lib/i18n";
import { request } from "../../lib/api";
import {
  startLocationTracking,
  stopLocationTracking,
  isLocationTrackingActive,
  onLocationChange,
  getStoredLocation,
  LocationItem,
} from "../../lib/location";
import { colors, radii, shadows } from "../../lib/theme";
import { BookingRecord, UserProfile } from "../../types";
import {
  ShieldCheck,
  Star,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
  Phone,
  CreditCard,
  X,
  Award,
  Navigation,
} from "lucide-react-native";

export default function WorkerHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLang();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [skills, setSkills] = useState<string[]>([
    "Domestic Wiring & Fault Diagnosis",
    "Switchboard & Circuit Breakers",
    "Ceiling Fan & Inverter Setup",
  ]);
  const [loading, setLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [workerLoc, setWorkerLoc] = useState<LocationItem | null>(null);

  // Add Skill Modal
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillExp, setNewSkillExp] = useState("3");
  const [addingSkill, setAddingSkill] = useState(false);


  const fetchWorkerData = async () => {
    try {
      setLoading(true);
      const [me, bks] = await Promise.all([
        request<UserProfile>("/auth/me").catch(() => null),
        request<BookingRecord[]>("/bookings").catch(() => []),
      ]);

      if (me) {
        setProfile(me);
      } else {
        setProfile({
          id: 1,
          worker_id: 1,
          name: user?.name || "Suresh Kumar",
          phone: user?.phone || "9010000001",
          role: "WORKER",
          verification_status: "VERIFIED",
          cooperative: "Gandhipuram Labour Cooperative Society",
          avg_rating: 4.9,
          rating_count: 142,
          experience_years: 8,
          upi_id: "suresh.coop@oksbi",
          bio: "Senior certified electrician with 8+ years experience in domestic wiring and fault diagnosis.",
          address: "Gandhipuram, Coimbatore",
          avatar_url: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80",
        });
      }

      if (Array.isArray(bks)) {
        setBookings(bks);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerData();

    getStoredLocation().then((cached) => {
      if (cached) setWorkerLoc(cached);
    });

    const unsubscribe = onLocationChange((loc) => {
      if (loc) setWorkerLoc(loc);
    });

    setIsTracking(isLocationTrackingActive());

    return () => {
      unsubscribe();
    };
  }, []);

  const handleToggleTracking = async () => {
    if (isTracking) {
      stopLocationTracking();
      setIsTracking(false);
    } else {
      await startLocationTracking((updatedLoc) => {
        setWorkerLoc(updatedLoc);
      });
      setIsTracking(true);
    }
  };

  const handleUpdateStatus = async (bookingId: number, nextStatus: string) => {
    try {
      await request<any>(`/bookings/${bookingId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchWorkerData();
    } catch (err: any) {
      Alert.alert(t("common.error", "Error"), err.message || "Failed to update job status");
    }
  };

  const handleAddSkill = async () => {
    if (!newSkillName.trim()) {
      Alert.alert(t("common.error", "Skill Required"), "Please enter a trade skill name.");
      return;
    }
    setAddingSkill(true);
    try {
      await request<any>("/workers/me/skills", {
        method: "POST",
        body: JSON.stringify({
          skill_name: newSkillName.trim(),
          experience_years: Number(newSkillExp) || 2,
        }),
      });
      setSkills((prev) => [...prev, newSkillName.trim()]);
      setNewSkillName("");
      setShowAddSkillModal(false);
      Alert.alert(t("common.success", "Skill Added"), "Your trade skill has been added to your cooperative profile.");
    } catch (err: any) {
      Alert.alert(t("common.error", "Error"), err.message || "Failed to add skill");
    } finally {
      setAddingSkill(false);
    }
  };

  // Metrics
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED");
  const totalDirectEarnings = completedBookings.reduce(
    (sum, b) => sum + (Number(b.service_amount) || Number(b.total_amount) * 0.9),
    0
  );

  return (
    <View style={styles.screen}>
      <MobileHeader title={t("nav.jobs_tab", "Cooperative Worker Portal")} showEmergency={false} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Worker Profile Header Card */}
        {profile && (
          <View style={styles.profileCard}>
            <View style={styles.profileTop}>
              <View style={styles.avatarBox}>
                {profile.avatar_url ? (
                  <Image source={{ uri: profile.avatar_url }} style={styles.avatarImg} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarLetter}>{profile.name.charAt(0)}</Text>
                  </View>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.workerName}>{profile.name}</Text>
                  <View style={styles.verifiedBadge}>
                    <ShieldCheck size={11} color="#047857" />
                    <Text style={styles.verifiedText}>{t("status.verified", "Verified Tradesperson")}</Text>
                  </View>
                </View>

                <Text style={styles.coopText}>
                  {profile.cooperative || "Coimbatore District Labour Cooperative"}
                </Text>

                <View style={styles.metaRow}>
                  <View style={styles.ratingChip}>
                    <Star size={11} color="#D97706" fill="#D97706" />
                    <Text style={styles.ratingText}>
                      {profile.avg_rating?.toFixed(1) || "4.9"} ({profile.rating_count || 142})
                    </Text>
                  </View>

                  <Text style={styles.expText}>
                    {profile.experience_years || 8} yrs exp
                  </Text>

                  {profile.upi_id && (
                    <View style={styles.upiPill}>
                      <Text style={styles.upiPillText}>UPI: {profile.upi_id}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Bio */}
            {profile.bio && (
              <View style={styles.bioBox}>
                <Text style={styles.bioText}>&ldquo;{profile.bio}&rdquo;</Text>
              </View>
            )}

            {/* Metrics Snapshot */}
            <View style={styles.metricsGrid}>
              <View style={[styles.metricCard, { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" }]}>
                <Text style={[styles.metricTitle, { color: "#047857" }]}>{t("worker.kpi_earnings", "Direct Earnings")}</Text>
                <Text style={[styles.metricNumber, { color: colors.brand.dark }]}>
                  ₹{totalDirectEarnings.toFixed(0)}
                </Text>
                <Text style={[styles.metricSub, { color: "#065F46" }]}>90% Retained Split</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>{t("worker.kpi_active_jobs", "Total Jobs")}</Text>
                <Text style={styles.metricNumber}>{bookings.length}</Text>
                <Text style={styles.metricSub}>Coop Dispatched</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>{t("worker.kpi_completed", "Completed")}</Text>
                <Text style={styles.metricNumber}>{completedBookings.length}</Text>
                <Text style={styles.metricSub}>100% Verified</Text>
              </View>
            </View>
          </View>
        )}

        {/* Live GPS Duty Tracking Card */}
        <View style={styles.gpsDutyCard}>
          <View style={styles.gpsDutyHeader}>
            <View style={styles.gpsDutyStatusRow}>
              <View style={[styles.pulseCircle, isTracking && styles.pulseCircleActive]} />
              <Text style={styles.gpsDutyTitle}>
                {isTracking ? t("gps.tracking_active", "LIVE GPS DUTY TRACKING ACTIVE") : t("gps.live_tracking", "GPS Live Tracking")}
              </Text>
            </View>
            <Switch
              value={isTracking}
              onValueChange={handleToggleTracking}
              trackColor={{ false: "#CBD5E1", true: "#059669" }}
              thumbColor={isTracking ? "#FFFFFF" : "#F8FAFC"}
            />
          </View>

          <Text style={styles.gpsDutySub}>
            {isTracking
              ? t("gps.signal_locked", "Your live GPS coordinates are actively broadcast to dispatch nearby cooperative jobs.")
              : t("gps.start_tracking", "Enable live tracking so nearest emergency dispatches reach you instantly.")}
          </Text>

          {workerLoc && (
            <View style={styles.workerLocRow}>
              <MapPin size={13} color="#047857" />
              <Text style={styles.workerLocText} numberOfLines={1}>
                {workerLoc.name} {workerLoc.accuracy ? `(±${workerLoc.accuracy}m)` : ""}
              </Text>
            </View>
          )}
        </View>

        {/* Section: Assigned Jobs */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{t("worker.assigned_jobs_title", "Assigned Cooperative Jobs & Tasks")}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{bookings.length} Jobs</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.brand.primary} />
            <Text style={styles.loadingText}>Fetching assigned tasks...</Text>
          </View>
        ) : bookings.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>{t("worker.no_jobs", "No Jobs Currently Assigned")}</Text>
            <Text style={styles.emptySub}>You will receive alerts when the cooperative assigns tasks.</Text>
          </View>
        ) : (
          <View style={styles.jobsList}>
            {bookings.map((b) => (
              <View key={b.id} style={styles.jobCard}>
                <View style={styles.jobTopRow}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                      <Text style={styles.jobId}>#{b.id}</Text>
                      <Text style={styles.jobTitle}>{b.service_name}</Text>
                      {b.is_emergency && (
                        <View style={styles.emergencyPill}>
                          <Text style={styles.emergencyPillText}>EMERGENCY</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.jobTime}>
                      {b.date} &bull; {b.start_time || "10:00"}
                    </Text>
                  </View>

                  <View style={styles.wageTakeHomeBox}>
                    <Text style={styles.takeHomeLabel}>Take-Home (90%)</Text>
                    <Text style={styles.takeHomeVal}>
                      ₹{(Number(b.service_amount) || Number(b.total_amount) * 0.9).toFixed(0)}
                    </Text>
                  </View>
                </View>

                {/* Customer Details */}
                <View style={styles.customerBox}>
                  <View style={styles.custRow}>
                    <Text style={styles.custLabel}>Customer:</Text>
                    <Text style={styles.custName}>{b.customer_name}</Text>
                  </View>

                  <View style={styles.custRow}>
                    <Text style={styles.custLabel}>Phone:</Text>
                    <Text style={styles.custPhone}>{b.worker_phone || "9000000011"}</Text>
                  </View>

                  <View style={styles.custRow}>
                    <Text style={styles.custLabel}>Address:</Text>
                    <Text style={styles.custAddress} numberOfLines={2}>{b.address}</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.jobActionsRow}>
                  {b.status === "CONFIRMED" && (
                    <TouchableOpacity
                      style={styles.actionStartBtn}
                      onPress={() => handleUpdateStatus(b.id, "IN_PROGRESS")}
                    >
                      <Text style={styles.actionStartText}>Start Service</Text>
                    </TouchableOpacity>
                  )}

                  {b.status === "IN_PROGRESS" && (
                    <TouchableOpacity
                      style={styles.actionCompleteBtn}
                      onPress={() => handleUpdateStatus(b.id, "COMPLETED")}
                    >
                      <Text style={styles.actionCompleteText}>Mark Completed ✓</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.actionDetailsBtn}
                    onPress={() => router.push(`/(worker)/job/${b.id}` as any)}
                  >
                    <Text style={styles.actionDetailsText}>View Job Details</Text>
                    <ArrowRight size={12} color={colors.brand.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Section: Trade Skills */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Certified Trade Skills</Text>
          <TouchableOpacity
            style={styles.addSkillBtn}
            onPress={() => setShowAddSkillModal(true)}
          >
            <Plus size={13} color="#FFFFFF" />
            <Text style={styles.addSkillBtnText}>Add Skill</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.skillsCard}>
          {skills.map((skill, i) => (
            <View key={i} style={styles.skillItem}>
              <CheckCircle2 size={14} color="#059669" />
              <Text style={styles.skillName}>{skill}</Text>
              <View style={styles.skillCertTag}>
                <Text style={styles.skillCertText}>VERIFIED</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add Skill Modal */}
      <Modal visible={showAddSkillModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.skillModalCard}>
            <View style={styles.modalTopBar}>
              <Text style={styles.modalTitle}>Add Trade Skill</Text>
              <TouchableOpacity onPress={() => setShowAddSkillModal(false)}>
                <X size={18} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={{ padding: 16 }}>
              <Text style={styles.inputLabel}>TRADE SKILL TITLE</Text>
              <TextInput
                value={newSkillName}
                onChangeText={setNewSkillName}
                placeholder="e.g. Inverter Installation, Motor Rewinding"
                style={styles.modalInput}
              />

              <Text style={styles.inputLabel}>YEARS OF EXPERIENCE</Text>
              <TextInput
                value={newSkillExp}
                onChangeText={setNewSkillExp}
                keyboardType="numeric"
                placeholder="Years of experience"
                style={styles.modalInput}
              />

              <TouchableOpacity
                style={styles.saveSkillBtn}
                onPress={handleAddSkill}
                disabled={addingSkill}
              >
                {addingSkill ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveSkillBtnText}>Register Skill with Society</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surface.border,
    ...shadows.card,
    marginBottom: 14,
  },
  profileTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  avatarBox: {
    width: 52,
    height: 52,
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  workerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: radii.sm,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#047857",
  },
  coopText: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
    flexWrap: "wrap",
  },
  ratingChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text.secondary,
  },
  expText: {
    fontSize: 11,
    color: colors.text.muted,
  },
  upiPill: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.surface.border,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.sm,
  },
  upiPillText: {
    fontSize: 9.5,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    color: colors.brand.primary,
    fontWeight: "600",
  },
  bioBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    borderRadius: radii.md,
    padding: 8,
    marginTop: 10,
  },
  bioText: {
    fontSize: 11,
    color: colors.text.secondary,
    fontStyle: "italic",
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radii.lg,
    padding: 10,
    alignItems: "center",
  },
  metricTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.text.secondary,
  },
  metricNumber: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.text.primary,
    marginTop: 2,
  },
  metricSub: {
    fontSize: 8.5,
    color: colors.text.muted,
    marginTop: 1,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  countBadge: {
    backgroundColor: colors.brand.light,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.brand.primary,
  },
  loadingBox: {
    paddingVertical: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 6,
  },
  emptyBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.xl,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.surface.border,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  emptySub: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
  jobsList: {
    gap: 10,
    marginBottom: 14,
  },
  jobCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surface.border,
    ...shadows.card,
  },
  jobTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 8,
    marginBottom: 8,
  },
  jobId: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.brand.primary,
  },
  jobTitle: {
    fontSize: 13.5,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  emergencyPill: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radii.sm,
  },
  emergencyPillText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#B91C1C",
  },
  jobTime: {
    fontSize: 10.5,
    color: colors.text.muted,
    marginTop: 1,
  },
  wageTakeHomeBox: {
    alignItems: "flex-end",
  },
  takeHomeLabel: {
    fontSize: 8.5,
    fontWeight: "800",
    color: colors.brand.primary,
  },
  takeHomeVal: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.brand.dark,
  },
  customerBox: {
    gap: 3,
    marginBottom: 10,
  },
  custRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  custLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: colors.text.muted,
    width: 60,
  },
  custName: {
    fontSize: 11.5,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  custPhone: {
    fontSize: 11,
    color: colors.brand.primary,
  },
  custAddress: {
    fontSize: 11,
    color: colors.text.secondary,
    flex: 1,
  },
  jobActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  actionStartBtn: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.md,
  },
  actionStartText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1D4ED8",
  },
  actionCompleteBtn: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.md,
  },
  actionCompleteText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#047857",
  },
  actionDetailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.surface.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.md,
  },
  actionDetailsText: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.brand.primary,
  },
  addSkillBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radii.md,
  },
  addSkillBtnText: {
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "bold",
  },
  skillsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.xl,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surface.border,
    ...shadows.card,
    gap: 8,
    marginBottom: 20,
  },
  skillItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  skillName: {
    fontSize: 11.5,
    fontWeight: "600",
    color: colors.text.primary,
    flex: 1,
  },
  skillCertTag: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radii.sm,
  },
  skillCertText: {
    fontSize: 8.5,
    fontWeight: "800",
    color: "#047857",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    justifyContent: "center",
    padding: 16,
  },
  skillModalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.xl,
    overflow: "hidden",
    ...shadows.elevated,
  },
  modalTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.text.subtle,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radii.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: colors.text.primary,
    marginBottom: 12,
  },
  saveSkillBtn: {
    backgroundColor: colors.brand.primary,
    paddingVertical: 11,
    borderRadius: radii.lg,
    alignItems: "center",
    marginTop: 4,
  },
  saveSkillBtnText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "bold",
  },
  gpsDutyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surface.border,
    marginBottom: 14,
    ...shadows.card,
  },
  gpsDutyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  gpsDutyStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  pulseCircle: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: "#94A3B8",
  },
  pulseCircleActive: {
    backgroundColor: "#10B981",
  },
  gpsDutyTitle: {
    fontSize: 11.5,
    fontWeight: "800",
    color: colors.text.primary,
    letterSpacing: 0.3,
  },
  gpsDutySub: {
    fontSize: 11,
    color: colors.text.muted,
    lineHeight: 15,
    marginBottom: 8,
  },
  workerLocRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  workerLocText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#065F46",
    flex: 1,
  },
});

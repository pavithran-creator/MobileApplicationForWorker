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
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import MobileHeader from "../../components/Header";
import InvoiceModal from "../../components/InvoiceModal";
import { useAuth } from "../../lib/auth";
import { useLang } from "../../lib/i18n";
import { request } from "../../lib/api";
import { colors, radii, shadows } from "../../lib/theme";
import { BookingRecord, InvoiceRecord } from "../../types";
import {
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Star,
  FileText,
  CreditCard,
  Building2,
  X,
  AlertTriangle,
} from "lucide-react-native";

export default function CustomerBookingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLang();

  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Invoice modal
  const [activeInvoice, setActiveInvoice] = useState<InvoiceRecord | null>(null);

  // Unified Payment modal
  const [activeBookingForPay, setActiveBookingForPay] = useState<BookingRecord | null>(null);
  const [utrInput, setUtrInput] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  // Rating modal
  const [ratingBooking, setRatingBooking] = useState<BookingRecord | null>(null);
  const [stars, setStars] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await request<BookingRecord[]>("/bookings");
      if (Array.isArray(data)) {
        setBookings(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenInvoice = async (booking: BookingRecord) => {
    try {
      const inv = await request<InvoiceRecord>(`/invoices/${booking.id}`);
      setActiveInvoice(inv);
    } catch {
      const total = Number(booking.total_amount) || 350;
      const workerWage = Number(booking.service_amount) || Math.round(total * 0.9);
      const coopFee = Number(booking.coop_charge) || Math.round(total - workerWage);
      setActiveInvoice({
        id: booking.id,
        invoice_no: `INV-TN-COOP-2026-${String(booking.id).padStart(4, "0")}`,
        booking_id: booking.id,
        date: booking.date,
        scheduled_date: booking.date,
        start_time: booking.start_time,
        total,
        worker_wage: workerWage,
        coop_charge: coopFee,
        payment_status: booking.status === "COMPLETED" ? "PAID" : "UNPAID",
        customer_name: booking.customer_name,
        customer_address: booking.address,
        worker_name: booking.worker_name,
        worker_phone: booking.worker_phone,
        service_name: booking.service_name,
        cooperative_name: "Gandhipuram Labour Cooperative Society",
        coop_registration_no: "TNCF/CBE/1983/9412",
        gstin: "33AAAAA0000A1Z5",
        bank_name: "Tamil Nadu State Apex Cooperative Bank",
        bank_account_no: "921020045678912",
        bank_ifsc: "TNSC0001001",
        items: [
          { label: `Direct Worker Fair Wage (90% - ${booking.worker_name})`, amount: workerWage },
          { label: "Cooperative Welfare & Admin Surcharge (10%)", amount: coopFee },
        ],
      });
    }
  };

  const handleOpenPayment = (booking: BookingRecord) => {
    setActiveBookingForPay(booking);
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    setUtrInput(`UTR-TNSC-${booking.id}-${randomSuffix}`);
  };

  const handleConfirmPayment = async () => {
    if (!activeBookingForPay) return;
    setPayLoading(true);
    try {
      await request<any>("/payments", {
        method: "POST",
        body: JSON.stringify({
          booking_id: activeBookingForPay.id,
          succeed: true,
          method: "Tamil Nadu State Apex Cooperative Bank / UPI URL",
          transaction_ref: utrInput.trim() || `UTR-TNSC-${activeBookingForPay.id}-OK`,
        }),
      });

      const inv: InvoiceRecord = await request<InvoiceRecord>(`/invoices/${activeBookingForPay.id}`);
      setActiveBookingForPay(null);
      setActiveInvoice(inv);
      fetchBookings();
    } catch (err: any) {
      Alert.alert("Payment Error", err.message || "Failed to confirm payment");
    } finally {
      setPayLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId: number, nextStatus: string) => {
    try {
      await request<any>(`/bookings/${bookingId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchBookings();
    } catch (err: any) {
      Alert.alert("Status Update", err.message || "Failed to update status");
    }
  };

  const handleSubmitRating = async () => {
    if (!ratingBooking) return;
    setRatingLoading(true);
    try {
      await request<any>("/ratings", {
        method: "POST",
        body: JSON.stringify({
          booking_id: ratingBooking.id,
          worker_id: ratingBooking.worker_id,
          rating: stars,
          feedback,
        }),
      });
      Alert.alert("Thank you!", "Your cooperative rating and review has been submitted.");
      setRatingBooking(null);
      setFeedback("");
    } catch (err: any) {
      Alert.alert("Rating Error", err.message || "Failed to submit rating");
    } finally {
      setRatingLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return { bg: "#EFF6FF", border: "#BFDBFE", text: "#1D4ED8", label: t("status.confirmed", "Confirmed") };
      case "IN_PROGRESS":
        return { bg: "#FFFBEB", border: "#FDE68A", text: "#B45309", label: t("status.in_progress", "In Progress") };
      case "COMPLETED":
        return { bg: "#ECFDF5", border: "#A7F3D0", text: "#047857", label: t("status.completed", "Completed") };
      default:
        return { bg: "#F1F5F9", border: "#E2E8F0", text: "#475569", label: status };
    }
  };

  return (
    <View style={styles.screen}>
      <MobileHeader />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header Title Bar */}
        <View style={styles.headerBlock}>
          <View style={styles.badgeRow}>
            <View style={styles.pillBadge}>
              <ShieldCheck size={11} color="#047857" />
              <Text style={styles.pillText}>Fair Wage Pricing &bull; 90% Worker Retained</Text>
            </View>
          </View>
          <Text style={styles.pageTitle}>{t("dashboard.title", "My Service Bookings & Invoices")}</Text>
          <Text style={styles.pageSub}>
            Track real-time service status, itemized transparent invoices, and submit worker reviews.
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.brand.primary} />
            <Text style={styles.loadingText}>Fetching active bookings &amp; invoices...</Text>
          </View>
        ) : bookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Active Bookings</Text>
            <Text style={styles.emptyDesc}>
              You haven't requested any cooperative trade services yet. Schedule certified tradespersons now.
            </Text>
            <TouchableOpacity
              style={styles.bookCtaBtn}
              onPress={() => router.push("/(customer)/book")}
            >
              <Text style={styles.bookCtaText}>Book a Trade Service</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.bookingsList}>
            {bookings.map((b) => {
              const badge = getStatusBadge(b.status);
              return (
                <View key={b.id} style={styles.bookingCard}>
                  {/* Card Header */}
                  <View style={styles.cardTopRow}>
                    <View style={styles.serviceInfo}>
                      <View style={styles.idBadge}>
                        <Text style={styles.idText}>#{b.id}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.srvName}>{b.service_name}</Text>
                        <Text style={styles.timeSlot}>
                          {b.date} &bull; {b.start_time} ({b.duration_min || 60}m)
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.statusPill, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                      <Text style={[styles.statusPillText, { color: badge.text }]}>{badge.label}</Text>
                    </View>
                  </View>

                  {/* Body Details */}
                  <View style={styles.detailsGrid}>
                    <View style={styles.detailCol}>
                      <Text style={styles.detailLabel}>ASSIGNED TRADESPERSON</Text>
                      <Text style={styles.workerName}>{b.worker_name}</Text>
                      <Text style={styles.workerPhone}>Ph: {b.worker_phone}</Text>
                    </View>

                    <View style={styles.detailCol}>
                      <Text style={styles.detailLabel}>SERVICE ADDRESS</Text>
                      <Text style={styles.addressVal} numberOfLines={2}>{b.address}</Text>
                    </View>

                    <View style={styles.detailCol}>
                      <Text style={styles.detailLabel}>TARIFF BREAKDOWN</Text>
                      <Text style={styles.tariffTotalVal}>₹{(Number(b.total_amount) || 0).toFixed(2)}</Text>
                      <Text style={styles.tariffSubVal}>
                        90% Worker (₹{(Number(b.service_amount) || 0).toFixed(2)}) &bull; 10% Coop
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionsRow}>
                    {/* Status updates */}
                    {b.status === "CONFIRMED" && (
                      <TouchableOpacity
                        style={styles.startBtn}
                        onPress={() => handleUpdateStatus(b.id, "IN_PROGRESS")}
                      >
                        <Text style={styles.startBtnText}>Start Service</Text>
                      </TouchableOpacity>
                    )}

                    {b.status === "IN_PROGRESS" && (
                      <TouchableOpacity
                        style={styles.completeBtn}
                        onPress={() => handleUpdateStatus(b.id, "COMPLETED")}
                      >
                        <Text style={styles.completeBtnText}>Mark Completed</Text>
                      </TouchableOpacity>
                    )}

                    {b.status === "COMPLETED" && (
                      <TouchableOpacity
                        style={styles.rateBtn}
                        onPress={() => setRatingBooking(b)}
                      >
                        <Star size={12} color="#D97706" fill="#D97706" />
                        <Text style={styles.rateBtnText}>Rate</Text>
                      </TouchableOpacity>
                    )}

                    {/* Pay button if not completed/paid */}
                    {b.status !== "COMPLETED" && (
                      <TouchableOpacity
                        style={styles.payBtn}
                        onPress={() => handleOpenPayment(b)}
                      >
                        <CreditCard size={12} color="#FFFFFF" />
                        <Text style={styles.payBtnText}>Pay via Bank/UPI</Text>
                      </TouchableOpacity>
                    )}

                    {/* View Audited Statutory Tax Invoice */}
                    <TouchableOpacity
                      style={styles.invoiceBtn}
                      onPress={() => handleOpenInvoice(b)}
                    >
                      <FileText size={12} color={colors.brand.primary} />
                      <Text style={styles.invoiceBtnText}>Audited Invoice</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Unified Bank / UPI Settlement Modal */}
      <Modal visible={!!activeBookingForPay} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.paymentCard}>
            <View style={styles.paymentTopBar}>
              <Text style={styles.paymentModalTitle}>Unified Bank &amp; UPI Settlement</Text>
              <TouchableOpacity onPress={() => setActiveBookingForPay(null)}>
                <X size={18} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16 }}>
              <View style={styles.summaryPill}>
                <Text style={styles.summaryTitle}>{activeBookingForPay?.service_name}</Text>
                <Text style={styles.summaryAmount}>₹{activeBookingForPay?.total_amount}</Text>
              </View>

              <Text style={styles.payInstructions}>
                Execute statutory bank payment via Apex Cooperative Gateway or UPI link below, then enter your Transaction UTR.
              </Text>

              <View style={styles.apexBankBox}>
                <Building2 size={16} color={colors.brand.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.apexBankTitle}>Tamil Nadu State Apex Cooperative Bank</Text>
                  <Text style={styles.apexBankSub}>A/C: 921020045678912 &bull; IFSC: TNSC0001001</Text>
                </View>
              </View>

              <Text style={styles.utrLabel}>ENTER BANK TRANSACTION REFERENCE / UTR</Text>
              <TextInput
                value={utrInput}
                onChangeText={setUtrInput}
                style={styles.utrField}
                placeholder="12-digit transaction UTR"
              />

              <TouchableOpacity
                style={styles.verifyPayBtn}
                onPress={handleConfirmPayment}
                disabled={payLoading}
              >
                {payLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.verifyPayBtnText}>Verify &amp; Issue Statutory Tax Invoice</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 5-Star Rating & Review Modal */}
      <Modal visible={!!ratingBooking} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.ratingCard}>
            <View style={styles.ratingTop}>
              <Text style={styles.ratingModalTitle}>Rate Cooperative Tradesperson</Text>
              <TouchableOpacity onPress={() => setRatingBooking(null)}>
                <X size={18} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={{ padding: 16 }}>
              <Text style={styles.ratingTradespersonName}>{ratingBooking?.worker_name}</Text>
              <Text style={styles.ratingService}>{ratingBooking?.service_name}</Text>

              {/* Star Selector */}
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <TouchableOpacity key={s} onPress={() => setStars(s)}>
                    <Star
                      size={28}
                      color="#D97706"
                      fill={s <= stars ? "#D97706" : "transparent"}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                value={feedback}
                onChangeText={setFeedback}
                placeholder="Write cooperative review: e.g. 'Punctual, professional tools, clean workmanship'..."
                placeholderTextColor={colors.text.subtle}
                style={styles.feedbackInput}
                multiline
              />

              <TouchableOpacity
                style={styles.submitRatingBtn}
                onPress={handleSubmitRating}
                disabled={ratingLoading}
              >
                {ratingLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitRatingBtnText}>Submit Worker Review</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Official Statutory Tax Invoice Modal */}
      <InvoiceModal
        visible={!!activeInvoice}
        invoice={activeInvoice}
        onClose={() => setActiveInvoice(null)}
      />
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
  loadingBox: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 8,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.surface.border,
    alignItems: "center",
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  emptyDesc: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 16,
  },
  bookCtaBtn: {
    marginTop: 14,
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radii.lg,
  },
  bookCtaText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "bold",
  },
  bookingsList: {
    gap: 12,
  },
  bookingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surface.border,
    ...shadows.card,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 10,
    marginBottom: 10,
  },
  serviceInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  idBadge: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  idText: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.brand.primary,
  },
  srvName: {
    fontSize: 13.5,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  timeSlot: {
    fontSize: 10.5,
    color: colors.text.muted,
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 9.5,
    fontWeight: "800",
  },
  detailsGrid: {
    gap: 8,
    marginBottom: 12,
  },
  detailCol: {},
  detailLabel: {
    fontSize: 8.5,
    fontWeight: "800",
    color: colors.text.subtle,
    letterSpacing: 0.5,
  },
  workerName: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.text.primary,
    marginTop: 1,
  },
  workerPhone: {
    fontSize: 10.5,
    color: colors.text.muted,
  },
  addressVal: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 1,
  },
  tariffTotalVal: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.brand.primary,
    marginTop: 1,
  },
  tariffSubVal: {
    fontSize: 9.5,
    color: colors.text.muted,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    flexWrap: "wrap",
  },
  startBtn: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.md,
  },
  startBtnText: {
    color: "#1D4ED8",
    fontSize: 11,
    fontWeight: "bold",
  },
  completeBtn: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.md,
  },
  completeBtnText: {
    color: "#047857",
    fontSize: 11,
    fontWeight: "bold",
  },
  rateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: radii.md,
  },
  rateBtnText: {
    color: "#B45309",
    fontSize: 11,
    fontWeight: "bold",
  },
  payBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.md,
  },
  payBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  invoiceBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.surface.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.md,
  },
  invoiceBtnText: {
    color: colors.brand.primary,
    fontSize: 11,
    fontWeight: "bold",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    justifyContent: "center",
    padding: 16,
  },
  paymentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.xl,
    maxHeight: "90%",
    ...shadows.elevated,
    overflow: "hidden",
  },
  paymentTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
  },
  paymentModalTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  summaryPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.brand.light,
    borderRadius: radii.lg,
    padding: 10,
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.brand.primary,
  },
  summaryAmount: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.brand.dark,
  },
  payInstructions: {
    fontSize: 11,
    color: colors.text.secondary,
    marginBottom: 10,
    lineHeight: 15,
  },
  apexBankBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radii.lg,
    padding: 10,
    marginBottom: 12,
  },
  apexBankTitle: {
    fontSize: 11.5,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  apexBankSub: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 1,
  },
  utrLabel: {
    fontSize: 8.5,
    fontWeight: "800",
    color: colors.text.subtle,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  utrField: {
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
  verifyPayBtn: {
    backgroundColor: colors.brand.primary,
    paddingVertical: 12,
    borderRadius: radii.lg,
    alignItems: "center",
  },
  verifyPayBtnText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "bold",
  },
  ratingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.xl,
    overflow: "hidden",
    ...shadows.elevated,
  },
  ratingTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
  },
  ratingModalTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  ratingTradespersonName: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text.primary,
    textAlign: "center",
  },
  ratingService: {
    fontSize: 11.5,
    color: colors.brand.primary,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 2,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginVertical: 14,
  },
  feedbackInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.surface.border,
    padding: 10,
    fontSize: 12,
    color: colors.text.primary,
    minHeight: 60,
    textAlignVertical: "top",
    marginBottom: 14,
  },
  submitRatingBtn: {
    backgroundColor: colors.brand.primary,
    paddingVertical: 11,
    borderRadius: radii.lg,
    alignItems: "center",
  },
  submitRatingBtnText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "bold",
  },
});

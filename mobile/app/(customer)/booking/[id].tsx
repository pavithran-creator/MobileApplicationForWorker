import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import MobileHeader from "../../../components/Header";
import InvoiceModal from "../../../components/InvoiceModal";
import { useAuth } from "../../../lib/auth";
import { useLang } from "../../../lib/i18n";
import { request } from "../../../lib/api";
import { colors, radii, shadows } from "../../../lib/theme";
import { BookingRecord, InvoiceRecord } from "../../../types";
import {
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Star,
  FileText,
  CreditCard,
  Building2,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react-native";

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLang();

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceRecord | null>(null);

  // UTR payment
  const [utrNumber, setUtrNumber] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Rating
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const bookings = await request<BookingRecord[]>("/bookings");
      const found = Array.isArray(bookings) ? bookings.find((b) => String(b.id) === String(id)) : null;

      if (found) {
        setBooking(found);
        setUtrNumber(`UTR-TNSC-${found.id}-OK`);
      } else {
        // Mock fallback
        setBooking({
          id: Number(id) || 101,
          service_name: "Fan & light repair",
          worker_id: 1,
          worker_name: "Suresh Kumar",
          worker_phone: "9010000001",
          customer_id: 11,
          customer_name: user?.name || "Meena Sundaram",
          date: new Date().toISOString().split("T")[0],
          start_time: "10:00",
          duration_min: 45,
          status: "CONFIRMED",
          is_emergency: false,
          total_amount: 250,
          service_amount: 225,
          coop_charge: 25,
          address: "142, Cross Cut Road, Gandhipuram, Coimbatore",
          description: "Ceiling fan regulator vibrating and humming loudly.",
        });
        setUtrNumber(`UTR-TNSC-${id || 101}-OK`);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInvoice = async () => {
    if (!booking) return;
    try {
      const inv = await request<InvoiceRecord>(`/invoices/${booking.id}`);
      setInvoice(inv);
      setShowInvoice(true);
    } catch {
      const total = Number(booking.total_amount) || 250;
      const workerWage = Number(booking.service_amount) || Math.round(total * 0.9);
      const coopFee = Number(booking.coop_charge) || Math.round(total - workerWage);
      setInvoice({
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
      setShowInvoice(true);
    }
  };

  const handlePay = async () => {
    if (!booking) return;
    setSubmittingPayment(true);
    try {
      await request<any>("/payments", {
        method: "POST",
        body: JSON.stringify({
          booking_id: booking.id,
          succeed: true,
          method: "Tamil Nadu State Apex Cooperative Bank / UPI URL",
          transaction_ref: utrNumber,
        }),
      });
      Alert.alert("Payment Complete", "Cooperative statutory settlement completed.");
      fetchBooking();
    } catch (err: any) {
      Alert.alert("Payment Error", err.message || "Payment verification failed");
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleRating = async () => {
    if (!booking) return;
    setSubmittingRating(true);
    try {
      await request<any>("/ratings", {
        method: "POST",
        body: JSON.stringify({
          booking_id: booking.id,
          worker_id: booking.worker_id,
          rating,
          feedback: review,
        }),
      });
      setRatingSubmitted(true);
      Alert.alert("Review Submitted", "Thank you for your rating.");
    } catch (err: any) {
      Alert.alert("Rating Error", err.message || "Failed to submit rating");
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading || !booking) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <MobileHeader />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Back Link */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <ArrowLeft size={16} color={colors.brand.primary} />
          <Text style={styles.backBtnText}>{t("dashboard.back_bookings", "Back to Bookings")}</Text>
        </TouchableOpacity>

        {/* Card Top */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.idText}>{t("dashboard.booking_id", "Booking #")}{booking.id}</Text>
              <Text style={styles.srvTitle}>{booking.service_name}</Text>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>{t("status." + booking.status.toLowerCase(), booking.status)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Key Meta */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Calendar size={13} color={colors.brand.primary} />
              <Text style={styles.metaText}>{booking.date}</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={13} color={colors.brand.primary} />
              <Text style={styles.metaText}>{booking.start_time || "10:00"}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <MapPin size={13} color={colors.brand.primary} />
            <Text style={styles.metaText} numberOfLines={2}>{booking.address}</Text>
          </View>

          {/* Assigned Worker Box */}
          <View style={styles.workerBox}>
            <Text style={styles.boxHeading}>{t("dashboard.assigned_worker", "ASSIGNED TRADESPERSON")}</Text>
            <Text style={styles.workerName}>{booking.worker_name}</Text>
            <Text style={styles.workerPhone}>Ph: {booking.worker_phone}</Text>
          </View>

          {/* Itemized 90/10 Breakdown */}
          <View style={styles.breakdownBox}>
            <Text style={styles.boxHeading}>{t("dashboard.invoice_modal_title", "STATUTORY TARIFF BREAKDOWN")}</Text>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>{t("dashboard.invoice_worker_wage", "Direct Worker Fair Wage (90%)")}</Text>
              <Text style={styles.wageVal}>₹{(Number(booking.service_amount) || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>{t("dashboard.invoice_coop_fee", "Cooperative Welfare Surcharge (10%)")}</Text>
              <Text style={styles.feeVal}>₹{(Number(booking.coop_charge) || 0).toFixed(2)}</Text>
            </View>
            <View style={[styles.feeRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>{t("dashboard.invoice_total", "TOTAL AMOUNT")}</Text>
              <Text style={styles.totalVal}>₹{(Number(booking.total_amount) || 0).toFixed(2)}</Text>
            </View>
          </View>

          {/* View Invoice Button */}
          <TouchableOpacity
            style={styles.invoiceBtn}
            onPress={handleOpenInvoice}
          >
            <FileText size={14} color={colors.brand.primary} />
            <Text style={styles.invoiceBtnText}>{t("dashboard.view_invoice", "View Audited Statutory Tax Invoice")}</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Section if not completed */}
        {booking.status !== "COMPLETED" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t("dashboard.pay_title", "Unified Bank & UPI Payment")}</Text>
            <Text style={styles.sectionSub}>
              Transfer via Tamil Nadu State Apex Cooperative Bank or scan UPI code.
            </Text>

            <View style={styles.bankBox}>
              <Building2 size={16} color={colors.brand.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.bankName}>Tamil Nadu State Apex Cooperative Bank</Text>
                <Text style={styles.bankSub}>A/C: 921020045678912 &bull; IFSC: TNSC0001001</Text>
              </View>
            </View>

            <Text style={styles.utrLabel}>{t("dashboard.enter_utr", "ENTER BANK TRANSACTION UTR")}</Text>
            <TextInput
              value={utrNumber}
              onChangeText={setUtrNumber}
              style={styles.utrField}
              placeholder="12-digit UTR"
            />

            <TouchableOpacity
              style={styles.payBtn}
              onPress={handlePay}
              disabled={submittingPayment}
            >
              {submittingPayment ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.payBtnText}>{t("dashboard.confirm_payment", "Verify & Confirm Payment")}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Rating Section if completed */}
        {booking.status === "COMPLETED" && !ratingSubmitted && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t("dashboard.rate_modal_title", "Rate Tradesperson")}</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setRating(s)}>
                  <Star
                    size={26}
                    color="#D97706"
                    fill={s <= rating ? "#D97706" : "transparent"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              value={review}
              onChangeText={setReview}
              placeholder={t("dashboard.rate_feedback_placeholder", "Write feedback for the cooperative society...")}
              placeholderTextColor={colors.text.subtle}
              style={styles.reviewInput}
              multiline
            />

            <TouchableOpacity
              style={styles.rateBtn}
              onPress={handleRating}
              disabled={submittingRating}
            >
              <Text style={styles.rateBtnText}>{t("dashboard.rate_submit", "Submit Rating")}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Invoice Modal */}
      <InvoiceModal
        visible={showInvoice}
        invoice={invoice}
        onClose={() => setShowInvoice(false)}
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
    paddingTop: 12,
    paddingBottom: 40,
  },
  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface.pageBg,
  },
  loadingText: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 8,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.brand.primary,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surface.border,
    ...shadows.card,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  idText: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.brand.primary,
  },
  srvTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.text.primary,
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: radii.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#047857",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11.5,
    color: colors.text.secondary,
    flex: 1,
  },
  workerBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radii.lg,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  boxHeading: {
    fontSize: 8.5,
    fontWeight: "800",
    color: colors.text.subtle,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  workerName: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  workerPhone: {
    fontSize: 11,
    color: colors.text.muted,
  },
  breakdownBox: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: radii.lg,
    padding: 10,
    gap: 4,
    marginBottom: 12,
  },
  feeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  feeLabel: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  wageVal: {
    fontSize: 11.5,
    fontWeight: "bold",
    color: colors.brand.primary,
  },
  feeVal: {
    fontSize: 11,
    color: colors.text.muted,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 6,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 11.5,
    fontWeight: "900",
    color: colors.text.primary,
  },
  totalVal: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.brand.primary,
  },
  invoiceBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingVertical: 10,
    borderRadius: radii.lg,
  },
  invoiceBtnText: {
    color: colors.brand.primary,
    fontSize: 11.5,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 2,
  },
  sectionSub: {
    fontSize: 11,
    color: colors.text.secondary,
    marginBottom: 10,
  },
  bankBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radii.md,
    padding: 10,
    marginBottom: 10,
  },
  bankName: {
    fontSize: 11.5,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  bankSub: {
    fontSize: 10,
    color: colors.text.muted,
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
  payBtn: {
    backgroundColor: colors.brand.primary,
    paddingVertical: 11,
    borderRadius: radii.lg,
    alignItems: "center",
  },
  payBtnText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "bold",
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginVertical: 12,
  },
  reviewInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radii.md,
    padding: 8,
    fontSize: 11.5,
    color: colors.text.primary,
    minHeight: 50,
    textAlignVertical: "top",
    marginBottom: 10,
  },
  rateBtn: {
    backgroundColor: colors.brand.primary,
    paddingVertical: 10,
    borderRadius: radii.lg,
    alignItems: "center",
  },
  rateBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
});

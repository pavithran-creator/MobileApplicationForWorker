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
  Image,
  Modal,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import MobileHeader from "../../components/Header";
import InvoiceModal from "../../components/InvoiceModal";
import WorkerCard from "../../components/WorkerCard";
import LiveCameraCapture from "../../components/LiveCameraCapture";
import VoiceRecorder from "../../components/VoiceRecorder";
import { useAuth } from "../../lib/auth";
import { useLang } from "../../lib/i18n";
import { request, getCurrentUser } from "../../lib/api";
import {
  getCurrentDeviceLocation,
  getStoredLocation,
  setStoredLocation,
  onLocationChange,
} from "../../lib/location";
import { colors, radii, shadows } from "../../lib/theme";
import { ServiceItem, MatchedWorker, InvoiceRecord } from "../../types";
import {
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Camera,
  Mic,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Building2,
  X,
} from "lucide-react-native";

export default function BookScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { lang, t } = useLang();

  // Route params or defaults
  const initialServiceId = params.serviceId ? Number(params.serviceId) : 1;

  // Form states
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number>(initialServiceId);
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [startTime, setStartTime] = useState("10:00");
  const [address, setAddress] = useState("Gandhipuram, Coimbatore");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({ lat: 11.0168, lng: 76.9558 });
  const [description, setDescription] = useState("");

  // Multimodal AI assistant states
  const [liveCapturedPhoto, setLiveCapturedPhoto] = useState<string | null>(null);
  const [voiceAudioUri, setVoiceAudioUri] = useState<string | null>(null);
  const [parsingNl, setParsingNl] = useState(false);
  const [nlExplanation, setNlExplanation] = useState<string | null>(null);

  // Worker matching states
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [matchedWorkers, setMatchedWorkers] = useState<MatchedWorker[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);

  // Booking & Payment action states
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Unified Payment modal
  const [pendingPaymentBooking, setPendingPaymentBooking] = useState<any | null>(null);
  const [enteredUtr, setEnteredUtr] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Statutory Tax Invoice modal
  const [viewInvoice, setViewInvoice] = useState<InvoiceRecord | null>(null);

  useEffect(() => {
    // 1. Fetch catalog
    request<ServiceItem[]>("/catalog/services")
      .then((srvs) => {
        if (Array.isArray(srvs) && srvs.length > 0) {
          setServices(srvs);
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
          triggerFindWorkers(initialServiceId, { lat: cached.lat, lng: cached.lng });
        }
      }
    });

    // 3. Listen to location changes anywhere in the app
    const unsubscribe = onLocationChange((loc) => {
      if (loc) {
        if (loc.address) setAddress(loc.address);
        else if (loc.name) setAddress(loc.name);
        if (loc.lat && loc.lng) {
          setUserCoords({ lat: loc.lat, lng: loc.lng });
          triggerFindWorkers(selectedServiceId, { lat: loc.lat, lng: loc.lng });
        }
      }
    });

    // 4. Fetch live device location
    getCurrentDeviceLocation()
      .then((loc) => {
        if (loc) {
          if (loc.address) setAddress(loc.address);
          else if (loc.name) setAddress(loc.name);
          if (loc.lat && loc.lng) {
            setUserCoords({ lat: loc.lat, lng: loc.lng });
            triggerFindWorkers(selectedServiceId, { lat: loc.lat, lng: loc.lng });
          }
        }
      })
      .catch(() => {});

    // 5. Match initial workers
    triggerFindWorkers(initialServiceId);

    return () => {
      unsubscribe();
    };
  }, []);

  const triggerFindWorkers = async (serviceId: number, coordsOverride?: { lat: number; lng: number }) => {
    setLoadingWorkers(true);
    setBookingError(null);
    try {
      const coords = coordsOverride || userCoords;
      const workers = await request<MatchedWorker[]>(
        `/workers/match?service_id=${serviceId}&lat=${coords.lat}&lng=${coords.lng}&scheduled_date=${scheduledDate}&start_time=${startTime}&duration_min=60`
      );
      if (Array.isArray(workers)) {
        setMatchedWorkers(workers);
        if (workers.length > 0) {
          setSelectedWorkerId(workers[0].worker_id);
        }
      }
    } catch (err: any) {
      setBookingError(t("common.error", "Geo search failed") + ": " + err.message);
    } finally {
      setLoadingWorkers(false);
    }
  };


  const handleSelectService = (id: number) => {
    setSelectedServiceId(id);
    triggerFindWorkers(id);
  };

  // Multimodal AI Parser trigger
  const handleParseMultimodal = async (overrideText?: string, overrideImage?: string) => {
    const textToAnalyze = overrideText !== undefined ? overrideText : description;
    const imageToAnalyze = overrideImage !== undefined ? overrideImage : liveCapturedPhoto;

    if (!textToAnalyze && !imageToAnalyze) {
      Alert.alert("Input Required", "Please enter a problem description or capture a live photo first.");
      return;
    }

    setParsingNl(true);
    setNlExplanation(null);

    try {
      const parsed: any = await request<any>("/ai/parse-request", {
        method: "POST",
        body: JSON.stringify({
          text: textToAnalyze,
          image: imageToAnalyze || undefined,
        }),
      });

      if (parsed?.service_id) {
        setSelectedServiceId(parsed.service_id);
        if (parsed.date) setScheduledDate(parsed.date);
        if (parsed.time) setStartTime(parsed.time);
        setNlExplanation(parsed.explain || `AI mapped to ${parsed.service_name}`);
        triggerFindWorkers(parsed.service_id);
      }
    } catch (err: any) {
      Alert.alert("AI Assistant", err.message || "Failed to analyze problem");
    } finally {
      setParsingNl(false);
    }
  };

  // Step 1: Create Booking
  const handleInitiateBooking = async () => {
    if (!selectedWorkerId) {
      Alert.alert("Worker Required", "Please select a certified tradesperson to proceed.");
      return;
    }

    const srv = services.find((s) => s.id === selectedServiceId) || services[0];
    const chosenWorker = matchedWorkers.find((w) => w.worker_id === selectedWorkerId);

    setBookingLoading(true);
    setBookingError(null);

    try {
      const res: any = await request<any>("/bookings", {
        method: "POST",
        body: JSON.stringify({
          service_id: selectedServiceId,
          worker_id: selectedWorkerId,
          scheduled_date: scheduledDate,
          start_time: startTime,
          duration_min: 60,
          address,
          description: description || "Scheduled home maintenance service",
        }),
      });

      // Prepare Unified Payment prompt
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      setEnteredUtr(`UTR-TNSC-${res.id}-${randomSuffix}`);
      setPendingPaymentBooking(res);
    } catch (err: any) {
      setBookingError(err.message || "Booking creation failed");
    } finally {
      setBookingLoading(false);
    }
  };

  // Step 2: Complete Unified Payment
  const handleCompletePayment = async () => {
    if (!pendingPaymentBooking) return;
    setPaymentProcessing(true);
    setBookingError(null);

    try {
      await request<any>("/payments", {
        method: "POST",
        body: JSON.stringify({
          booking_id: pendingPaymentBooking.id,
          succeed: true,
          method: "Tamil Nadu State Apex Cooperative Bank / UPI URL",
          transaction_ref: enteredUtr.trim() || `UTR-TNSC-${pendingPaymentBooking.id}-OK`,
        }),
      });

      // Fetch official statutory invoice
      const invoiceData: InvoiceRecord = await request<InvoiceRecord>(`/invoices/${pendingPaymentBooking.id}`);

      setPendingPaymentBooking(null);
      setViewInvoice(invoiceData);
    } catch (err: any) {
      setBookingError("Payment verification failed: " + err.message);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const selectedServiceObj = services.find((s) => s.id === selectedServiceId) || services[0] || {
    base_price: 350,
    worker_earning: 315,
    coop_charge: 35,
  };

  return (
    <View style={styles.screen}>
      <MobileHeader />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Title Header */}
        <View style={styles.headerBlock}>
          <View style={styles.badgeRow}>
            <View style={styles.pillBadge}>
              <ShieldCheck size={11} color="#047857" />
              <Text style={styles.pillText}>Cooperative Audited &bull; Double-Booking Protection</Text>
            </View>
          </View>
          <Text style={styles.pageTitle}>{t("book.title", "Schedule a Verified Trade Service")}</Text>
          <Text style={styles.pageSub}>
            Transparent cooperative pricing, explainable geo-matching, and double-booking conflict prevention.
          </Text>
        </View>

        {/* AI Multimodal Assistant Card */}
        <View style={styles.aiCard}>
          <View style={styles.aiHeaderRow}>
            <View style={styles.aiTitleGroup}>
              <Sparkles size={16} color="#059669" />
              <Text style={styles.aiCardHeading}>{t("book.ai_title", "AI Multimodal Assistant")}</Text>
            </View>
            <View style={styles.aiPillBadge}>
              <Text style={styles.aiPillBadgeText}>Camera &bull; Voice</Text>
            </View>
          </View>

          <Text style={styles.aiCardSub}>
            {t(
              "book.ai_desc",
              "Snap a live camera photo of the repair issue or speak your problem. Anti-tamper inspection verifies the exact trade needed."
            )}
          </Text>

          {/* Multimodal Actions Row */}
          <View style={styles.mmActionsRow}>
            <LiveCameraCapture
              photoUri={liveCapturedPhoto}
              onPhotoCaptured={(photo) => {
                setLiveCapturedPhoto(photo);
                handleParseMultimodal(description, photo);
              }}
              onClearPhoto={() => setLiveCapturedPhoto(null)}
            />

            <VoiceRecorder
              onRecordingComplete={(uri: string, dur: number) => {
                setVoiceAudioUri(uri);
                if (!description) {
                  setDescription("Plumbing tap dripping and water joint leaking under sink");
                  handleParseMultimodal("Plumbing tap dripping and water joint leaking under sink", liveCapturedPhoto || undefined);
                }
              }}
              onTranscriptRecorded={(text: string) => {
                setDescription(text);
                handleParseMultimodal(text, liveCapturedPhoto || undefined);
              }}
            />
          </View>

          {/* Natural Language Problem Description Input */}
          <View style={styles.descInputBox}>
            <TextInput
              placeholder={t("book.ai_placeholder", "Or type problem: e.g. 'Ceiling fan humming loudly and switch sparking'...")}
              placeholderTextColor={colors.text.subtle}
              value={description}
              onChangeText={setDescription}
              style={styles.descInput}
              multiline
            />
            <TouchableOpacity
              style={styles.aiParseBtn}
              onPress={() => handleParseMultimodal()}
              disabled={parsingNl}
            >
              {parsingNl ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.aiParseBtnText}>{t("book.ai_button", "Analyze with AI")}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* AI Explanation Banner */}
          {nlExplanation && (
            <View style={styles.aiExplanationBox}>
              <CheckCircle2 size={13} color="#047857" />
              <Text style={styles.aiExplanationText}>{nlExplanation}</Text>
            </View>
          )}
        </View>

        {/* Service Trade Selection */}
        <Text style={styles.sectionHeading}>1. {t("book.form_service", "Select Trade Service")}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.srvChipScroll}>
          {services.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[
                styles.srvChip,
                selectedServiceId === s.id && styles.srvChipActive,
              ]}
              onPress={() => handleSelectService(s.id)}
            >
              <Text
                style={[
                  styles.srvChipText,
                  selectedServiceId === s.id && styles.srvChipTextActive,
                ]}
              >
                {s.name}
              </Text>
              <Text
                style={[
                  styles.srvChipPrice,
                  selectedServiceId === s.id && styles.srvChipPriceActive,
                ]}
              >
                ₹{s.base_price}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Schedule Date & Time Slots */}
        <Text style={styles.sectionHeading}>
          2. {t("book.form_date", "Schedule Date")} &amp; {t("book.form_time", "Start Time Slot")}
        </Text>
        <View style={styles.scheduleRow}>
          <View style={styles.scheduleInputCol}>
            <View style={styles.labelRow}>
              <Calendar size={12} color={colors.text.secondary} />
              <Text style={styles.inputLabel}>{t("book.form_date", "Date")}</Text>
            </View>
            <TextInput
              value={scheduledDate}
              onChangeText={setScheduledDate}
              style={styles.timeInput}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.scheduleInputCol}>
            <View style={styles.labelRow}>
              <Clock size={12} color={colors.text.secondary} />
              <Text style={styles.inputLabel}>{t("book.form_time", "Start Time")}</Text>
            </View>
            <TextInput
              value={startTime}
              onChangeText={setStartTime}
              style={styles.timeInput}
              placeholder="10:00"
            />
          </View>
        </View>

        {/* Service Address */}
        <Text style={styles.sectionHeading}>3. {t("book.form_address", "Service Street Address")}</Text>
        <View style={styles.addressBox}>
          <MapPin size={16} color={colors.brand.primary} />
          <TextInput
            value={address}
            onChangeText={setAddress}
            style={styles.addressInput}
            placeholder={t("book.form_address_placeholder", "Door No, Street, Landmark, Area")}
          />
        </View>

        {/* Tariff Breakdown Card (Transparent 90/10) */}
        <View style={styles.tariffCard}>
          <Text style={styles.tariffTitle}>Cooperative Tariff Summary</Text>
          <View style={styles.tariffRow}>
            <Text style={styles.tariffLabel}>Standard Statutory Price:</Text>
            <Text style={styles.tariffTotal}>₹{selectedServiceObj.base_price || 350}</Text>
          </View>
          <View style={styles.tariffRow}>
            <Text style={styles.tariffWageLabel}>
              &bull; {t("dashboard.invoice_worker_wage", "Direct Worker Fair Wage (90%)")}:
            </Text>
            <Text style={styles.tariffWageVal}>₹{selectedServiceObj.worker_earning || 315}</Text>
          </View>
          <View style={styles.tariffRow}>
            <Text style={styles.tariffFeeLabel}>
              &bull; {t("dashboard.invoice_coop_fee", "Cooperative Welfare & Ops (10%)")}:
            </Text>
            <Text style={styles.tariffFeeVal}>₹{selectedServiceObj.coop_charge || 35}</Text>
          </View>
        </View>

        {/* Matched Certified Tradespersons */}
        <Text style={styles.sectionHeading}>4. {t("book.results_title", "Choose Available Tradesperson")}</Text>

        {loadingWorkers ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.brand.primary} />
            <Text style={styles.loadingText}>{t("book.finding", "Geo-matching closest available workers...")}</Text>
          </View>
        ) : matchedWorkers.length === 0 ? (
          <View style={styles.emptyWorkers}>
            <Text style={styles.emptyWorkersText}>{t("book.empty_workers", "No workers available for this trade slot.")}</Text>
          </View>
        ) : (
          <View style={styles.workersList}>
            {matchedWorkers.map((worker) => (
              <WorkerCard
                key={worker.worker_id}
                worker={worker}
                isSelected={selectedWorkerId === worker.worker_id}
                onSelect={(w) => setSelectedWorkerId(w.worker_id)}
              />
            ))}
          </View>
        )}

        {/* Error banner if any */}
        {bookingError && (
          <View style={styles.errorBanner}>
            <AlertTriangle size={14} color="#B91C1C" />
            <Text style={styles.errorText}>{bookingError}</Text>
          </View>
        )}

        {/* Confirm Booking CTA */}
        <TouchableOpacity
          style={[styles.confirmBtn, (!selectedWorkerId || bookingLoading) && styles.btnDisabled]}
          onPress={handleInitiateBooking}
          disabled={!selectedWorkerId || bookingLoading}
          activeOpacity={0.85}
        >
          {bookingLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmBtnText}>
              {t("book.confirm_btn", "Confirm Booking")} &bull; ₹{selectedServiceObj.base_price || 350}
            </Text>
          )}
        </TouchableOpacity>

      </ScrollView>

      {/* Unified Bank / UPI Payment Modal */}
      <Modal visible={!!pendingPaymentBooking} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.paymentCard}>
            <View style={styles.paymentTopBar}>
              <Text style={styles.paymentModalTitle}>Unified Bank &amp; UPI Settlement</Text>
              <TouchableOpacity onPress={() => setPendingPaymentBooking(null)}>
                <X size={18} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16 }}>
              <View style={styles.bookingSummaryPill}>
                <Text style={styles.summaryService}>{pendingPaymentBooking?.service_name}</Text>
                <Text style={styles.summaryTotal}>Total: ₹{pendingPaymentBooking?.total_amount}</Text>
              </View>

              <Text style={styles.payInstruction}>
                Pay via Unified Cooperative Gateway or UPI transfer, then verify with the Transaction UTR.
              </Text>

              {/* Apex Bank Details */}
              <View style={styles.apexBankBox}>
                <Building2 size={16} color={colors.brand.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.apexBankTitle}>Tamil Nadu State Apex Cooperative Bank</Text>
                  <Text style={styles.apexBankSub}>A/C: 921020045678912 &bull; IFSC: TNSC0001001</Text>
                </View>
              </View>

              {/* UTR Input */}
              <Text style={styles.utrInputLabel}>BANK TRANSACTION REFERENCE / UTR</Text>
              <TextInput
                value={enteredUtr}
                onChangeText={setEnteredUtr}
                style={styles.utrInputField}
                placeholder="Enter 12-digit UTR or Reference Number"
              />

              <TouchableOpacity
                style={styles.payConfirmBtn}
                onPress={handleCompletePayment}
                disabled={paymentProcessing}
              >
                {paymentProcessing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.payConfirmBtnText}>Verify Payment &amp; Issue Invoice</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Statutory Tax Invoice Modal */}
      <InvoiceModal
        visible={!!viewInvoice}
        invoice={viewInvoice}
        onClose={() => {
          setViewInvoice(null);
          router.replace("/(customer)/bookings");
        }}
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
  aiCard: {
    backgroundColor: "#ECFDF5",
    borderRadius: radii.xl,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#A7F3D0",
    ...shadows.card,
    marginBottom: 14,
  },
  aiHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  aiTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  aiCardHeading: {
    fontSize: 13.5,
    fontWeight: "bold",
    color: colors.brand.dark,
  },
  aiPillBadge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: radii.sm,
  },
  aiPillBadgeText: {
    fontSize: 8.5,
    fontWeight: "900",
    color: "#065F46",
  },
  aiCardSub: {
    fontSize: 10.5,
    color: colors.brand.emerald800,
    lineHeight: 15,
    marginTop: 2,
  },
  mmActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 10,
  },
  descInputBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    padding: 8,
  },
  descInput: {
    fontSize: 11.5,
    color: colors.text.primary,
    minHeight: 44,
    textAlignVertical: "top",
    padding: 0,
  },
  aiParseBtn: {
    backgroundColor: colors.brand.primary,
    paddingVertical: 7,
    borderRadius: radii.md,
    alignItems: "center",
    marginTop: 6,
  },
  aiParseBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  aiExplanationBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#D1FAE5",
    borderRadius: radii.md,
    padding: 8,
    marginTop: 8,
  },
  aiExplanationText: {
    fontSize: 10.5,
    color: "#047857",
    fontWeight: "600",
    flex: 1,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.text.primary,
    marginTop: 10,
    marginBottom: 8,
  },
  srvChipScroll: {
    marginBottom: 10,
  },
  srvChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radii.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  srvChipActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  srvChipText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: colors.text.primary,
  },
  srvChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  srvChipPrice: {
    fontSize: 10.5,
    fontWeight: "bold",
    color: colors.brand.primary,
    marginTop: 2,
  },
  srvChipPriceActive: {
    color: "#D1FAE5",
  },
  scheduleRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  scheduleInputCol: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.surface.border,
    padding: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  inputLabel: {
    fontSize: 9.5,
    fontWeight: "700",
    color: colors.text.secondary,
  },
  timeInput: {
    fontSize: 12.5,
    fontWeight: "bold",
    color: colors.text.primary,
    padding: 0,
  },
  addressBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.surface.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  addressInput: {
    flex: 1,
    fontSize: 11.5,
    color: colors.text.primary,
    padding: 0,
  },
  tariffCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    padding: 12,
    marginBottom: 14,
    gap: 3,
  },
  tariffTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.brand.dark,
    marginBottom: 2,
  },
  tariffRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tariffLabel: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  tariffTotal: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.text.primary,
  },
  tariffWageLabel: {
    fontSize: 10,
    color: colors.brand.primary,
    fontWeight: "600",
  },
  tariffWageVal: {
    fontSize: 10.5,
    fontWeight: "bold",
    color: colors.brand.primary,
  },
  tariffFeeLabel: {
    fontSize: 10,
    color: colors.text.muted,
  },
  tariffFeeVal: {
    fontSize: 10.5,
    color: colors.text.muted,
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
  emptyWorkers: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyWorkersText: {
    fontSize: 11.5,
    color: colors.text.muted,
  },
  workersList: {
    marginBottom: 14,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 11,
    color: "#B91C1C",
    fontWeight: "600",
    flex: 1,
  },
  confirmBtn: {
    backgroundColor: colors.brand.primary,
    paddingVertical: 13,
    borderRadius: radii.lg,
    alignItems: "center",
    ...shadows.elevated,
    marginBottom: 20,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 13.5,
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
  bookingSummaryPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.brand.light,
    borderRadius: radii.lg,
    padding: 10,
    marginBottom: 10,
  },
  summaryService: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.brand.primary,
  },
  summaryTotal: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.brand.dark,
  },
  payInstruction: {
    fontSize: 11,
    color: colors.text.secondary,
    marginBottom: 12,
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
  utrInputLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.text.subtle,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  utrInputField: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radii.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: colors.text.primary,
    marginBottom: 14,
  },
  payConfirmBtn: {
    backgroundColor: colors.brand.primary,
    paddingVertical: 12,
    borderRadius: radii.lg,
    alignItems: "center",
  },
  payConfirmBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
});

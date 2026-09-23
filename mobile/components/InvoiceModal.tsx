import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Share, Platform } from "react-native";
import { InvoiceRecord } from "../types";
import { colors, radii, shadows } from "../lib/theme";
import { CheckCircle2, ShieldCheck, X, Share2, Building2 } from "lucide-react-native";

interface InvoiceModalProps {
  visible: boolean;
  invoice: InvoiceRecord | null;
  onClose: () => void;
}

export default function InvoiceModal({ visible, invoice, onClose }: InvoiceModalProps) {
  if (!invoice) return null;

  const totalAmount = parseFloat(String(invoice.total || 0)) || 0;
  const workerWage =
    invoice.worker_wage !== undefined && invoice.worker_wage !== null
      ? parseFloat(String(invoice.worker_wage)) || 0
      : Math.round(totalAmount * 0.9 * 100) / 100;
  const coopFee =
    invoice.coop_charge !== undefined && invoice.coop_charge !== null
      ? parseFloat(String(invoice.coop_charge)) || 0
      : Math.round((totalAmount - workerWage) * 100) / 100;

  const handleShare = async () => {
    try {
      await Share.share({
        title: `Cooperative Tax Invoice - ${invoice.invoice_no}`,
        message: `TAMIL NADU LABOUR COOPERATIVE FEDERATION\nStatutory Tax Invoice: ${invoice.invoice_no}\nBooking #${invoice.booking_id}\nService: ${invoice.service_name}\nTradesperson: ${invoice.worker_name}\nCustomer: ${invoice.customer_name}\nTotal: ₹${totalAmount}\nWorker Fair Wage (90%): ₹${workerWage}\nCoop Welfare (10%): ₹${coopFee}\nPayment Status: ${invoice.payment_status}\nRef: ${invoice.transaction_ref || "UTR-TNSC-VERIFIED"}`,
      });
    } catch {}
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header Action Bar */}
          <View style={styles.topActions}>
            <View style={styles.taxPill}>
              <Text style={styles.taxPillText}>STATUTORY TAX INVOICE</Text>
            </View>
            <View style={styles.actionIcons}>
              <TouchableOpacity onPress={handleShare} style={styles.iconBtn}>
                <Share2 size={16} color={colors.text.secondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
                <X size={18} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Federation Header Banner */}
            <View style={styles.federationBanner}>
              <View style={styles.fedLogoBadge}>
                <Text style={styles.fedLogoText}>⚙</Text>
              </View>
              <View style={styles.fedInfo}>
                <Text style={styles.fedTitle}>TAMIL NADU LABOUR COOPERATIVE FEDERATION</Text>
                <Text style={styles.societyName}>
                  {invoice.cooperative_name || "Coimbatore District Labour Cooperative Society"}
                </Text>
                <Text style={styles.regText}>
                  Reg. No: {invoice.coop_registration_no || "TNCF/CBE/1983/9412"} &bull; GSTIN: {invoice.gstin || "33AAAAA0000A1Z5"}
                </Text>
              </View>
            </View>

            {/* Invoice Meta Pill Bar */}
            <View style={styles.invoiceMetaBar}>
              <View>
                <Text style={styles.metaLabel}>INVOICE NUMBER</Text>
                <Text style={styles.metaValMono}>{invoice.invoice_no}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.metaLabel}>DATE OF SERVICE</Text>
                <Text style={styles.metaVal}>{invoice.date || invoice.scheduled_date}</Text>
              </View>
            </View>

            {/* Key Parties: Customer & Tradesperson */}
            <View style={styles.partiesBox}>
              <View style={styles.partyCol}>
                <Text style={styles.partyRole}>BILLED TO (CITIZEN / CUSTOMER)</Text>
                <Text style={styles.partyName}>{invoice.customer_name || "Cooperative Citizen"}</Text>
                <Text style={styles.partyDetail}>Ph: {invoice.customer_phone || "9000000011"}</Text>
                <Text style={styles.partyDetail}>{invoice.customer_address || "Gandhipuram, Coimbatore"}</Text>
              </View>

              <View style={styles.partyDivider} />

              <View style={styles.partyCol}>
                <Text style={styles.partyRole}>ASSIGNED CERTIFIED TRADESPERSON</Text>
                <Text style={styles.partyName}>{invoice.worker_name || "Cooperative Worker"}</Text>
                <Text style={styles.serviceName}>{invoice.service_name}</Text>
                <Text style={styles.partyDetail}>Booking #{invoice.booking_id} &bull; {invoice.start_time || "10:00"}</Text>
              </View>
            </View>

            {/* Transparent 90/10 Fair Wage Breakdown Table */}
            <Text style={styles.sectionTitle}>Itemized Statutory Fee Breakdown</Text>
            <View style={styles.tableBox}>
              <View style={styles.tableHeader}>
                <Text style={[styles.thText, { flex: 2 }]}>Description &amp; Fund Allocation</Text>
                <Text style={[styles.thText, { flex: 0.8, textAlign: "center" }]}>Share</Text>
                <Text style={[styles.thText, { flex: 1, textAlign: "right" }]}>Amount</Text>
              </View>

              {/* 90% Worker Fair Wage */}
              <View style={styles.tableRow}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.itemTitle}>Direct Worker Fair Wage</Text>
                  <Text style={styles.itemSub}>Direct trade compensation disbursed to tradesperson</Text>
                </View>
                <Text style={[styles.shareText, { flex: 0.8, textAlign: "center" }]}>90%</Text>
                <Text style={[styles.amountText, { flex: 1, textAlign: "right" }]}>₹{workerWage.toFixed(2)}</Text>
              </View>

              {/* 10% Cooperative Surcharge */}
              <View style={styles.tableRow}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.itemTitle}>Cooperative Welfare &amp; Admin</Text>
                  <Text style={styles.itemSub}>ESI health cover, pension fund &amp; operations</Text>
                </View>
                <Text style={[styles.shareTextAmber, { flex: 0.8, textAlign: "center" }]}>10%</Text>
                <Text style={[styles.amountText, { flex: 1, textAlign: "right" }]}>₹{coopFee.toFixed(2)}</Text>
              </View>

              {/* Grand Total */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.totalLabel}>TOTAL PAYABLE</Text>
                  <Text style={styles.totalSub}>Inclusive of all statutory welfare allocations</Text>
                </View>
                <Text style={[styles.totalAmount, { flex: 1.8, textAlign: "right" }]}>₹{totalAmount.toFixed(2)}</Text>
              </View>
            </View>

            {/* Bank & Settlement Details */}
            <View style={styles.bankBox}>
              <View style={styles.bankHeader}>
                <Building2 size={14} color={colors.brand.primary} />
                <Text style={styles.bankHeading}>Statutory Bank Settlement Account</Text>
              </View>
              <Text style={styles.bankDetail}>
                Bank: {invoice.bank_name || "Tamil Nadu State Apex Cooperative Bank"}
              </Text>
              <Text style={styles.bankDetail}>
                A/C: {invoice.bank_account_no || "921020045678912"} &bull; IFSC: {invoice.bank_ifsc || "TNSC0001001"}
              </Text>
              <View style={styles.utrRow}>
                <CheckCircle2 size={13} color="#16A34A" />
                <Text style={styles.utrText}>
                  Ref: {invoice.transaction_ref || `UTR-TNSC-${invoice.booking_id}-SETTLED`} ({invoice.payment_status})
                </Text>
              </View>
            </View>

            {/* 30-Day Guarantee Seal */}
            <View style={styles.guaranteeBanner}>
              <ShieldCheck size={16} color={colors.brand.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.guaranteeTitle}>30-Day Cooperative Service Assurance</Text>
                <Text style={styles.guaranteeDesc}>
                  Audited by Tamil Nadu Registrar of Cooperative Societies. Free rework guaranteed.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    justifyContent: "center",
    padding: 14,
    paddingTop: 40,
    paddingBottom: 20,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.xl,
    maxHeight: "92%",
    ...shadows.elevated,
    overflow: "hidden",
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
  },
  taxPill: {
    backgroundColor: colors.brand.light,
    borderColor: colors.brand.accent,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  taxPillText: {
    fontSize: 9.5,
    fontWeight: "900",
    color: colors.brand.primary,
    letterSpacing: 0.5,
  },
  actionIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    padding: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: radii.md,
  },
  scrollBody: {
    padding: 16,
  },
  federationBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 2,
    borderBottomColor: colors.brand.primary,
    paddingBottom: 12,
  },
  fedLogoBadge: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  fedLogoText: {
    fontSize: 20,
    color: "#FDE68A",
    fontWeight: "bold",
  },
  fedInfo: {
    flex: 1,
  },
  fedTitle: {
    fontSize: 12.5,
    fontWeight: "900",
    color: colors.brand.dark,
    letterSpacing: -0.3,
  },
  societyName: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.brand.primary,
    marginTop: 1,
  },
  regText: {
    fontSize: 9.5,
    color: colors.text.muted,
    marginTop: 1,
  },
  invoiceMetaBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderRadius: radii.md,
    padding: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.text.subtle,
    letterSpacing: 0.5,
  },
  metaValMono: {
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    color: colors.text.primary,
    marginTop: 2,
  },
  metaVal: {
    fontSize: 11.5,
    fontWeight: "700",
    color: colors.text.primary,
    marginTop: 2,
  },
  partiesBox: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radii.lg,
    padding: 12,
    marginTop: 12,
  },
  partyCol: {
    flex: 1,
  },
  partyDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 8,
  },
  partyRole: {
    fontSize: 8.5,
    fontWeight: "800",
    color: colors.text.subtle,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  partyName: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  partyDetail: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 1,
  },
  serviceName: {
    fontSize: 11.5,
    fontWeight: "700",
    color: colors.brand.primary,
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.text.primary,
    marginTop: 14,
    marginBottom: 6,
  },
  tableBox: {
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
  },
  thText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.text.secondary,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  itemTitle: {
    fontSize: 11.5,
    fontWeight: "700",
    color: colors.text.primary,
  },
  itemSub: {
    fontSize: 9.5,
    color: colors.text.muted,
    marginTop: 1,
  },
  shareText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.brand.primary,
  },
  shareTextAmber: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.status.warning,
  },
  amountText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  totalRow: {
    backgroundColor: colors.brand.light,
    borderBottomWidth: 0,
    borderTopWidth: 1.5,
    borderTopColor: colors.brand.primary,
    paddingVertical: 10,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.brand.dark,
    letterSpacing: 0.5,
  },
  totalSub: {
    fontSize: 9,
    color: colors.brand.primary,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.brand.dark,
  },
  bankBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radii.md,
    padding: 10,
    marginTop: 12,
  },
  bankHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  bankHeading: {
    fontSize: 10.5,
    fontWeight: "700",
    color: colors.brand.primary,
  },
  bankDetail: {
    fontSize: 10,
    color: colors.text.secondary,
    marginTop: 1,
  },
  utrRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  utrText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#16A34A",
  },
  guaranteeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.brand.light,
    borderWidth: 1,
    borderColor: colors.brand.accent,
    borderRadius: radii.md,
    padding: 10,
    marginTop: 12,
    marginBottom: 10,
  },
  guaranteeTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.brand.primary,
  },
  guaranteeDesc: {
    fontSize: 9.5,
    color: colors.brand.emerald800,
    marginTop: 1,
  },
  modalFooter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.surface.border,
    backgroundColor: "#FFFFFF",
  },
  closeBtn: {
    backgroundColor: colors.brand.primary,
    paddingVertical: 11,
    borderRadius: radii.lg,
    alignItems: "center",
  },
  closeBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
});

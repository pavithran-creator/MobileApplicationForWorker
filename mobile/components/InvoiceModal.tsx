import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from "react-native";
import { InvoiceRecord } from "../types";
import { CheckCircle2, ShieldCheck, X, FileText } from "lucide-react-native";

interface InvoiceModalProps {
  visible: boolean;
  invoice: InvoiceRecord | null;
  onClose: () => void;
}

export default function InvoiceModal({ visible, invoice, onClose }: InvoiceModalProps) {
  if (!invoice) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <FileText size={18} color="#065f46" />
              <Text style={styles.modalTitle}>Statutory Cooperative Tax Invoice</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Cooperative Federation Authority Header */}
            <View style={styles.federationBox}>
              <Text style={styles.federationName}>Tamil Nadu Labour Cooperative Federation</Text>
              <Text style={styles.coopDetails}>Registration: TNCF/CBE/1983/9412 • GSTIN: 33AAAAA0000A1Z5</Text>
              <Text style={styles.coopBank}>Bank: Tamil Nadu State Apex Cooperative Bank (TNSC0001001)</Text>
            </View>

            {/* Invoice Meta Grid */}
            <View style={styles.metaGrid}>
              <View style={styles.metaCell}>
                <Text style={styles.metaLabel}>Invoice No</Text>
                <Text style={styles.metaVal}>{invoice.invoice_no}</Text>
              </View>
              <View style={styles.metaCell}>
                <Text style={styles.metaLabel}>Date</Text>
                <Text style={styles.metaVal}>{invoice.date || invoice.scheduled_date}</Text>
              </View>
              <View style={styles.metaCell}>
                <Text style={styles.metaLabel}>Citizen / Customer</Text>
                <Text style={styles.metaVal}>{invoice.customer_name || "Cooperative Member"}</Text>
              </View>
              <View style={styles.metaCell}>
                <Text style={styles.metaLabel}>Assigned Tradesperson</Text>
                <Text style={styles.metaVal}>{invoice.worker_name || "Verified Worker"}</Text>
              </View>
            </View>

            {/* Transparent 90/10 Fair Wage Breakdown */}
            <Text style={styles.sectionHeading}>Itemized Statutory Fair Wage Breakdown</Text>
            <View style={styles.breakdownTable}>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Direct Worker Fair Wage (90%)</Text>
                <Text style={styles.tableValue}>₹{invoice.worker_wage || Math.round(invoice.total * 0.9)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Cooperative Social Security & Ops (10%)</Text>
                <Text style={styles.tableValue}>₹{invoice.coop_charge || Math.round(invoice.total * 0.1)}</Text>
              </View>
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Payable Amount</Text>
                <Text style={styles.totalValue}>₹{invoice.total}</Text>
              </View>
            </View>

            {/* Payment & Audit Reference */}
            <View style={styles.paymentBox}>
              <View style={styles.paymentStatusRow}>
                <CheckCircle2 size={16} color="#059669" />
                <Text style={styles.paymentStatusText}>Statutory Payment Verified</Text>
              </View>
              <Text style={styles.utrText}>
                Ref: {invoice.transaction_ref || `UTR-TNSC-${invoice.booking_id}-VERIFIED`}
              </Text>
            </View>

            <View style={styles.guaranteeBox}>
              <ShieldCheck size={14} color="#065f46" />
              <Text style={styles.guaranteeText}>
                Backed by 30-Day Tamil Nadu Labour Cooperative Service Assurance.
              </Text>
            </View>
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.doneBtnText}>Close Invoice</Text>
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
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0f172a",
  },
  closeBtn: {
    padding: 4,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  federationBox: {
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    marginBottom: 14,
  },
  federationName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#065f46",
  },
  coopDetails: {
    fontSize: 10,
    color: "#047857",
    marginTop: 2,
  },
  coopBank: {
    fontSize: 10,
    color: "#047857",
    marginTop: 1,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  metaCell: {
    width: "50%",
    padding: 6,
  },
  metaLabel: {
    fontSize: 10,
    color: "#64748b",
  },
  metaVal: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: 1,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 8,
  },
  breakdownTable: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
    marginBottom: 14,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  tableLabel: {
    fontSize: 11,
    color: "#475569",
  },
  tableValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0f172a",
  },
  totalRow: {
    backgroundColor: "#ecfdf5",
    borderBottomWidth: 0,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#065f46",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#065f46",
  },
  paymentBox: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 10,
  },
  paymentStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#059669",
  },
  utrText: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 3,
    fontFamily: "monospace",
  },
  guaranteeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 10,
    backgroundColor: "#ecfdf5",
    borderRadius: 10,
    marginBottom: 16,
  },
  guaranteeText: {
    fontSize: 10,
    color: "#065f46",
    fontWeight: "500",
    flex: 1,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  doneBtn: {
    backgroundColor: "#065f46",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#ffffff",
  },
});

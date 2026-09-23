import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import MobileHeader from "../../components/Header";
import { useLang } from "../../lib/i18n";
import { colors, radii, shadows } from "../../lib/theme";
import {
  ShieldCheck,
  Heart,
  Award,
  FileText,
  PhoneCall,
  CheckCircle2,
} from "lucide-react-native";

export default function WorkerWelfareScreen() {
  const { t } = useLang();

  const welfareData = {
    societyName: t("admin.state_federation", "Tamil Nadu Labour Cooperative Federation"),
    societyRegNo: "TNCF/CBE/1983/9412",
    welfareFundBalance: "₹8,450",
    totalContributed: "₹14,200",
    policies: [
      {
        id: "pol-1",
        name: t("welfare.scheme_1_name", "Pradhan Mantri Suraksha Bima Yojana (PMSBY)"),
        type: t("welfare.scheme_1_type", "Accidental Death & Disability Cover"),
        coverage: "₹2,00,000",
        status: t("welfare.status_active", "ACTIVE"),
        validTill: "31 May 2027",
        premiumPaidBy: t("welfare.coop_subsidized", "Cooperative Society (100% Subsidized)"),
      },
      {
        id: "pol-2",
        name: t("welfare.scheme_2_name", "Cooperative Health Shield & Emergency Care"),
        type: t("welfare.scheme_2_type", "Inpatient Hospitalization & Critical Illness"),
        coverage: "₹1,50,000",
        status: t("welfare.status_active", "ACTIVE"),
        validTill: "31 Dec 2027",
        premiumPaidBy: t("welfare.surcharge_pool", "10% Cooperative Surcharge Pool"),
      },
      {
        id: "pol-3",
        name: t("welfare.scheme_3_name", "Unorganized Workers Social Security Card (e-Shram)"),
        type: t("welfare.scheme_3_type", "Universal Social Security Number (UAN)"),
        coverage: "Pensions & Maternity Benefits",
        status: t("welfare.status_linked", "LINKED"),
        validTill: "Lifetime",
        premiumPaidBy: t("welfare.gov_board", "Government of India / Cooperative Board"),
      },
    ],
  };

  const handleClaimSupport = () => {
    Alert.alert(
      t("welfare.emergency_sos", "Emergency Welfare Assistance"),
      "Contacting Coimbatore Labour Cooperative Welfare Officer (Phone: 0422-2240192). Dedicated ambulance and emergency cash grant (up to ₹10,000) are accessible within 2 hours.",
      [
        { text: t("header.close", "Cancel"), style: "cancel" },
        { text: t("welfare.call_officer", "Call Officer"), onPress: () => {} },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <MobileHeader title={t("welfare.header_title", "Cooperative Welfare & ESI")} showEmergency={false} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Society Header Card */}
        <View style={styles.societyCard}>
          <View style={styles.societyHeader}>
            <View style={styles.fedIconBox}>
              <Text style={styles.fedIconText}>⚙</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.societyTitle}>{welfareData.societyName}</Text>
              <Text style={styles.societyReg}>Reg. No: {welfareData.societyRegNo}</Text>
            </View>
          </View>

          <View style={styles.welfareBalanceBox}>
            <View style={{ flex: 1 }}>
              <Text style={styles.balanceLabel}>{t("welfare.reserve_title", "Cooperative Welfare Reserve")}</Text>
              <Text style={styles.balanceAmount}>{welfareData.welfareFundBalance}</Text>
            </View>
            <View style={styles.contributedBox}>
              <Text style={styles.contributedLabel}>{t("welfare.lifetime_pooled", "Lifetime Pooled")}</Text>
              <Text style={styles.contributedAmount}>{welfareData.totalContributed}</Text>
            </View>
          </View>
        </View>

        {/* Emergency Welfare Assistance Trigger */}
        <TouchableOpacity
          style={styles.sosClaimCard}
          onPress={handleClaimSupport}
          activeOpacity={0.85}
        >
          <View style={styles.sosClaimIcon}>
            <PhoneCall size={20} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sosClaimTitle}>{t("welfare.emergency_sos", "Emergency Welfare Grant & Care")}</Text>
            <Text style={styles.sosClaimSub}>
              {t("welfare.emergency_sos_desc", "Direct medical distress cash grant up to ₹10,000 disbursed within 2 hours.")}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Policies Section */}
        <Text style={styles.sectionTitle}>{t("welfare.active_policies", "Active Social Security & Insurance Covers")}</Text>

        <View style={styles.policiesList}>
          {welfareData.policies.map((p) => (
            <View key={p.id} style={styles.policyCard}>
              <View style={styles.policyTopRow}>
                <Text style={styles.policyName}>{p.name}</Text>
                <View style={styles.activePill}>
                  <Text style={styles.activePillText}>{p.status}</Text>
                </View>
              </View>

              <Text style={styles.policyType}>{p.type}</Text>

              <View style={styles.policyDetailRow}>
                <View>
                  <Text style={styles.detailLbl}>{t("welfare.coverage_label", "SUM ASSURED")}</Text>
                  <Text style={styles.coverageVal}>{p.coverage}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.detailLbl}>{t("welfare.valid_till_label", "VALIDITY")}</Text>
                  <Text style={styles.validVal}>{p.validTill}</Text>
                </View>
              </View>

              <View style={styles.subsidizedBox}>
                <CheckCircle2 size={12} color="#047857" />
                <Text style={styles.subsidizedText}>{p.premiumPaidBy}</Text>
              </View>
            </View>
          ))}
        </View>
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
  societyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surface.border,
    ...shadows.card,
    marginBottom: 12,
  },
  societyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 10,
    marginBottom: 10,
  },
  fedIconBox: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  fedIconText: {
    fontSize: 18,
    color: "#FDE68A",
    fontWeight: "bold",
  },
  societyTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  societyReg: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 1,
  },
  welfareBalanceBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.brand.light,
    borderRadius: radii.lg,
    padding: 12,
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.brand.primary,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.brand.dark,
    marginTop: 2,
  },
  contributedBox: {
    alignItems: "flex-end",
  },
  contributedLabel: {
    fontSize: 9.5,
    color: colors.brand.emerald800,
  },
  contributedAmount: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.brand.dark,
    marginTop: 2,
  },
  sosClaimCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.status.danger,
    borderRadius: radii.xl,
    padding: 14,
    marginBottom: 14,
    ...shadows.elevated,
  },
  sosClaimIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  sosClaimTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  sosClaimSub: {
    fontSize: 10.5,
    color: "#FEE2E2",
    marginTop: 2,
    lineHeight: 14,
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 8,
  },
  policiesList: {
    gap: 10,
    marginBottom: 20,
  },
  policyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surface.border,
    ...shadows.card,
  },
  policyTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  policyName: {
    fontSize: 12.5,
    fontWeight: "bold",
    color: colors.text.primary,
    flex: 1,
  },
  activePill: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: radii.sm,
  },
  activePillText: {
    fontSize: 8.5,
    fontWeight: "800",
    color: "#047857",
  },
  policyType: {
    fontSize: 10.5,
    color: colors.text.muted,
    marginTop: 2,
    marginBottom: 10,
  },
  policyDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    padding: 8,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
    marginBottom: 8,
  },
  detailLbl: {
    fontSize: 8,
    fontWeight: "800",
    color: colors.text.subtle,
    letterSpacing: 0.5,
  },
  coverageVal: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.brand.primary,
    marginTop: 1,
  },
  validVal: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.primary,
    marginTop: 1,
  },
  subsidizedBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  subsidizedText: {
    fontSize: 10,
    color: "#047857",
    fontWeight: "600",
  },
});

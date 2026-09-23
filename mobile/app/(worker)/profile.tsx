import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from "react-native";
import { useRouter } from "expo-router";
import MobileHeader from "../../components/Header";
import { useAuth } from "../../lib/auth";
import { useLang } from "../../lib/i18n";
import { colors, radii, shadows } from "../../lib/theme";
import {
  ShieldCheck,
  Star,
  Award,
  CreditCard,
  Building2,
  LogOut,
  UserCheck,
  Check,
} from "lucide-react-native";

export default function WorkerProfileScreen() {
  const router = useRouter();
  const { user, signOut, switchPersona } = useAuth();
  const { lang, setLang, t } = useLang();

  const [upiId, setUpiId] = useState("suresh.coop@oksbi");
  const [editingUpi, setEditingUpi] = useState(false);

  const handleSaveUpi = () => {
    setEditingUpi(false);
    Alert.alert("UPI Updated", "Your direct settlement UPI ID has been recorded for instant dispatches.");
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  const handleSwitchToCustomer = async () => {
    await switchPersona("customer");
    router.replace("/(customer)");
  };

  return (
    <View style={styles.screen}>
      <MobileHeader title="Cooperative Worker Profile" showEmergency={false} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarBox}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80" }}
              style={styles.avatarImg}
            />
          </View>

          <Text style={styles.nameText}>{user?.name || "Suresh Kumar"}</Text>
          <Text style={styles.tradeText}>Certified Electrician &bull; 8 Years Experience</Text>

          <View style={styles.verifiedPill}>
            <ShieldCheck size={12} color="#047857" />
            <Text style={styles.verifiedPillText}>VERIFIED COOPERATIVE MEMBER</Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>98%</Text>
              <Text style={styles.statLbl}>Coop Score</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>4.9 ★</Text>
              <Text style={styles.statLbl}>Rating (142)</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>210</Text>
              <Text style={styles.statLbl}>Jobs Done</Text>
            </View>
          </View>
        </View>

        {/* Language Selection Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t("profile.select_language", "Choose Interface Language")}</Text>
          <Text style={styles.langHelpText}>{t("profile.lang_desc", "Switch app display between English, தமிழ், and हिन्दी.")}</Text>
          <View style={styles.langSelectionGrid}>
            {[
              { code: "en", label: "English", native: "English" },
              { code: "ta", label: "தமிழ்", native: "Tamil" },
              { code: "hi", label: "हिन्दी", native: "Hindi" },
            ].map((item) => (
              <TouchableOpacity
                key={item.code}
                style={[styles.langChoiceBtn, lang === item.code && styles.langChoiceBtnActive]}
                onPress={() => setLang(item.code)}
                activeOpacity={0.8}
              >
                <Text style={[styles.langChoiceText, lang === item.code && styles.langChoiceTextActive]}>
                  {item.label}
                </Text>
                <Text style={[styles.langChoiceSub, lang === item.code && styles.langChoiceSubActive]}>
                  {item.native}
                </Text>
                {lang === item.code && <Check size={14} color="#059669" style={{ marginTop: 4 }} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Cooperative Credentials */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t("worker.skills_title", "Cooperative Credentials")}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>{t("worker.scheme_id", "Member Registration")}</Text>
            <Text style={styles.infoVal}>TNCF/CBE/1983/9412</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>{t("admin.col_coop", "Affiliated Society")}</Text>
            <Text style={styles.infoVal}>Gandhipuram Labour Cooperative</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>{t("status.certified", "Govt Trade License")}</Text>
            <Text style={styles.infoVal}>TN-ELE-LIC-94129 ({t("welfare.status_active", "Valid")})</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>{t("footer.fair_wages", "Statutory Wage Share")}</Text>
            <Text style={[styles.infoVal, { color: colors.brand.primary, fontWeight: "800" }]}>
              90% Direct Take-Home
            </Text>
          </View>
        </View>

        {/* Direct UPI Settlement */}
        <View style={styles.sectionCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Direct UPI Settlement</Text>
            <TouchableOpacity onPress={() => (editingUpi ? handleSaveUpi() : setEditingUpi(true))}>
              <Text style={styles.editLink}>{editingUpi ? t("common.success", "Save") : "Edit"}</Text>
            </TouchableOpacity>
          </View>

          {editingUpi ? (
            <TextInput
              value={upiId}
              onChangeText={setUpiId}
              style={styles.upiInput}
              autoCapitalize="none"
              placeholder="worker@okhdfcbank"
            />
          ) : (
            <View style={styles.upiDisplay}>
              <CreditCard size={15} color={colors.brand.primary} />
              <Text style={styles.upiText}>{upiId}</Text>
            </View>
          )}
          <Text style={styles.upiHint}>
            Customer payments are disbursed directly to this UPI address after completion.
          </Text>
        </View>

        {/* Switch Persona & Sign Out */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.switchBtn}
            onPress={handleSwitchToCustomer}
            activeOpacity={0.8}
          >
            <UserCheck size={16} color={colors.brand.primary} />
            <Text style={styles.switchBtnText}>Switch to Customer Mode</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <LogOut size={16} color="#DC2626" />
            <Text style={styles.signOutText}>{t("nav.logout", "Sign Out of Registry")}</Text>
          </TouchableOpacity>
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
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.xl,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.surface.border,
    ...shadows.card,
    marginBottom: 14,
  },
  avatarBox: {
    width: 72,
    height: 72,
    borderRadius: radii.full,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.brand.primary,
    marginBottom: 10,
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },
  nameText: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text.primary,
  },
  tradeText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
    marginTop: 8,
  },
  verifiedPillText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#047857",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.surface.border,
  },
  statBox: {
    alignItems: "center",
  },
  statVal: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.brand.primary,
  },
  statLbl: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.surface.border,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surface.border,
    ...shadows.card,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 8,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  infoKey: {
    fontSize: 11.5,
    color: colors.text.secondary,
  },
  infoVal: {
    fontSize: 11.5,
    fontWeight: "600",
    color: colors.text.primary,
  },
  editLink: {
    fontSize: 11.5,
    fontWeight: "bold",
    color: colors.brand.primary,
  },
  upiInput: {
    borderWidth: 1,
    borderColor: colors.brand.primary,
    borderRadius: radii.md,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    color: colors.text.primary,
    marginTop: 6,
  },
  upiDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
    marginTop: 4,
  },
  upiText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.brand.primary,
  },
  upiHint: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 6,
  },
  actionsContainer: {
    gap: 10,
    marginTop: 8,
  },
  switchBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingVertical: 12,
    borderRadius: radii.lg,
  },
  switchBtnText: {
    fontSize: 12.5,
    fontWeight: "bold",
    color: colors.brand.primary,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    paddingVertical: 12,
    borderRadius: radii.lg,
  },
  signOutText: {
    fontSize: 12.5,
    fontWeight: "bold",
    color: "#DC2626",
  },
  langHelpText: {
    fontSize: 11,
    color: colors.text.muted,
    marginBottom: 10,
  },
  langSelectionGrid: {
    flexDirection: "row",
    gap: 8,
  },
  langChoiceBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: radii.md,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  langChoiceBtnActive: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  langChoiceText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text.primary,
  },
  langChoiceTextActive: {
    color: colors.brand.primary,
  },
  langChoiceSub: {
    fontSize: 9.5,
    color: colors.text.muted,
    marginTop: 2,
  },
  langChoiceSubActive: {
    color: "#047857",
  },
});

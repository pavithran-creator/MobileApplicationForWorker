import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../lib/auth";
import { useLang, SUPPORTED_LANGUAGES } from "../../lib/i18n";
import { request } from "../../lib/api";
import { colors, radii, shadows } from "../../lib/theme";
import { ArrowLeft, Globe, Check } from "lucide-react-native";

export default function RegisterScreen() {
  const [role, setRole] = useState<"CUSTOMER" | "WORKER">("CUSTOMER");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("Gandhipuram, Coimbatore");
  const [trade, setTrade] = useState("Electrician");
  const [experienceYears, setExperienceYears] = useState("3");
  const [loading, setLoading] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const { login } = useAuth();
  const { lang, setLang, t } = useLang();
  const router = useRouter();

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert(
        t("common.error", "Required"),
        t("auth.enter_name", "Please enter your full name and mobile phone number.")
      );
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.trim().replace(/[^\d+]/g, "");

      // Register via API or embedded fallback
      await request<any>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          phone: cleanPhone,
          role,
          address: address.trim() || "Coimbatore, Tamil Nadu",
          trade,
          experience_years: Number(experienceYears) || 2,
        }),
      });

      await login(cleanPhone);

      Alert.alert(
        t("common.success", "Registration Complete"),
        t("auth.welcome_back", `Welcome to the ON-DEMAND Labour Cooperative, ${name}!`),
        [
          {
            text: t("common.continue", "Continue"),
            onPress: () => {
              if (role === "WORKER") {
                router.replace("/(worker)");
              } else {
                router.replace("/(customer)");
              }
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert(
        t("common.error", "Registration Failed"),
        err.message || t("common.error", "Failed to register account.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topNavRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={16} color={colors.brand.primary} />
          <Text style={styles.backText}>{t("nav.login", "Back to Sign In")}</Text>
        </TouchableOpacity>

        {/* Language Switcher Button */}
        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => setShowLangModal(true)}
          activeOpacity={0.7}
        >
          <Globe size={13} color="#065F46" />
          <Text style={styles.langBtnText}>{lang.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoIcon}>⚙</Text>
        </View>
        <Text style={styles.title}>{t("auth.register_title", "Join Trade Cooperative")}</Text>
        <Text style={styles.subtitle}>
          {t("auth.register_sub", "Join certified tradespersons or register for doorstep trade services with fair wages.")}
        </Text>
      </View>

      <View style={styles.formCard}>
        {/* Role Toggle */}
        <Text style={styles.inputLabel}>{t("auth.select_account_type", "CHOOSE YOUR MEMBERSHIP TYPE")}</Text>
        <View style={styles.roleToggleRow}>
          <TouchableOpacity
            style={[styles.roleBtn, role === "CUSTOMER" && styles.roleBtnActive]}
            onPress={() => setRole("CUSTOMER")}
          >
            <Text style={[styles.roleBtnText, role === "CUSTOMER" && styles.roleBtnTextActive]}>
              {t("auth.role_customer_title", "Customer (Citizen)")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleBtn, role === "WORKER" && styles.roleBtnActive]}
            onPress={() => setRole("WORKER")}
          >
            <Text style={[styles.roleBtnText, role === "WORKER" && styles.roleBtnTextActive]}>
              {t("auth.role_worker_title", "Tradesperson (Worker)")}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.inputLabel}>{t("auth.full_name", "FULL LEGAL NAME")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("auth.name_placeholder", "e.g. Ramesh K")}
          placeholderTextColor={colors.text.subtle}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.inputLabel}>{t("auth.phone_label", "MOBILE PHONE NUMBER")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("auth.phone_placeholder", "10-digit mobile number")}
          placeholderTextColor={colors.text.subtle}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.inputLabel}>{t("book.form_location", "SERVICE AREA / RESIDENCE")}</Text>
        <TextInput
          style={styles.input}
          placeholder="Area, City (e.g. Gandhipuram, Coimbatore)"
          placeholderTextColor={colors.text.subtle}
          value={address}
          onChangeText={setAddress}
        />

        {/* Worker Specific Fields */}
        {role === "WORKER" && (
          <>
            <Text style={styles.inputLabel}>{t("worker.skill_name", "PRIMARY TRADE SKILL")}</Text>
            <View style={styles.tradeChipsRow}>
              {["Electrician", "Plumber", "Carpenter", "Painter"].map((tr) => (
                <TouchableOpacity
                  key={tr}
                  style={[styles.tradeChip, trade === tr && styles.tradeChipActive]}
                  onPress={() => setTrade(tr)}
                >
                  <Text style={[styles.tradeChipText, trade === tr && styles.tradeChipTextActive]}>
                    {tr === "Electrician" ? t("doorstep.srv.electrician", tr) :
                     tr === "Plumber" ? t("doorstep.srv.plumber", tr) :
                     tr === "Carpenter" ? t("doorstep.srv.carpenter", tr) :
                     t("doorstep.srv.painting", tr)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>{t("worker.skill_exp", "YEARS OF EXPERIENCE")}</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 5"
              placeholderTextColor={colors.text.subtle}
              keyboardType="numeric"
              value={experienceYears}
              onChangeText={setExperienceYears}
            />
          </>
        )}

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>
              {t("auth.create_account_btn", "Complete Registration")}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.loginLinkText}>
            {t("auth.already_member", "Already a member?")} <Text style={styles.loginBold}>{t("nav.login", "Sign In")}</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Language Selection Modal */}
      <Modal visible={showLangModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.langPickerCard}>
            <Text style={styles.modalHeading}>
              {t("header.select_lang", "Select Interface Language")}
            </Text>
            <Text style={styles.modalSubheading}>தமிழ்நாடு தொழிலாளர் கூட்டுறவு தளம்</Text>

            <View style={styles.langPresetList}>
              {SUPPORTED_LANGUAGES.map((item) => (
                <TouchableOpacity
                  key={item.code}
                  style={[styles.langItem, lang === item.code && styles.langItemActive]}
                  onPress={() => {
                    setLang(item.code);
                    setShowLangModal(false);
                  }}
                >
                  <View>
                    <Text style={[styles.langText, lang === item.code && styles.langTextActive]}>
                      {item.label}
                    </Text>
                    <Text style={styles.langNativeText}>{item.native}</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.pageBg,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  topNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  backText: {
    fontSize: 12.5,
    fontWeight: "bold",
    color: colors.brand.primary,
  },
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.md,
  },
  langBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#065F46",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: radii.xl,
    backgroundColor: colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    ...shadows.card,
  },
  logoIcon: {
    fontSize: 24,
    color: "#FDE68A",
    fontWeight: "bold",
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.text.primary,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: 4,
    maxWidth: 290,
    lineHeight: 16,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.surface.border,
    ...shadows.card,
  },
  inputLabel: {
    fontSize: 8.5,
    fontWeight: "800",
    color: colors.text.subtle,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  roleToggleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: radii.md,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.surface.border,
    alignItems: "center",
  },
  roleBtnActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  roleBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  roleBtnTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 12,
    color: colors.text.primary,
    marginBottom: 12,
  },
  tradeChipsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  tradeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.md,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  tradeChipActive: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  tradeChipText: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  tradeChipTextActive: {
    color: colors.brand.primary,
    fontWeight: "bold",
  },
  submitBtn: {
    backgroundColor: colors.brand.primary,
    paddingVertical: 12,
    borderRadius: radii.lg,
    alignItems: "center",
    marginTop: 6,
    ...shadows.elevated,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  loginLink: {
    alignItems: "center",
    marginTop: 14,
  },
  loginLinkText: {
    fontSize: 11.5,
    color: colors.text.secondary,
  },
  loginBold: {
    fontWeight: "bold",
    color: colors.brand.primary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    justifyContent: "center",
    padding: 20,
  },
  langPickerCard: {
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
  langPresetList: {
    gap: 8,
    marginBottom: 16,
  },
  langItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  langItemActive: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  langText: {
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: "600",
  },
  langTextActive: {
    color: colors.brand.primary,
    fontWeight: "700",
  },
  langNativeText: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
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
});

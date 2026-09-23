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
import { colors, radii, shadows } from "../../lib/theme";
import { ArrowLeft, Globe, Check } from "lucide-react-native";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const { login, quickLogin } = useAuth();
  const { lang, setLang, t } = useLang();
  const router = useRouter();

  const handleLogin = async () => {
    if (!phone.trim()) {
      Alert.alert(
        t("common.error", "Required"),
        t("auth.enter_phone", "Please enter your mobile phone number.")
      );
      return;
    }
    setLoading(true);
    try {
      const user = await login(phone, password);
      if (user.role === "WORKER") {
        router.replace("/(worker)");
      } else {
        router.replace("/(customer)");
      }
    } catch (err: any) {
      Alert.alert(
        t("common.error", "Sign In Failed"),
        err.message || t("common.error", "Invalid credentials.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = async (role: "CUSTOMER" | "WORKER") => {
    setLoading(true);
    try {
      const user = await quickLogin(role);
      if (user.role === "WORKER") {
        router.replace("/(worker)");
      } else {
        router.replace("/(customer)");
      }
    } catch (err: any) {
      Alert.alert(t("common.error", "Demo Login Error"), err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topNavRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={16} color={colors.brand.primary} />
          <Text style={styles.backText}>{t("nav.home", "Back to Home")}</Text>
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

      {/* Header crest matching web */}
      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoIcon}>⚙</Text>
        </View>
        <Text style={styles.title}>{t("auth.welcome_back", "Sign in to your account")}</Text>
        <Text style={styles.subtitle}>
          {t("auth.sign_in_sub", "Access your bookings, assignments, or administrative controls.")}
        </Text>
      </View>

      {/* Form Card */}
      <View style={styles.formCard}>
        <Text style={styles.inputLabel}>{t("auth.phone_label", "REGISTERED PHONE NUMBER")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("auth.phone_placeholder", "10-digit mobile number")}
          placeholderTextColor={colors.text.subtle}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.inputLabel}>{t("auth.password_label", "PASSWORD")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("auth.password_placeholder", "Enter password")}
          placeholderTextColor={colors.text.subtle}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>{t("auth.sign_in_btn", "Sign In")}</Text>
          )}
        </TouchableOpacity>

        {/* 1-Click Demo Personas Grid matching web */}
        <View style={styles.demoDivider} />
        <View style={styles.demoHeaderRow}>
          <Text style={styles.demoHeader}>{t("auth.demoTitle", "1-CLICK DEMO PERSONAS")}</Text>
          <View style={styles.instantPill}>
            <Text style={styles.instantPillText}>{t("auth.instantAccess", "Instant Access")}</Text>
          </View>
        </View>

        <View style={styles.demoGrid}>
          <TouchableOpacity
            style={styles.demoCard}
            onPress={() => handleQuick("CUSTOMER")}
          >
            <Text style={styles.demoCardRole}>{t("auth.role_customer_title", "Customer")}</Text>
            <Text style={styles.demoCardName}>Meena Sundaram</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoCard}
            onPress={() => handleQuick("WORKER")}
          >
            <Text style={styles.demoCardRole}>{t("auth.role_worker_title", "Skilled Worker")}</Text>
            <Text style={styles.demoCardName}>Suresh (Electrician)</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.regLink}
          onPress={() => router.push("/(auth)/register")}
        >
          <Text style={styles.regLinkText}>
            {t("auth.already_member", "Don't have an account?")}{" "}
            <Text style={styles.regBold}>{t("auth.sign_in_now", "Register here")}</Text>
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
    fontSize: 22,
    fontWeight: "900",
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: 4,
    maxWidth: 280,
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
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12.5,
    color: colors.text.primary,
    marginBottom: 14,
  },
  submitBtn: {
    backgroundColor: colors.brand.primary,
    paddingVertical: 12,
    borderRadius: radii.lg,
    alignItems: "center",
    ...shadows.elevated,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  demoDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 16,
  },
  demoHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  demoHeader: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.text.subtle,
    letterSpacing: 0.5,
  },
  instantPill: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: radii.sm,
  },
  instantPillText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#92400E",
  },
  demoGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  demoCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radii.md,
    padding: 10,
  },
  demoCardRole: {
    fontSize: 11.5,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  demoCardName: {
    fontSize: 9.5,
    color: colors.text.muted,
    marginTop: 2,
  },
  regLink: {
    alignItems: "center",
  },
  regLinkText: {
    fontSize: 11.5,
    color: colors.text.secondary,
  },
  regBold: {
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

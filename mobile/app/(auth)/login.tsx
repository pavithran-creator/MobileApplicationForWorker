import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../lib/auth";
import { Shield, ArrowLeft, Phone, Lock, Check } from "lucide-react-native";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, quickLogin } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!phone.trim()) {
      Alert.alert("Required", "Please enter your mobile phone number.");
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
      Alert.alert("Sign In Failed", err.message || "Invalid credentials. Please verify your phone number.");
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
      Alert.alert("Demo Login Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <ArrowLeft size={20} color="#065f46" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <Shield size={28} color="#065f46" />
        </View>
        <Text style={styles.title}>Sign in to ON-DEMAND</Text>
        <Text style={styles.subtitle}>Access bookings, cooperative job orders, or statutory welfare records.</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.inputLabel}>Mobile Phone Number</Text>
        <View style={styles.inputWrapper}>
          <Phone size={18} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g. 9000000011"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <Text style={styles.inputLabel}>Password</Text>
        <View style={styles.inputWrapper}>
          <Lock size={18} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitBtnText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 1-Click Fast Fill Personas */}
      <View style={styles.quickCard}>
        <Text style={styles.quickTitle}>Or 1-Click Demo Login</Text>
        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => handleQuick("CUSTOMER")}>
            <Check size={14} color="#065f46" />
            <Text style={styles.quickBtnText}>Customer (Meena)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickBtn, styles.quickWorkerBtn]} onPress={() => handleQuick("WORKER")}>
            <Check size={14} color="#0284c7" />
            <Text style={[styles.quickBtnText, styles.quickWorkerText]}>Worker (Suresh)</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.registerLinkRow}>
        <Text style={styles.regText}>Don&apos;t have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
          <Text style={styles.regLink}>Register New Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  backText: {
    fontSize: 14,
    color: "#065f46",
    fontWeight: "bold",
  },
  header: {
    marginBottom: 24,
  },
  logoBadge: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 12.5,
    color: "#64748b",
    marginTop: 4,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0f172a",
  },
  submitBtn: {
    backgroundColor: "#065f46",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  quickCard: {
    backgroundColor: "#f0fdf4",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    marginBottom: 20,
  },
  quickTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#065f46",
    textAlign: "center",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  quickRow: {
    flexDirection: "row",
    gap: 8,
  },
  quickBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "#ffffff",
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  quickWorkerBtn: {
    borderColor: "#bae6fd",
  },
  quickBtnText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#065f46",
  },
  quickWorkerText: {
    color: "#0284c7",
  },
  registerLinkRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  regText: {
    fontSize: 12.5,
    color: "#64748b",
  },
  regLink: {
    fontSize: 12.5,
    fontWeight: "bold",
    color: "#065f46",
    textDecorationLine: "underline",
  },
});

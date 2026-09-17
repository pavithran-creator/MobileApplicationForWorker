import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { Shield, ArrowLeft, User, Phone, MapPin, Wrench } from "lucide-react-native";

export default function RegisterScreen() {
  const [role, setRole] = useState<"CUSTOMER" | "WORKER">("CUSTOMER");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [trade, setTrade] = useState("Electrician");
  const [experienceYears, setExperienceYears] = useState("3");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Required", "Please enter your full name and mobile phone number.");
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.trim().replace(/[^\d+]/g, "");

      // 1. Create Profile in Supabase
      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .insert({
          name: name.trim(),
          phone: cleanPhone,
          role: role,
        })
        .select()
        .single();

      if (pErr) throw pErr;

      // 2. Create Role-specific record
      if (role === "CUSTOMER") {
        await supabase.from("customers").insert({
          profile_id: profile.id,
          user_id_num: profile.user_id_num,
          address: address.trim() || "Coimbatore, Tamil Nadu",
        });
      } else {
        const { data: worker, error: wErr } = await supabase
          .from("workers")
          .insert({
            profile_id: profile.id,
            user_id_num: profile.user_id_num,
            cooperative_id: 1, // Gandhipuram Labour Cooperative
            address: address.trim() || "Coimbatore, Tamil Nadu",
            experience_years: parseFloat(experienceYears) || 2,
            verification_status: "VERIFIED",
            is_available: true,
            avg_rating: 5.0,
            rating_count: 0,
            upi_id: `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}@oksbi`,
            base_lat: 11.0168,
            base_lng: 76.9558,
            service_radius_km: 25.0,
          })
          .select()
          .single();

        if (wErr) throw wErr;

        // Link default skill
        await supabase.from("worker_skills").insert({
          worker_id: worker.id,
          skill_id: trade === "Plumber" ? 3 : trade === "Carpenter" ? 5 : 1,
          level: "expert",
          experience_years: parseFloat(experienceYears) || 2,
        });
      }

      // Log in automatically
      await login(cleanPhone);

      Alert.alert("Registration Complete", `Welcome to ON-DEMAND Labour Cooperative, ${name}!`, [
        {
          text: "Continue",
          onPress: () => {
            if (role === "WORKER") {
              router.replace("/(worker)");
            } else {
              router.replace("/(customer)");
            }
          },
        },
      ]);
    } catch (err: any) {
      Alert.alert("Registration Failed", err.message || "Could not register account. Phone number may already be registered.");
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
        <Text style={styles.title}>Member Registration</Text>
        <Text style={styles.subtitle}>Register as a household consumer or join as a verified trade member.</Text>
      </View>

      {/* Role Switcher Pills */}
      <View style={styles.roleToggle}>
        <TouchableOpacity
          style={[styles.roleOption, role === "CUSTOMER" && styles.roleOptionActive]}
          onPress={() => setRole("CUSTOMER")}
        >
          <Text style={[styles.roleText, role === "CUSTOMER" && styles.roleTextActive]}>
            Household Customer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleOption, role === "WORKER" && styles.roleOptionActive]}
          onPress={() => setRole("WORKER")}
        >
          <Text style={[styles.roleText, role === "WORKER" && styles.roleTextActive]}>
            Trade Worker
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.inputLabel}>Full Name</Text>
        <View style={styles.inputWrapper}>
          <User size={18} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g. Ramesh Kumar"
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
          />
        </View>

        <Text style={styles.inputLabel}>Mobile Phone Number</Text>
        <View style={styles.inputWrapper}>
          <Phone size={18} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g. 9840012345"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <Text style={styles.inputLabel}>Service Street Address / Area</Text>
        <View style={styles.inputWrapper}>
          <MapPin size={18} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g. Gandhipuram, Coimbatore"
            placeholderTextColor="#94a3b8"
            value={address}
            onChangeText={setAddress}
          />
        </View>

        {/* Worker-Specific Fields */}
        {role === "WORKER" && (
          <>
            <Text style={styles.inputLabel}>Primary Trade Specialization</Text>
            <View style={styles.inputWrapper}>
              <Wrench size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Electrician / Plumber / Carpenter"
                placeholderTextColor="#94a3b8"
                value={trade}
                onChangeText={setTrade}
              />
            </View>

            <Text style={styles.inputLabel}>Years of Experience</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="e.g. 5"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={experienceYears}
                onChangeText={setExperienceYears}
              />
            </View>
          </>
        )}

        <TouchableOpacity style={styles.submitBtn} onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitBtnText}>
              {role === "WORKER" ? "Register as Trade Worker" : "Create Customer Account"}
            </Text>
          )}
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
    marginBottom: 20,
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
  roleToggle: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  roleOptionActive: {
    backgroundColor: "#065f46",
  },
  roleText: {
    fontSize: 12.5,
    fontWeight: "bold",
    color: "#475569",
  },
  roleTextActive: {
    color: "#ffffff",
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
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
});

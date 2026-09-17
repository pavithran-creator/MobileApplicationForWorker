import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth';
import { useI18n } from '../../lib/i18n';

export default function WorkerProfileScreen() {
  const router = useRouter();
  const { user, profile, workerProfile, signOut, switchPersona } = useAuth();
  const { language, setLanguage, t } = useI18n();

  const [upiId, setUpiId] = useState(
    profile?.phone ? `coop.${profile.phone}@okhdfcbank` : 'suresh.kumar@okhdfcbank'
  );
  const [editingUpi, setEditingUpi] = useState(false);

  const handleSaveUpi = () => {
    setEditingUpi(false);
    Alert.alert('UPI Updated', 'Your direct settlement UPI ID has been updated in the cooperative ledger.');
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const handleSwitchToCustomer = async () => {
    await switchPersona('customer');
    router.replace('/(customer)');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Profile Header Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#16A34A" />
        </View>

        <Text style={styles.nameText}>{profile?.full_name || 'Suresh Kumar'}</Text>
        <Text style={styles.tradeText}>
          {workerProfile?.primary_skill || 'Certified Electrician'} • {workerProfile?.experience_years || 7} Years Exp.
        </Text>

        <View style={styles.badgeRow}>
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#16A34A" />
            <Text style={styles.verifiedBadgeText}>VERIFIED COOPERATIVE MEMBER</Text>
          </View>
        </View>

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

      {/* Cooperative Membership Credentials */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Cooperative Credentials</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Member ID</Text>
          <Text style={styles.infoVal}>TN-COOP-MBR-2024-8841</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Affiliated Society</Text>
          <Text style={styles.infoVal}>Chennai Central Electrical Coop</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Govt Trade License</Text>
          <Text style={styles.infoVal}>TN-ELE-LIC-94129 (Valid till 2028)</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Fair Wage Share</Text>
          <Text style={[styles.infoVal, { color: '#16A34A', fontWeight: '800' }]}>90% Direct Pay</Text>
        </View>
      </View>

      {/* Direct UPI Settlement Handle */}
      <View style={styles.sectionCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Direct UPI Settlement</Text>
          <TouchableOpacity onPress={() => (editingUpi ? handleSaveUpi() : setEditingUpi(true))}>
            <Text style={styles.editLink}>{editingUpi ? 'Save' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.upiDesc}>
          Customers transfer payments directly to this UPI handle during service completion. Zero platform commission.
        </Text>

        {editingUpi ? (
          <TextInput
            style={styles.upiInput}
            value={upiId}
            onChangeText={setUpiId}
            placeholder="yourname@bank"
          />
        ) : (
          <View style={styles.upiDisplayBox}>
            <Ionicons name="qr-code-outline" size={20} color="#16A34A" />
            <Text style={styles.upiDisplayText}>{upiId}</Text>
          </View>
        )}
      </View>

      {/* Language Switcher */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>App Language / மொழி / भाषा</Text>
        <View style={styles.langRow}>
          {[
            { code: 'en', label: 'English' },
            { code: 'ta', label: 'தமிழ்' },
            { code: 'hi', label: 'हिन्दी' },
          ].map((item) => (
            <TouchableOpacity
              key={item.code}
              style={[styles.langPill, language === item.code && styles.langPillActive]}
              onPress={() => setLanguage(item.code as any)}
            >
              <Text style={[styles.langPillText, language === item.code && styles.langPillTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Switch to Customer Persona & Sign Out */}
      <View style={styles.actionsBox}>
        <TouchableOpacity style={styles.switchPersonaBtn} onPress={handleSwitchToCustomer}>
          <Ionicons name="swap-horizontal" size={18} color="#1E3A8A" />
          <Text style={styles.switchPersonaText}>Switch to Customer Portal</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={18} color="#DC2626" />
          <Text style={styles.signOutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  tradeText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 10,
  },
  badgeRow: {
    marginBottom: 16,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  verifiedBadgeText: {
    color: '#16A34A',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
    width: '100%',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLbl: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    height: 24,
    alignSelf: 'center',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editLink: {
    fontSize: 13,
    color: '#16A34A',
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  infoKey: {
    fontSize: 13,
    color: '#64748B',
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  upiDesc: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
    lineHeight: 16,
  },
  upiDisplayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  upiDisplayText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#166534',
  },
  upiInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  langRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  langPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  langPillActive: {
    backgroundColor: '#16A34A',
  },
  langPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  langPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actionsBox: {
    gap: 10,
    marginTop: 4,
  },
  switchPersonaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  switchPersonaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
});

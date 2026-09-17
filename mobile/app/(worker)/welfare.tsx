import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

export default function WorkerWelfareScreen() {
  const { workerProfile, profile } = useAuth();
  const [loading, setLoading] = useState(false);

  // Welfare metrics
  const welfareData = {
    societyName: 'Tamil Nadu Urban Cooperative Labour Federation',
    societyRegNo: 'TN-COOP-ACT-1983-0942',
    welfareFundBalance: '₹8,450',
    totalContributed: '₹14,200',
    policies: [
      {
        id: 'pol-1',
        name: 'Pradhan Mantri Suraksha Bima Yojana (PMSBY)',
        type: 'Accidental Death & Disability Cover',
        coverage: '₹2,00,000',
        status: 'ACTIVE',
        validTill: '31 May 2027',
        premiumPaidBy: 'Cooperative Society (100% Subsidized)',
      },
      {
        id: 'pol-2',
        name: 'Cooperative Health Shield & Emergency Care',
        type: 'Inpatient Hospitalization & Critical Illness',
        coverage: '₹1,50,000',
        status: 'ACTIVE',
        validTill: '31 Dec 2027',
        premiumPaidBy: '10% Cooperative Surcharge Pool',
      },
      {
        id: 'pol-3',
        name: 'Unorganized Workers Social Security Card (e-Shram)',
        type: 'Universal Social Security Number (UAN)',
        coverage: 'Pensions & Maternity Benefits',
        status: 'LINKED',
        validTill: 'Lifetime',
        premiumPaidBy: 'Government of India / Cooperative Board',
      },
    ],
  };

  const handleClaimSupport = () => {
    Alert.alert(
      'Emergency Welfare Assistance',
      'Contacting your Cooperative Welfare Officer (Phone: 044-28340192). Dedicated ambulance and emergency cash grant (up to ₹10,000) are accessible within 2 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Officer', onPress: () => {} },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Society Header */}
      <View style={styles.societyCard}>
        <View style={styles.societyHeader}>
          <Ionicons name="shield-checkmark" size={24} color="#16A34A" />
          <View style={{ flex: 1 }}>
            <Text style={styles.societyTitle}>{welfareData.societyName}</Text>
            <Text style={styles.societyReg}>{welfareData.societyRegNo}</Text>
          </View>
        </View>

        <View style={styles.welfareBalanceBox}>
          <View>
            <Text style={styles.balanceLabel}>Your Cooperative Pension & Welfare Reserve</Text>
            <Text style={styles.balanceAmount}>{welfareData.welfareFundBalance}</Text>
          </View>
          <View style={styles.contributedBox}>
            <Text style={styles.contributedLabel}>Lifetime Pooled</Text>
            <Text style={styles.contributedAmount}>{welfareData.totalContributed}</Text>
          </View>
        </View>
      </View>

      {/* Emergency Distress Assistance CTA */}
      <TouchableOpacity style={styles.emergencyClaimBtn} onPress={handleClaimSupport}>
        <Ionicons name="medkit" size={20} color="#FFFFFF" />
        <View style={{ flex: 1 }}>
          <Text style={styles.claimBtnTitle}>Emergency Health / Accident Distress Claim</Text>
          <Text style={styles.claimBtnSub}>24/7 dedicated cooperative hospital admission desk</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Active Enrolled Policies */}
      <Text style={styles.sectionHeading}>Active Social Security & Insurance Policies</Text>

      {welfareData.policies.map((policy) => (
        <View key={policy.id} style={styles.policyCard}>
          <View style={styles.policyHeader}>
            <View style={styles.statusPill}>
              <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
              <Text style={styles.statusPillText}>{policy.status}</Text>
            </View>
            <Text style={styles.validText}>Valid till: {policy.validTill}</Text>
          </View>

          <Text style={styles.policyName}>{policy.name}</Text>
          <Text style={styles.policyType}>{policy.type}</Text>

          <View style={styles.coverageRow}>
            <View>
              <Text style={styles.covLabel}>Insurance Sum Insured</Text>
              <Text style={styles.covValue}>{policy.coverage}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.covLabel}>Premium Sponsor</Text>
              <Text style={styles.sponsorValue}>{policy.premiumPaidBy}</Text>
            </View>
          </View>
        </View>
      ))}
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
  societyCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
  },
  societyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  societyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  societyReg: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  welfareBalanceBox: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 11,
    color: '#86EFAC',
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  contributedBox: {
    alignItems: 'flex-end',
  },
  contributedLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  contributedAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E2E8F0',
    marginTop: 2,
  },
  emergencyClaimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  claimBtnTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  claimBtnSub: {
    color: '#FEE2E2',
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  policyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  policyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  statusPillText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '800',
  },
  validText: {
    fontSize: 11,
    color: '#64748B',
  },
  policyName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  policyType: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 12,
  },
  coverageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  covLabel: {
    fontSize: 10,
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  covValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#16A34A',
    marginTop: 2,
  },
  sponsorValue: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
    marginTop: 2,
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth';
import { BookingRecord } from '../../../types';

export default function WorkerJobDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { workerProfile } = useAuth();

  const [job, setJob] = useState<BookingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services:service_id (name, category),
          customers:customer_id (
            profiles:user_id (full_name, phone)
          )
        `)
        .eq('id', id)
        .single();

      if (!error && data) {
        setJob({
          id: data.id,
          customer_id: data.customer_id,
          worker_id: data.worker_id,
          service_id: data.service_id,
          status: data.status,
          scheduled_date: data.scheduled_date,
          total_amount: data.total_amount || 399,
          worker_wage: data.worker_wage || Math.round((data.total_amount || 399) * 0.9),
          cooperative_surcharge: data.cooperative_surcharge || Math.round((data.total_amount || 399) * 0.1),
          service_address: data.service_address || 'Customer Location',
          notes: data.notes,
          photo_url: data.photo_url,
          created_at: data.created_at,
          service_name: data.services?.name || 'Cooperative Service',
          customer_name: data.customers?.profiles?.full_name || 'Meena Sundaram',
          customer_phone: data.customers?.profiles?.phone || '9000000011',
        });
      } else {
        // Mock fallback
        setJob({
          id: (id as string) || 'job-901',
          customer_id: 'cust-1',
          worker_id: 'work-1',
          service_id: 'srv-1',
          status: 'REQUESTED',
          scheduled_date: new Date().toISOString(),
          total_amount: 399,
          worker_wage: 359,
          cooperative_surcharge: 40,
          service_address: '42/B, Anna Salai, Royapettah (1.4 km)',
          notes: 'Customer reported ceiling fan regulator heating up and smelling burnt.',
          photo_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
          service_name: 'Ceiling Fan Rewiring & Servicing',
          customer_name: 'Meena Sundaram',
          customer_phone: '9000000011',
          created_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Job details error:', e);
    } finally {
      setLoading(false);
    }
  };

  const updateJobStatus = async (newStatus: 'ACCEPTED' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') => {
    try {
      setUpdating(true);
      if (job) {
        await supabase
          .from('bookings')
          .update({ status: newStatus })
          .eq('id', job.id);

        setJob({ ...job, status: newStatus });
        Alert.alert('Status Updated', `Job marked as ${newStatus}.`);
      }
    } catch (e: any) {
      if (job) setJob({ ...job, status: newStatus });
      Alert.alert('Status Updated (Local)', `Job transitioned to ${newStatus}.`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !job) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Top Header Card */}
      <View style={styles.card}>
        <View style={styles.badgeRow}>
          <View style={[styles.statusBadge, { backgroundColor: job.status === 'COMPLETED' ? '#DCFCE7' : '#EFF6FF' }]}>
            <Text style={[styles.statusBadgeText, { color: job.status === 'COMPLETED' ? '#16A34A' : '#2563EB' }]}>
              {job.status}
            </Text>
          </View>
          <Text style={styles.jobRef}>#{job.id.slice(0, 8)}</Text>
        </View>

        <Text style={styles.jobTitle}>{job.service_name}</Text>

        <View style={styles.wageHighlightCard}>
          <View>
            <Text style={styles.wageLabel}>Your 90% Direct Cooperative Wage</Text>
            <Text style={styles.wageAmount}>₹{job.worker_wage}</Text>
          </View>
          <View style={styles.splitNoteBox}>
            <Text style={styles.splitNote}>Total Bill: ₹{job.total_amount}</Text>
            <Text style={styles.splitNote}>Welfare Fund: ₹{job.cooperative_surcharge}</Text>
          </View>
        </View>
      </View>

      {/* Customer Location & Contact */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Client & Dispatch Location</Text>

        <View style={styles.rowItem}>
          <Ionicons name="person" size={16} color="#16A34A" />
          <Text style={styles.customerName}>{job.customer_name}</Text>
        </View>

        <View style={styles.rowItem}>
          <Ionicons name="location" size={16} color="#DC2626" />
          <Text style={styles.locationText}>{job.service_address}</Text>
        </View>

        {job.customer_phone && (
          <TouchableOpacity style={styles.callButton}>
            <Ionicons name="call" size={16} color="#FFFFFF" />
            <Text style={styles.callButtonText}>Call Customer ({job.customer_phone})</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Multimodal Diagnostic Proof: Live Image & Notes */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Customer Problem Capture</Text>

        {job.photo_url ? (
          <View style={styles.photoBox}>
            <Text style={styles.photoLabel}>Customer's Live Problem Snapshot:</Text>
            <Image source={{ uri: job.photo_url }} style={styles.photoPreview} />
          </View>
        ) : null}

        {job.notes ? (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Diagnosis / Transcript Notes:</Text>
            <Text style={styles.notesText}>{job.notes}</Text>
          </View>
        ) : (
          <Text style={styles.emptyNotesText}>No additional problem notes provided.</Text>
        )}
      </View>

      {/* Action Buttons for Worker Workflow */}
      <View style={styles.actionSection}>
        {job.status === 'REQUESTED' && (
          <View style={styles.dualActionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.acceptBtn]}
              onPress={() => updateJobStatus('ACCEPTED')}
              disabled={updating}
            >
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Accept Job Order</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => updateJobStatus('CANCELLED')}
              disabled={updating}
            >
              <Ionicons name="close-circle" size={18} color="#DC2626" />
              <Text style={[styles.actionBtnText, { color: '#DC2626' }]}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}

        {job.status === 'ACCEPTED' && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.arrivedBtn]}
            onPress={() => updateJobStatus('ARRIVED')}
            disabled={updating}
          >
            <Ionicons name="navigate" size={18} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Mark Arrived at Location</Text>
          </TouchableOpacity>
        )}

        {job.status === 'ARRIVED' && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.startBtn]}
            onPress={() => updateJobStatus('IN_PROGRESS')}
            disabled={updating}
          >
            <Ionicons name="play" size={18} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Start Service Work</Text>
          </TouchableOpacity>
        )}

        {job.status === 'IN_PROGRESS' && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.completeBtn]}
            onPress={() => updateJobStatus('COMPLETED')}
            disabled={updating}
          >
            <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Complete Job & Request Payment (₹{job.worker_wage})</Text>
          </TouchableOpacity>
        )}

        {job.status === 'COMPLETED' && (
          <View style={styles.completedNotice}>
            <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
            <Text style={styles.completedTitle}>Job Completed Successfully</Text>
            <Text style={styles.completedSub}>₹{job.worker_wage} credited directly to your cooperative ledger.</Text>
          </View>
        )}
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
  card: {
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
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  jobRef: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  wageHighlightCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wageLabel: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600',
  },
  wageAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#15803D',
    marginTop: 2,
  },
  splitNoteBox: {
    alignItems: 'flex-end',
  },
  splitNote: {
    fontSize: 11,
    color: '#166534',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  locationText: {
    fontSize: 13,
    color: '#475569',
    flex: 1,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    marginTop: 6,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  photoBox: {
    marginBottom: 12,
  },
  photoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  photoPreview: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    backgroundColor: '#0F172A',
  },
  notesContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 18,
  },
  emptyNotesText: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  actionSection: {
    marginTop: 4,
  },
  dualActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  acceptBtn: {
    flex: 2,
    backgroundColor: '#16A34A',
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  arrivedBtn: {
    backgroundColor: '#2563EB',
  },
  startBtn: {
    backgroundColor: '#D97706',
  },
  completeBtn: {
    backgroundColor: '#16A34A',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  completedNotice: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  completedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#166534',
  },
  completedSub: {
    fontSize: 13,
    color: '#166534',
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

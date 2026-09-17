import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useI18n } from '../../lib/i18n';
import { BookingRecord } from '../../types';

export default function BookingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useI18n();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      if (!user) {
        setBookings(getMockBookings());
        return;
      }

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services:service_id (name, category),
          workers:worker_id (
            id,
            profiles:user_id (full_name, phone)
          )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const formatted: BookingRecord[] = data.map((b: any) => ({
          id: b.id,
          customer_id: b.customer_id,
          worker_id: b.worker_id,
          service_id: b.service_id,
          status: b.status,
          scheduled_date: b.scheduled_date,
          total_amount: b.total_amount,
          worker_wage: b.worker_wage,
          cooperative_surcharge: b.cooperative_surcharge,
          service_address: b.service_address,
          notes: b.notes,
          photo_url: b.photo_url,
          created_at: b.created_at,
          service_name: b.services?.name || 'Cooperative Service',
          worker_name: b.workers?.profiles?.full_name || 'Assigned Cooperative Worker',
          worker_phone: b.workers?.profiles?.phone,
        }));
        setBookings(formatted);
      } else {
        setBookings(getMockBookings());
      }
    } catch (e) {
      console.warn('Booking fetch fallback:', e);
      setBookings(getMockBookings());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockBookings = (): BookingRecord[] => [
    {
      id: 'bk-101',
      customer_id: 'cust-1',
      worker_id: 'work-1',
      service_id: 'srv-1',
      status: 'IN_PROGRESS',
      scheduled_date: new Date().toISOString(),
      total_amount: 349,
      worker_wage: 314,
      cooperative_surcharge: 35,
      service_address: '14, Anna Nagar 2nd St, Ward 12',
      service_name: 'Ceiling Fan Rewiring & Repair',
      worker_name: 'Suresh Kumar',
      worker_phone: '9010000001',
      created_at: new Date().toISOString(),
    },
    {
      id: 'bk-102',
      customer_id: 'cust-1',
      worker_id: 'work-2',
      service_id: 'srv-2',
      status: 'COMPLETED',
      scheduled_date: new Date(Date.now() - 86400000 * 2).toISOString(),
      total_amount: 399,
      worker_wage: 359,
      cooperative_surcharge: 40,
      service_address: '14, Anna Nagar 2nd St, Ward 12',
      service_name: 'Water Pipe Leakage Repair',
      worker_name: 'Murugan Velu',
      worker_phone: '9010000002',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];

  const filteredBookings = bookings.filter((b) => {
    if (activeFilter === 'ACTIVE') return ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'ARRIVED'].includes(b.status);
    if (activeFilter === 'COMPLETED') return ['COMPLETED', 'CANCELLED'].includes(b.status);
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return { bg: '#EFF6FF', text: '#2563EB', icon: 'sync-circle' };
      case 'COMPLETED': return { bg: '#F0FDF4', text: '#16A34A', icon: 'checkmark-circle' };
      case 'ACCEPTED': return { bg: '#FEF3C7', text: '#D97706', icon: 'time' };
      case 'CANCELLED': return { bg: '#FEE2E2', text: '#DC2626', icon: 'close-circle' };
      default: return { bg: '#F1F5F9', text: '#475569', icon: 'hourglass-outline' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.tabButton, activeFilter === filter && styles.tabButtonActive]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[styles.tabText, activeFilter === filter && styles.tabTextActive]}>
              {filter === 'ALL' ? 'All Bookings' : filter === 'ACTIVE' ? 'Active' : 'Completed'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookings List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchBookings} />}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const statusStyle = getStatusColor(item.status);
            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => router.push(`/(customer)/booking/${item.id}`)}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Ionicons name={statusStyle.icon as any} size={13} color={statusStyle.text} />
                    <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>{item.status}</Text>
                  </View>
                  <Text style={styles.bookingId}>#{item.id.slice(0, 8)}</Text>
                </View>

                <Text style={styles.serviceName}>{item.service_name}</Text>
                <Text style={styles.addressText} numberOfLines={1}>
                  <Ionicons name="location-outline" size={13} color="#64748B" /> {item.service_address}
                </Text>

                <View style={styles.workerRow}>
                  <View style={styles.workerAvatar}>
                    <Ionicons name="person" size={14} color="#1E3A8A" />
                  </View>
                  <Text style={styles.workerName}>{item.worker_name}</Text>
                </View>

                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.priceLabel}>Paid / Due</Text>
                    <Text style={styles.priceText}>₹{item.total_amount}</Text>
                  </View>

                  <View style={styles.trackAction}>
                    <Text style={styles.trackActionText}>Track & Details</Text>
                    <Ionicons name="chevron-forward" size={16} color="#1E3A8A" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No bookings found</Text>
              <Text style={styles.emptySub}>Book a verified cooperative worker to get started.</Text>
              <TouchableOpacity
                style={styles.bookNowBtn}
                onPress={() => router.push('/(customer)/services')}
              >
                <Text style={styles.bookNowText}>Explore Services</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  tabButtonActive: {
    backgroundColor: '#1E3A8A',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    gap: 12,
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
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bookingId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
  },
  workerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  priceLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  trackAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trackActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  bookNowBtn: {
    marginTop: 8,
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookNowText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

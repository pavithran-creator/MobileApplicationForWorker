import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../lib/i18n';
import { ServiceItem } from '../../types';

const CATEGORIES = ['All', 'Electrical', 'Plumbing', 'Carpentry', 'Cleaning', 'Appliance', 'Painting'];

export default function ServicesScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        setServices(data);
      } else {
        // Fallback demo services matching cooperative catalog
        setServices([
          { id: '1', name: 'Ceiling Fan Installation & Repair', category: 'Electrical', base_price: 349, duration_minutes: 45, is_emergency: false },
          { id: '2', name: 'Switchboard / Fuse Box Fix', category: 'Electrical', base_price: 299, duration_minutes: 30, is_emergency: true },
          { id: '3', name: 'Water Pipe Leakage Repair', category: 'Plumbing', base_price: 399, duration_minutes: 60, is_emergency: true },
          { id: '4', name: 'Tap & Mixer Replacement', category: 'Plumbing', base_price: 249, duration_minutes: 30, is_emergency: false },
          { id: '5', name: 'Door Lock Repair / Installation', category: 'Carpentry', base_price: 399, duration_minutes: 45, is_emergency: true },
          { id: '6', name: 'Furniture Assembly & Hinge Fix', category: 'Carpentry', base_price: 499, duration_minutes: 90, is_emergency: false },
          { id: '7', name: 'Full Kitchen Deep Cleaning', category: 'Cleaning', base_price: 799, duration_minutes: 120, is_emergency: false },
          { id: '8', name: 'AC Filter & Jet Servicing', category: 'Appliance', base_price: 599, duration_minutes: 60, is_emergency: false },
          { id: '9', name: 'Refrigerator Gas Leak Check', category: 'Appliance', base_price: 499, duration_minutes: 45, is_emergency: false },
          { id: '10', name: 'Wall Waterproofing & Patch Painting', category: 'Painting', base_price: 899, duration_minutes: 150, is_emergency: false },
        ]);
      }
    } catch (err) {
      console.warn('Error fetching services, using fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'All' || service.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search verified cooperative trades..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Horizontal Filter */}
      <View style={styles.categoryScrollWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item;
            return (
              <TouchableOpacity
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Services List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.serviceCard}>
              <View style={styles.cardHeader}>
                <View style={styles.badgeCategory}>
                  <Text style={styles.badgeText}>{item.category}</Text>
                </View>
                {item.is_emergency && (
                  <View style={styles.badgeEmergency}>
                    <Ionicons name="flash" size={11} color="#DC2626" />
                    <Text style={styles.badgeEmergencyText}>SOS Priority</Text>
                  </View>
                )}
              </View>

              <Text style={styles.serviceName}>{item.name}</Text>
              {item.description ? (
                <Text style={styles.serviceDesc} numberOfLines={2}>{item.description}</Text>
              ) : null}

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color="#64748B" />
                  <Text style={styles.metaText}>~{item.duration_minutes || 45} mins</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="shield-checkmark" size={14} color="#16A34A" />
                  <Text style={[styles.metaText, { color: '#16A34A' }]}>90% Fair Wage</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.priceLabel}>Cooperative Standard</Text>
                  <Text style={styles.priceText}>₹{item.base_price}</Text>
                </View>

                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => router.push({
                    pathname: '/(customer)/book',
                    params: { serviceId: item.id, serviceName: item.name, serviceCategory: item.category, basePrice: item.base_price }
                  })}
                >
                  <Text style={styles.bookButtonText}>{t('book_service')}</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>No services found matching your criteria.</Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 48,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  categoryScrollWrapper: {
    marginBottom: 8,
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    gap: 12,
  },
  serviceCard: {
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
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgeCategory: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badgeEmergency: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  badgeEmergencyText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '700',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 10,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
    paddingTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  priceLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
  },
});

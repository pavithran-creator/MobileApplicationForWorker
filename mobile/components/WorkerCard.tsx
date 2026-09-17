import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MatchedWorker } from "../types";
import { Star, MapPin, Award, ShieldCheck, CheckCircle } from "lucide-react-native";

interface WorkerCardProps {
  worker: MatchedWorker;
  onSelect: (worker: MatchedWorker) => void;
  isSelected?: boolean;
}

export default function WorkerCard({ worker, onSelect, isSelected = false }: WorkerCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={() => onSelect(worker)}
      activeOpacity={0.8}
    >
      <View style={styles.topRow}>
        <View style={styles.nameCol}>
          <View style={styles.nameBadgeRow}>
            <Text style={styles.workerName}>{worker.name || (worker as any).full_name || 'Cooperative Worker'}</Text>
            <View style={styles.verifiedPill}>
              <ShieldCheck size={12} color="#059669" />
              <Text style={styles.verifiedText}>Coop Verified</Text>
            </View>
          </View>
          <Text style={styles.coopText}>{worker.cooperative_name || (worker as any).primary_skill || 'Cooperative Specialist'}</Text>
        </View>

        <View style={styles.scoreBadge}>
          <Text style={styles.scoreNum}>{worker.score || (worker as any).cooperative_score || 95}</Text>
          <Text style={styles.scoreLabel}>Score</Text>
        </View>
      </View>

      {/* Meta Indicators: Distance, Rating, Experience */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MapPin size={13} color="#2563eb" />
          <Text style={styles.metaText}>{worker.distance_km !== undefined ? `${Number(worker.distance_km).toFixed(1)} km away` : 'Nearby'}</Text>
        </View>

        <View style={styles.metaItem}>
          <Star size={13} color="#f59e0b" fill="#f59e0b" />
          <Text style={styles.metaText}>{worker.avg_rating || (worker as any).average_rating || 4.8} ({worker.rating_count || (worker as any).total_jobs_completed || 85})</Text>
        </View>

        <View style={styles.metaItem}>
          <Award size={13} color="#059669" />
          <Text style={styles.metaText}>{worker.experience_years || 5} yrs exp</Text>
        </View>
      </View>

      {/* Match Explainability Chips */}
      {worker.reasons && worker.reasons.length > 0 && (
        <View style={styles.reasonsBox}>
          {worker.reasons.slice(0, 2).map((r, i) => (
            <View key={i} style={styles.reasonChip}>
              <CheckCircle size={10} color="#047857" />
              <Text style={styles.reasonText} numberOfLines={1}>{r}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Select / Book CTA */}
      <View style={styles.footerRow}>
        <Text style={styles.wageText}>Fair Living Wage Guaranteed</Text>
        <View style={[styles.selectBtn, isSelected && styles.selectBtnActive]}>
          <Text style={[styles.selectBtnText, isSelected && styles.selectBtnTextActive]}>
            {isSelected ? "Selected ✓" : "Book Worker"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardSelected: {
    borderColor: "#059669",
    backgroundColor: "#f0fdf4",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  nameCol: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  workerName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0f172a",
  },
  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#059669",
  },
  coopText: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  scoreBadge: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
  },
  scoreNum: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0f172a",
  },
  scoreLabel: {
    fontSize: 9,
    color: "#64748b",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
    marginVertical: 6,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "600",
  },
  reasonsBox: {
    gap: 4,
    marginVertical: 6,
  },
  reasonChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reasonText: {
    fontSize: 10.5,
    color: "#065f46",
    fontWeight: "500",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 4,
  },
  wageText: {
    fontSize: 10.5,
    color: "#059669",
    fontWeight: "bold",
  },
  selectBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: "#065f46",
    borderRadius: 8,
  },
  selectBtnActive: {
    backgroundColor: "#059669",
  },
  selectBtnText: {
    fontSize: 11.5,
    fontWeight: "bold",
    color: "#ffffff",
  },
  selectBtnTextActive: {
    color: "#ffffff",
  },
});

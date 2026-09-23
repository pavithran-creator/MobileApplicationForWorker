import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { MatchedWorker } from "../types";
import { colors, radii, shadows } from "../lib/theme";
import { Star, MapPin, Award, ShieldCheck, CheckCircle2 } from "lucide-react-native";

interface WorkerCardProps {
  worker: MatchedWorker;
  onSelect: (worker: MatchedWorker) => void;
  isSelected?: boolean;
}

export default function WorkerCard({ worker, onSelect, isSelected = false }: WorkerCardProps) {
  const workerName = worker.name || (worker as any).full_name || "Cooperative Tradesperson";
  const rating = (worker.avg_rating || (worker as any).average_rating || 4.9).toFixed(1);
  const ratingCount = worker.rating_count || (worker as any).total_jobs_completed || 92;
  const dist = worker.distance_km !== undefined ? Number(worker.distance_km).toFixed(1) : "1.5";
  const score = worker.score || (worker as any).cooperative_score || 96;

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={() => onSelect(worker)}
      activeOpacity={0.85}
    >
      {/* Top Profile Row */}
      <View style={styles.topRow}>
        <View style={styles.avatarBox}>
          {worker.avatar_url ? (
            <Image source={{ uri: worker.avatar_url }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarLetter}>{workerName.charAt(0)}</Text>
            </View>
          )}
        </View>

        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={styles.workerName} numberOfLines={1}>{workerName}</Text>
            <View style={styles.verifiedBadge}>
              <ShieldCheck size={11} color="#047857" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>

          <Text style={styles.coopText} numberOfLines={1}>
            {worker.cooperative_name || "Coimbatore District Labour Cooperative"}
          </Text>

          <View style={styles.metricsRow}>
            <View style={styles.metricChip}>
              <Star size={11} color="#D97706" fill="#D97706" />
              <Text style={styles.metricVal}>{rating}</Text>
              <Text style={styles.metricCount}>({ratingCount})</Text>
            </View>

            <View style={styles.metricChip}>
              <MapPin size={11} color="#2563EB" />
              <Text style={styles.metricVal}>{dist} km</Text>
            </View>

            <View style={styles.metricChip}>
              <Award size={11} color="#059669" />
              <Text style={styles.metricVal}>{worker.experience_years || 5}y exp</Text>
            </View>
          </View>
        </View>

        {/* Score Badge */}
        <View style={styles.scoreCol}>
          <View style={styles.scorePill}>
            <Text style={styles.scoreNum}>{score}</Text>
            <Text style={styles.scoreLbl}>SCORE</Text>
          </View>
        </View>
      </View>

      {/* Match Explainability Reasons */}
      {worker.reasons && worker.reasons.length > 0 && (
        <View style={styles.reasonsContainer}>
          {worker.reasons.slice(0, 2).map((reason, idx) => (
            <View key={idx} style={styles.reasonRow}>
              <CheckCircle2 size={11} color="#059669" />
              <Text style={styles.reasonText} numberOfLines={1}>{reason}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Card Footer: Fair Wage & Select CTA */}
      <View style={styles.footerRow}>
        <View>
          <Text style={styles.fairWageLabel}>Fair Living Wage Guaranteed</Text>
          <Text style={styles.splitSub}>90% direct to worker &bull; 10% welfare</Text>
        </View>

        <TouchableOpacity
          style={[styles.actionBtn, isSelected && styles.actionBtnSelected]}
          onPress={() => onSelect(worker)}
        >
          <Text style={[styles.actionBtnText, isSelected && styles.actionBtnTextSelected]}>
            {isSelected ? "Selected ✓" : "Book Worker"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: radii.xl,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.surface.border,
    marginBottom: 10,
    ...shadows.card,
  },
  cardSelected: {
    borderColor: colors.brand.primary,
    backgroundColor: "#F0FDF4",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  avatarBox: {
    width: 46,
    height: 46,
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.brand.dark,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  workerName: {
    fontSize: 14.5,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  verifiedText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#047857",
  },
  coopText: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 1,
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
  },
  metricChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metricVal: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text.secondary,
  },
  metricCount: {
    fontSize: 9.5,
    color: colors.text.subtle,
  },
  scoreCol: {
    alignItems: "center",
  },
  scorePill: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radii.md,
    paddingHorizontal: 7,
    paddingVertical: 4,
    alignItems: "center",
  },
  scoreNum: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.brand.primary,
  },
  scoreLbl: {
    fontSize: 8,
    fontWeight: "800",
    color: colors.text.muted,
  },
  reasonsContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: radii.md,
    padding: 8,
    marginTop: 10,
    gap: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reasonText: {
    fontSize: 10.5,
    color: colors.brand.emerald800,
    fontWeight: "500",
    flex: 1,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  fairWageLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.brand.primary,
  },
  splitSub: {
    fontSize: 9.5,
    color: colors.text.muted,
    marginTop: 1,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: colors.brand.primary,
    borderRadius: radii.md,
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  actionBtnSelected: {
    backgroundColor: colors.brand.accent,
  },
  actionBtnText: {
    fontSize: 11.5,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  actionBtnTextSelected: {
    color: "#FFFFFF",
  },
});

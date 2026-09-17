import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Camera, RefreshCw, X, Check, Eye } from "lucide-react-native";

interface LiveCameraCaptureProps {
  onPhotoCaptured: (base64Photo: string) => void;
  photoUri?: string | null;
  onClearPhoto?: () => void;
  onCancel?: () => void;
}

export default function LiveCameraCapture({
  onPhotoCaptured,
  photoUri,
  onClearPhoto,
  onCancel,
}: LiveCameraCaptureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  const handleOpenLiveCamera = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert(
          "Camera Permission Required",
          "Live camera access is strictly required to verify physical repair issues. Pre-taken gallery photos are prohibited."
        );
        return;
      }
    }
    setIsOpen(true);
  };

  const handleTakeSnapshot = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });

        if (photo?.base64) {
          const formatted = `data:image/jpeg;base64,${photo.base64}`;
          onPhotoCaptured(formatted);
          setIsOpen(false);
        }
      } catch (err: any) {
        Alert.alert("Snapshot Error", err.message || "Failed to capture live frame.");
      }
    }
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Camera size={16} color="#065f46" />
          <Text style={styles.cardTitle}>Live Camera Verification</Text>
        </View>
        <Text style={styles.verifiedBadge}>Strictly Live Only</Text>
      </View>

      <Text style={styles.cardSub}>
        Frame the damaged item (burst pipe, sparking wire). Pre-taken gallery photos are disabled to prevent false claims.
      </Text>

      {/* Captured State */}
      {photoUri ? (
        <View style={styles.previewBox}>
          <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="cover" />
          <View style={styles.verifiedStamp}>
            <Check size={12} color="#ffffff" />
            <Text style={styles.verifiedStampText}>Live Verified Snapshot</Text>
          </View>
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.retakeBtn} onPress={handleOpenLiveCamera} activeOpacity={0.7}>
              <RefreshCw size={13} color="#065f46" />
              <Text style={styles.retakeText}>Retake Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.removeBtn} onPress={onClearPhoto} activeOpacity={0.7}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Standby State */
        <TouchableOpacity style={styles.openCameraBtn} onPress={handleOpenLiveCamera} activeOpacity={0.8}>
          <Camera size={20} color="#047857" />
          <Text style={styles.openCameraText}>Switch On Live Camera</Text>
        </TouchableOpacity>
      )}

      {/* Fullscreen Live Camera Viewfinder Modal */}
      <Modal visible={isOpen} animationType="slide" transparent={false}>
        <View style={styles.cameraScreen}>
          <CameraView style={styles.cameraView} facing={facing} ref={cameraRef}>
            {/* Viewfinder Target Guidelines */}
            <View style={styles.overlayCenter}>
              <View style={styles.reticleBox}>
                <Text style={styles.reticleText}>Frame the damaged item</Text>
              </View>
            </View>

            {/* Live Indicator */}
            <View style={styles.liveTag}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE FEED ONLY</Text>
            </View>

            {/* Top Close Button */}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsOpen(false)}>
              <X size={20} color="#ffffff" />
            </TouchableOpacity>

            {/* Bottom Shutter Controls */}
            <View style={styles.shutterBar}>
              <TouchableOpacity style={styles.flipBtn} onPress={toggleFacing}>
                <RefreshCw size={18} color="#ffffff" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.shutterBtn} onPress={handleTakeSnapshot} activeOpacity={0.8}>
                <View style={styles.shutterInner} />
              </TouchableOpacity>

              <View style={{ width: 44 }} />
            </View>
          </CameraView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0f172a",
  },
  verifiedBadge: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#065f46",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardSub: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 10,
    lineHeight: 16,
  },
  openCameraBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#f0fdf4",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#10b981",
    borderRadius: 12,
    paddingVertical: 14,
  },
  openCameraText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#065f46",
  },
  previewBox: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#0f172a",
  },
  previewImage: {
    width: "100%",
    height: 140,
  },
  verifiedStamp: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(5, 150, 105, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedStampText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#ffffff",
  },
  previewActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    padding: 8,
  },
  retakeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
  },
  retakeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#065f46",
  },
  removeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  removeText: {
    fontSize: 12,
    color: "#dc2626",
    fontWeight: "600",
  },
  cameraScreen: {
    flex: 1,
    backgroundColor: "#000000",
  },
  cameraView: {
    flex: 1,
    justifyContent: "space-between",
  },
  overlayCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  reticleBox: {
    width: "80%",
    height: 220,
    borderWidth: 2,
    borderColor: "#fbbf24",
    borderStyle: "dashed",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 10,
  },
  reticleText: {
    fontSize: 11,
    color: "#fbbf24",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: "600",
  },
  liveTag: {
    position: "absolute",
    top: 50,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(220, 38, 38, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ffffff",
  },
  liveText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#ffffff",
  },
  closeBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 30,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  flipBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#fbbf24",
  },
  shutterInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#065f46",
  },
});

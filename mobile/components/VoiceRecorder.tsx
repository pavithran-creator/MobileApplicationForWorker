import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Audio } from "expo-av";
import { Mic, Square } from "lucide-react-native";

interface VoiceRecorderProps {
  onTranscriptRecorded?: (text: string) => void;
  onRecordingComplete?: (uri: string, duration: number) => void;
  isRecording?: boolean;
  setIsRecording?: (recording: boolean) => void;
}

export default function VoiceRecorder({
  onTranscriptRecorded,
  onRecordingComplete,
  isRecording: externalIsRecording,
  setIsRecording: externalSetIsRecording,
}: VoiceRecorderProps) {
  const [internalIsRecording, setInternalIsRecording] = useState(false);
  const isRecording = externalIsRecording !== undefined ? externalIsRecording : internalIsRecording;
  const setIsRecording = externalSetIsRecording || setInternalIsRecording;

  const [seconds, setSeconds] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<any>(null);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Required", "Microphone access is needed for voice problem description.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
      setSeconds(0);

      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      Alert.alert("Recording Error", err.message || "Unable to start voice recording.");
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      setIsRecording(false);

      if (uri && onRecordingComplete) {
        onRecordingComplete(uri, seconds);
      }

      const sampleTranscripts = [
        "Need electrician tomorrow at 6 PM near Gandhipuram, switchboard sparking",
        "Bathroom tap leaking water heavily, need plumber today 2 PM",
        "Kitchen drainage clogged, urgent plumbing needed in RS Puram",
      ];
      const simulatedText = sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
      if (onTranscriptRecorded) {
        onTranscriptRecorded(simulatedText);
      }
    } catch (err: any) {
      console.warn("Stop recording notice:", err);
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.micBtn, isRecording && styles.micBtnActive]}
        onPress={toggleRecording}
        activeOpacity={0.8}
      >
        {isRecording ? (
          <View style={styles.activeInner}>
            <Square size={16} color="#ffffff" />
            <Text style={styles.timerText}>{seconds}s</Text>
          </View>
        ) : (
          <Mic size={20} color="#065f46" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  micBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ecfdf5",
    borderWidth: 1.5,
    borderColor: "#a7f3d0",
    alignItems: "center",
    justifyContent: "center",
  },
  micBtnActive: {
    backgroundColor: "#dc2626",
    borderColor: "#b91c1c",
  },
  activeInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  timerText: {
    fontSize: 9,
    color: "#ffffff",
    fontWeight: "bold",
    marginTop: 2,
  },
});

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLang } from "../lib/i18n";

export interface ParsedAIResult {
  service_id?: number;
  service_name?: string;
  location?: string;
  date?: string;
  time?: string;
  explain?: string;
  confidence?: number;
  image_verified?: boolean;
  live_image?: string | null;
  problem_summary?: string;
}

interface LiveMultimodalAssistantProps {
  onParsed: (result: ParsedAIResult) => void;
  onError?: (msg: string) => void;
  isLoading?: boolean;
}

export default function LiveMultimodalAssistant({
  onParsed,
  onError,
  isLoading = false,
}: LiveMultimodalAssistantProps) {
  const { t, lang } = useLang();

  // --- Camera State (Default: OFF. User must explicitly switch it on) ---
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [liveImage, setLiveImage] = useState<string | null>(null);
  const [liveImageTimestamp, setLiveImageTimestamp] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- Text & Voice State ---
  const [textQuery, setTextQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voiceLang, setVoiceLang] = useState<string>(() => {
    if (lang === "ta") return "ta-IN";
    if (lang === "hi") return "hi-IN";
    return "en-IN";
  });

  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const [audioVolume, setAudioVolume] = useState(0);
  const animationFrameRef = useRef<number | null>(null);

  // --- AI Parsing State ---
  const [parsing, setParsing] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  // Sync speech recognition language with current app locale
  useEffect(() => {
    if (lang === "ta") setVoiceLang("ta-IN");
    else if (lang === "hi") setVoiceLang("hi-IN");
    else setVoiceLang("en-IN");
  }, [lang]);

  // Clean up media streams on unmount
  useEffect(() => {
    return () => {
      turnOffCamera();
      stopVoice();
    };
  }, []);

  // --- Camera Operations (Strictly Live Stream - No Gallery Upload) ---
  const turnOnCamera = async (overrideFacing?: "environment" | "user") => {
    setCameraError(null);
    turnOffCamera();

    const targetMode = overrideFacing || facingMode;

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("Live camera stream is not supported in this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: targetMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setCameraStream(stream);
      setIsCameraActive(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((err) => console.warn("Video play notice:", err));
        }
      }, 100);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        err.name === "NotAllowedError"
          ? "Camera permission denied. Please enable camera access in your browser."
          : "Unable to activate live camera: " + (err.message || "Camera not ready.")
      );
      setIsCameraActive(false);
    }
  };

  const turnOffCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const switchFacingMode = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    turnOnCamera(nextMode);
  };

  const captureLiveSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw frame from live video
    ctx.drawImage(video, 0, 0, width, height);

    // Apply Live Verification Watermark
    const now = new Date();
    const timestampStr = now.toLocaleDateString() + " " + now.toLocaleTimeString();

    ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
    ctx.fillRect(0, height - 44, width, 44);

    ctx.fillStyle = "#10B981";
    ctx.beginPath();
    ctx.arc(22, height - 22, 6, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = "#F8FAFC";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(`● LIVE VERIFIED CAPTURE • ${timestampStr} • COOPERATIVE ON-DEMAND`, 38, height - 17);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
    setLiveImage(dataUrl);
    setLiveImageTimestamp(timestampStr);

    turnOffCamera();
  };

  const removeLiveImage = () => {
    setLiveImage(null);
    setLiveImageTimestamp(null);
  };

  // --- Voice Mic ('m') to Text using Speech-to-Text AI ---
  const toggleVoice = () => {
    if (isRecording) {
      stopVoice();
    } else {
      startVoice();
    }
  };

  const startVoice = async () => {
    setAiExplanation(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onError?.("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    try {
      // Audio level analyser for waveform feedback
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = audioStream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(audioStream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        setAudioVolume(Math.min(100, Math.round((avg / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      // Start native speech-to-text recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = voiceLang;

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + " ";
        }
        setTextQuery(transcript.trim());
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition notice:", event.error);
        if (event.error === "not-allowed") {
          onError?.("Microphone permission denied. Please allow microphone access to speak.");
          stopVoice();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();

      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      onError?.("Microphone permission required: " + (err.message || "Microphone inaccessible"));
      stopVoice();
    }
  };

  const stopVoice = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }
      recognitionRef.current = null;
    }

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    setIsRecording(false);
    setAudioVolume(0);
  };

  // --- Parse with AI (Image, Voice/Text, or Both) ---
  const handleParse = async () => {
    const hasText = !!textQuery.trim();
    const hasImage = !!liveImage;

    if (!hasText && !hasImage) {
      onError?.("Please record your voice with the mic (m), type the issue, or switch on the camera to capture a photo.");
      return;
    }

    setParsing(true);
    setAiExplanation(null);

    try {
      const res = await fetch("/api/ai/parse-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textQuery.trim() || undefined,
          image: liveImage || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to analyze request with AI");
      }

      setAiExplanation(data.explain || t("book.ai_extracted", "AI Extracted parameters successfully"));

      onParsed({
        ...data,
        live_image: liveImage,
        problem_summary: data.problem_summary || textQuery.trim() || "Live photo verified assessment",
      });
    } catch (err: any) {
      onError?.("AI Assistant Error: " + (err.message || "Failed to parse problem"));
    } finally {
      setParsing(false);
    }
  };

  const hasAnyInput = !!textQuery.trim() || !!liveImage;

  return (
    <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-emerald-800/60 transition-all">
      {/* Hidden canvas for live frame snapshot */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
          </span>
          <h2 className="text-base sm:text-lg font-bold text-emerald-100 tracking-tight">
            {t("book.ai_title", "Natural Language AI Assistant")}
          </h2>
        </div>

        {/* Status badges & Language */}
        <div className="flex items-center gap-2">
          {/* Language selector */}
          <select
            value={voiceLang}
            onChange={(e) => setVoiceLang(e.target.value)}
            disabled={isRecording}
            className="bg-emerald-900/80 border border-emerald-700/80 text-emerald-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
            title="Voice Recognition Language"
          >
            <option value="en-IN">EN (English)</option>
            <option value="ta-IN">தமிழ் (Tamil)</option>
            <option value="hi-IN">हिंदी (Hindi)</option>
          </select>

          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-800/80 text-emerald-200 border border-emerald-700/50">
            AI Multimodal
          </span>
        </div>
      </div>

      {/* Camera Error Message if any */}
      {cameraError && (
        <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500/60 text-xs text-red-200 flex items-center justify-between gap-2">
          <span>&#9888; {cameraError}</span>
          <button
            onClick={() => setCameraError(null)}
            className="text-red-300 hover:text-white font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP SECTION: [ cam ] - Rounded Screen Matching User's Diagram             */}
      {/* NOT activated from start - user switches it on if needed                   */}
      {/* ========================================================================= */}
      <div className="mb-4">
        <div className="w-full h-56 sm:h-72 rounded-3xl border-2 border-slate-700/80 bg-slate-950/90 relative overflow-hidden flex flex-col items-center justify-center shadow-inner group">
          {/* STATE 1: Live Video Feed (When Switched On) */}
          {isCameraActive ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Target Guidelines */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
                <div className="w-4/5 h-4/5 border-2 border-dashed border-amber-400/60 rounded-2xl flex flex-col justify-between p-3">
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-t-2 border-l-2 border-amber-400"></div>
                    <div className="w-4 h-4 border-t-2 border-r-2 border-amber-400"></div>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-300 bg-black/60 px-3 py-0.5 rounded-full self-center backdrop-blur-sm">
                    Frame the issue (leak, wiring, damage)
                  </span>
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-b-2 border-l-2 border-amber-400"></div>
                    <div className="w-4 h-4 border-b-2 border-r-2 border-amber-400"></div>
                  </div>
                </div>
              </div>

              {/* Live Badge */}
              <div className="absolute top-3 left-3 bg-red-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                LIVE STREAM
              </div>

              {/* Controls bar inside video */}
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2 p-2 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10">
                <button
                  type="button"
                  onClick={switchFacingMode}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Flip</span>
                </button>

                {/* Shutter Button */}
                <button
                  type="button"
                  onClick={captureLiveSnapshot}
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                >
                  <div className="w-3 h-3 rounded-full bg-slate-950"></div>
                  <span>Take Live Photo</span>
                </button>

                <button
                  type="button"
                  onClick={turnOffCamera}
                  className="px-3 py-1.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-medium transition-colors"
                >
                  Switch Off
                </button>
              </div>
            </div>
          ) : liveImage ? (
            /* STATE 2: Captured Photo Display */
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={liveImage}
                alt="Captured live issue"
                className="w-full h-full object-cover"
              />

              <div className="absolute top-3 left-3 bg-emerald-600/90 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1.5 shadow-md">
                <span>&#10003;</span>
                <span>Live Verified Photo Attached</span>
              </div>

              <div className="absolute bottom-3 right-3 text-[10px] text-emerald-200 bg-black/80 px-2.5 py-1 rounded-lg border border-emerald-500/40">
                {liveImageTimestamp}
              </div>

              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => turnOnCamera()}
                  className="px-3 py-1.5 rounded-xl bg-emerald-800/90 hover:bg-emerald-700 text-white text-xs font-semibold backdrop-blur-md shadow-md transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retake Photo
                </button>
                <button
                  type="button"
                  onClick={removeLiveImage}
                  className="px-3 py-1.5 rounded-xl bg-red-900/80 hover:bg-red-800 text-red-100 text-xs font-semibold backdrop-blur-md transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            /* STATE 3: Camera Off (Default Standby matching sketch 'cam') */
            <div className="text-center p-6 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center mb-3 text-emerald-400 group-hover:text-amber-400 group-hover:border-amber-400/60 transition-all">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>

              <div className="text-sm font-bold text-slate-200 tracking-wider uppercase mb-1">
                cam (Camera Off)
              </div>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                Camera is off by default. Switch on live camera if you want to attach a photo of the damaged item.
              </p>

              {/* Explicit Switch On Button */}
              <button
                type="button"
                onClick={() => turnOnCamera()}
                className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 border border-emerald-600 shadow-md transition-all group-hover:bg-amber-400 group-hover:text-slate-950 group-hover:border-amber-400"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Switch On Camera</span>
              </button>

              <div className="text-[10px] text-emerald-400/60 mt-2.5">
                🔒 Live camera only • Pre-taken gallery uploads prohibited
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM SECTION: [ text ] [ (m) ] [ Parse with AI ]                        */}
      {/* Matching User's Diagram: unified input bar with text and 'm' (mic) button  */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border-2 border-slate-700/80 bg-slate-950/80 p-2 sm:p-2.5 shadow-lg flex flex-col sm:flex-row items-center gap-2.5">
        {/* [ text ] Input Area */}
        <div className="relative flex-1 w-full flex items-center">
          <input
            type="text"
            value={textQuery}
            onChange={(e) => setTextQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleParse()}
            placeholder={
              isRecording
                ? "Listening... Speak your problem now (e.g. Need plumber tomorrow at 10 AM in Gandhipuram)"
                : "Type your problem or click the mic to speak (voice to text)..."
            }
            className={`w-full px-4 py-3 rounded-xl bg-emerald-950/50 border text-sm text-white placeholder-emerald-400/50 focus:outline-none transition-all ${
              isRecording
                ? "border-amber-400 ring-2 ring-amber-400/30 text-amber-200"
                : "border-emerald-800/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            }`}
          />

          {/* If text is present, clear button */}
          {textQuery && !isRecording && (
            <button
              type="button"
              onClick={() => setTextQuery("")}
              className="absolute right-3 text-slate-400 hover:text-white text-sm"
              title="Clear text"
            >
              &times;
            </button>
          )}
        </div>

        {/* Action Buttons: [ Circular mic button ] and [ Parse with AI button ] */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Circular Mic Button (voice to text using AI) */}
          <button
            type="button"
            onClick={toggleVoice}
            title={isRecording ? "Stop recording" : "Click mic to speak (Voice to Text)"}
            className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all transform active:scale-95 shadow-md flex-shrink-0 ${
              isRecording
                ? "bg-red-600 text-white animate-pulse ring-4 ring-red-500/40"
                : "bg-emerald-800 hover:bg-amber-400 text-emerald-100 hover:text-slate-950 border-2 border-emerald-600 hover:border-amber-300"
            }`}
          >
            {isRecording ? (
              /* Stop Recording Square with audio volume ripple */
              <div className="flex flex-col items-center justify-center">
                <span className="w-3.5 h-3.5 bg-white rounded-sm"></span>
                <span className="text-[8px] font-mono leading-none mt-1">
                  {recordingSeconds}s
                </span>
              </div>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>

          {/* AI Parse Action Button */}
          <button
            type="button"
            onClick={handleParse}
            disabled={parsing || isLoading || !hasAnyInput}
            className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shadow-md flex items-center justify-center gap-1.5 transform active:scale-95 flex-1 sm:flex-initial"
          >
            {parsing ? (
              <>
                <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>Parse with AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mic Audio Waveform & Status Indicator while recording */}
      {isRecording && (
        <div className="mt-3 p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-xs font-semibold text-red-200">
              Mic Active • Transcribing voice to text with AI in {voiceLang === "ta-IN" ? "தமிழ்" : voiceLang === "hi-IN" ? "हिंदी" : "English"}...
            </span>
          </div>

          {/* Dynamic Audio Bars */}
          <div className="h-4 flex items-center gap-1">
            {[10, 22, 35, 18, 40, 24, 32, 14, 45, 20].map((h, i) => {
              const dyn = Math.max(4, Math.min(18, (h * (audioVolume + 15)) / 60));
              return (
                <div
                  key={i}
                  className="w-1 bg-amber-400 rounded-full transition-all duration-75"
                  style={{ height: `${dyn}px` }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* AI Extraction Explanation Banner */}
      {aiExplanation && (
        <div className="mt-3.5 p-3 rounded-xl bg-emerald-800/80 border border-emerald-600/60 text-xs text-amber-200 flex items-start gap-2.5 animate-in fade-in duration-200">
          <span className="text-base leading-none text-emerald-300">&#10003;</span>
          <div className="flex-1">
            <span className="font-semibold text-emerald-100">AI Assessment: </span>
            <span>{aiExplanation}</span>
          </div>
        </div>
      )}
    </div>
  );
}

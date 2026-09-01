import { useState, useEffect, useRef, useCallback } from "react";
import { triggerHapticVibration } from "../utils/haptics";

// Type declarations for Web Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface UseDictationOptions {
  onTranscriptChange?: (text: string, isFinal: boolean) => void;
  onAutoSubmit?: (finalText: string) => void;
  continuous?: boolean;
}

export function useDictation(options: UseDictationOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [micVolume, setMicVolume] = useState(0);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Check SpeechRecognition support on mount
  useEffect(() => {
    const SpeechRecognitionClass =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognitionClass) {
      setIsSupported(false);
    }
  }, []);

  // Clean up audio streams and animation frames
  const cleanupAudio = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setMicVolume(0);
  }, []);

  // Start Web Audio API for volume metering visualization
  const startAudioVisualizer = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (e) {
      // User may have blocked mic or browser doesn't support getUserMedia
    }
  }, []);

  const stopListening = useCallback(() => {
    triggerHapticVibration("light");
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    cleanupAudio();
    setIsListening(false);
  }, [cleanupAudio]);

  const startListening = useCallback(() => {
    setError(null);
    setTranscript("");
    setInterimTranscript("");
    triggerHapticVibration("medium");

    const SpeechRecognitionClass =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      setError("Web Speech API not supported in this browser. Please type manually.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = options.continuous ?? true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        startAudioVisualizer();
      };

      recognition.onresult = (event: any) => {
        let currentInterim = "";
        let finalOutput = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalOutput += item[0].transcript;
          } else {
            currentInterim += item[0].transcript;
          }
        }

        if (finalOutput) {
          const cleanedFinal = finalOutput.trim();
          setTranscript((prev) => {
            const newTotal = prev ? `${prev} ${cleanedFinal}` : cleanedFinal;
            if (options.onTranscriptChange) {
              options.onTranscriptChange(newTotal, true);
            }
            return newTotal;
          });
          setInterimTranscript("");
        } else if (currentInterim) {
          setInterimTranscript(currentInterim);
          if (options.onTranscriptChange) {
            options.onTranscriptChange(currentInterim, false);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "no-speech") {
          setError("No speech detected. Please speak clearly into the microphone.");
        } else if (event.error === "not-allowed" || event.error === "permission-denied") {
          setError("Microphone permission denied. Please allow mic access in browser settings.");
        } else if (event.error === "network") {
          setError("Network connection issue for speech recognition.");
        } else {
          setError(`Dictation error: ${event.error}`);
        }
        stopListening();
      };

      recognition.onend = () => {
        setIsListening(false);
        cleanupAudio();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error("Failed to start speech recognition:", err);
      setError("Unable to access microphone or start voice recognition.");
      setIsListening(false);
      cleanupAudio();
    }
  }, [options, startAudioVisualizer, stopListening, cleanupAudio]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      cleanupAudio();
    };
  }, [cleanupAudio]);

  return {
    isListening,
    transcript,
    interimTranscript,
    micVolume,
    error,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    setTranscript
  };
}

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle } from "lucide-react"; 
import axios from "axios";
import Modal from "@/components/ui/modal";
import Spinner from "@/components/ui/spinner";
import WaveformRecordingModal from "./WaveformRecordingModal";

interface SpeechToTextProps {
  onTranscribe: (text: string) => void;
}

const SpeechToText: React.FC<SpeechToTextProps> = ({ onTranscribe }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const transcribeAudio = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("model", "whisper-1");
    formData.append("language", "en");
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/audio/transcriptions",
        formData,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.text;
    } catch (error) {
      console.error("Error transcribing audio:", error);
      throw error;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const audioFile = new File([audioBlob], "audio.wav", { type: "audio/wav" });

        setIsProcessing(true);
        const transcribedText = await transcribeAudio(audioFile);
        onTranscribe(transcribedText);
        setIsProcessing(false);
        setIsListening(false);
        setShowModal(false);
        clearInterval(timerRef.current!);
        setTimeElapsed(0);
      };

      mediaRecorder.start();
      setIsListening(true);
      setShowModal(true);
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const toggleListening = () => {
    if (!isListening) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  // Format time in mm:ss format
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <>
      {/* Modal for recording waveform */}
      {showModal && (
        <WaveformRecordingModal
          duration={timeElapsed}
          audioStream={streamRef.current} // Pass the audio stream
          onStop={stopRecording}
        />
      )}

      <button
        type="button"
        onClick={toggleListening}
      >
        {isListening ? (
          <StopCircle className="h-4 w-4 text-red-500" />
        ) : (
          <Mic className="h-6 w-6 text-[#2F76FF]" />
        )}
      </button>
    </>
  );
};

export default SpeechToText;

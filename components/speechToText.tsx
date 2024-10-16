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



export default SpeechToText;

import React, { useEffect, useRef, useState } from 'react'

interface Window {
  webkitAudioContext: typeof AudioContext;
}

interface RecordingModalProps {
  duration: number
  audioStream: MediaStream | null
  onStop: () => void
}

export default function WaveformRecordingModal({ duration, audioStream, onStop }: RecordingModalProps) {
  const [waveform, setWaveform] = useState<number[]>(Array(20).fill(10));
  const animationFrameRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!audioStream) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const source = audioContext.createMediaStreamSource(audioStream);
    source.connect(analyser);

    analyserRef.current = analyser;
    dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

    const updateWaveform = () => {
      if (!analyserRef.current || !dataArrayRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#2F76FF';

      const barWidth = canvas.width / 20;
      const barGap = 2;

      for (let i = 0; i < 20; i++) {
        const value = dataArrayRef.current[i * 2];
        const barHeight = (value / 255) * canvas.height;
        ctx.fillRect(i * (barWidth + barGap), canvas.height - barHeight, barWidth, barHeight);
      }

      animationFrameRef.current = requestAnimationFrame(updateWaveform);
    };

    updateWaveform();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      audioContext.close();
    };
  }, [audioStream]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-80 h-48 bg-gradient-to-br from-[#000362] to-[#07323F] rounded-lg flex flex-col items-center justify-center shadow-lg p-4">
        <canvas ref={canvasRef} width={200} height={64} className="mb-4" />
        <div className="text-white text-2xl font-bold mb-2">{formatDuration(duration)}</div>
        <button
          onClick={onStop}
          className="bg-[#435B8C] hover:bg-[#5676B5] text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Stop
        </button>
      </div>
    </div>
  );
}

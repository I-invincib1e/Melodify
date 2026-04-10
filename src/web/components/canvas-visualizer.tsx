import { useEffect, useRef } from "react";
import { usePlayerStore } from "@/lib/store";

// We keep audio stuff outside the component so it persists across renders without reconnecting
let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let source: MediaElementAudioSourceNode | null = null;

export default function CanvasVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { audioRef, isPlaying } = usePlayerStore();
  const requestRef = useRef<number>();

  useEffect(() => {
    if (!audioRef || !canvasRef.current) return;
    
    // Initialize Web Audio API once
    if (!audioCtx) {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioCtx = new AudioContext();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source = audioCtx.createMediaElementSource(audioRef);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
      } catch (e) {
        console.warn("AudioContext already created or error:", e);
      }
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx || !analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      requestRef.current = requestAnimationFrame(draw);
      
      // Responsive canvas
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const width = canvas.width;
      const height = canvas.height;

      analyser!.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, width, height);
      
      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
        const normalized = barHeight / 255;
        const actualHeight = normalized * height * 0.8; 
        
        const dColor = usePlayerStore.getState().dominantColor;
        const r = dColor ? dColor.r : 140;
        const g = dColor ? dColor.g : 225;
        const b = dColor ? dColor.b : 255;
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${normalized + 0.2})`; 
        ctx.shadowBlur = 15 * normalized;
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
        
        ctx.fillRect(x, height - actualHeight, barWidth, actualHeight);
        x += barWidth + 2;
      }
    };

    if (isPlaying) {
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      draw();
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      // Let it draw one idle frame
      setTimeout(() => draw(), 50);
      setTimeout(() => { if (requestRef.current) cancelAnimationFrame(requestRef.current) }, 100);
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [audioRef, isPlaying]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30 pointer-events-none mix-blend-screen" />;
}

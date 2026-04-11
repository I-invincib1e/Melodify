import { useEffect, useRef } from "react";
import { usePlayerStore, useUIStore } from "@/lib/store";
import { Engine } from "@/lib/audioEngine";

export default function CanvasVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isPlaying, dominantColor } = usePlayerStore();
  const { isFullScreenPlayer } = useUIStore();
  const requestRef = useRef<number>();

  useEffect(() => {
    if (!Engine.ctx || !Engine.analyser) {
        console.warn("Audio Engine not initialized globally yet.");
        return;
    }
    const analyser = Engine.analyser;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      requestRef.current = requestAnimationFrame(draw);
      
      // Responsive canvas
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const width = canvas.width;
      const height = canvas.height;

      analyser.getByteFrequencyData(dataArray);

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

    if (isPlaying && isFullScreenPlayer) {
      if (Engine.ctx && Engine.ctx.state === 'suspended') Engine.resume();
      draw();
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      // Let it draw one idle frame to settle
      setTimeout(() => draw(), 50);
      setTimeout(() => { if (requestRef.current) cancelAnimationFrame(requestRef.current) }, 100);
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, dominantColor, isFullScreenPlayer]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30 pointer-events-none mix-blend-screen" />;
}

import { useState, useEffect } from "react";
import { SlidersHorizontal, RefreshCcw } from "lucide-react";
import { Engine } from "@/lib/audioEngine";

const EQ_PRESETS: Record<string, number[]> = {
  "Flat": [0, 0, 0, 0, 0],
  "Bass Boost": [12, 8, 0, -2, -4],
  "Acoustic": [2, 1, 4, 3, 2],
  "Electronic": [8, 5, -2, 4, 6],
  "Pop": [-2, 2, 5, 4, 1],
  "Vocal Boost": [-4, -2, 6, 8, 4]
};

export default function GlobalEqualizer() {
  // Initialize from actual engine state across module re-renders
  const [gains, setGains] = useState([0, 0, 0, 0, 0]);
  const [activePreset, setActivePreset] = useState<string>("Custom");

  useEffect(() => {
    if (Engine.filters.length === 5) {
      setGains(Engine.filters.map(f => f.gain.value));
    }
  }, []);

  const handleGainChange = (index: number, val: number) => {
    const newGains = [...gains];
    newGains[index] = val;
    setGains(newGains);
    setActivePreset("Custom");
    Engine.setFilterGain(index, val);
  };

  const applyPreset = (presetName: string) => {
    const pGains = EQ_PRESETS[presetName];
    if (!pGains) return;
    setGains(pGains);
    setActivePreset(presetName);
    pGains.forEach((val, i) => Engine.setFilterGain(i, val));
  };

  const labels = ["60", "230", "910", "3.6k", "14k"];
  const names = ["Sub", "Bass", "Mid", "High", "Air"];

  return (
    <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <SlidersHorizontal size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-white">Audio Equalizer</h2>
          </div>
          <p className="text-xs text-[#a7a7a7] uppercase tracking-wider">Master 5-Band Tuning</p>
        </div>
        
        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {Object.keys(EQ_PRESETS).map(preset => (
            <button
              key={preset}
              onClick={() => applyPreset(preset)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                activePreset === preset || (activePreset === "Custom" && preset === "Custom")
                  ? "bg-primary text-black border-primary shadow-[0_0_10px_rgba(140,225,255,0.3)]"
                  : "bg-white/[0.05] text-[#a7a7a7] border-white/[0.1] hover:text-white hover:border-white/[0.2]"
              }`}
            >
              {preset}
            </button>
          ))}
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${activePreset === "Custom" ? "bg-white/10 text-white border-white/20" : "bg-transparent text-[#555] border-transparent"}`}>
            Custom
          </div>
        </div>
      </div>

      {/* Sliders Container */}
      <div className="flex justify-between md:justify-around h-48 px-2 md:px-8 mt-4">
        {gains.map((gain, i) => (
          <div key={i} className="flex flex-col items-center justify-between h-full">
            <span className={`text-xs font-bold ${gain > 0 ? "text-primary" : gain < 0 ? "text-amber-400" : "text-[#555]"}`}>
              {gain > 0 ? "+" : ""}{gain}
            </span>
            
            <div className="relative flex-1 w-8 my-3 group">
              {/* Slider Input */}
              <input 
                type="range"
                min="-15"
                max="15"
                step="1"
                value={gain}
                onChange={(e) => handleGainChange(i, parseInt(e.target.value))}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-[#111] [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-transform origin-center -rotate-90 z-10"
              />
              
              {/* Vertical Fill Track via CSS trick mapping gain to height */}
              <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-2 bg-black/40 rounded-full overflow-hidden pointer-events-none border border-white/5">
                 <div 
                   className="absolute bottom-1/2 w-full transition-all duration-300"
                   style={{
                     height: `${Math.max(0, gain) * 3.33}%`,
                     backgroundColor: 'var(--primary)',
                     boxShadow: '0 0 10px var(--primary)'
                   }}
                 />
                 <div 
                   className="absolute top-1/2 w-full transition-all duration-300"
                   style={{
                     height: `${Math.max(0, -gain) * 3.33}%`,
                     backgroundColor: '#fbbf24'
                   }}
                 />
              </div>

              {/* Zero line marker */}
              <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/20 pointer-events-none drop-shadow-md z-0" />
            </div>

            <div className="text-center mt-2">
              <p className="text-[13px] font-bold text-white">{names[i]}</p>
              <p className="text-[10px] text-[#727272] tracking-widest">{labels[i]}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

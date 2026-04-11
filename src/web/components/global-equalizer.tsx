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
    <div className="neuglass rounded-3xl p-6 sm:p-8 w-full transition-all duration-300">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-10 gap-6">
        <div className="shrink-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[#1db954]/10 flex items-center justify-center">
              <SlidersHorizontal size={20} className="text-[#1db954]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Audio Engine</h2>
              <p className="text-[10px] text-[#555] font-bold uppercase tracking-[0.2em]">Master 5-Band Tuning</p>
            </div>
          </div>
        </div>
        
        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {Object.keys(EQ_PRESETS).map(preset => (
            <button
              key={preset}
              onClick={() => applyPreset(preset)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                activePreset === preset
                  ? "bg-[#1db954] text-black border-[#1db954] shadow-[0_0_15px_rgba(29,185,84,0.4)]"
                  : "bg-white/[0.03] text-[#a7a7a7] border-white/[0.05] hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              {preset}
            </button>
          ))}
          {activePreset === "Custom" && (
            <div className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1db954]/10 text-[#1db954] border border-[#1db954]/20 animate-pulse">
              Custom Tuning
            </div>
          )}
        </div>
      </div>

      {/* Sliders Container */}
      <div className="flex justify-between md:justify-around h-56 px-2 md:px-4">
        {gains.map((gain, i) => (
          <div key={i} className="flex flex-col items-center justify-between h-full group/fader">
            <div className={`text-[13px] font-black tabular-nums transition-colors ${gain > 0 ? "text-[#1db954]" : gain < 0 ? "text-white/40" : "text-[#333]"}`}>
              {gain > 0 ? "+" : ""}{gain}
            </div>
            
            <div className="relative flex-1 w-10 my-4 flex items-center justify-center">
              {/* Vertical fill background track */}
              <div className="absolute inset-y-0 w-2.5 bg-black/40 rounded-full border border-white/[0.05] overflow-hidden">
                 {/* Up fill */}
                 <div 
                   className="absolute bottom-1/2 w-full transition-all duration-300 rounded-t-sm"
                   style={{
                     height: `${Math.max(0, gain) * 3.33}%`,
                     backgroundColor: '#1db954',
                     boxShadow: '0 0 15px rgba(29,185,84,0.6)'
                   }}
                 />
                 {/* Down fill */}
                 <div 
                   className="absolute top-1/2 w-full transition-all duration-300 rounded-b-sm"
                   style={{
                     height: `${Math.max(0, -gain) * 3.33}%`,
                     backgroundColor: 'rgba(255,255,255,0.1)'
                   }}
                 />
              </div>

              {/* Slider Input (Invisible overlay for interaction) */}
              <input 
                type="range"
                min="-15"
                max="15"
                step="1"
                value={gain}
                onChange={(e) => handleGainChange(i, parseInt(e.target.value))}
                className="absolute w-40 h-10 opacity-0 cursor-ns-resize transition-all -rotate-90 z-20"
              />
              
              {/* Visual Knob */}
              <div 
                className="absolute w-5 h-5 bg-white rounded-md shadow-xl border-2 border-black z-10 transition-all duration-75 pointer-events-none group-hover/fader:scale-110"
                style={{ bottom: `calc(${((gain + 15) / 30) * 100}% - 10px)` }}
              />

              {/* Zero line marker */}
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/10 pointer-events-none z-0" />
            </div>

            <div className="text-center mt-3">
              <p className="text-[14px] font-black text-white group-hover/fader:text-[#1db954] transition-colors">{names[i]}</p>
              <p className="text-[9px] text-[#555] font-bold uppercase tracking-widest">{labels[i]}Hz</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

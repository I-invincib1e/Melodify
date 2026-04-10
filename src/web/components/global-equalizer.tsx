import { useState, useRef, useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Engine } from "@/lib/audioEngine";

export default function GlobalEqualizer() {
  const [isOpen, setIsOpen] = useState(false);
  const [gains, setGains] = useState([0, 0, 0, 0, 0]); // 60, 230, 910, 3600, 14000 Hz
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleGainChange = (index: number, val: number) => {
    const newGains = [...gains];
    newGains[index] = val;
    setGains(newGains);
    Engine.setFilterGain(index, val);
  };

  const labels = ["60", "230", "910", "3.6k", "14k"];
  const names = ["Sub", "Bass", "Mid", "High", "Air"];

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className={`p-2 transition-colors rounded-full hover:bg-white/10 ${isOpen ? "text-primary" : "text-[#b3b3b3] hover:text-white"}`}
        title="Audio Tuning (Equalizer)"
      >
        <SlidersHorizontal size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-4 w-72 md:w-80 neuglass rounded-xl shadow-2xl shadow-black/50 border border-white/10 overflow-hidden z-50 p-4" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Audio Equalizer</h3>
              <p className="text-[10px] text-[#a7a7a7] uppercase tracking-wider">5-Band Master Tuning</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-[#a7a7a7] hover:text-white bg-white/5 rounded-full p-1"><X size={14}/></button>
          </div>

          <div className="flex justify-between h-48 px-2">
            {gains.map((gain, i) => (
              <div key={i} className="flex flex-col items-center justify-between h-full">
                <span className="text-[10px] text-white/50">{gain > 0 ? "+" : ""}{gain}</span>
                <div className="relative flex-1 w-6 my-2 group">
                  <input 
                    type="range"
                    min="-15"
                    max="15"
                    step="1"
                    value={gain}
                    onChange={(e) => handleGainChange(i, parseInt(e.target.value))}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-transform origin-center -rotate-90"
                  />
                  {/* Zero line marker */}
                  <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/20 pointer-events-none" />
                </div>
                <div className="text-center mt-2">
                  <p className="text-[11px] font-bold text-white">{names[i]}</p>
                  <p className="text-[9px] text-[#727272]">{labels[i]}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button 
             onClick={() => {
                const flat = [0, 0, 0, 0, 0];
                setGains(flat);
                flat.forEach((v, i) => Engine.setFilterGain(i, v));
             }}
             className="w-full mt-4 py-1.5 text-xs font-semibold text-[#b3b3b3] hover:text-white border border-white/10 rounded hover:bg-white/5 transition-colors"
          >
            Reset to Flat
          </button>
        </div>
      )}
    </div>
  );
}

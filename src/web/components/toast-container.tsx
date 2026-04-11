import { useEffect, useState } from "react";
import { CircleCheck as CheckCircle, Circle as XCircle, Info, TriangleAlert as AlertTriangle, X } from "lucide-react";
import { useToastStore, type Toast } from "@/lib/toastStore";

const CONFIG = {
  success: { icon: CheckCircle, color: "#1db954", bg: "#1db954" },
  error: { icon: XCircle, color: "#ef4444", bg: "#ef4444" },
  info: { icon: Info, color: "#8ce1ff", bg: "#8ce1ff" },
  warning: { icon: AlertTriangle, color: "#f59e0b", bg: "#f59e0b" },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [visible, setVisible] = useState(false);
  const { icon: Icon, color, bg } = CONFIG[toast.type];

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    setVisible(false);
    setTimeout(onRemove, 320);
  }

  return (
    <div
      onClick={dismiss}
      style={{
        transform: visible ? "translateX(0)" : "translateX(110%)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.32s cubic-bezier(0.16,1,0.3,1), opacity 0.32s ease",
      }}
      className="flex items-start gap-3 w-80 bg-[#1a1a1a] border border-white/[0.08] rounded-xl p-4 shadow-2xl cursor-pointer hover:border-white/15 transition-colors"
    >
      <div className="shrink-0 mt-0.5">
        <Icon size={18} style={{ color }} />
      </div>
      <p className="flex-1 text-sm text-white/90 leading-snug">{toast.message}</p>
      <button
        onClick={(e) => { e.stopPropagation(); dismiss(); }}
        className="shrink-0 text-white/30 hover:text-white/70 transition-colors mt-0.5"
      >
        <X size={14} />
      </button>
      {toast.duration > 0 && (
        <div
          className="absolute bottom-0 left-0 h-[2px] rounded-b-xl"
          style={{
            background: bg,
            width: "100%",
            animation: `shrink-width ${toast.duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, remove } = useToastStore();

  return (
    <>
      <style>{`
        @keyframes shrink-width {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
      <div className="fixed top-4 right-4 md:top-auto md:bottom-[108px] md:right-5 z-[9999] flex flex-col gap-3 items-end pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto relative overflow-hidden">
            <ToastItem toast={t} onRemove={() => remove(t.id)} />
          </div>
        ))}
      </div>
    </>
  );
}

export default function Equalizer({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-end gap-[2px] h-[20px] ${className}`}>
      <span className="eq-bar" />
      <span className="eq-bar" />
      <span className="eq-bar" />
      <span className="eq-bar" />
    </div>
  );
}

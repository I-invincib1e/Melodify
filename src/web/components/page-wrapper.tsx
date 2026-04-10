import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function PageWrapper({ children, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [location] = useLocation();

  // Scroll to top on navigation
  useEffect(() => {
    ref.current?.scrollTo({ top: 0 });
  }, [location]);

  return (
    <div ref={ref} className={`animate-fade-in ${className}`}>
      {children}
    </div>
  );
}

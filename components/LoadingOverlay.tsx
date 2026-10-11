"use client";

import { trailLoading } from "@/assets";
import Image from "next/image";
import { useEffect, useState } from "react";

// Most loads finish in well under this; showing the dark overlay for those
// reads as a flicker, so it only appears for loads that actually take a while.
export const LOADING_OVERLAY_DELAY_MS = 300;

const LoadingOverlay = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), LOADING_OVERLAY_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="w-full h-full  left-0 fixed top-0 z-[9999] bg-black opacity-[0.7] backdrop-blur-sm flex items-center justify-center pointer-events-none animate-in fade-in-0 duration-200">
      <Image src={trailLoading} alt="Loading..." className="w-20 h-20" />
    </div>
  );
};

export default LoadingOverlay;

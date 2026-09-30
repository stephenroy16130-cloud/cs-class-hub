"use client";

import { useEffect, useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";

export default function InitialSplash() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 400);
    const removeTimer = setTimeout(() => setVisible(false), 700);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] transition-opacity duration-300 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <LoadingScreen />
    </div>
  );
}

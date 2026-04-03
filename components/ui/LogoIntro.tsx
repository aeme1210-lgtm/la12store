"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const VIDEO_URL =
  "https://chljxifjjzaffvwixtfm.supabase.co/storage/v1/object/public/brand/LOGO%20LA%2012.mp4";

export function LogoIntro() {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem("la12-intro-shown")) {
      setShowIntro(true);
    }
  }, []);

  const handleComplete = useCallback(() => {
    setShowIntro(false);
    sessionStorage.setItem("la12-intro-shown", "1");
  }, []);

  useEffect(() => {
    if (!showIntro) return;
    const t = setTimeout(handleComplete, 3500);
    return () => clearTimeout(t);
  }, [showIntro, handleComplete]);

  return (
    <AnimatePresence>
      {showIntro && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[10003] bg-black flex items-center justify-center"
          onClick={handleComplete}
        >
          <video
            autoPlay
            muted
            playsInline
            className="w-64 md:w-80 lg:w-96 h-auto"
            style={{ mixBlendMode: "screen" }}
          >
            <source src={VIDEO_URL} type="video/mp4" />
          </video>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

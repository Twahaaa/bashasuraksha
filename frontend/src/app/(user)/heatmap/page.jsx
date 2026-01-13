"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const MapContainer = dynamic(() => import("./MapContainer"), {
  ssr: false,
});

export default function HeatmapPage() {
  return (
    <div className="min-h-screen bg-black text-neutral-200 font-sans selection:bg-yellow-500/30 selection:text-yellow-200 overflow-hidden relative">
      {/* Animated Background - PRESERVED */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/3 left-2/5 w-50 h-50 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-1/3 right-2/5 w-50 h-50 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-2/5 left-2/5 w-50 h-50 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(#737373 1px, transparent 1px), linear-gradient(90deg, #737373 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Main Content - Accounts for navbar height */}
      <div className="relative z-10 h-screen pt-16 flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-6 px-6 text-center space-y-3 shrink-0"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-yellow-500 inline-block"></span>
            <Shield className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-400 font-mono text-xs tracking-widest uppercase">
              BhashaSuraksha Heatmap
            </span>
            <Shield className="w-4 h-4 text-yellow-500" />
            <span className="h-px w-8 bg-yellow-500 inline-block"></span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Language Distribution Map
          </h1>
          <p className="text-neutral-400 font-mono text-xs tracking-wide max-w-2xl mx-auto">
            Click on markers to explore audio samples from different regions
          </p>
        </motion.div>

        {/* Content Area - Map Only */}
        <div className="flex-1 flex overflow-hidden">
          <MapContainer />
        </div>
      </div>

      {/* Styles - PRESERVED */}
      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
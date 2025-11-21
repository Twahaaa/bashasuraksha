"use client";
import React, { useState, useRef, useCallback } from "react";
import { Upload, Mic, X, Shield, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_AUDIO_SIZE_BYTES = 3 * 1024 * 1024; // 3MB
const AUDIO_MIME_TYPE = "audio/webm";
const RECORDED_FILENAME = "recorded_audio.webm";

const COLORS = {
  yellow: "#FACC15",
  yellowDim: "#CA8A04",
  bg: "#050505",
  text: "#E5E5E5",
  textDim: "#737373",
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [recordingSize, setRecordingSize] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const uploadAudioBlob = async (blob) => {
    const formData = new FormData();
    formData.append("audio", blob, RECORDED_FILENAME);

    console.log("📤 Uploading audio blob...");
    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }
  };

  const startRecording = useCallback(async () => {
    try {
      console.log("🎙️ Recording started");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setRecordingSize(0);

      mediaRecorder.ondataavailable = (e) => {
        const newSize = recordingSize + e.data.size;
        setRecordingSize(newSize);

        if (newSize >= MAX_AUDIO_SIZE_BYTES) {
          console.log("⛔ File size limit reached!");
          mediaRecorder.stop();
          return;
        }

        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: AUDIO_MIME_TYPE });
        const audioUrl = URL.createObjectURL(blob);
        console.log("🎵 Audio URL created:", audioUrl);
        setAudioURL(audioUrl);
        uploadAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("❌ Recording error:", error);
    }
  }, [recordingSize]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    console.log("⏹️ Recording stopped");
  }, []);

  return {
    isRecording,
    audioURL,
    recordingSize,
    startRecording,
    stopRecording,
  };
};

const useFileUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = useCallback((e) => {
    if (!e.target.files || e.target.files.length === 0) {
      console.log("❌ No file selected");
      setFile(null);
      return;
    }

    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    console.log("📁 Selected file:", selectedFile);
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!file) {
        console.log("⚠️ No file to upload");
        return;
      }

      console.log("📤 File uploading...");
      const formData = new FormData();
      formData.append("audio", file);

      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
    },
    [file]
  );

  return {
    file,
    message,
    handleFileChange,
    handleSubmit,
  };
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const ModeSelector = ({ activeMode, onModeChange }) => {
  return (
    <div className="relative border border-neutral-800 p-1.5 flex gap-2 ">
      <button
        onClick={() => onModeChange("upload")}
        className={`relative px-8 py-4 font-bold tracking-widest uppercase text-sm transition-all duration-300 flex items-center gap-3 overflow-hidden group ${
          activeMode === "upload"
            ? "bg-yellow-500 text-black"
            : "text-neutral-400 hover:text-yellow-400"
        }`}
      >
        <Upload size={20} className="relative z-10" />
        <span className="relative z-10">Upload</span>
      </button>
      <button
        onClick={() => onModeChange("record")}
        className={`relative px-8 py-4 font-bold tracking-widest uppercase text-sm transition-all duration-300 flex items-center gap-3 overflow-hidden group ${
          activeMode === "record"
            ? "bg-yellow-500 text-black"
            : "text-neutral-400 hover:text-yellow-400"
        }`}
      >
        <Mic size={20} className="relative z-10" />
        <span className="relative z-10">Record</span>
      </button>
    </div>
  );
};

const UploadInterface = ({ file, message, onFileChange, onSubmit }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl"
    >
      <div className="border border-neutral-800  p-12">
        <div className="flex flex-col items-center space-y-8">
          <div className="p-6 border border-yellow-500/30 bg-black">
            <Upload size={64} className="text-yellow-400" />
          </div>

          <div className="text-center space-y-3">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Upload Audio File
            </h3>
            <p className="text-neutral-400 font-mono text-sm tracking-wide">
              SELECT YOUR AUDIO RECORDING
            </p>
          </div>

          <form onSubmit={onSubmit} className="w-full space-y-6">
            <label
              htmlFor="audioUpload"
              className="block w-full cursor-pointer group"
            >
              <input
                id="audioUpload"
                type="file"
                accept="audio/*"
                onChange={onFileChange}
                className="hidden"
              />
              <div className="border-2 border-dashed border-neutral-700 hover:border-yellow-500/50 transition-colors duration-300 p-12 text-center bg-black group-hover:bg-neutral-900/30">
                {file ? (
                  <div className="space-y-2">
                    <div className="text-yellow-400 font-mono text-sm">
                      FILE SELECTED
                    </div>
                    <div className="text-white font-bold">{file.name}</div>
                    <div className="text-neutral-500 text-xs">
                      {(file.size / 1024).toFixed(2)} KB
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-neutral-400 font-mono text-sm">
                      CLICK TO BROWSE
                    </div>
                    <div className="text-neutral-600 text-xs">
                      Supported: MP3, WAV, WEBM
                    </div>
                  </div>
                )}
              </div>
            </label>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!file}
              className={`w-full py-4 font-bold tracking-widest uppercase text-sm transition-all duration-300 ${
                file
                  ? "bg-yellow-500 text-black hover:bg-yellow-400"
                  : "bg-neutral-800 text-neutral-600 cursor-not-allowed"
              }`}
            >
              {file ? "Upload Recording" : "Select File First"}
            </motion.button>

            {message && (
              <div className="text-center text-yellow-400 font-mono text-sm">
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </motion.div>
  );
};

const RecordInterface = ({
  isRecording,
  audioURL,
  onStartRecording,
  onStopRecording,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl"
    >
      <div className="border border-neutral-800  p-12">
        <div className="flex flex-col items-center space-y-8">
          <div className="relative p-6 border border-yellow-500/30 bg-black">
            <Mic size={64} className="text-yellow-400" />
            {isRecording && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 border border-red-500 bg-red-500/10"
              />
            )}
          </div>

          <div className="text-center space-y-3">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Voice Recording
            </h3>
            <p className="text-neutral-400 font-mono text-sm tracking-wide">
              {isRecording ? "RECORDING IN PROGRESS..." : "READY TO RECORD"}
            </p>
          </div>

          <div className="w-full space-y-6">
            {!isRecording ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStartRecording}
                className="w-full bg-yellow-500 text-black py-4 font-bold tracking-widest uppercase text-sm hover:bg-yellow-400 transition-colors duration-300 flex items-center justify-center gap-3"
              >
                <Mic size={20} />
                Start Recording
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStopRecording}
                className="w-full bg-red-500 text-white py-4 font-bold tracking-widest uppercase text-sm hover:bg-red-600 transition-colors duration-300 flex items-center justify-center gap-3"
              >
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                Stop Recording
              </motion.button>
            )}

            {audioURL && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="border border-neutral-800 bg-black p-6 space-y-4"
              >
                <div className="flex items-center gap-2 text-yellow-400 font-mono text-xs tracking-widest">
                  <Activity size={14} />
                  <span>RECORDING COMPLETE</span>
                </div>
                <audio controls src={audioURL} className="w-full" />
              </motion.div>
            )}
          </div>

          <div className="w-full pt-6 border-t border-neutral-800">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
              <span>MAX DURATION: 10 SEC</span>
              <span>MAX SIZE: 3 MB</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function UploadComponent() {
  const [activeMode, setActiveMode] = useState("upload");

  const { isRecording, audioURL, startRecording, stopRecording } =
    useAudioRecorder();

  const { file, message, handleFileChange, handleSubmit } = useFileUpload();

  return (
    <div className="min-h-screen text-neutral-200 font-sans selection:bg-yellow-500/30 selection:text-yellow-200 overflow-hidden relative">
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
            backgroundImage: `linear-gradient(${COLORS.textDim} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.textDim} 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-20 mt-[-80]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-[1px] w-12 bg-yellow-500 inline-block"></span>
            <Shield className="w-5 h-5 text-yellow-500" />
            <span className="text-yellow-400 font-mono text-xs tracking-widest uppercase">
              BhashaSuraksha Archive
            </span>
            <Shield className="w-5 h-5 text-yellow-500" />
            <span className="h-[1px] w-12 bg-yellow-500 inline-block"></span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Contribute Your Voice
          </h1>
          <p className="text-neutral-400 font-mono text-sm tracking-wide max-w-2xl">
            Help preserve India's linguistic heritage by uploading or recording
            audio samples
          </p>
        </motion.div>

        {/* Mode Selector */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <ModeSelector activeMode={activeMode} onModeChange={setActiveMode} />
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeMode === "upload" ? (
            <UploadInterface
              key="upload"
              file={file}
              message={message}
              onFileChange={handleFileChange}
              onSubmit={handleSubmit}
            />
          ) : (
            <RecordInterface
              key="record"
              isRecording={isRecording}
              audioURL={audioURL}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
            />
          )}
        </AnimatePresence>

        {/* Status Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 flex items-center gap-2 text-neutral-500 text-xs font-mono"
        >
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          <span>SYSTEM ONLINE</span>
        </motion.div>
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
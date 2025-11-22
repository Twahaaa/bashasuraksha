"use client";
import React, { useState, useRef, useCallback } from "react";
import { Upload, Mic, Shield, Activity, Send, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BlockBlobClient } from "@azure/storage-blob";
import { saveToDB } from "@/actions/bhasha";

const MAX_AUDIO_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const AUDIO_MIME_TYPE = "audio/webm";
const RECORDED_FILENAME = "recorded_audio.webm";
const PROCESS_API_URL = "https://parky-reliably-zoe.ngrok-free.dev/process";

const COLORS = {
  yellow: "#FACC15",
  yellowDim: "#CA8A04",
  bg: "#050505",
  text: "#E5E5E5",
  textDim: "#737373",
};

// ============================================================================
// DIRECT AZURE UPLOAD HELPER
// ============================================================================
const uploadToAzure = async (file, fileName) => {
  // Get SAS token from our lightweight API
  const sasRes = await fetch(`/api/get-sas-token?fileName=${encodeURIComponent(fileName)}`);
  if (!sasRes.ok) throw new Error("Failed to get upload token");

  const { sasUrl, blobUrl } = await sasRes.json();

  // Upload directly to Azure from browser
  const blockBlobClient = new BlockBlobClient(sasUrl);
  await blockBlobClient.uploadData(file, {
    blobHTTPHeaders: { blobContentType: file.type || AUDIO_MIME_TYPE }
  });

  return blobUrl;
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================
const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [finalMessage, setFinalMessage] = useState("");
  const [location, setLocation] = useState({ lat: 0, long: 0 });
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Get user location on mount
  useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            long: position.coords.longitude
          });
          console.log("Location obtained:", position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Location access denied or unavailable:", error);
          // Keep default 0, 0
        }
      );
    }
  }, [])();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setAudioURL(null);
      setAudioBlob(null);
      setFinalMessage("");

      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: AUDIO_MIME_TYPE });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Recording error:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const handleSend = useCallback(async () => {
    if (!audioBlob) return;

    try {
      setUploading(true);
      setFinalMessage("Uploading directly to Azure...");
      console.log("Step 1: Direct upload to Azure Blob Storage...");

      // DIRECT UPLOAD - NO NEXTJS ROUTE!
      const blobUrl = await uploadToAzure(audioBlob, RECORDED_FILENAME);
      console.log("Blob URL:", blobUrl);

      setUploading(false);
      setProcessing(true);
      setFinalMessage("Processing audio...");
      console.log("Step 2: Processing audio via ML API...");

      // Add timeout for ML processing (60 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      try {
        const processRes = await fetch(PROCESS_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file_url: blobUrl, lat: location.lat, long: location.long }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!processRes.ok) {
          const errorText = await processRes.text();
          console.error("Process error:", errorText);
          throw new Error("Processing failed: " + errorText);
        }

        const processedData = await processRes.json();
        console.log("Processed data:", processedData);

        setFinalMessage("Saving to database...");
        console.log("Step 3: Saving to database...");

        // Add the file URL to the processed data
        processedData.file_url = blobUrl;

        // Call Server Action directly
        const saveData = await saveToDB(processedData);
        console.log("Save successful:", saveData);

        setFinalMessage("✓ Successfully saved!");

        setTimeout(() => {
          setAudioBlob(null);
          setAudioURL(null);
          setFinalMessage("");
        }, 2000);

      } catch (err) {
        if (err.name === 'AbortError') {
          throw new Error("Processing timed out. The ML server might be busy or down.");
        }
        throw err;
      }

    } catch (err) {
      console.error("Send error:", err);
      setFinalMessage("✗ Failed: " + err.message);
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  }, [audioBlob, location.lat, location.long]);

  const clearRecording = useCallback(() => {
    setAudioBlob(null);
    setAudioURL(null);
    setFinalMessage("");
  }, []);

  return {
    isRecording,
    audioURL,
    audioBlob,
    uploading,
    processing,
    finalMessage,
    startRecording,
    stopRecording,
    handleSend,
    clearRecording
  };
};

const useFileUpload = () => {
  const [file, setFile] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [finalMessage, setFinalMessage] = useState("");
  const [location, setLocation] = useState({ lat: 0, long: 0 });

  // Get user location on mount
  useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            long: position.coords.longitude
          });
          console.log("Location obtained:", position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Location access denied or unavailable:", error);
          // Keep default 0, 0
        }
      );
    }
  }, [])();

  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files?.[0] || null;
    console.log("File selected:", selectedFile);

    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setAudioURL(url);
      setFinalMessage("");
      console.log("File state updated:", selectedFile.name);
    }
  }, []);

  const handleSend = useCallback(async () => {
    if (!file) {
      console.error("No file selected");
      return;
    }

    try {
      setUploading(true);
      setFinalMessage("Uploading directly to Azure...");
      console.log("Step 1: Direct upload to Azure Blob Storage...");

      // DIRECT UPLOAD - NO NEXTJS ROUTE!
      const blobUrl = await uploadToAzure(file, file.name);
      console.log("Blob URL:", blobUrl);

      setUploading(false);
      setProcessing(true);
      setFinalMessage("Processing audio...");
      console.log("Step 2: Processing audio via ML API...");

      // Add timeout for ML processing (60 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      try {
        const processRes = await fetch(PROCESS_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file_url: blobUrl, lat: location.lat, long: location.long }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!processRes.ok) {
          const errorText = await processRes.text();
          console.error("Process error:", errorText);
          throw new Error("Processing failed: " + errorText);
        }

        const processedData = await processRes.json();
        console.log("Processed data:", processedData);

        setFinalMessage("Saving to database...");
        console.log("Step 3: Saving to database...");

        // Add the file URL to the processed data
        processedData.file_url = blobUrl;

        // Call Server Action directly
        const saveData = await saveToDB(processedData);
        console.log("Save successful:", saveData);

        setFinalMessage("✓ Successfully saved!");

        setTimeout(() => {
          setFile(null);
          setAudioURL(null);
          setFinalMessage("");
        }, 2000);

      } catch (err) {
        if (err.name === 'AbortError') {
          throw new Error("Processing timed out. The ML server might be busy or down.");
        }
        throw err;
      }


    } catch (err) {
      console.error("Send error:", err);
      setFinalMessage("✗ Failed: " + err.message);
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  }, [file, location.lat, location.long]);

  const clearFile = useCallback(() => {
    console.log("Clearing file");
    setFile(null);
    setAudioURL(null);
    setFinalMessage("");
  }, []);

  return {
    file,
    audioURL,
    uploading,
    processing,
    finalMessage,
    handleFileChange,
    handleSend,
    clearFile
  };
};

// ============================================================================
// SUB-COMPONENTS (Keep all your existing UI components exactly as they are)
// ============================================================================
const ModeSelector = ({ activeMode, onModeChange }) => (
  <div className="relative border border-neutral-800 p-1.5 flex gap-2">
    <button
      onClick={() => onModeChange("upload")}
      className={`relative px-8 py-4 font-bold tracking-widest uppercase text-sm flex items-center gap-3 transition-colors ${activeMode === "upload" ? "bg-yellow-500 text-black" : "text-neutral-400 hover:text-yellow-400"
        }`}
    >
      <Upload size={20} />
      Upload
    </button>
    <button
      onClick={() => onModeChange("record")}
      className={`relative px-8 py-4 font-bold tracking-widest uppercase text-sm flex items-center gap-3 transition-colors ${activeMode === "record" ? "bg-yellow-500 text-black" : "text-neutral-400 hover:text-yellow-400"
        }`}
    >
      <Mic size={20} />
      Record
    </button>
  </div>
);

const UploadInterface = ({
  file,
  audioURL,
  uploading,
  processing,
  finalMessage,
  onFileChange,
  onSend,
  onClear
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl"
    >
      <div className="border border-neutral-800 p-12 flex flex-col items-center space-y-8">
        <div className="p-6 border border-yellow-500/30 bg-black">
          <Upload size={64} className="text-yellow-400" />
        </div>
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-bold text-white tracking-tight">Upload Audio File</h3>
          <p className="text-neutral-400 font-mono text-sm tracking-wide">
            SELECT YOUR AUDIO RECORDING
          </p>
        </div>

        {!file ? (
          <label htmlFor="audioUpload" className="block w-full cursor-pointer group">
            <input
              id="audioUpload"
              type="file"
              accept="audio/*"
              onChange={onFileChange}
              className="hidden"
            />
            <div className="border-2 border-dashed border-neutral-700 hover:border-yellow-500/50 transition-colors duration-300 p-12 text-center bg-black group-hover:bg-neutral-900/30">
              <div className="space-y-2">
                <div className="text-neutral-400 font-mono text-sm">CLICK TO BROWSE</div>
                <div className="text-neutral-600 text-xs">Supported: MP3, WAV, WEBM</div>
              </div>
            </div>
          </label>
        ) : (
          <div className="w-full space-y-6">
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="border border-neutral-800 bg-black p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-yellow-400 font-mono text-xs tracking-widest">
                  <Activity size={14} />
                  <span>FILE LOADED</span>
                </div>
                <button
                  onClick={onClear}
                  className="p-1 hover:bg-neutral-800 transition-colors"
                  disabled={uploading || processing}
                >
                  <X size={16} className="text-neutral-400" />
                </button>
              </div>
              <div className="space-y-2">
                <div className="text-white font-bold">{file.name}</div>
                <div className="text-neutral-500 text-xs">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
              </div>
              {audioURL && <audio controls src={audioURL} className="w-full" />}
            </motion.div>

            <motion.button
              whileHover={{ scale: uploading || processing ? 1 : 1.02 }}
              whileTap={{ scale: uploading || processing ? 1 : 0.98 }}
              onClick={onSend}
              disabled={uploading || processing}
              className={`w-full py-4 font-bold tracking-widest uppercase text-sm flex items-center justify-center gap-3 transition-colors ${uploading || processing
                ? "bg-neutral-800 text-neutral-600 cursor-not-allowed"
                : "bg-yellow-500 text-black hover:bg-yellow-400"
                }`}
            >
              {uploading || processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-neutral-600 border-t-transparent rounded-full animate-spin" />
                  {uploading ? "Uploading..." : "Processing..."}
                </>
              ) : (
                <>
                  <Send size={20} />
                  Send Recording
                </>
              )}
            </motion.button>

            {finalMessage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-center font-mono text-sm ${finalMessage.includes("✓") ? "text-green-400" :
                  finalMessage.includes("✗") ? "text-red-400" : "text-yellow-400"
                  }`}
              >
                {finalMessage}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const RecordInterface = ({
  isRecording,
  audioURL,
  audioBlob,
  uploading,
  processing,
  finalMessage,
  onStartRecording,
  onStopRecording,
  onSend,
  onClear
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4 }}
    className="w-full max-w-2xl"
  >
    <div className="border border-neutral-800 p-12 flex flex-col items-center space-y-8">
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
        <h3 className="text-2xl font-bold text-white tracking-tight">Voice Recording</h3>
        <p className="text-neutral-400 font-mono text-sm tracking-wide">
          {isRecording ? "RECORDING IN PROGRESS..." : audioBlob ? "RECORDING COMPLETE" : "READY TO RECORD"}
        </p>
      </div>
      <div className="w-full space-y-6">
        {!audioBlob ? (
          !isRecording ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStartRecording}
              className="w-full bg-yellow-500 text-black py-4 font-bold tracking-widest uppercase text-sm hover:bg-yellow-400 transition-colors flex items-center justify-center gap-3"
            >
              <Mic size={20} /> Start Recording
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStopRecording}
              className="w-full bg-red-500 text-white py-4 font-bold tracking-widest uppercase text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-3"
            >
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" /> Stop Recording
            </motion.button>
          )
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="border border-neutral-800 bg-black p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-yellow-400 font-mono text-xs tracking-widest">
                  <Activity size={14} />
                  <span>RECORDING COMPLETE</span>
                </div>
                <button
                  onClick={onClear}
                  className="p-1 hover:bg-neutral-800 transition-colors"
                  disabled={uploading || processing}
                >
                  <X size={16} className="text-neutral-400" />
                </button>
              </div>
              <audio controls src={audioURL} className="w-full" />
            </motion.div>

            <motion.button
              whileHover={{ scale: uploading || processing ? 1 : 1.02 }}
              whileTap={{ scale: uploading || processing ? 1 : 0.98 }}
              onClick={onSend}
              disabled={uploading || processing}
              className={`w-full py-4 font-bold tracking-widest uppercase text-sm flex items-center justify-center gap-3 transition-colors ${uploading || processing
                ? "bg-neutral-800 text-neutral-600 cursor-not-allowed"
                : "bg-yellow-500 text-black hover:bg-yellow-400"
                }`}
            >
              {uploading || processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-neutral-600 border-t-transparent rounded-full animate-spin" />
                  {uploading ? "Uploading..." : "Processing..."}
                </>
              ) : (
                <>
                  <Send size={20} />
                  Send Recording
                </>
              )}
            </motion.button>

            {finalMessage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-center font-mono text-sm ${finalMessage.includes("✓") ? "text-green-400" :
                  finalMessage.includes("✗") ? "text-red-400" : "text-yellow-400"
                  }`}
              >
                {finalMessage}
              </motion.div>
            )}
          </>
        )}
      </div>
      <div className="w-full pt-6 border-t border-neutral-800 flex justify-between text-xs font-mono text-neutral-500">
        <span>MAX DURATION: 10 SEC</span>
        <span>MAX SIZE: 10 MB</span>
      </div>
    </div>
  </motion.div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function UploadComponent() {
  const [activeMode, setActiveMode] = useState("upload");

  const audioHook = useAudioRecorder();
  const fileHook = useFileUpload();

  return (
    <div className="min-h-screen text-neutral-200 font-sans selection:bg-yellow-500/30 selection:text-yellow-200 overflow-hidden relative">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/3 left-2/5 w-50 h-50 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-1/3 right-2/5 w-50 h-50 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-2/5 left-2/5 w-50 h-50 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `linear-gradient(${COLORS.textDim} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.textDim} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-20">
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
            Help preserve India&apos;s linguistic heritage by uploading or recording audio samples
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <ModeSelector activeMode={activeMode} onModeChange={setActiveMode} />
        </motion.div>
        <AnimatePresence mode="wait">
          {activeMode === "upload" ? (
            <UploadInterface
              file={fileHook.file}
              audioURL={fileHook.audioURL}
              uploading={fileHook.uploading}
              processing={fileHook.processing}
              finalMessage={fileHook.finalMessage}
              onFileChange={fileHook.handleFileChange}
              onSend={fileHook.handleSend}
              onClear={fileHook.clearFile}
            />
          ) : (
            <RecordInterface
              isRecording={audioHook.isRecording}
              audioURL={audioHook.audioURL}
              audioBlob={audioHook.audioBlob}
              uploading={audioHook.uploading}
              processing={audioHook.processing}
              finalMessage={audioHook.finalMessage}
              onStartRecording={audioHook.startRecording}
              onStopRecording={audioHook.stopRecording}
              onSend={audioHook.handleSend}
              onClear={audioHook.clearRecording}
            />
          )}
        </AnimatePresence>
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
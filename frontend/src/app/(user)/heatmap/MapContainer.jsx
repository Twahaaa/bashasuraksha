"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { motion, AnimatePresence } from "framer-motion";
import { Satellite, Activity, X, Play, Pause, Volume2 } from "lucide-react";

const COLOR_PALETTE = [
  "#F87171", // Red
  "#FB923C", // Orange
  "#FACC15", // Yellow
  "#A3E635", // Lime
  "#34D399", // Emerald
  "#22D3EE", // Cyan
  "#60A5FA", // Blue
  "#818CF8", // Indigo
  "#C084FC", // Purple
  "#F472B6", // Pink
];

// Helper function to parse "lat,lng" string
const parseCoordinates = (str) => {
  if (!str) return null;
  const parts = str.split(",");
  if (parts.length !== 2) return null;
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng };
};

// Mock geocoding function (or simple fallback)
// Since we expect "lat,lng" from the DB for UnknownSamples, this primarily handles that.
const geocodeRegion = async (region) => {
  // 1. Try parsing as "lat,lng"
  const coords = parseCoordinates(region);
  if (coords) return coords;

  // 2. Fallback: If it's a named region (e.g. "New York"), we might need a real geocoder.
  // For now, let's return null or a placeholder if we don't have a geocoding service key.
  // If you have a geocoding service, implement it here.
  console.warn(`Region "${region}" is not a coordinate pair. Geocoding skipped.`);
  return null;
};

const AudioPopup = ({ region, audioSamples, clusterColors, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/95">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Satellite className="w-4 h-4 text-yellow-500" />
              Location Data
            </h3>
            <p className="text-xs text-neutral-400 font-mono mt-1">{region}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto space-y-3 custom-scrollbar">
          {audioSamples.map((sample) => (
            <div 
              key={sample.id} 
              className="p-3 rounded bg-neutral-800/50 border border-neutral-700/50 hover:border-neutral-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: clusterColors[sample.clusterId] || "#94a3b8" }}
                  />
                  <span className="text-xs font-mono text-neutral-300">
                    Cluster {sample.clusterId}
                  </span>
                </div>
                <span className="text-xs text-neutral-500">
                  {new Date(sample.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              {sample.transcript ? (
                <p className="text-sm text-neutral-200 mb-3 italic">&quot;{sample.transcript}&quot;</p>
              ) : (
                <p className="text-sm text-neutral-500 mb-3 italic">No transcript available</p>
              )}

              <div className="flex items-center gap-2">
                 {sample.fileUrl && (
                    <audio controls className="w-full h-8 opacity-80 hover:opacity-100 transition-opacity">
                        <source src={sample.fileUrl} type="audio/mpeg" />
                        <source src={sample.fileUrl} type="audio/wav" />
                        Your browser does not support the audio element.
                    </audio>
                 )}
              </div>
              
              <div className="mt-2 flex flex-wrap gap-1">
                 <span className="text-[10px] px-1.5 py-0.5 bg-neutral-700 rounded text-neutral-300">
                    Conf: {(sample.confidence * 100).toFixed(1)}%
                 </span>
                 {sample.languageGuess && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-neutral-700 rounded text-neutral-300">
                        Lang: {sample.languageGuess}
                    </span>
                 )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default function MapContainer() {
  const mapRef = useRef(null);
  const mapContainer = useRef(null);
  const markersRef = useRef([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedSamples, setSelectedSamples] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [samplesData, setSamplesData] = useState([]);
  const [clusterColors, setClusterColors] = useState({});
  const [error, setError] = useState(null);

  // ============================================
  // STEP 1: Fetch samples from /api/heatmap
  // ============================================
  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const res = await fetch("/api/heatmap");
        const json = await res.json();
        
        if (json.success && json.data) {
          setSamplesData(json.data);
          
          if (json.data.length === 0) {
            setIsLoading(false);
            return;
          }
          
          // Build dynamic color map from unique cluster IDs
          const uniqueClusterIds = [...new Set(
            json.data.map((s) => s.clusterId).filter((id) => id !== null && id !== undefined)
          )].sort((a, b) => a - b);
          
          const colorMap = {};
          uniqueClusterIds.forEach((id, idx) => {
            colorMap[id] = COLOR_PALETTE[idx % COLOR_PALETTE.length];
          });
          setClusterColors(colorMap);
          
          // Set loading to false after data is processed
          setIsLoading(false);
          
        } else {
          setError(json.error || "Failed to fetch heatmap data.");
          setIsLoading(false);
        }
      } catch (e) {
        setError("An unexpected error occurred.");
        setIsLoading(false);
      }
    };
    
    fetchSamples();
  }, []);

  // ============================================
  // STEP 2: Group samples by lat/lng coordinates
  // ============================================
  const groupedByCoordinates = React.useMemo(() => {
    return samplesData.reduce((acc, sample) => {
      // Use lat/lng if available, otherwise skip
      if (sample.lat !== null && sample.lat !== undefined && 
          sample.lng !== null && sample.lng !== undefined) {
        // Create a key from coordinates (rounded to 4 decimal places for grouping nearby samples)
        const key = `${sample.lat.toFixed(4)},${sample.lng.toFixed(4)}`;
        if (!acc[key]) {
          acc[key] = {
            lat: sample.lat,
            lng: sample.lng,
            samples: []
          };
        }
        acc[key].samples.push(sample);
      }
      return acc;
    }, {});
  }, [samplesData]);

  // ============================================
  // STEP 3: Prepare geocoded data (no geocoding needed, we have coordinates)
  // ============================================
  const geocodedData = React.useMemo(() => {
    return Object.entries(groupedByCoordinates).map(([key, data]) => ({
      region: key, // Keep for compatibility
      samples: data.samples,
      coordinates: { lat: data.lat, lng: data.lng }
    }));
  }, [groupedByCoordinates]);

  // Define updateMarkers before it's used
  const updateMarkers = React.useCallback((mapInstance) => {
      if (!mapInstance) return;
      
      // Clear existing markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      geocodedData.forEach(({ region, samples, coordinates }) => {
        // Use the first sample's clusterId for marker color
        const firstSample = samples[0];
        const clusterColor = clusterColors[firstSample.clusterId] || "#94a3b8";

        const el = document.createElement("div");
        el.style.cssText = "width:30px;height:30px;cursor:pointer;display:flex;align-items:center;justify-content:center;";

        const marker = document.createElement("div");
        marker.style.cssText = `width:30px;height:30px;border-radius:50%;background-color:${clusterColor};border:3px solid rgba(0,0,0,0.8);position:relative;box-shadow:0 2px 8px rgba(0,0,0,0.6);transition:transform 0.2s ease,box-shadow 0.2s ease;`;
        el.appendChild(marker);

        const badge = document.createElement("div");
        badge.textContent = samples.length;
        badge.style.cssText = "position:absolute;top:-8px;right:-8px;background:#FACC15;color:black;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;font-family:monospace;border:2px solid black;pointer-events:none;";
        marker.appendChild(badge);

        el.addEventListener("mouseenter", () => {
          marker.style.transform = "scale(1.15)";
          marker.style.boxShadow = "0 4px 12px rgba(0,0,0,0.8)";
        });
        el.addEventListener("mouseleave", () => {
          marker.style.transform = "scale(1)";
          marker.style.boxShadow = "0 2px 8px rgba(0,0,0,0.6)";
        });

        el.addEventListener("click", () => {
          setSelectedRegion(region);
          setSelectedSamples(samples);
        });

        const mapMarker = new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat(coordinates)
          .addTo(mapInstance);

        markersRef.current.push(mapMarker);
      });
  }, [geocodedData, clusterColors]);

  // ============================================
  // STEP 4: Initialize map and add markers
  // ============================================
  useEffect(() => {
    if (mapRef.current) return; // Initialize only once
    if (!mapContainer.current) return; // Ensure container ref exists
    // Wait for colors to be ready. 
    if (samplesData.length > 0 && Object.keys(clusterColors).length === 0) return; 
    if (isLoading) return;

    // Default center
    let center = [78.9629, 20.5937];
    let zoom = 4;

    // If we have data, center on the first point
    if (geocodedData.length > 0) {
        center = [geocodedData[0].coordinates.lng, geocodedData[0].coordinates.lat];
        zoom = 5;
    }

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json",
      center: center,
      zoom: zoom,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on("load", () => {
      // Add markers
      updateMarkers(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [geocodedData, isLoading, samplesData.length, clusterColors, updateMarkers]);

  // Update markers when geocodedData or clusterColors change
  useEffect(() => {
      if (!mapRef.current) return;
      updateMarkers(mapRef.current);
  }, [geocodedData, clusterColors, updateMarkers]);



  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-500 font-mono text-center p-8">
        <div>
          <p className="text-lg font-bold">An Error Occurred</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }
  
  if (samplesData.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-500 font-mono text-center p-8">
        No heatmap data available.
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex-1 flex flex-col h-full overflow-hidden px-6 py-4"
      >
        <div className="w-full space-y-3 mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="h-[1px] w-8 bg-yellow-500 inline-block"></span>
            <Satellite className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-400 font-mono text-xs tracking-widest uppercase">Geographic Distribution</span>
          </div>
        </div>

        <div className="w-full flex-1 border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm p-3 mb-4 min-h-0 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
              <div className="text-center space-y-3">
                <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-yellow-400 font-mono text-xs">LOADING DATA...</p>
              </div>
            </div>
          )}
          <div ref={mapContainer} className="w-full h-full border border-neutral-700 overflow-hidden" />
        </div>

        {/* Dynamic Legend - shows only clusters that exist in DB */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm p-4 flex-shrink-0"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-yellow-400" />
              <span className="text-neutral-400 font-mono text-xs tracking-widest uppercase">Cluster Legend</span>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              {Object.keys(clusterColors).length > 0 ? (
                Object.entries(clusterColors).map(([clusterId, color]) => (
                  <div key={clusterId} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border border-neutral-700" style={{ backgroundColor: color }}></div>
                    <span className="text-neutral-300 font-mono text-xs">Cluster {clusterId}</span>
                  </div>
                ))
              ) : (
                <span className="text-neutral-500 font-mono text-xs">
                  {isLoading ? "Loading clusters..." : "No clusters found"}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-2 text-neutral-500 text-xs font-mono mt-4 flex-shrink-0"
        >
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          <span>MAP SYSTEM ONLINE • {samplesData.length} SAMPLES • {geocodedData.length} REGIONS</span>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {selectedRegion && (
          <AudioPopup
            region={selectedRegion}
            audioSamples={selectedSamples}
            clusterColors={clusterColors}
            onClose={() => {
              setSelectedRegion(null);
              setSelectedSamples([]);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}


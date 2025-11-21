"use client"

import { useEffect, useRef, useState } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { motion, AnimatePresence } from "framer-motion"
import { Satellite, Activity, X, Play, Calendar, MapPin, Globe } from "lucide-react"

// Demo data
const DEMO_DATA = [
  {
    id: 1,
    fileUrl: "https://example.com/audio1.mp3",
    languageGuess: "Kannada",
    confidence: 0.45,
    transcript: "Hello, how are you doing today?",
    clusterId: 101,
    region: "Mangalore, Karnataka",
    keywords: "greetings, hello",
    embedding: [0.12, 0.43, 0.65, 0.21],
    createdAt: "2025-11-21T23:00:00Z",
  },
  {
    id: 2,
    fileUrl: "https://example.com/audio2.mp3",
    languageGuess: "Malayalam",
    confidence: 0.5,
    transcript: "I would like some rice and curry please",
    clusterId: 102,
    region: "Kasargod, Kerala",
    keywords: "food, rice",
    embedding: [0.33, 0.12, 0.78, 0.56],
    createdAt: "2025-11-21T23:05:00Z",
  },
  {
    id: 3,
    fileUrl: "https://example.com/audio3.mp3",
    languageGuess: "Kannada",
    confidence: 0.47,
    transcript: "Good morning, have a great day",
    clusterId: 101,
    region: "Mangalore, Karnataka",
    keywords: "greetings, morning",
    embedding: [0.14, 0.41, 0.63, 0.23],
    createdAt: "2025-11-21T23:10:00Z",
  },
  {
    id: 4,
    fileUrl: "https://example.com/audio4.mp3",
    languageGuess: "Tulu",
    confidence: 0.38,
    transcript: "Going to the market to buy vegetables",
    clusterId: 103,
    region: "Udupi, Karnataka",
    keywords: "market, buy",
    embedding: [0.55, 0.22, 0.44, 0.78],
    createdAt: "2025-11-21T23:12:00Z",
  },
  {
    id: 5,
    fileUrl: "https://example.com/audio5.mp3",
    languageGuess: "Malayalam",
    confidence: 0.42,
    transcript: "These spices smell amazing",
    clusterId: 102,
    region: "Kasargod, Kerala",
    keywords: "food, spices",
    embedding: [0.31, 0.15, 0.72, 0.5],
    createdAt: "2025-11-21T23:15:00Z",
  },
  {
    id: 7,
    fileUrl: "https://example.com/audio7.mp3",
    languageGuess: "Kannada",
    confidence: 0.37,
    transcript: "Good night, sleep well",
    clusterId: 101,
    region: "Mangalore, Karnataka",
    keywords: "greetings, night",
    embedding: [0.15, 0.44, 0.62, 0.25],
    createdAt: "2025-11-21T23:25:00Z",
  },
  {
    id: 8,
    fileUrl: "https://example.com/audio93.mp3",
    languageGuess: "Marathi",
    confidence: 0.37,
    transcript: "Good morning, sleep well",
    clusterId: 104,
    region: "Mumbai, Maharashtra",
    keywords: "greetings, night",
    embedding: [0.15, 0.44, 0.62, 0.25],
    createdAt: "2025-11-21T23:25:00Z",
  },
  {
    id: 9,
    fileUrl: "https://example.com/audio94.mp3",
    languageGuess: "Tamil",
    confidence: 0.62,
    transcript: "Welcome to our city",
    clusterId: 105,
    region: "Chennai, Tamil Nadu",
    keywords: "welcome, city",
    embedding: [0.25, 0.54, 0.72, 0.35],
    createdAt: "2025-11-21T23:30:00Z",
  },
]

// Cluster color mapping
const CLUSTER_COLORS = {
  101: "#3b82f6", // Blue
  102: "#14b8a6", // Teal
  103: "#eab308", // Yellow
  104: "#ef4444", // Red
  105: "#8b5cf6", // Purple
  106: "#ec4899", // Pink
}

// Geocoding function using Nominatim (OpenStreetMap)
const geocodeRegion = async (region) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(region)}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "BhashaSuraksha/1.0",
        },
      },
    )
    const data = await response.json()
    if (data && data.length > 0) {
      return [Number.parseFloat(data[0].lon), Number.parseFloat(data[0].lat)]
    }
    return null
  } catch (error) {
    console.error(`Geocoding failed for ${region}:`, error)
    return null
  }
}

const AudioPopup = ({ region, audioSamples, onClose }) => {
  const [playingId, setPlayingId] = useState(null)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-neutral-900 border border-neutral-800 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-yellow-500/30 bg-black">
              <MapPin size={20} className="text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{region}</h2>
              <p className="text-neutral-400 font-mono text-xs">
                {audioSamples.length} Audio Sample
                {audioSamples.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-800 transition-colors border border-neutral-700">
            <X size={20} className="text-neutral-400" />
          </button>
        </div>

        {/* Audio List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {audioSamples.map((sample) => (
            <div
              key={sample.id}
              className="border border-neutral-800 bg-black p-4 space-y-3 hover:border-yellow-500/30 transition-colors"
            >
              {/* Header Row: Cluster + Language + Date */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full border border-neutral-700"
                      style={{
                        backgroundColor: CLUSTER_COLORS[sample.clusterId] || "#94a3b8",
                      }}
                    />
                    <span className="text-neutral-400 font-mono text-xs">Cluster {sample.clusterId}</span>
                  </div>
                  {sample.languageGuess && (
                    <div className="flex items-center gap-2 px-2 py-1 bg-yellow-500/10 border border-yellow-500/30">
                      <Globe size={12} className="text-yellow-400" />
                      <span className="text-yellow-400 font-mono text-xs font-bold">{sample.languageGuess}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-neutral-500 text-xs font-mono">
                  <Calendar size={12} />
                  {formatDate(sample.createdAt)}
                </div>
              </div>

              {/* Transcript */}
              {sample.transcript && (
                <div className="bg-neutral-900/50 border border-neutral-800 p-3">
                  <p className="text-neutral-300 text-sm leading-relaxed">"{sample.transcript}"</p>
                </div>
              )}

              {/* Audio Player Placeholder */}
              <div className="border border-neutral-700 bg-neutral-900/30 p-3 flex items-center gap-3">
                <button
                  onClick={() => setPlayingId(playingId === sample.id ? null : sample.id)}
                  className="p-2 bg-yellow-500 hover:bg-yellow-400 transition-colors"
                >
                  <Play size={16} className="text-black" fill={playingId === sample.id ? "black" : "none"} />
                </button>
                <div className="flex-1">
                  <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 transition-all"
                      style={{
                        width: playingId === sample.id ? "60%" : "0%",
                      }}
                    />
                  </div>
                </div>
                <span className="text-neutral-500 font-mono text-xs">{(sample.confidence * 100).toFixed(0)}%</span>
              </div>

              {/* Keywords */}
              {sample.keywords && (
                <div className="flex items-center gap-2 flex-wrap">
                  {sample.keywords.split(",").map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-400 font-mono text-xs"
                    >
                      {keyword.trim()}
                    </span>
                  ))}
                </div>
              )}

              {/* File URL (for development) */}
              <div className="text-neutral-600 font-mono text-xs truncate">{sample.fileUrl}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function MapContainer() {
  const mapRef = useRef(null)
  const mapContainer = useRef(null)
  const markersRef = useRef([])
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [selectedSamples, setSelectedSamples] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [geocodedData, setGeocodedData] = useState([])

  // Group samples by region
  const groupedByRegion = DEMO_DATA.reduce((acc, sample) => {
    if (!acc[sample.region]) {
      acc[sample.region] = []
    }
    acc[sample.region].push(sample)
    return acc
  }, {})

  // Geocode all regions on mount
  useEffect(() => {
    const geocodeAllRegions = async () => {
      setIsLoading(true)
      const geocoded = []

      for (const [region, samples] of Object.entries(groupedByRegion)) {
        const coordinates = await geocodeRegion(region)
        if (coordinates) {
          geocoded.push({
            region,
            samples,
            coordinates,
          })
        } else {
          console.warn(`Could not geocode region: ${region}`)
        }
        // Add delay to respect rate limits
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      setGeocodedData(geocoded)
      setIsLoading(false)
    }

    geocodeAllRegions()
  }, [])

  // Initialize map and add markers
  useEffect(() => {
    if (mapRef.current || geocodedData.length === 0) return

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json",
      center: [78.9629, 20.5937], // Center of India
      zoom: 5,
    })

    mapRef.current = map

    map.on("load", () => {
      // Add markers for each geocoded region
      geocodedData.forEach(({ region, samples, coordinates }) => {
        const firstSample = samples[0]
        const clusterColor = CLUSTER_COLORS[firstSample.clusterId] || "#94a3b8"

        const el = document.createElement("div")
        el.className = "flex items-center justify-center"
        el.style.cssText = `
          width: 30px;
          height: 30px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        `

        // Inner circle for the marker
        const marker = document.createElement("div")
        marker.style.cssText = `
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: ${clusterColor};
          border: 3px solid rgba(0, 0, 0, 0.8);
          position: relative;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
        `
        el.appendChild(marker)

        // Add sample count badge
        const badge = document.createElement("div")
        badge.textContent = samples.length
        badge.style.cssText = `
          position: absolute;
          top: -8px;
          right: -8px;
          background: #FACC15;
          color: black;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
          font-family: monospace;
          border: 2px solid black;
          pointer-events: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
        `
        marker.appendChild(badge)

        // Hover effect
        el.addEventListener("mouseenter", () => {
          marker.style.transform = "scale(1.15)"
          marker.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.8)"
        })
        el.addEventListener("mouseleave", () => {
          marker.style.transform = "scale(1)"
          marker.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.6)"
        })

        marker.style.transition = "transform 0.2s ease, box-shadow 0.2s ease"

        // Click handler
        el.addEventListener("click", () => {
          setSelectedRegion(region)
          setSelectedSamples(samples)
        })

        const mapMarker = new maplibregl.Marker({
          element: el,
          anchor: "center",
        })
          .setLngLat(coordinates)
          .addTo(map)

        markersRef.current.push(mapMarker)
      })
    })

    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
    }
  }, [geocodedData])

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex-1 flex flex-col h-full overflow-hidden px-6 py-4"
      >
        {/* Map Header */}
        <div className="w-full space-y-3 mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="h-[1px] w-8 bg-yellow-500 inline-block"></span>
            <Satellite className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-400 font-mono text-xs tracking-widest uppercase">Geographic Distribution</span>
          </div>
        </div>

        {/* Map Container */}
        <div className="w-full flex-1 border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm p-3 mb-4 min-h-0 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
              <div className="text-center space-y-3">
                <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-yellow-400 font-mono text-xs">GEOCODING REGIONS...</p>
              </div>
            </div>
          )}
          <div ref={mapContainer} className="w-full h-full border border-neutral-700 overflow-hidden" />
        </div>

        {/* Legend */}
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
              {Object.entries(CLUSTER_COLORS).map(([clusterId, color]) => (
                <div key={clusterId} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full border border-neutral-700"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="text-neutral-300 font-mono text-xs">Cluster {clusterId}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Status Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-2 text-neutral-500 text-xs font-mono mt-4 flex-shrink-0"
        >
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          <span>
            MAP SYSTEM ONLINE • {DEMO_DATA.length} SAMPLES • {geocodedData.length} REGIONS
          </span>
        </motion.div>
      </motion.div>

      {/* Audio Popup */}
      <AnimatePresence>
        {selectedRegion && (
          <AudioPopup
            region={selectedRegion}
            audioSamples={selectedSamples}
            onClose={() => {
              setSelectedRegion(null)
              setSelectedSamples([])
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

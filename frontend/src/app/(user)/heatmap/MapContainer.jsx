"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapContainer({ filters }) {
  const mapRef = useRef(null);
  const mapContainer = useRef(null);

  // Initialize Map once
  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.stadiamaps.com/styles/osm_bright.json",
      center: [78.9629, 20.5937],
      zoom: 4,
    });

    mapRef.current = map;

    map.on("load", async () => {
      const res = await fetch(
        `/api/heatmap?filters=${encodeURIComponent(JSON.stringify(filters))}`
      );
      const geojson = await res.json();

      // City layer (optional)
      map.addSource("cities", {
        type: "geojson",
        data:
          "https://raw.githubusercontent.com/manifestinteractive/open-geocoding/master/data/cities_india.geojson",
      });

      map.addLayer({
        id: "city-labels",
        type: "symbol",
        source: "cities",
        layout: {
          "text-field": ["get", "name"],
          "text-size": 12,
          "text-anchor": "top",
          "text-offset": [0, 1],
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-color": "#000000",
          "text-halo-width": 1.5,
        },
      });

      // ADD SAMPLES SOURCE (IMPORTANT)
      map.addSource("samples", {
        type: "geojson",
        data: geojson,
      });

      // HEATMAP
      map.addLayer({
        id: "heatmap",
        type: "heatmap",
        source: "samples",
        maxzoom: 12,
        paint: {
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", "confidence"],
            0,
            0,
            100,
            1,
          ],
          "heatmap-intensity": 1.2,
          "heatmap-radius": 25,
          "heatmap-opacity": 0.8,
        },
      });

      // POINTS
      map.addLayer({
        id: "points",
        type: "circle",
        source: "samples",
        minzoom: 6,
        paint: {
          "circle-radius": 6,
          "circle-color": [
            "match",
            ["get", "cluster"],
            -1,
            "#6b7280",
            0,
            "#3b82f6",
            1,
            "#14b8a6",
            2,
            "#eab308",
            3,
            "#ef4444",
            "#94a3b8",
          ],
        },
      });
    });
  }, []);

  // Update map when filters change
  useEffect(() => {
    if (!mapRef.current) return;

    fetch(
      `/api/heatmap?filters=${encodeURIComponent(JSON.stringify(filters))}`
    )
      .then((res) => res.json())
      .then((data) => {
        const src = mapRef.current.getSource("samples");
        if (src) src.setData(data);
      });
  }, [filters]);

  return (
    <div className="w-full flex justify-center items-center p-6 mt-20">
      <div
        ref={mapContainer}
        className="w-[90%] h-[80vh] max-w-5xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
      />
    </div>
  );
}

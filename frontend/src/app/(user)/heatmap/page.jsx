"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import FiltersSidebar from "./FiltersSidebar";

const MapContainer = dynamic(() => import("./MapContainer"), {
  ssr: false,
});

export default function HeatmapPage() {
  const [filters, setFilters] = useState({
    languageType: "all",
    cluster: "all",
    locality: "all",
    confidence: [0, 100],
  });

  return (
    <div className="flex w-full pt-10 h-screen">
      <FiltersSidebar filters={filters} setFilters={setFilters} />

      <div className="flex-1">
        <MapContainer filters={filters} />
      </div>
    </div>
  );
}

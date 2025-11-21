"use client";

export default function FiltersSidebar({ filters, setFilters }) {
  return (
    <div className="z-10 w-72 border-r border-white/20 shadow-xl p-4 flex flex-col gap-6 overflow-y-auto text-white mt-20 ml-10 ">
      <h2 className="text-2xl font-bold">Filters</h2>

      {/* Language Type */}
      <div>
        <label className="font-semibold">Language Type</label>
        <select
          className="w-full mt-1 p-2 rounded-md bg-white/20 text-white border border-white/30 focus:outline-none"
          value={filters.languageType}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, languageType: e.target.value }))
          }
        >
          <option className="bg-gray-900" value="all">All</option>
          <option className="bg-gray-900" value="known">Known Languages</option>
          <option className="bg-gray-900" value="unknown">Unknown / New Dialects</option>
        </select>
      </div>

      {/* Cluster */}
      <div>
        <label className="font-semibold">Cluster (DBSCAN)</label>
        <select
          className="w-full mt-1 p-2 rounded-md bg-white/20 text-white border border-white/30 focus:outline-none"
          value={filters.cluster}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, cluster: e.target.value }))
          }
        >
          <option className="bg-gray-900" value="all">All Clusters</option>
          <option className="bg-gray-900" value="-1">Noise / Outliers</option>
          <option className="bg-gray-900" value="0">Cluster 0</option>
          <option className="bg-gray-900" value="1">Cluster 1</option>
          <option className="bg-gray-900" value="2">Cluster 2</option>
        </select>
      </div>

      {/* Locality */}
      <div>
        <label className="font-semibold">Locality</label>
        <select
          className="w-full mt-1 p-2 rounded-md bg-white/20 text-white border border-white/30 focus:outline-none"
          value={filters.locality}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, locality: e.target.value }))
          }
        >
          <option className="bg-gray-900" value="all">All</option>
          <option className="bg-gray-900" value="Karnataka">Karnataka</option>
          <option className="bg-gray-900" value="Tamil Nadu">Tamil Nadu</option>
          <option className="bg-gray-900" value="Assam">Assam</option>
        </select>
      </div>

      {/* Confidence Slider */}
      <div>
        <label className="font-semibold">Whisper Confidence</label>
        <input
          type="range"
          min="0"
          max="100"
          value={filters.confidence[0]}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              confidence: [parseInt(e.target.value), prev.confidence[1]],
            }))
          }
          className="w-full mt-2 accent-white"
        />
        <p className="text-sm mt-1">
          Min Confidence: {filters.confidence[0]}%
        </p>
      </div>
    </div>
  );
}

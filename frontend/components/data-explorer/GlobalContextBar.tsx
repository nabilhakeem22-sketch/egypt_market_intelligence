"use client";

import { Calendar, MapPin, ChevronDown, DollarSign, Users, Activity } from "lucide-react";

interface GlobalContextBarProps {
    districts: string[];
    selectedDistricts: string[];
    onDistrictChange: (district: string) => void;
    timePeriod: string;
    onTimePeriodChange: (period: string) => void;
    densityFilter: string[];
    onDensityChange: (density: string) => void;
    trafficFilter: number;
    onTrafficChange: (traffic: number) => void;
    viewMode: "explore" | "compare";
    onViewModeChange: (mode: "explore" | "compare") => void;
    industry: string;
    onIndustryChange: (industry: string) => void;
    rentRange: number[];
    onRentRangeChange: (range: number[]) => void;
}

type FilterType = "time" | "location" | "density" | "traffic" | "rent";

const FILTER_CONFIG: Record<string, FilterType[]> = {
    "Retail": ["time", "location", "density", "traffic", "rent"],
    "F&B": ["time", "location", "density", "traffic", "rent"],
    "Real Estate": ["time", "location", "rent", "density"], // No traffic
    "Logistics": ["time", "location", "rent"], // Minimal
    "Technology": ["time", "location"]
};

export default function GlobalContextBar({
    districts, selectedDistricts, onDistrictChange,
    timePeriod, onTimePeriodChange,
    densityFilter, onDensityChange,
    trafficFilter, onTrafficChange,
    viewMode, onViewModeChange,
    industry, onIndustryChange,
    rentRange, onRentRangeChange
}: GlobalContextBarProps) {
    const INDUSTRIES = ["Retail", "F&B", "Real Estate", "Logistics", "Technology"];

    // Get active filters for current industry (default to Retail if not found)
    const activeFilters = FILTER_CONFIG[industry] || FILTER_CONFIG["Retail"];

    return (
        <div className="w-full bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 p-4 flex justify-between items-center px-8 shadow-sm z-20 relative">

            {/* Left: Industry & View Toggle */}
            <div className="flex items-center gap-4">
                {/* Industry Switcher */}
                <div className="relative group">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                        <span className="text-blue-400 dark:text-blue-500 uppercase text-[10px] tracking-wider font-bold">In</span>
                        {industry || "Select Industry"}
                        <ChevronDown className="w-4 h-4 text-blue-400" />
                    </button>
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 hidden group-hover:block p-1 z-50">
                        {INDUSTRIES.map((ind) => (
                            <button
                                key={ind}
                                onClick={() => onIndustryChange(ind)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${industry === ind
                                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-semibold"
                                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                                    }`}
                            >
                                {ind}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700 mx-2"></div>

                {/* View Toggle */}
                <div className="flex bg-zinc-100 dark:bg-zinc-700/50 p-1 rounded-lg">
                    <button
                        onClick={() => onViewModeChange("explore")}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === "explore"
                            ? "bg-white dark:bg-zinc-600 shadow-sm text-blue-600 dark:text-blue-400"
                            : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                            }`}
                    >
                        Explore
                    </button>
                    <button
                        onClick={() => onViewModeChange("compare")}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === "compare"
                            ? "bg-white dark:bg-zinc-600 shadow-sm text-pink-600 dark:text-pink-400"
                            : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                            }`}
                    >
                        Compare
                    </button>
                </div>
            </div>

            {/* Right: Dynamic Filters */}
            {viewMode === "explore" && (
                <div className="flex items-center gap-4">
                    {activeFilters.includes("time") && (
                        <FilterButton
                            icon={Calendar}
                            label={timePeriod}
                            active={true}
                        >
                            <div className="p-1">
                                {["Last 30 Days", "Q4 2025", "Year to Date"].map((period) => (
                                    <button
                                        key={period}
                                        onClick={() => onTimePeriodChange(period)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm ${timePeriod === period
                                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                                            }`}
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                        </FilterButton>
                    )}

                    {activeFilters.includes("location") && (
                        <FilterButton
                            icon={MapPin}
                            label={selectedDistricts.length > 0 ? `${selectedDistricts.length} Selected` : "All Locations"}
                            active={selectedDistricts.length > 0}
                        >
                            <div className="p-1 max-h-80 overflow-y-auto w-64">
                                {districts.map((district) => (
                                    <label
                                        key={district}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/50 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedDistricts.includes(district)}
                                            onChange={() => onDistrictChange(district)}
                                            className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-zinc-700 dark:text-zinc-300">{district}</span>
                                    </label>
                                ))}
                            </div>
                        </FilterButton>
                    )}

                    {activeFilters.includes("rent") && (
                        <FilterButton
                            icon={DollarSign}
                            label={`Rent: ${rentRange[0]} - ${rentRange[1]}`}
                            active={rentRange[0] > 0 || rentRange[1] < 1000}
                        >
                            <div className="p-4 w-64 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-500">Price Range (EGP/sqm)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={rentRange[0]}
                                            onChange={(e) => onRentRangeChange([Number(e.target.value), rentRange[1]])}
                                            className="w-full text-xs p-1 border rounded"
                                        />
                                        <span className="text-zinc-400">-</span>
                                        <input
                                            type="number"
                                            value={rentRange[1]}
                                            onChange={(e) => onRentRangeChange([rentRange[0], Number(e.target.value)])}
                                            className="w-full text-xs p-1 border rounded"
                                        />
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="5000"
                                        step="100"
                                        value={rentRange[1]}
                                        onChange={(e) => onRentRangeChange([rentRange[0], Number(e.target.value)])}
                                        className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700"
                                    />
                                </div>
                            </div>
                        </FilterButton>
                    )}

                    {activeFilters.includes("density") && (
                        <FilterButton
                            icon={Activity}
                            label="Density"
                            count={densityFilter.length}
                            active={densityFilter.length > 0}
                        >
                            <div className="p-1">
                                {["High", "Medium", "Low"].map((level) => (
                                    <label
                                        key={level}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/50 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={densityFilter.includes(level)}
                                            onChange={() => onDensityChange(level)}
                                            className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-zinc-700 dark:text-zinc-300">{level}</span>
                                    </label>
                                ))}
                            </div>
                        </FilterButton>
                    )}

                    {activeFilters.includes("traffic") && (
                        <FilterButton
                            icon={Users}
                            label={`Traffic ${trafficFilter > 0 ? `> ${trafficFilter}` : "All"}`}
                            active={trafficFilter > 0}
                        >
                            <div className="p-4 w-64">
                                <label className="block text-xs font-medium text-zinc-500 mb-2">Min Traffic Score: {trafficFilter}</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="1"
                                    value={trafficFilter}
                                    onChange={(e) => onTrafficChange(Number(e.target.value))}
                                    className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700"
                                />
                                <div className="flex justify-between text-xs text-zinc-400 mt-1">
                                    <span>0</span>
                                    <span>10</span>
                                </div>
                            </div>
                        </FilterButton>
                    )}
                </div>
            )}
        </div>
    );
}

// Reusable Filter Button Component
function FilterButton({ icon: Icon, label, children, active = false, count = 0 }: any) {
    return (
        <div className="relative group">
            <button className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${active
                    ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                    : "bg-zinc-100 dark:bg-zinc-700/50 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-600"
                }`}>
                <Icon className={`w-4 h-4 ${active ? "text-blue-500" : "text-zinc-500"}`} />
                {label}
                {count > 0 && <span className="bg-blue-500 text-white text-xs px-1.5 rounded-full">{count}</span>}
                <ChevronDown className={`w-4 h-4 ${active ? "text-blue-400" : "text-zinc-400"}`} />
            </button>
            <div className="absolute top-full right-0 mt-2 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 hidden group-hover:block z-50 min-w-[200px]">
                {children}
            </div>
        </div>
    );
}

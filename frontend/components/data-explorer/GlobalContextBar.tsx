"use client";

import { Calendar, MapPin, ChevronDown } from "lucide-react";

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
}

export default function GlobalContextBar({
    districts,
    selectedDistricts,
    onDistrictChange,
    timePeriod,
    onTimePeriodChange,
    densityFilter,
    onDensityChange,
    trafficFilter,
    onTrafficChange
}: GlobalContextBarProps) {
    return (
        <div className="w-full bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 p-4 flex justify-center items-center gap-4 shadow-sm z-20 relative">
            {/* Time Period Filter */}
            <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-700/50 rounded-full text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors">
                    <Calendar className="w-4 h-4 text-zinc-500" />
                    {timePeriod}
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                </button>
                {/* Dropdown (Mock) */}
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 hidden group-hover:block p-1 z-50">
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
            </div>

            {/* Location Filter */}
            <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-700/50 rounded-full text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors">
                    <MapPin className="w-4 h-4 text-zinc-500" />
                    {selectedDistricts.length > 0 ? `${selectedDistricts.length} Selected` : "All Locations"}
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                </button>
                {/* Dropdown */}
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 hidden group-hover:block p-1 z-50 max-h-80 overflow-y-auto">
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
            </div>

            {/* Competitor Density Filter */}
            <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-700/50 rounded-full text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors">
                    <span>Density</span>
                    {densityFilter.length > 0 && <span className="bg-blue-500 text-white text-xs px-1.5 rounded-full">{densityFilter.length}</span>}
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 hidden group-hover:block p-1 z-50">
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
            </div>

            {/* Traffic Score Filter */}
            <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-700/50 rounded-full text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors">
                    <span>Traffic {trafficFilter > 0 ? `> ${trafficFilter}` : "All"}</span>
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 hidden group-hover:block p-4 z-50">
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
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowRightLeft } from "lucide-react";

// Dynamic import for ApexCharts and Map
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface CompareViewProps {
    data: any[]; // Full dataset
    districts: string[]; // All available districts
}

export default function CompareView({ data, districts }: CompareViewProps) {
    // Default to first two districts if available
    const [districtA, setDistrictA] = useState<string>(districts[0] || "");
    const [districtB, setDistrictB] = useState<string>(districts[1] || "");

    const dataA = data.find(d => d.District === districtA) || {};
    const dataB = data.find(d => d.District === districtB) || {};

    // Normalize metrics for Radar Chart (0-100 scale approximation)
    // In a real app, you'd calculate this relative to max values
    const metrics = [
        { label: "Rent Price", key: "Avg_Rent_Sqm_EGP", max: 5000 },
        { label: "Foot Traffic", key: "Foot_Traffic_Score", max: 5000 },
        { label: "Competitors", key: "Competitor_Density", max: 10 }, // If mapped to numeric
    ];

    // Helper to get numeric value safely
    const getValue = (record: any, key: string) => {
        const val = record[key];
        if (typeof val === 'number') return val;
        // Handle "High"/"Medium"/"Low" for density
        if (key === "Competitor_Density") {
            if (val === "High") return 8;
            if (val === "Very High") return 10;
            if (val === "Medium") return 5;
            return 2;
        }
        return 0;
    };

    const series = [
        {
            name: districtA,
            data: metrics.map(m => {
                const raw = getValue(dataA, m.key);
                // Normalize to 0-100 for radar
                return Math.min(100, Math.round((raw / m.max) * 100));
            })
        },
        {
            name: districtB,
            data: metrics.map(m => {
                const raw = getValue(dataB, m.key);
                return Math.min(100, Math.round((raw / m.max) * 100));
            })
        }
    ];

    const options: ApexCharts.ApexOptions = {
        chart: {
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif',
            type: 'radar',
            animations: { enabled: true }
        },
        xaxis: {
            categories: metrics.map(m => m.label),
            labels: {
                style: { colors: ['#6b7280', '#6b7280', '#6b7280'], fontSize: '12px' }
            }
        },
        yaxis: { show: false },
        stroke: { width: 2 },
        fill: { opacity: 0.2 },
        markers: { size: 4 },
        colors: ['#3b82f6', '#ec4899'], // Blue vs Pink
        legend: { position: 'top' }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Control Column */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                        <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                        Compare Districts
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Baseline District</label>
                            <select
                                value={districtA}
                                onChange={(e) => setDistrictA(e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500"
                            >
                                {districts.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        <div className="flex justify-center">
                            <div className="bg-zinc-100 dark:bg-zinc-700 p-2 rounded-full text-zinc-400">
                                <span className="text-xs font-bold">VS</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Target District</label>
                            <select
                                value={districtB}
                                onChange={(e) => setDistrictB(e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-pink-500"
                            >
                                {districts.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Scorecard */}
                <div className="bg-white dark:bg-zinc-800 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500">
                            <tr>
                                <th className="px-4 py-3 text-left">Metric</th>
                                <th className="px-4 py-3 text-right text-blue-600">{districtA.split(' ')[0]}</th>
                                <th className="px-4 py-3 text-right text-pink-600">{districtB.split(' ')[0]}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                            {metrics.map(m => (
                                <tr key={m.key}>
                                    <td className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">{m.label}</td>
                                    <td className="px-4 py-3 text-right font-mono">{getValue(dataA, m.key)}</td>
                                    <td className="px-4 py-3 text-right font-mono">{getValue(dataB, m.key)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Radar Chart Column */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col items-center justify-center">
                <Chart
                    options={options}
                    series={series}
                    type="radar"
                    width="100%"
                    height="400"
                />
                <p className="text-sm text-zinc-400 mt-4 text-center italic">
                    Values normalized to 0-100 scale for comparison.
                </p>
            </div>
        </div>
    );
}

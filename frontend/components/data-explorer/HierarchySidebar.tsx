"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, PieChart, Activity, TrendingUp, DollarSign, Users } from "lucide-react";

interface HierarchySidebarProps {
    selectedMetric: string;
    onSelectMetric: (metric: string) => void;
}

export default function HierarchySidebar({ selectedMetric, onSelectMetric }: HierarchySidebarProps) {
    const [expandedSectors, setExpandedSectors] = useState<string[]>(["Market Indicators", "Operational Metrics"]);

    const toggleSector = (sector: string) => {
        setExpandedSectors(prev =>
            prev.includes(sector)
                ? prev.filter(s => s !== sector)
                : [...prev, sector]
        );
    };

    const tree = [
        {
            name: "Market Indicators",
            icon: PieChart,
            items: [
                { name: "Avg_Rent_Sqm_EGP", label: "Avg Rent (EGP)", icon: DollarSign },
                { name: "Vacancy_Rate", label: "Vacancy Rate", icon: Activity },
            ]
        },
        {
            name: "Operational Metrics",
            icon: TrendingUp,
            items: [
                { name: "Foot_Traffic_Score", label: "Foot Traffic", icon: Users },
                { name: "Competitor_Density", label: "Competitor Density", icon: Users },
            ]
        },
        {
            name: "Macroeconomic Sectors",
            icon: PieChart,
            items: [
                { name: "manufacturing_gdp", label: "Manufacturing (% GDP)", icon: Activity },
                { name: "agriculture_gdp", label: "Agriculture (% GDP)", icon: Activity },
                { name: "services_gdp", label: "Services (% GDP)", icon: Activity },
                { name: "exports_gdp", label: "Exports (% GDP)", icon: Activity },
            ]
        }
    ];

    return (
        <div className="w-64 bg-white dark:bg-zinc-800 border-r border-zinc-200 dark:border-zinc-700 flex flex-col h-full">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Data Hierarchy</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {tree.map((sector) => {
                    const isExpanded = expandedSectors.includes(sector.name);
                    return (
                        <div key={sector.name}>
                            <button
                                onClick={() => toggleSector(sector.name)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 rounded-lg transition-colors"
                            >
                                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                <sector.icon className="w-4 h-4 text-zinc-500" />
                                {sector.name}
                            </button>

                            {isExpanded && (
                                <div className="ml-4 pl-2 border-l border-zinc-200 dark:border-zinc-700 space-y-1 mt-1">
                                    {sector.items.map((item) => (
                                        <button
                                            key={item.name}
                                            onClick={() => onSelectMetric(item.name)}
                                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${selectedMetric === item.name
                                                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium"
                                                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                                                }`}
                                        >
                                            <item.icon className="w-3 h-3 opacity-70" />
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

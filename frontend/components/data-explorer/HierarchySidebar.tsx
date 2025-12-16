"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, PieChart, Activity, TrendingUp, DollarSign, Users } from "lucide-react";
import api from "@/utils/api";

interface HierarchySidebarProps {
    selectedMetric: string;
    onSelectMetric: (metric: string) => void;
    industry: string;
}

const ICON_MAP: any = {
    PieChart, Activity, TrendingUp, DollarSign, Users
};

export default function HierarchySidebar({ selectedMetric, onSelectMetric, industry }: HierarchySidebarProps) {
    const [expandedSectors, setExpandedSectors] = useState<string[]>(["Market Indicators", "Operational Metrics"]);
    const [tree, setTree] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHierarchy = async () => {
            try {
                const res = await api.get("/api/hierarchy");
                setTree(res.data.tree);
            } catch (error) {
                console.error("Failed to fetch hierarchy", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHierarchy();
    }, []);

    const toggleSector = (sector: string) => {
        setExpandedSectors(prev =>
            prev.includes(sector)
                ? prev.filter(s => s !== sector)
                : [...prev, sector]
        );
    };

    if (loading) return <div className="w-64 p-4 text-xs text-zinc-500">Loading hierarchy...</div>;

    return (
        <div className="w-64 bg-white dark:bg-zinc-800 border-r border-zinc-200 dark:border-zinc-700 flex flex-col h-full">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Data Hierarchy</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {tree.map((sector) => {
                    const isExpanded = expandedSectors.includes(sector.name);
                    const SectorIcon = ICON_MAP[sector.icon] || PieChart;

                    // Filter items based on Industry
                    const visibleItems = sector.items.filter((item: any) => {
                        // Logic: Show if no industry defined (universal) OR current industry is in list
                        if (!item.industries || item.industries.length === 0) return true;
                        return item.industries.includes(industry);
                    });

                    // Hide sector if no items visible
                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={sector.name}>
                            <button
                                onClick={() => toggleSector(sector.name)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 rounded-lg transition-colors"
                            >
                                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                <SectorIcon className="w-4 h-4 text-zinc-500" />
                                {sector.name}
                            </button>

                            {isExpanded && (
                                <div className="ml-4 pl-2 border-l border-zinc-200 dark:border-zinc-700 space-y-1 mt-1">
                                    {visibleItems.map((item: any) => {
                                        const ItemIcon = ICON_MAP[item.icon] || Activity;
                                        return (
                                            <button
                                                key={item.name}
                                                onClick={() => onSelectMetric(item.name)}
                                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${selectedMetric === item.name
                                                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium"
                                                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                                                    }`}
                                            >
                                                <ItemIcon className="w-3 h-3 opacity-70" />
                                                {item.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

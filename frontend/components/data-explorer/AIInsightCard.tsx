"use client";

import { useState, useEffect } from "react";
import { Sparkles, Bot } from "lucide-react";
import axios from "axios";
import { useDashboard } from "@/context/DashboardContext";

interface AIInsightCardProps {
    metric: string;
    data: any[];
}

export default function AIInsightCard({ metric, data }: AIInsightCardProps) {
    const { filters } = useDashboard();
    const [insight, setInsight] = useState("Analyzing market dynamics...");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!data || data.length === 0) {
            setInsight("Select data to generate insights.");
            return;
        }
        generateInsight();
    }, [data, metric]);

    const generateInsight = async () => {
        setLoading(true);
        try {
            // Create a simple summary of the data for the AI
            const top5 = data.slice(0, 5).map(d => `${d.District}: ${d[metric]}`).join(", ");
            const dataSummary = `Top 5 for ${metric}: ${top5}... (Total rows: ${data.length})`;

            const res = await axios.post("http://localhost:8001/api/ai/insight", {
                filters: filters,
                data_summary: dataSummary
            });
            setInsight(res.data.insight);
        } catch (error) {
            console.error(error);
            setInsight("Could not generate insight at this time.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 shadow-lg text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />

            <div className="relative z-10 flex gap-4">
                <div className={`p-3 bg-white/10 rounded-lg h-fit backdrop-blur-sm ${loading ? 'animate-pulse' : ''}`}>
                    <Bot className="w-6 h-6 text-blue-400" />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">AI Market Analysis</h3>
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Live Insight
                        </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-sm min-h-[40px]">
                        {insight}
                    </p>
                </div>
            </div>
        </div>
    );
}

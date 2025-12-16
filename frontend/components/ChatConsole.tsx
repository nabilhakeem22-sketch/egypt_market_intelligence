"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Calculator, TrendingUp } from "lucide-react";
import api from "@/utils/api";
import { useDashboard } from "@/context/DashboardContext";

interface ChatConsoleProps {
    onDataUpdate: (data: any) => void;
}

export default function ChatConsole({ onDataUpdate }: ChatConsoleProps) {
    const { filters, data: dashboardData } = useDashboard();
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([
        { role: "assistant", content: "Hello! I'm your Egypt Market AI. Ask me about inflation, rent prices, or feasibility." }
    ]);
    const [loading, setLoading] = useState(false);
    const [simulationMode, setSimulationMode] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const formatSourceIds = (text: string) => {
        // Regex to find [Source: ID]
        const parts = text.split(/(\[Source: [^\]]+\])/g);
        return parts.map((part, index) => {
            if (part.startsWith("[Source:")) {
                const sourceId = part.replace("[Source: ", "").replace("]", "");
                return (
                    <span
                        key={index}
                        className="inline-flex items-center mx-1 px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 cursor-pointer hover:underline"
                        title={`Source ID: ${sourceId}`}
                        onClick={() => console.log(`Source clicked: ${sourceId}`)}
                    >
                        {sourceId}
                    </span>
                );
            }
            return part;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            // Prepare Dashboard Context
            const visibleData = Array.isArray(dashboardData) ? dashboardData.slice(0, 50) : []; // Send top 50 rows max
            const dashboardContext = {
                filters: filters,
                visible_data: visibleData
            };

            const res = await api.post(
                "/api/query",
                {
                    text: userMsg.content,
                    dashboard_context: dashboardContext,
                    simulation_mode: simulationMode
                }
            );
            const data = res.data;

            const aiMsg = { role: "assistant", content: data.response };
            setMessages((prev) => [...prev, aiMsg]);

            // Update Dashboard with new context if provided
            if (data.data_context) onDataUpdate(data);
        } catch (error: any) {
            console.error(error);
            let errorMessage = "Sorry, I encountered an error connecting to the brain.";
            if (error.response?.status === 401) {
                errorMessage = "🔒 Authentication failed. Please log in again.";
            }
            setMessages((prev) => [...prev, { role: "assistant", content: errorMessage }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                <h2 className="font-semibold flex items-center gap-2">
                    <Bot className="w-5 h-5 text-blue-600" />
                    AI Consultant
                </h2>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${simulationMode ? "text-purple-600" : "text-zinc-500"}`}>
                        {simulationMode ? "Simulation Mode" : "Standard Mode"}
                    </span>
                    <button
                        onClick={() => setSimulationMode(!simulationMode)}
                        className={`w-10 h-6 rounded-full p-1 transition-colors ${simulationMode ? "bg-purple-600" : "bg-zinc-300 dark:bg-zinc-700"}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${simulationMode ? "translate-x-4" : ""}`} />
                    </button>
                </div>
            </div>

            {simulationMode && (
                <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-xs text-purple-800 dark:text-purple-200 border-b border-purple-100 dark:border-purple-800 flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Scenario Planning Active. Ask "What if..." questions.
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                {messages.map((m, i) => (
                    <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-blue-600" : "bg-emerald-600"}`}>
                            {m.role === "user" ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                        </div>
                        <div className={`p-3 rounded-lg max-w-[85%] text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100" : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"}`}>
                            {m.role === "assistant" ? formatSourceIds(m.content) : m.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 animate-pulse">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm italic text-zinc-500">
                            Analyzing market data...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={simulationMode ? "Ex: What if inflation hits 40%?" : "Ask your analyst..."}
                        className="w-full p-3 pr-12 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button type="submit" disabled={loading} className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}

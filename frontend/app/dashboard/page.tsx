"use client";

import Link from "next/link";
import { MessageSquare, BarChart3, ArrowRight, TrendingUp, Activity } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Welcome back, Investor</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">Here's what's happening in the Egyptian market today.</p>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Inflation Rate</p>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-white">32.5%</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">GDP Growth</p>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-white">3.8%</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                            <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Top Sector</p>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-white">Real Estate</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/dashboard/ai" className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transition-all">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
                            <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">AI Consultant</h3>
                        <p className="text-blue-100 mb-6 max-w-sm">
                            Get personalized investment advice, market analysis, and answers to your questions powered by Gemini.
                        </p>
                        <div className="flex items-center gap-2 font-medium group-hover:gap-3 transition-all">
                            Start Chatting <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                </Link>

                <Link href="/dashboard/data" className="group relative overflow-hidden bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-6">
                            <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Market Data Explorer</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm">
                            Deep dive into rental prices, foot traffic scores, and competitor density across Cairo's districts.
                        </p>
                        <div className="flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400 group-hover:gap-3 transition-all">
                            Explore Data <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}

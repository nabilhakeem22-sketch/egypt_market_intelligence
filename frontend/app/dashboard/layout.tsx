"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, MessageSquare, BarChart3, LogOut, User } from "lucide-react";
import { DashboardProvider } from "@/context/DashboardContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        // Basic auth check
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
        }
        // In a real app, we'd decode the token or fetch user info
        setUsername("Investor");
    }, [router]);

    const handleSignOut = () => {
        localStorage.removeItem("token");
        router.push("/");
    };

    const navItems = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { name: "AI Consultant", href: "/dashboard/ai", icon: MessageSquare },
        { name: "Market Data", href: "/dashboard/data", icon: BarChart3 },
    ];

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-zinc-800 border-r border-zinc-200 dark:border-zinc-700 flex flex-col">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                        Egypt AI
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
                            <User className="w-4 h-4 text-zinc-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                {username}
                            </p>
                            <p className="text-xs text-zinc-500 truncate">Pro Plan</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden relative">
                <DashboardProvider>
                    {children}
                </DashboardProvider>
            </main>
        </div>
    );
}

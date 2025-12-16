"use client";

import ChatConsole from "@/components/ChatConsole";
import DynamicDashboard from "@/components/DynamicDashboard";
import { useDashboard } from "@/context/DashboardContext";

export default function AIPage() {
    const { data, setData } = useDashboard();

    return (
        <div className="h-[calc(100vh-64px)] flex overflow-hidden">
            {/* Left Panel: Chat Console */}
            <div className="w-1/3 min-w-[400px] border-r border-zinc-200 dark:border-zinc-800 h-full">
                <ChatConsole onDataUpdate={(newData) => setData(newData)} />
            </div>

            {/* Right Panel: Dynamic Dashboard */}
            <div className="flex-1 h-full bg-zinc-50 dark:bg-black relative">
                <DynamicDashboard data={data} />
            </div>
        </div>
    );
}

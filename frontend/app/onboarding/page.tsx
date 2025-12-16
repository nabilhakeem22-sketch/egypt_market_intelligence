"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Building2, ShoppingBag, Utensils, Laptop, Briefcase } from "lucide-react";

const INDUSTRIES = [
    { id: "Real Estate", label: "Real Estate", icon: Building2 },
    { id: "Retail", label: "Retail", icon: ShoppingBag },
    { id: "F&B", label: "Food & Beverage", icon: Utensils },
    { id: "Technology", label: "Technology", icon: Laptop },
    { id: "General", label: "General Investment", icon: Briefcase },
];

export default function OnboardingPage() {
    const [selectedIndustry, setSelectedIndustry] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleContinue = async () => {
        if (!selectedIndustry) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "http://localhost:8000/api/profile",
                { industry: selectedIndustry },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            router.push("/dashboard");
        } catch (err) {
            console.error("Failed to update profile", err);
            // Fallback to dashboard anyway
            router.push("/dashboard");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-6">
            <div className="w-full max-w-2xl space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight">Tailor Your Experience</h1>
                    <p className="text-xl text-zinc-500 dark:text-zinc-400">
                        Select your primary industry to get customized AI insights.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {INDUSTRIES.map((ind) => {
                        const Icon = ind.icon;
                        const isSelected = selectedIndustry === ind.id;
                        return (
                            <button
                                key={ind.id}
                                onClick={() => setSelectedIndustry(ind.id)}
                                className={`p-6 rounded-2xl border-2 text-left transition-all ${isSelected
                                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-black"
                                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
                                    }`}
                            >
                                <Icon className={`w-8 h-8 mb-4 ${isSelected ? "text-blue-600" : "text-zinc-400"}`} />
                                <div className={`font-semibold ${isSelected ? "text-blue-700 dark:text-blue-400" : "text-zinc-900 dark:text-zinc-100"}`}>
                                    {ind.label}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="flex justify-center pt-8">
                    <button
                        onClick={handleContinue}
                        disabled={!selectedIndustry || loading}
                        className={`px-8 py-4 rounded-full font-bold text-lg transition-all ${!selectedIndustry || loading
                                ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-500 text-white hover:scale-105 shadow-lg shadow-blue-600/20"
                            }`}
                    >
                        {loading ? "Personalizing..." : "Continue to Dashboard"}
                    </button>
                </div>
            </div>
        </div>
    );
}

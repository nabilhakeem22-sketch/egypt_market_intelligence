import { Filter, Check } from "lucide-react";

interface AttributeFilterProps {
    confidence: string[];
    onConfidenceChange: (val: string) => void;
    verifiedOnly: boolean;
    onVerifiedChange: (val: boolean) => void;
}

export default function AttributeFilter({
    confidence,
    onConfidenceChange,
    verifiedOnly,
    onVerifiedChange
}: AttributeFilterProps) {
    return (
        <div className="relative group">
            <button className="p-2 text-zinc-500 hover:text-blue-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                <Filter className="w-5 h-5" />
            </button>

            <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 hidden group-hover:block p-4 z-50">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase mb-3">Data Quality</h3>

                {/* Confidence Score */}
                <div className="mb-4">
                    <label className="text-xs text-zinc-400 mb-2 block">Confidence Score</label>
                    <div className="flex gap-2">
                        {["High", "Medium", "Low"].map(score => (
                            <button
                                key={score}
                                onClick={() => onConfidenceChange(score)}
                                className={`px-2 py-1 text-xs rounded-md border transition-colors ${confidence.includes(score)
                                        ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
                                        : "border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                                    }`}
                            >
                                {score}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Verified Source */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Verified Sources Only</span>
                    <button
                        onClick={() => onVerifiedChange(!verifiedOnly)}
                        className={`w-10 h-6 rounded-full transition-colors relative ${verifiedOnly ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-700"
                            }`}
                    >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${verifiedOnly ? "translate-x-4" : ""
                            }`} />
                    </button>
                </div>
            </div>
        </div>
    );
}

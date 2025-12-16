"use client";

import { useState } from "react";
import {
    BarChart3,
    Table as TableIcon,
    LineChart as LineChartIcon,
    Download,
    PieChart,
    Activity,
    Radar
} from "lucide-react";
import dynamic from "next/dynamic";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Dynamic import for ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type ChartType = "bar" | "line" | "area" | "pie" | "donut" | "radar";

interface HybridChartCardProps {
    data: any[];
    metric: string;
}

export default function HybridChartCard({ data, metric }: HybridChartCardProps) {
    // Ensure data is always an array
    const safeData = data ?? [];
    const [activeTab, setActiveTab] = useState<"chart" | "table">("chart");
    const [chartType, setChartType] = useState<ChartType>("bar");

    const metricLabel = metric.replace(/_/g, " ");

    const downloadCSV = () => {
        const headers = ["District", metricLabel];
        const csvContent = [
            headers.join(","),
            ...safeData.map(row => `${row.District},${row[metric]}`)
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `market_data_${metric}.csv`);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.text(`Market Data Report: ${metricLabel}`, 14, 15);

        autoTable(doc, {
            head: [["District", metricLabel]],
            body: safeData.map(row => [row.District, row[metric]]),
            startY: 20,
        });

        doc.save(`market_data_${metric}.pdf`);
    };

    // Prepare Data
    const categories = safeData.map(d => d.District);
    const rawSeriesData = safeData.map(d => typeof d[metric] === 'number' ? d[metric] : parseFloat(d[metric]));

    // Configure Options & Series based on Chart Type
    const isCircular = chartType === 'pie' || chartType === 'donut';

    // Base Options
    let options: ApexCharts.ApexOptions = {
        chart: {
            id: `chart-${metric}`,
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif',
            foreColor: '#6b7280',
            animations: { enabled: true }
        },
        dataLabels: { enabled: isCircular },
        grid: {
            borderColor: '#374151',
            strokeDashArray: 4,
            yaxis: { lines: { show: !isCircular } },
            xaxis: { lines: { show: !isCircular } }
        },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'],
        tooltip: {
            theme: 'dark',
            y: { formatter: (val) => `${val}` }
        }
    };

    // Specific Chart Logic
    let series: any = [];

    if (isCircular) {
        // Pie / Donut
        options = {
            ...options,
            labels: categories,
            plotOptions: {
                pie: {
                    donut: {
                        size: '65%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Total',
                                color: '#9ca3af',
                            }
                        }
                    }
                }
            },
            legend: { position: 'bottom' }
        };
        series = rawSeriesData; // Simple array for pie/donut
    } else {
        // XY Charts (Bar, Line, Area, Radar)
        options = {
            ...options,
            xaxis: {
                categories: categories,
                axisBorder: { show: false },
                axisTicks: { show: false },
                labels: { style: { colors: '#6b7280', fontSize: '12px' } }
            },
            yaxis: {
                labels: { style: { colors: '#6b7280', fontSize: '12px' } }
            },
            stroke: {
                curve: chartType === 'line' || chartType === 'area' ? 'smooth' : 'straight',
                width: chartType === 'area' ? 2 : (chartType === 'line' || chartType === 'radar' ? 3 : 0)
            },
            fill: {
                opacity: chartType === 'area' || chartType === 'radar' ? 0.2 : 1
            },
        };

        series = [{
            name: metricLabel,
            data: rawSeriesData
        }];
    }

    return (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden flex flex-col h-[550px]">
            {/* Header & Tabs */}
            <div className="border-b border-zinc-200 dark:border-zinc-700 flex flex-col gap-2 p-4 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">{metricLabel}</h3>

                    <div className="flex gap-1 bg-zinc-200 dark:bg-zinc-800 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab("chart")}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === "chart"
                                ? "bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400"
                                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                }`}
                        >
                            Chart
                        </button>
                        <button
                            onClick={() => setActiveTab("table")}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === "table"
                                ? "bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400"
                                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                }`}
                        >
                            Table
                        </button>
                    </div>
                </div>

                {/* Toolbar */}
                {activeTab === "chart" && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {[
                            { id: "bar", icon: BarChart3, label: "Bar" },
                            { id: "line", icon: LineChartIcon, label: "Line" },
                            { id: "area", icon: Activity, label: "Area" },
                            { id: "pie", icon: PieChart, label: "Pie" },
                            { id: "donut", icon: PieChart, label: "Donut" },
                            { id: "radar", icon: Radar, label: "Radar" },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setChartType(t.id as ChartType)}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${chartType === t.id
                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                    }`}
                            >
                                <t.icon className="w-3.5 h-3.5" />
                                {t.label}
                            </button>
                        ))}
                    </div>
                )}

                {activeTab === "table" && (
                    <div className="flex gap-2">
                        <button onClick={downloadCSV} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-800 rounded-md hover:bg-zinc-200">
                            <Download className="w-3.5 h-3.5" /> CSV
                        </button>
                        <button onClick={downloadPDF} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-800 rounded-md hover:bg-zinc-200">
                            <Download className="w-3.5 h-3.5" /> PDF
                        </button>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 overflow-hidden relative">
                {activeTab === "chart" ? (
                    <div className="h-full w-full">
                        <Chart
                            options={options}
                            series={series}
                            type={chartType}
                            width="100%"
                            height="100%"
                        />
                    </div>
                ) : (
                    <div className="h-full overflow-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3">{metric.includes("_gdp") ? "Year" : "District"}</th>
                                    <th className="px-6 py-3">{metricLabel}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                {safeData.map((row, i) => (
                                    <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
                                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{row.District}</td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{row[metric]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

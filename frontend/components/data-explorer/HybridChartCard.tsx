"use client";

import { useState } from "react";
import { BarChart3, Table as TableIcon, LineChart as LineChartIcon, Download } from "lucide-react";
import dynamic from "next/dynamic";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Dynamic import for ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface HybridChartCardProps {
    data: any[];
    metric: string;
}

export default function HybridChartCard({ data, metric }: HybridChartCardProps) {
    // Ensure data is always an array
    const safeData = data ?? [];
    const [activeTab, setActiveTab] = useState<"chart" | "table">("chart");
    const [chartType, setChartType] = useState<"bar" | "line">("bar");

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

    // Prepare Chart Data
    const categories = safeData.map(d => d.District);
    const seriesData = safeData.map(d => typeof d[metric] === 'number' ? d[metric] : parseFloat(d[metric]));

    // Determine curve style based on chart type
    // 'smooth' looks good for lines, 'straight' for bars (though bars don't use stroke curve usually)
    const curveType = chartType === 'line' ? 'smooth' : 'straight';

    const options: ApexCharts.ApexOptions = {
        chart: {
            id: `chart-${metric}`,
            toolbar: { show: false },
            type: chartType,
            fontFamily: 'Inter, sans-serif',
            foreColor: '#6b7280' // zinc-500
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: '60%',
            }
        },
        dataLabels: { enabled: false },
        stroke: {
            curve: curveType as any,
            width: chartType === 'line' ? 3 : 0
        },
        xaxis: {
            categories: categories,
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                style: {
                    colors: '#6b7280',
                    fontSize: '12px'
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#6b7280',
                    fontSize: '12px'
                }
            }
        },
        grid: {
            borderColor: '#374151',
            strokeDashArray: 4,
            yaxis: { lines: { show: true } },
        },
        colors: [chartType === 'line' ? '#3b82f6' : '#3b82f6'],
        tooltip: {
            theme: 'dark',
            y: {
                formatter: (val) => `${val}`
            }
        }
    };

    const series = [{
        name: metricLabel,
        data: seriesData
    }];

    return (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden flex flex-col h-[500px]">
            {/* Header & Tabs */}
            <div className="border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between px-4 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="flex gap-1">
                    <button
                        onClick={() => setActiveTab("chart")}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "chart"
                            ? "border-blue-600 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                            }`}
                    >
                        <BarChart3 className="w-4 h-4" />
                        Visual Trend
                    </button>
                    <button
                        onClick={() => setActiveTab("table")}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "table"
                            ? "border-blue-600 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                            }`}
                    >
                        <TableIcon className="w-4 h-4" />
                        Data Table
                    </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {activeTab === "table" && (
                        <>
                            <button onClick={downloadCSV} className="p-2 text-zinc-500 hover:text-blue-600 transition-colors" title="Download CSV">
                                <Download className="w-4 h-4" />
                            </button>
                            <button onClick={downloadPDF} className="p-2 text-zinc-500 hover:text-red-600 transition-colors" title="Download PDF">
                                <span className="text-xs font-bold">PDF</span>
                            </button>
                        </>
                    )}

                    {/* Chart Controls (Only visible in Chart tab) */}
                    {activeTab === "chart" && (
                        <div className="flex bg-zinc-200 dark:bg-zinc-700 rounded-lg p-1">
                            <button
                                onClick={() => setChartType("bar")}
                                className={`p-1.5 rounded-md transition-all ${chartType === "bar" ? "bg-white dark:bg-zinc-600 shadow-sm" : "text-zinc-500"
                                    }`}
                            >
                                <BarChart3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setChartType("line")}
                                className={`p-1.5 rounded-md transition-all ${chartType === "line" ? "bg-white dark:bg-zinc-600 shadow-sm" : "text-zinc-500"
                                    }`}
                            >
                                <LineChartIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-hidden relative">
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

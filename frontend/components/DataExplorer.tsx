"use client";

import { useState, useEffect } from "react";
import api from "@/utils/api";
import GlobalContextBar from "./data-explorer/GlobalContextBar";
import HierarchySidebar from "./data-explorer/HierarchySidebar";
import AIInsightCard from "./data-explorer/AIInsightCard";
import HybridChartCard from "./data-explorer/HybridChartCard";
import CompareView from "./data-explorer/CompareView";
import { useDashboard } from "@/context/DashboardContext";

export default function DataExplorer() {
    const { filters, setFilters, setDistricts: setContextDistricts, setMetric: setContextMetric, data, setData, loading, setLoading } = useDashboard();
    const [districts, setDistricts] = useState<string[]>([]); // List of available districts
    const [viewMode, setViewMode] = useState<"explore" | "compare">("explore");

    // Destructure filters for easier access
    const { districts: selectedDistricts, timePeriod, density: densityFilter, traffic: trafficFilter, metric: selectedMetric } = filters;

    useEffect(() => {
        fetchDistricts();
        if (!data) fetchData(); // Only fetch if no data in context
    }, []);

    // Re-fetch when filters OR metric changes
    useEffect(() => {
        fetchData();
    }, [selectedDistricts, selectedMetric, densityFilter, trafficFilter]);

    const fetchDistricts = async () => {
        try {
            const res = await api.get("/api/districts");
            setDistricts(res.data.districts);
        } catch (error) {
            console.error("Failed to fetch districts", error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const isMacro = ["manufacturing_gdp", "agriculture_gdp", "services_gdp", "exports_gdp"].includes(selectedMetric);

            if (isMacro) {
                const res = await api.get("/api/macro/sectors");
                const sectorData = res.data.sectors.find((s: any) => s.name === selectedMetric);
                if (sectorData) {
                    setData(sectorData.data.map((d: any) => ({ ...d, District: d.year, [selectedMetric]: d.value })));
                }
            } else {
                const apiFilters: any = {};
                // In compare mode, we might want to fetch everything to allow client-side comparison selector
                // But for now, respect filters if in explore mode
                if (viewMode === "explore") {
                    if (selectedDistricts.length > 0) apiFilters.districts = selectedDistricts;
                    if (densityFilter.length > 0) apiFilters.competitor_density = densityFilter;
                    if (trafficFilter > 0) apiFilters.min_traffic = trafficFilter;
                }

                const res = await api.post(
                    "/api/data",
                    { filters: apiFilters }
                );
                setData(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleDistrict = (district: string) => {
        setContextDistricts(
            selectedDistricts.includes(district)
                ? selectedDistricts.filter((d: string) => d !== district)
                : [...selectedDistricts, district]
        );
    };

    const toggleDensity = (density: string) => {
        setFilters({
            ...filters,
            density: densityFilter.includes(density)
                ? densityFilter.filter((d: string) => d !== density)
                : [...densityFilter, density]
        });
    };

    const setTimePeriod = (tp: string) => setFilters({ ...filters, timePeriod: tp });
    const setTrafficFilter = (tf: number) => setFilters({ ...filters, traffic: tf });
    const setSelectedMetric = (m: string) => setContextMetric(m);

    return (
        <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-900">
            {/* 1. Global Context Bar (Header) */}
            <GlobalContextBar
                districts={districts}
                selectedDistricts={selectedDistricts}
                onDistrictChange={toggleDistrict}
                timePeriod={timePeriod}
                onTimePeriodChange={setTimePeriod}
                densityFilter={densityFilter}
                onDensityChange={toggleDensity}
                trafficFilter={trafficFilter}
                onTrafficChange={setTrafficFilter}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            <div className="flex flex-1 overflow-hidden">
                {/* 2. Hierarchy Sidebar (Only show in Explore mode, or keep it to switch context?) */}
                {/* Let's keep it but maybe it's less relevant in Compare mode. For now, keep it. */}
                <HierarchySidebar
                    selectedMetric={selectedMetric}
                    onSelectMetric={setSelectedMetric}
                />

                {/* Main Content Area */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6">

                    {viewMode === "explore" ? (
                        <>
                            {/* 3. AI Insight Card */}
                            <AIInsightCard
                                metric={selectedMetric}
                                data={data}
                            />

                            {/* 4. Hybrid Chart Card */}
                            <HybridChartCard
                                data={data}
                                metric={selectedMetric}
                            />
                        </>
                    ) : (
                        /* Compare View */
                        <CompareView
                            data={data}
                            districts={districts}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

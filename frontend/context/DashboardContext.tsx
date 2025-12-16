"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface DashboardFilters {
    districts: string[];
    timePeriod: string;
    density: string[];
    traffic: number;
    metric: string;
    industry: string;
    rentRange: number[]; // [min, max]
}

interface DashboardContextType {
    filters: DashboardFilters;
    setFilters: (filters: DashboardFilters) => void;
    // Helper setters for convenience
    setDistricts: (districts: string[]) => void;
    setMetric: (metric: string) => void;
    setIndustry: (industry: string) => void;
    setRentRange: (range: number[]) => void;

    data: any;
    setData: (data: any) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const [filters, setFilters] = useState<DashboardFilters>({
        districts: [],
        timePeriod: "Last 30 Days",
        density: [],
        traffic: 0,
        metric: "Avg_Rent_Sqm_EGP",
        industry: "Retail", // Default
        rentRange: [0, 1000] // Default range [0, 1000] EGP
    });
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const setDistricts = (districts: string[]) => setFilters(prev => ({ ...prev, districts }));
    const setMetric = (metric: string) => setFilters(prev => ({ ...prev, metric }));
    const setIndustry = (industry: string) => setFilters(prev => ({ ...prev, industry }));
    const setRentRange = (range: number[]) => setFilters(prev => ({ ...prev, rentRange: range }));

    return (
        <DashboardContext.Provider value={{ filters, setFilters, setDistricts, setMetric, setIndustry, setRentRange, data, setData, loading, setLoading }}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error("useDashboard must be used within a DashboardProvider");
    }
    return context;
}

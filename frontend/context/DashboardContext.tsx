"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface DashboardFilters {
    districts: string[];
    timePeriod: string;
    density: string[];
    traffic: number;
    metric: string;
}

interface DashboardContextType {
    filters: DashboardFilters;
    setFilters: (filters: DashboardFilters) => void;
    // Helper setters for convenience
    setDistricts: (districts: string[]) => void;
    setMetric: (metric: string) => void;

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
        metric: "Avg_Rent_Sqm_EGP"
    });
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const setDistricts = (districts: string[]) => setFilters(prev => ({ ...prev, districts }));
    const setMetric = (metric: string) => setFilters(prev => ({ ...prev, metric }));

    return (
        <DashboardContext.Provider value={{ filters, setFilters, setDistricts, setMetric, data, setData, loading, setLoading }}>
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

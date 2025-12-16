"use client";

import { Card, Title, Text } from "@tremor/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

interface DashboardProps {
    data: any;
}

export default function DynamicDashboard({ data }: DashboardProps) {
    if (!data) {
        return (
            <div className="flex items-center justify-center h-full text-zinc-400">
                <div className="text-center">
                    <p className="text-lg font-medium">Ready to Analyze</p>
                    <p className="text-sm">Ask a question to see live market data.</p>
                </div>
            </div>
        );
    }

    const { intent, data_context } = data;

    return (
        <div className="p-6 h-full overflow-y-auto bg-zinc-50 dark:bg-black space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Live Market Intelligence</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${intent === "HYBRID" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                    {intent} MODE
                </span>
            </div>

            {/* MACRO SECTION */}
            {(intent === "MACRO" || intent === "HYBRID") && data_context?.macro && (
                <div className="grid grid-cols-1 gap-4">
                    <Card>
                        <Title>Inflation Trend (CPI)</Title>
                        <div className="h-64 mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data_context.macro.inflation?.trend || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="year" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} name="Inflation %" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card>
                        <Title>GDP Growth</Title>
                        <div className="h-64 mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data_context.macro.gdp_growth?.trend || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="year" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} name="GDP Growth %" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            )}

            {/* MICRO SECTION */}
            {(intent === "MICRO" || intent === "HYBRID") && data_context?.micro && (
                <div className="grid grid-cols-1 gap-4">
                    <Card>
                        <Title>Local Market Data (Proprietary)</Title>
                        <div className="h-80 mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data_context.micro}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="District" />
                                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="Avg_Rent_Sqm_EGP" fill="#8884d8" name="Rent (EGP/sqm)" />
                                    <Bar yAxisId="right" dataKey="Foot_Traffic_Score" fill="#82ca9d" name="Foot Traffic (1-10)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

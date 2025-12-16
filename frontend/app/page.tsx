"use client";

import Link from "next/link";
import { ArrowRight, BarChart2, Globe, ShieldCheck, Check } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500 selection:text-white">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <BarChart2 className="w-5 h-5 text-white" />
                        </div>
                        <span>EgyptAI</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                            Log in
                        </Link>
                        <Link
                            href="/signup"
                            className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-black to-black" />
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-blue-400 mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Live Market Data 2025
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                        Unlock Egypt's <br /> Market Potential
                    </h1>
                    <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
                        The first AI-powered intelligence platform combining World Bank macro indicators with hyper-local field data.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/signup"
                            className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-medium transition-all hover:scale-105"
                        >
                            Start Free Trial
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/login"
                            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-full font-medium transition-all"
                        >
                            View Demo
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 border-t border-white/10 bg-zinc-950">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Globe className="w-6 h-6 text-blue-400" />}
                            title="Macro Insights"
                            description="Real-time integration with World Bank API for GDP, inflation, and interest rate trends."
                        />
                        <FeatureCard
                            icon={<BarChart2 className="w-6 h-6 text-purple-400" />}
                            title="Micro Data"
                            description="Proprietary field surveys covering rental prices, foot traffic, and competitor density in Cairo."
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="w-6 h-6 text-emerald-400" />}
                            title="Trusted Sources"
                            description="Verified data from official and proprietary sources."
                        />
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-24 border-t border-white/10 bg-black">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
                        <p className="text-zinc-400">Choose the plan that fits your investment needs.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Starter */}
                        <PricingCard
                            title="Starter"
                            price="Free"
                            description="Perfect for students and casual market observers."
                            features={[
                                "Macro Economic Indicators",
                                "5 AI Queries per day",
                                "Standard Support",
                                "Community Access"
                            ]}
                            cta="Get Started"
                            ctaLink="/signup"
                        />

                        {/* Professional */}
                        <PricingCard
                            title="Professional"
                            price="EGP 499"
                            period="/mo"
                            description="For serious investors and SMEs needing granular data."
                            features={[
                                "Everything in Starter",
                                "Full Micro Data (Rent, Traffic)",
                                "Unlimited AI Queries",
                                "District Comparison Tools",
                                "Export Data to CSV"
                            ]}
                            highlight={true}
                            cta="Start Free Trial"
                            ctaLink="/signup"
                        />

                        {/* Enterprise */}
                        <PricingCard
                            title="Enterprise"
                            price="Custom"
                            description="Tailored solutions for large corporations and government."
                            features={[
                                "Everything in Professional",
                                "API Access",
                                "Custom Data Ingestion",
                                "Dedicated Account Manager",
                                "White-label Reports"
                            ]}
                            cta="Contact Sales"
                            ctaLink="#"
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-white/10 text-center text-zinc-500 text-sm">
                <p>© 2025 Egypt Market Intelligence AI. All rights reserved.</p>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
            <div className="mb-4 p-3 bg-white/5 rounded-xl w-fit">{icon}</div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-zinc-400 leading-relaxed">{description}</p>
        </div>
    );
}

function PricingCard({ title, price, period, description, features, highlight, cta, ctaLink }: any) {
    return (
        <div className={`p-8 rounded-3xl border flex flex-col ${highlight ? 'bg-zinc-900 border-blue-500/50 relative' : 'bg-white/5 border-white/10'}`}>
            {highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                </div>
            )}
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold">{price}</span>
                {period && <span className="text-zinc-400">{period}</span>}
            </div>
            <p className="text-zinc-400 mb-8 text-sm">{description}</p>

            <ul className="space-y-4 mb-8 flex-1">
                {features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                        <Check className="w-5 h-5 text-blue-500 shrink-0" />
                        <span className="text-zinc-300">{feature}</span>
                    </li>
                ))}
            </ul>

            <Link href={ctaLink} className={`w-full py-3 rounded-xl font-medium text-center transition-colors ${highlight ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                {cta}
            </Link>
        </div>
    )
}

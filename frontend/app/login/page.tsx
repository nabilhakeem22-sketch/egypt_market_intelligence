"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { Lock, User } from "lucide-react";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await axios.post("http://localhost:8000/api/login", {
                username,
                password,
            });

            localStorage.setItem("token", res.data.access_token);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.response?.data?.detail || "Login failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold">Welcome Back</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Sign in to access market intelligence</p>
                </div>

                {error && (
                    <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Sign In
                    </button>
                </form>

                <div className="text-center text-sm text-zinc-500">
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-blue-600 hover:underline">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}

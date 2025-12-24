import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMissions } from "../services/api";

export default function Dashboard() {
    const { user } = useAuth();
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMissions()
            .then((data) => setMissions(Array.isArray(data) ? data : []))
            .finally(() => setLoading(false));
    }, []);

    const xpForNextLevel = 500;
    const currentLevelXP = user?.xp % xpForNextLevel || 0;
    const xpProgress = (currentLevelXP / xpForNextLevel) * 100;

    // Calculate tier
    const getTier = (level) => {
        if (level >= 50) return { name: "Diamond", color: "text-cyan-300", bg: "bg-cyan-500/20" };
        if (level >= 30) return { name: "Platinum", color: "text-slate-300", bg: "bg-slate-500/20" };
        if (level >= 20) return { name: "Gold", color: "text-yellow-400", bg: "bg-yellow-500/20" };
        if (level >= 10) return { name: "Silver", color: "text-slate-400", bg: "bg-slate-400/20" };
        return { name: "Bronze", color: "text-orange-400", bg: "bg-orange-500/20" };
    };

    const tier = getTier(user?.level || 1);

    return (
        <div className="animate-fadeIn">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    Welcome back, <span className="gradient-text">{user?.username || "Defender"}</span>! 👋
                </h1>
                <p className="text-slate-400">Ready to sharpen your phishing detection skills?</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Level Card */}
                <div className="stat-card">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-400 text-sm">Level</span>
                        <span className={`badge ${tier.bg} ${tier.color}`}>{tier.name}</span>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold gradient-text animate-countUp">{user?.level || 1}</span>
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>{currentLevelXP} XP</span>
                            <span>{xpForNextLevel} XP</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
                                style={{ width: `${xpProgress}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Total XP Card */}
                <div className="stat-card">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-400 text-sm">Total XP</span>
                        <span className="text-lg">⚡</span>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-emerald-400 animate-countUp">{user?.xp || 0}</span>
                    </div>
                    <p className="text-slate-500 text-sm mt-2">Experience Points</p>
                </div>

                {/* Missions Card */}
                <div className="stat-card">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-400 text-sm">Missions</span>
                        <span className="text-lg">🎯</span>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-cyan-400 animate-countUp">{user?.missionsCompleted || 0}</span>
                    </div>
                    <p className="text-slate-500 text-sm mt-2">Completed</p>
                </div>

                {/* Streak Card */}
                <div className="stat-card">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-400 text-sm">Streak</span>
                        <span className="text-lg streak-fire">🔥</span>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-orange-400 animate-countUp">{user?.streak || 0}</span>
                        <span className="text-slate-400 mb-1">days</span>
                    </div>
                    <p className="text-slate-500 text-sm mt-2">Keep it going!</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Pending Missions */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">📥 Pending Missions</h2>
                        <Link to="/inbox" className="text-emerald-400 text-sm hover:underline">
                            View All →
                        </Link>
                    </div>
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="skeleton h-12 rounded-lg" />
                            ))}
                        </div>
                    ) : missions.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">No missions available</p>
                    ) : (
                        <div className="space-y-2">
                            {missions.slice(0, 3).map((m) => (
                                <Link
                                    key={m._id}
                                    to={`/mission/${m._id}`}
                                    className="block p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-200">{m.title}</span>
                                        <span className="text-xs text-slate-400">+{m.scoreWeight || 50} XP</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Achievements */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">🏆 Recent Badges</h2>
                        <Link to="/profile" className="text-emerald-400 text-sm hover:underline">
                            View All →
                        </Link>
                    </div>
                    {user?.badges && user.badges.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {user.badges.slice(0, 6).map((badge, i) => (
                                <span key={i} className="badge badge-success text-lg">
                                    {badge}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-slate-500">Complete missions to earn badges!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Call to Action */}
            <div className="glass-card p-6 text-center">
                <h3 className="text-xl font-semibold mb-2">Ready for a Challenge?</h3>
                <p className="text-slate-400 mb-4">Test your skills with the latest phishing scenarios</p>
                <Link
                    to="/inbox"
                    className="btn-primary inline-flex items-center gap-2"
                >
                    <span>Start Mission</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Sample weekly challenges
const WEEKLY_CHALLENGES = [
    {
        id: 1,
        title: "Phishing Pro",
        description: "Complete 5 phishing missions this week",
        progress: 3,
        target: 5,
        xpReward: 200,
        badge: "🎯",
        endsIn: "3 days",
        active: true,
    },
    {
        id: 2,
        title: "Sharp Shooter",
        description: "Achieve 90%+ accuracy on 3 missions",
        progress: 1,
        target: 3,
        xpReward: 150,
        badge: "🎯",
        endsIn: "3 days",
        active: true,
    },
    {
        id: 3,
        title: "Speed Demon",
        description: "Complete a mission in under 60 seconds",
        progress: 0,
        target: 1,
        xpReward: 100,
        badge: "⚡",
        endsIn: "3 days",
        active: true,
    },
    {
        id: 4,
        title: "Tool Master",
        description: "Use all 4 investigation tools in a single mission",
        progress: 1,
        target: 1,
        xpReward: 75,
        badge: "🔧",
        endsIn: "3 days",
        active: true,
        completed: true,
    },
];

const PAST_CHALLENGES = [
    {
        id: 5,
        title: "Winter Defender",
        description: "Complete 10 holiday-themed phishing missions",
        completed: true,
        xpEarned: 300,
        badge: "❄️",
    },
    {
        id: 6,
        title: "Early Bird",
        description: "Complete 3 missions before 9 AM",
        completed: false,
        xpEarned: 0,
        badge: "🌅",
    },
];

export default function WeeklyChallenges() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("current");

    const challenges = activeTab === "current" ? WEEKLY_CHALLENGES : PAST_CHALLENGES;
    const completedCount = WEEKLY_CHALLENGES.filter(c => c.completed).length;
    const totalXP = WEEKLY_CHALLENGES.reduce((acc, c) => acc + (c.completed ? c.xpReward : 0), 0);

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        🏅 <span className="gradient-text">Weekly Challenges</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Complete challenges for bonus XP and exclusive badges</p>
                </div>
                <Link to="/dashboard" className="text-slate-400 hover:text-white transition">
                    ← Back
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="stat-card text-center">
                    <div className="text-3xl font-bold text-emerald-400">{completedCount}/{WEEKLY_CHALLENGES.length}</div>
                    <div className="text-sm text-slate-400">Completed</div>
                </div>
                <div className="stat-card text-center">
                    <div className="text-3xl font-bold text-cyan-400">+{totalXP}</div>
                    <div className="text-sm text-slate-400">XP Earned</div>
                </div>
                <div className="stat-card text-center">
                    <div className="text-3xl font-bold text-orange-400">3 days</div>
                    <div className="text-sm text-slate-400">Time Left</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab("current")}
                    className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === "current"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        }`}
                >
                    Current Week
                </button>
                <button
                    onClick={() => setActiveTab("past")}
                    className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === "past"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        }`}
                >
                    Past Challenges
                </button>
            </div>

            {/* Challenges List */}
            <div className="space-y-4">
                {activeTab === "current" ? (
                    WEEKLY_CHALLENGES.map((challenge) => (
                        <div
                            key={challenge.id}
                            className={`glass-card p-6 ${challenge.completed ? "opacity-70" : ""}`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Badge */}
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${challenge.completed
                                        ? "bg-emerald-500/20"
                                        : "bg-slate-800"
                                    }`}>
                                    {challenge.badge}
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-lg">
                                            {challenge.title}
                                            {challenge.completed && (
                                                <span className="ml-2 text-emerald-400 text-sm">✓ Completed</span>
                                            )}
                                        </h3>
                                        <span className="text-emerald-400 font-medium">+{challenge.xpReward} XP</span>
                                    </div>

                                    <p className="text-slate-400 text-sm mb-3">{challenge.description}</p>

                                    {/* Progress Bar */}
                                    {!challenge.completed && (
                                        <div>
                                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                                <span>{challenge.progress}/{challenge.target}</span>
                                                <span>Ends in {challenge.endsIn}</span>
                                            </div>
                                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all"
                                                    style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    PAST_CHALLENGES.map((challenge) => (
                        <div
                            key={challenge.id}
                            className={`glass-card p-6 ${!challenge.completed ? "opacity-50" : ""}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${challenge.completed
                                        ? "bg-emerald-500/20"
                                        : "bg-red-500/20"
                                    }`}>
                                    {challenge.badge}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold">{challenge.title}</h3>
                                            <p className="text-slate-400 text-sm">{challenge.description}</p>
                                        </div>
                                        {challenge.completed ? (
                                            <span className="badge badge-success">+{challenge.xpEarned} XP</span>
                                        ) : (
                                            <span className="badge badge-danger">Missed</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Info Card */}
            <div className="mt-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-start gap-3">
                    <span className="text-xl">💡</span>
                    <div>
                        <p className="text-sm text-slate-300">
                            <strong>Pro Tip:</strong> Weekly challenges reset every Monday at midnight UTC.
                            Complete all challenges to earn a special weekly badge!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

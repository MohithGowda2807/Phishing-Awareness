import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE = "http://localhost:5000/api";

const CATEGORIES = [
    { id: "all", label: "All", icon: "🌐" },
    { id: "banking", label: "Banking", icon: "🏦" },
    { id: "payroll", label: "Payroll", icon: "💰" },
    { id: "academic", label: "Academic", icon: "🎓" },
    { id: "healthcare", label: "Healthcare", icon: "🏥" },
    { id: "social", label: "Social", icon: "👥" },
    { id: "technical", label: "Technical", icon: "💻" },
    { id: "shipping", label: "Shipping", icon: "📦" },
    { id: "prize", label: "Prize/Lottery", icon: "🎰" },
];

export default function CommunityHub() {
    const { user } = useAuth();
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState("all");
    const [sort, setSort] = useState("popular");
    const [activeTab, setActiveTab] = useState("browse");
    const [myChallenges, setMyChallenges] = useState([]);

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchChallenges();
    }, [category, sort]);

    useEffect(() => {
        if (activeTab === "my") {
            fetchMyChallenges();
        }
    }, [activeTab]);

    const fetchChallenges = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `${API_BASE}/challenges?category=${category}&sort=${sort}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            setChallenges(data.challenges || []);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const fetchMyChallenges = async () => {
        try {
            const res = await fetch(`${API_BASE}/challenges/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setMyChallenges(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        }
    };

    const handleVote = async (challengeId, vote) => {
        try {
            const res = await fetch(`${API_BASE}/challenges/${challengeId}/vote`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ vote })
            });
            const data = await res.json();

            // Update local state
            setChallenges(prev => prev.map(c =>
                c._id === challengeId
                    ? { ...c, upvotes: data.upvotes, downvotes: data.downvotes, userVote: data.userVote }
                    : c
            ));
        } catch (e) {
            console.error(e);
        }
    };

    const canCreateChallenges = (user?.missionsCompleted || 0) >= 5;

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        🌍 <span className="gradient-text">Community Hub</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Browse, vote, and play community-created challenges
                    </p>
                </div>
                {canCreateChallenges ? (
                    <Link to="/create-challenge" className="btn-primary">
                        + Create Challenge
                    </Link>
                ) : (
                    <div className="text-sm text-slate-500">
                        Complete {5 - (user?.missionsCompleted || 0)} more missions to create challenges
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab("browse")}
                    className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === "browse"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        }`}
                >
                    Browse
                </button>
                <button
                    onClick={() => setActiveTab("my")}
                    className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === "my"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        }`}
                >
                    My Challenges
                </button>
            </div>

            {activeTab === "browse" && (
                <>
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        {/* Categories */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(cat.id)}
                                    className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition ${category === cat.id
                                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                                            : "bg-slate-800 text-slate-400 border border-transparent hover:bg-slate-700"
                                        }`}
                                >
                                    <span className="mr-1">{cat.icon}</span>
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Sort */}
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="popular">Most Popular</option>
                            <option value="newest">Newest</option>
                            <option value="difficulty">Difficulty</option>
                        </select>
                    </div>

                    {/* Challenges Grid */}
                    {loading ? (
                        <div className="grid md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="skeleton h-48 rounded-xl" />
                            ))}
                        </div>
                    ) : challenges.length === 0 ? (
                        <div className="glass-card p-12 text-center">
                            <div className="text-5xl mb-4">🌱</div>
                            <h3 className="text-xl font-semibold mb-2">No Challenges Yet</h3>
                            <p className="text-slate-400 mb-4">
                                Be the first to create a challenge in this category!
                            </p>
                            {canCreateChallenges && (
                                <Link to="/create-challenge" className="btn-primary">
                                    Create Challenge
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {challenges.map((challenge) => (
                                <ChallengeCard
                                    key={challenge._id}
                                    challenge={challenge}
                                    onVote={handleVote}
                                    currentUserId={user?._id}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {activeTab === "my" && (
                <div className="space-y-4">
                    {myChallenges.length === 0 ? (
                        <div className="glass-card p-12 text-center">
                            <div className="text-5xl mb-4">📝</div>
                            <h3 className="text-xl font-semibold mb-2">No Challenges Created</h3>
                            <p className="text-slate-400 mb-4">
                                Share your phishing knowledge with the community!
                            </p>
                            {canCreateChallenges && (
                                <Link to="/create-challenge" className="btn-primary">
                                    Create Your First Challenge
                                </Link>
                            )}
                        </div>
                    ) : (
                        myChallenges.map((challenge) => (
                            <div
                                key={challenge._id}
                                className="glass-card p-4 flex items-center justify-between"
                            >
                                <div>
                                    <div className="font-medium">{challenge.title}</div>
                                    <div className="flex items-center gap-3 text-sm text-slate-400">
                                        <span className={`badge ${challenge.status === "approved" ? "badge-success" :
                                                challenge.status === "featured" ? "bg-purple-500/20 text-purple-400" :
                                                    challenge.status === "rejected" ? "badge-danger" :
                                                        "bg-yellow-500/20 text-yellow-400"
                                            }`}>
                                            {challenge.status}
                                        </span>
                                        <span>👍 {challenge.upvotes}</span>
                                        <span>🎮 {challenge.timesPlayed} plays</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

function ChallengeCard({ challenge, onVote, currentUserId }) {
    const getDifficultyInfo = (diff) => {
        if (diff <= 2) return { label: "Easy", color: "text-emerald-400", bg: "bg-emerald-500/20" };
        if (diff === 3) return { label: "Medium", color: "text-yellow-400", bg: "bg-yellow-500/20" };
        return { label: "Hard", color: "text-red-400", bg: "bg-red-500/20" };
    };

    const diff = getDifficultyInfo(challenge.difficulty);
    const userVote = challenge.voters?.find(v => v.user === currentUserId)?.vote;

    return (
        <div className="glass-card p-5 hover:border-emerald-500/50 transition">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div>
                    {challenge.status === "featured" && (
                        <span className="badge bg-purple-500/20 text-purple-400 mb-2">⭐ Featured</span>
                    )}
                    <h3 className="font-semibold text-lg">{challenge.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                        <span>by {challenge.creator?.username || "Unknown"}</span>
                        <span>•</span>
                        <span className="capitalize">{challenge.category}</span>
                    </div>
                </div>
                <span className={`badge ${diff.bg} ${diff.color}`}>{diff.label}</span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 text-sm text-slate-400">
                <span>🎮 {challenge.timesPlayed} plays</span>
                <span>📊 Avg: {challenge.avgScore || "--"}%</span>
                <span className={challenge.type === "phishing" ? "text-red-400" : "text-emerald-400"}>
                    {challenge.type === "phishing" ? "🚨 Phishing" : "✅ Legitimate"}
                </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onVote(challenge._id, "up")}
                        className={`px-3 py-1 rounded-lg flex items-center gap-1 transition ${userVote === "up"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                            }`}
                    >
                        👍 {challenge.upvotes || 0}
                    </button>
                    <button
                        onClick={() => onVote(challenge._id, "down")}
                        className={`px-3 py-1 rounded-lg flex items-center gap-1 transition ${userVote === "down"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                            }`}
                    >
                        👎 {challenge.downvotes || 0}
                    </button>
                </div>
                <Link
                    to={`/challenge/${challenge._id}`}
                    className="btn-primary text-sm py-2"
                >
                    Play →
                </Link>
            </div>
        </div>
    );
}

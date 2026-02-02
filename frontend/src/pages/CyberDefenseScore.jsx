import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    generateCyberScore,
    getLatestCyberScore,
    verifyCyberScore,
    getCyberScoreHistory,
    getCyberScoreLeaderboard
} from "../services/api";

// Tier configurations
const TIERS = {
    novice: { color: "text-slate-400", bg: "bg-slate-500/20", icon: "🌱", label: "Novice" },
    aware: { color: "text-blue-400", bg: "bg-blue-500/20", icon: "👁️", label: "Aware" },
    vigilant: { color: "text-purple-400", bg: "bg-purple-500/20", icon: "🔍", label: "Vigilant" },
    defender: { color: "text-emerald-400", bg: "bg-emerald-500/20", icon: "🛡️", label: "Defender" },
    expert: { color: "text-yellow-400", bg: "bg-yellow-500/20", icon: "⭐", label: "Expert" },
    elite: { color: "text-red-400", bg: "bg-red-500/20", icon: "🏆", label: "Elite" }
};

export default function CyberDefenseScore() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { token } = useParams(); // For verification page

    const [score, setScore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [view, setView] = useState("main"); // main, history, leaderboard
    const [history, setHistory] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [verificationData, setVerificationData] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (token) {
            // Verification mode
            verifyScore(token);
        } else {
            // Normal mode
            loadLatestScore();
        }
    }, [token]);

    const loadLatestScore = async () => {
        setLoading(true);
        try {
            const data = await getLatestCyberScore();
            if (data.hasScore) {
                setScore(data);
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const verifyScore = async (shareToken) => {
        setLoading(true);
        try {
            const data = await verifyCyberScore(shareToken);
            setVerificationData(data);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const handleGenerateScore = async () => {
        setGenerating(true);
        try {
            const data = await generateCyberScore();
            if (data.score !== undefined) {
                setScore({
                    hasScore: true,
                    ...data
                });
            }
        } catch (e) {
            console.error(e);
        }
        setGenerating(false);
    };

    const loadHistory = async () => {
        try {
            const data = await getCyberScoreHistory();
            setHistory(data.scores || []);
            setView("history");
        } catch (e) {
            console.error(e);
        }
    };

    const loadLeaderboard = async () => {
        try {
            const data = await getCyberScoreLeaderboard();
            setLeaderboard(data.leaderboard || []);
            setView("leaderboard");
        } catch (e) {
            console.error(e);
        }
    };

    const copyShareLink = () => {
        if (score?.shareToken) {
            const shareUrl = `${window.location.origin}/score/${score.shareToken}`;
            navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareOnLinkedIn = () => {
        if (score) {
            const text = `I just earned a ${TIERS[score.tier]?.label} rating (${score.score}/100) on my Cyber Defense Score! 🛡️ How cyber-aware are you?`;
            const url = `${window.location.origin}/score/${score.shareToken}`;
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        }
    };

    // Verification page (public)
    if (token) {
        if (loading) {
            return (
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full" />
                </div>
            );
        }

        if (!verificationData || !verificationData.verified) {
            return (
                <div className="animate-fadeIn p-4 max-w-2xl mx-auto text-center">
                    <div className="glass-card p-8">
                        <div className="text-6xl mb-4">❌</div>
                        <h1 className="text-2xl font-bold mb-2">Score Not Found</h1>
                        <p className="text-slate-400 mb-6">
                            This score may be expired or invalid.
                        </p>
                        <button onClick={() => navigate("/")} className="btn-primary">
                            Go Home
                        </button>
                    </div>
                </div>
            );
        }

        const tierConfig = TIERS[verificationData.tier] || TIERS.novice;

        return (
            <div className="animate-fadeIn p-4 max-w-2xl mx-auto">
                {/* Verification Badge */}
                <div className="glass-card p-6 text-center mb-6">
                    <div className="text-4xl mb-2">✓</div>
                    <h1 className="text-xl font-bold text-emerald-400">Verified Cyber Defense Score</h1>
                    <p className="text-slate-400 text-sm">
                        This score has been verified by the Phishing Training Platform
                    </p>
                </div>

                {/* Score Card */}
                <div className={`glass-card p-8 text-center ${tierConfig.bg}`}>
                    <div className="text-6xl mb-4">{tierConfig.icon}</div>

                    <div className="text-7xl font-bold mb-2">
                        <span className={tierConfig.color}>{verificationData.score}</span>
                        <span className="text-slate-500 text-2xl">/100</span>
                    </div>

                    <div className={`text-2xl font-semibold ${tierConfig.color} mb-4`}>
                        {tierConfig.label}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-slate-800/50 rounded-lg p-3">
                            <div className="font-bold">{verificationData.username}</div>
                            <div className="text-xs text-slate-400">Username</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                            <div className="font-bold">Level {verificationData.userLevel}</div>
                            <div className="text-xs text-slate-400">Player Level</div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
                        <div className="bg-slate-800/30 rounded-lg p-2">
                            <div className="font-medium">{verificationData.components?.accuracy}%</div>
                            <div className="text-xs text-slate-400">Accuracy</div>
                        </div>
                        <div className="bg-slate-800/30 rounded-lg p-2">
                            <div className="font-medium">{verificationData.components?.breadth}%</div>
                            <div className="text-xs text-slate-400">Breadth</div>
                        </div>
                        <div className="bg-slate-800/30 rounded-lg p-2">
                            <div className="font-medium capitalize">{verificationData.components?.trend}</div>
                            <div className="text-xs text-slate-400">Trend</div>
                        </div>
                    </div>

                    {/* Validity */}
                    <div className={`mt-6 text-sm ${verificationData.isValid ? "text-emerald-400" : "text-red-400"}`}>
                        {verificationData.isValid ? "✓ Score is valid" : "⚠ Score has expired"}
                    </div>
                </div>

                {/* CTA for viewers */}
                <div className="glass-card p-6 mt-6 text-center">
                    <h3 className="font-semibold mb-2">Want to know your Cyber Defense Score?</h3>
                    <p className="text-slate-400 text-sm mb-4">
                        Train your phishing detection skills and get your own shareable score!
                    </p>
                    <button onClick={() => navigate("/register")} className="btn-primary">
                        Get Started Free
                    </button>
                </div>
            </div>
        );
    }

    // Main score page (authenticated)
    const renderScoreCard = () => {
        if (!score?.hasScore) {
            return (
                <div className="glass-card p-8 text-center">
                    <div className="text-6xl mb-4">🎯</div>
                    <h2 className="text-2xl font-bold mb-2">Generate Your Cyber Defense Score</h2>
                    <p className="text-slate-400 mb-6 max-w-md mx-auto">
                        Your score is calculated based on your training performance, accuracy,
                        consistency, and improvement over time.
                    </p>
                    <button
                        onClick={handleGenerateScore}
                        disabled={generating}
                        className="btn-primary text-lg px-8"
                    >
                        {generating ? "Calculating..." : "Generate My Score"}
                    </button>
                </div>
            );
        }

        const tierConfig = TIERS[score.tier] || TIERS.novice;

        return (
            <>
                {/* Main Score Display */}
                <div className={`glass-card p-8 text-center ${tierConfig.bg}`}>
                    <div className="text-6xl mb-4">{tierConfig.icon}</div>

                    <div className="text-7xl font-bold mb-2">
                        <span className={tierConfig.color}>{score.score}</span>
                        <span className="text-slate-500 text-2xl">/100</span>
                    </div>

                    <div className={`text-2xl font-semibold ${tierConfig.color} mb-2`}>
                        {tierConfig.label}
                    </div>

                    <p className="text-slate-400 text-sm">
                        Cyber Defense Score
                    </p>
                </div>

                {/* Components Breakdown */}
                <div className="glass-card p-6">
                    <h3 className="font-semibold mb-4">Score Breakdown</h3>
                    <div className="space-y-4">
                        {score.components && Object.entries(score.components).map(([key, comp]) => (
                            <div key={key}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="capitalize">{key}</span>
                                    <span className="text-slate-400">
                                        {comp.value}/{comp.maxPoints}
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                                        style={{ width: `${(comp.value / comp.maxPoints) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="glass-card p-6 border-emerald-500/30">
                        <h3 className="font-semibold mb-3 text-emerald-400">💪 Strengths</h3>
                        {score.strengths?.length > 0 ? (
                            <div className="space-y-2">
                                {score.strengths.map((s, i) => (
                                    <div key={i} className="text-sm">
                                        <div className="font-medium">{s.area}</div>
                                        <div className="text-slate-400">{s.description}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400">Keep training to identify your strengths!</p>
                        )}
                    </div>

                    {/* Weaknesses */}
                    <div className="glass-card p-6 border-yellow-500/30">
                        <h3 className="font-semibold mb-3 text-yellow-400">🎯 Areas to Improve</h3>
                        {score.weaknesses?.length > 0 ? (
                            <div className="space-y-2">
                                {score.weaknesses.map((w, i) => (
                                    <div key={i} className="text-sm">
                                        <div className="font-medium">{w.area}</div>
                                        <div className="text-slate-400">{w.description}</div>
                                        {w.improvementTip && (
                                            <div className="text-emerald-400 text-xs mt-1">💡 {w.improvementTip}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400">Great job! No major weaknesses identified.</p>
                        )}
                    </div>
                </div>

                {/* Share Section */}
                <div className="glass-card p-6">
                    <h3 className="font-semibold mb-4">📤 Share Your Score</h3>
                    <p className="text-sm text-slate-400 mb-4">
                        Share your verified score on your resume, LinkedIn, or with employers!
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <button onClick={copyShareLink} className="btn-secondary">
                            {copied ? "✓ Copied!" : "📋 Copy Link"}
                        </button>
                        <button onClick={shareOnLinkedIn} className="btn-secondary bg-blue-600 hover:bg-blue-700">
                            💼 Share on LinkedIn
                        </button>
                        <button onClick={handleGenerateScore} className="btn-secondary" disabled={generating}>
                            🔄 Regenerate
                        </button>
                    </div>
                    <div className="mt-4 text-xs text-slate-500">
                        Valid until: {new Date(score.validUntil).toLocaleDateString()}
                    </div>
                </div>
            </>
        );
    };

    const renderHistory = () => (
        <div className="space-y-4">
            <button onClick={() => setView("main")} className="text-slate-400 hover:text-white">
                ← Back
            </button>
            <h2 className="text-xl font-bold">Score History</h2>
            {history.length === 0 ? (
                <div className="glass-card p-6 text-center text-slate-400">
                    No score history yet
                </div>
            ) : (
                <div className="space-y-2">
                    {history.map((h, i) => {
                        const tierConfig = TIERS[h.tier] || TIERS.novice;
                        return (
                            <div key={i} className="glass-card p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{tierConfig.icon}</span>
                                    <div>
                                        <div className={`font-bold ${tierConfig.color}`}>{h.score}/100</div>
                                        <div className="text-xs text-slate-400">
                                            {new Date(h.generatedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <span className={`badge ${tierConfig.bg} ${tierConfig.color}`}>
                                    {tierConfig.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    const renderLeaderboard = () => (
        <div className="space-y-4">
            <button onClick={() => setView("main")} className="text-slate-400 hover:text-white">
                ← Back
            </button>
            <h2 className="text-xl font-bold">🏆 Cyber Score Leaderboard</h2>
            {leaderboard.length === 0 ? (
                <div className="glass-card p-6 text-center text-slate-400">
                    No scores yet. Be the first!
                </div>
            ) : (
                <div className="space-y-2">
                    {leaderboard.map((entry, i) => {
                        const tierConfig = TIERS[entry.tier] || TIERS.novice;
                        return (
                            <div key={i} className={`glass-card p-4 flex items-center justify-between ${entry.username === user?.username ? "border-emerald-500/50" : ""
                                }`}>
                                <div className="flex items-center gap-4">
                                    <span className={`text-xl font-bold ${entry.rank === 1 ? "text-yellow-400" :
                                            entry.rank === 2 ? "text-slate-300" :
                                                entry.rank === 3 ? "text-amber-600" : "text-slate-500"
                                        }`}>
                                        #{entry.rank}
                                    </span>
                                    <div>
                                        <div className="font-medium">{entry.username}</div>
                                        <div className="text-xs text-slate-400">Level {entry.level}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-bold ${tierConfig.color}`}>{entry.score}</div>
                                    <div className="text-xs text-slate-400">{tierConfig.label}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="animate-fadeIn p-4 max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    🛡️ <span className="gradient-text">Cyber Defense Score</span>
                </h1>
                <p className="text-slate-400">
                    Your verified cybersecurity awareness rating
                </p>
            </div>

            {/* Navigation */}
            {view === "main" && (
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={loadHistory}
                        className="btn-secondary text-sm"
                    >
                        📊 History
                    </button>
                    <button
                        onClick={loadLeaderboard}
                        className="btn-secondary text-sm"
                    >
                        🏆 Leaderboard
                    </button>
                </div>
            )}

            {/* Content */}
            <div className="space-y-6">
                {view === "main" && renderScoreCard()}
                {view === "history" && renderHistory()}
                {view === "leaderboard" && renderLeaderboard()}
            </div>
        </div>
    );
}

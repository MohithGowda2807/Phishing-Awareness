import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ChallengePlayer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();

    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [decision, setDecision] = useState(null);
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showTools, setShowTools] = useState({
        sender: false,
        headers: false
    });

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchChallenge();
    }, [id]);

    const fetchChallenge = async () => {
        try {
            const res = await fetch(`${API_BASE}/challenges/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setChallenge(data);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const handleSubmit = async () => {
        if (!decision || submitting) return;
        setSubmitting(true);

        try {
            const res = await fetch(`${API_BASE}/challenges/${id}/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    verdict: decision === "report",
                    cluesFound: Object.keys(showTools).filter(k => showTools[k])
                })
            });

            const data = await res.json();
            setResult(data);
            refreshUser();
        } catch (e) {
            console.error(e);
        }
        setSubmitting(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!challenge) {
        return (
            <div className="text-center py-12">
                <div className="text-4xl mb-4">❌</div>
                <h2 className="text-xl font-bold mb-2">Challenge Not Found</h2>
                <Link to="/community" className="text-emerald-400 hover:underline">
                    Back to Community Hub
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate("/community")}
                    className="text-slate-400 hover:text-white flex items-center gap-2"
                >
                    ← Back
                </button>
                <span className="badge bg-purple-500/20 text-purple-400">
                    Community Challenge
                </span>
            </div>

            {!result ? (
                <>
                    {/* Email Display */}
                    <div className="glass-card p-6 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-xl">
                                {challenge.emailContent?.fromName?.charAt(0) || "?"}
                            </div>
                            <div>
                                <div className="font-semibold">{challenge.emailContent?.fromName || "Unknown"}</div>
                                <div className="text-sm text-slate-400">&lt;{challenge.emailContent?.from}&gt;</div>
                            </div>
                        </div>
                        <div className="text-lg font-medium mb-4">{challenge.emailContent?.subject}</div>
                        <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap">
                            {challenge.emailContent?.body}
                        </div>
                    </div>

                    {/* Investigation Tools */}
                    <div className="mb-6">
                        <h3 className="text-sm text-slate-400 mb-3">🔍 Investigation Tools</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowTools(prev => ({ ...prev, sender: !prev.sender }))}
                                className={`p-3 rounded-lg border transition ${showTools.sender
                                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                                    : "bg-slate-800/50 border-slate-700/50"
                                    }`}
                            >
                                👤 Inspect Sender
                            </button>
                            <button
                                onClick={() => setShowTools(prev => ({ ...prev, headers: !prev.headers }))}
                                className={`p-3 rounded-lg border transition ${showTools.headers
                                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                                    : "bg-slate-800/50 border-slate-700/50"
                                    }`}
                            >
                                📋 View Headers
                            </button>
                        </div>

                        {showTools.sender && (
                            <div className="mt-3 p-3 bg-slate-800/50 rounded-lg text-sm">
                                <strong>Sender Domain:</strong> {challenge.emailContent?.from?.split("@")[1] || "Unknown"}
                            </div>
                        )}
                        {showTools.headers && (
                            <div className="mt-3 p-3 bg-slate-800/50 rounded-lg text-sm">
                                <strong>SPF:</strong> {challenge.emailContent?.headers?.spf || "fail"} |{" "}
                                <strong>DKIM:</strong> {challenge.emailContent?.headers?.dkim || "none"} |{" "}
                                <strong>DMARC:</strong> {challenge.emailContent?.headers?.dmarc || "fail"}
                            </div>
                        )}
                    </div>

                    {/* Decision */}
                    <div className="mb-6">
                        <h3 className="text-sm text-slate-400 mb-3">🎯 Your Decision</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setDecision("report")}
                                className={`p-4 rounded-lg border transition ${decision === "report"
                                    ? "bg-red-500/20 border-red-500 text-red-400"
                                    : "bg-slate-800/50 border-slate-700/50 hover:border-red-500/50"
                                    }`}
                            >
                                <span className="text-2xl block mb-1">🚨</span>
                                <span className="font-medium">Report as Phishing</span>
                            </button>
                            <button
                                onClick={() => setDecision("safe")}
                                className={`p-4 rounded-lg border transition ${decision === "safe"
                                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                                    : "bg-slate-800/50 border-slate-700/50 hover:border-emerald-500/50"
                                    }`}
                            >
                                <span className="text-2xl block mb-1">✅</span>
                                <span className="font-medium">Mark as Safe</span>
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={!decision || submitting}
                        className="w-full btn-primary py-4 disabled:opacity-50"
                    >
                        {submitting ? "Submitting..." : "Submit Answer"}
                    </button>
                </>
            ) : (
                /* Result Screen */
                <div className="glass-card p-8 text-center">
                    <div className={`text-6xl mb-4 ${result.correct ? "" : "grayscale"}`}>
                        {result.correct ? "🎉" : "😔"}
                    </div>
                    <div className="text-3xl font-bold mb-2">
                        {result.correct ? "Correct!" : "Incorrect"}
                    </div>
                    <div className="text-xl text-emerald-400 mb-4">+{result.xpGained} XP</div>

                    <div className={`p-4 rounded-lg mb-6 ${result.wasPhishing
                        ? "bg-red-500/20 border border-red-500/50"
                        : "bg-emerald-500/20 border border-emerald-500/50"
                        }`}>
                        This was: {result.wasPhishing ? "🚨 PHISHING" : "✅ LEGITIMATE"}
                    </div>

                    {/* Clues */}
                    <div className="text-left mb-6">
                        <h4 className="font-semibold mb-2">Key Indicators:</h4>
                        <div className="flex flex-wrap gap-2">
                            {result.clues?.map((clue, i) => (
                                <span key={i} className="badge bg-slate-700">{clue}</span>
                            ))}
                        </div>
                    </div>

                    {/* Explanation */}
                    {result.explanation && (
                        <div className="text-left p-4 bg-slate-800/50 rounded-lg mb-6">
                            <h4 className="font-semibold mb-2">💡 Learning Note</h4>
                            <p className="text-slate-300 text-sm">{result.explanation}</p>
                        </div>
                    )}

                    {/* Creator Credit */}
                    <div className="text-sm text-slate-500 mb-6">
                        Challenge by: {challenge.creator?.username || "Unknown"}
                    </div>

                    <div className="flex gap-4 justify-center">
                        <Link to="/community" className="btn-primary">
                            More Challenges
                        </Link>
                        <Link to="/dashboard" className="btn-secondary">
                            Dashboard
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

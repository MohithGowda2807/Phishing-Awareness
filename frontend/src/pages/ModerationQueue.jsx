import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ModerationQueue() {
    const { user } = useAuth();
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeChallenge, setActiveChallenge] = useState(null);
    const [note, setNote] = useState("");
    const [processing, setProcessing] = useState(false);

    const token = localStorage.getItem("token");

    // Only allow admins and moderators
    if (user?.role !== "admin" && user?.role !== "moderator") {
        return <Navigate to="/dashboard" replace />;
    }

    useEffect(() => {
        fetchPendingChallenges();
    }, []);

    const fetchPendingChallenges = async () => {
        try {
            const res = await fetch(`${API_BASE}/challenges/pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setChallenges(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const handleModerate = async (challengeId, action) => {
        setProcessing(true);
        try {
            const res = await fetch(`${API_BASE}/challenges/${challengeId}/moderate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ action, note })
            });

            if (res.ok) {
                setChallenges(prev => prev.filter(c => c._id !== challengeId));
                setActiveChallenge(null);
                setNote("");
            }
        } catch (e) {
            console.error(e);
        }
        setProcessing(false);
    };

    return (
        <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        🛡️ <span className="gradient-text">Moderation Queue</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Review community-submitted challenges
                    </p>
                </div>
                <span className="badge bg-purple-500/20 text-purple-400">
                    {challenges.length} pending
                </span>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="skeleton h-24 rounded-xl" />
                    ))}
                </div>
            ) : challenges.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div className="text-5xl mb-4">✨</div>
                    <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
                    <p className="text-slate-400">No challenges pending review</p>
                </div>
            ) : (
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Challenge List */}
                    <div className="space-y-4">
                        {challenges.map(challenge => (
                            <div
                                key={challenge._id}
                                onClick={() => setActiveChallenge(challenge)}
                                className={`glass-card p-4 cursor-pointer transition ${activeChallenge?._id === challenge._id
                                    ? "ring-2 ring-emerald-500"
                                    : "hover:border-slate-600"
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold">{challenge.title}</h3>
                                        <div className="text-sm text-slate-400">
                                            by {challenge.creator?.username || "Unknown"} •
                                            Level {challenge.creator?.level || 1}
                                        </div>
                                    </div>
                                    <span className={`badge ${challenge.type === "phishing"
                                        ? "badge-danger"
                                        : "badge-success"
                                        }`}>
                                        {challenge.type}
                                    </span>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <span className="text-xs text-slate-500 capitalize">{challenge.category}</span>
                                    <span className="text-xs text-slate-500">• Diff {challenge.difficulty}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Challenge Detail */}
                    {activeChallenge ? (
                        <div className="glass-card p-6 sticky top-6">
                            <h3 className="text-lg font-semibold mb-4">Review Challenge</h3>

                            {/* Email Preview */}
                            <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                                <div className="text-sm text-slate-400 mb-1">From:</div>
                                <div className="mb-2">
                                    {activeChallenge.emailContent?.fromName}
                                    &lt;{activeChallenge.emailContent?.from}&gt;
                                </div>
                                <div className="text-sm text-slate-400 mb-1">Subject:</div>
                                <div className="font-medium mb-2">{activeChallenge.emailContent?.subject}</div>
                                <div className="text-sm text-slate-400 mb-1">Body:</div>
                                <div className="text-sm text-slate-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                                    {activeChallenge.emailContent?.body}
                                </div>
                            </div>

                            {/* Clues */}
                            <div className="mb-4">
                                <div className="text-sm text-slate-400 mb-2">Clues:</div>
                                <div className="flex flex-wrap gap-2">
                                    {activeChallenge.clues?.map((clue, i) => (
                                        <span key={i} className="badge bg-slate-700">{clue}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Headers */}
                            <div className="mb-4 text-sm">
                                <span className="text-slate-400">Headers: </span>
                                SPF: {activeChallenge.emailContent?.headers?.spf} |
                                DKIM: {activeChallenge.emailContent?.headers?.dkim} |
                                DMARC: {activeChallenge.emailContent?.headers?.dmarc}
                            </div>

                            {/* Moderation Note */}
                            <div className="mb-4">
                                <label className="block text-sm text-slate-400 mb-1">
                                    Note (optional)
                                </label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Feedback for the creator..."
                                    className="input min-h-[60px]"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleModerate(activeChallenge._id, "approve")}
                                    disabled={processing}
                                    className="flex-1 btn-primary"
                                >
                                    ✓ Approve
                                </button>
                                <button
                                    onClick={() => handleModerate(activeChallenge._id, "feature")}
                                    disabled={processing}
                                    className="flex-1 bg-purple-500/20 text-purple-400 border border-purple-500/50 py-2 px-4 rounded-lg hover:bg-purple-500/30 transition"
                                >
                                    ⭐ Feature
                                </button>
                                <button
                                    onClick={() => handleModerate(activeChallenge._id, "reject")}
                                    disabled={processing}
                                    className="flex-1 bg-red-500/20 text-red-400 border border-red-500/50 py-2 px-4 rounded-lg hover:bg-red-500/30 transition"
                                >
                                    ✗ Reject
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card p-12 text-center">
                            <div className="text-4xl mb-4">👈</div>
                            <p className="text-slate-400">Select a challenge to review</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * RegionView Page
 * 
 * Shows quests within a region as a vertical path with progress indicators.
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRegionById } from "../services/api";

export default function RegionView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [region, setRegion] = useState(null);
    const [quests, setQuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadRegion();
    }, [id]);

    const loadRegion = async () => {
        try {
            const data = await getRegionById(id);
            if (data.error || data.message) {
                setError(data.error || data.message);
            } else {
                setRegion(data.region);
                setQuests(data.quests || []);
            }
        } catch (err) {
            setError("Failed to load region");
        } finally {
            setLoading(false);
        }
    };

    const handleQuestClick = (quest) => {
        if (!quest.isUnlocked) return;

        // Navigate based on quest type
        if (quest.linkedContent?.missionId) {
            navigate(`/mission/${quest.linkedContent.missionId._id || quest.linkedContent.missionId}`);
        } else if (quest.linkedContent?.questionId) {
            navigate(`/question/${quest.linkedContent.questionId._id || quest.linkedContent.questionId}`);
        } else {
            // For tutorial/boss quests without linked content, show the quest itself
            navigate(`/quest/${quest._id}`);
        }
    };

    const renderStars = (stars, max = 3) => {
        return (
            <div className="flex gap-0.5">
                {[...Array(max)].map((_, i) => (
                    <span
                        key={i}
                        className={`text-sm ${i < stars ? "text-yellow-400" : "text-slate-600"}`}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16">
                <p className="text-red-400 mb-4">{error}</p>
                <button onClick={() => navigate("/world-map")} className="btn-primary">
                    Back to Map
                </button>
            </div>
        );
    }

    const totalStars = quests.reduce((sum, q) => sum + (q.progress?.stars || 0), 0);
    const maxStars = quests.length * 3;
    const completedQuests = quests.filter(q => q.progress?.isCompleted).length;

    return (
        <div className="animate-fadeIn max-w-3xl mx-auto">
            {/* Back button */}
            <button
                onClick={() => navigate("/world-map")}
                className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition mb-6"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Map
            </button>

            {/* Region Header */}
            <div className="glass-card p-6 mb-8">
                <div className="flex items-start gap-4">
                    <span className="text-5xl">{region?.icon}</span>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold mb-1">{region?.name}</h1>
                        <p className="text-slate-400 mb-4">{region?.description}</p>

                        {/* Story intro */}
                        {region?.story?.intro && (
                            <div className="p-4 bg-slate-800/50 rounded-lg border-l-4 border-emerald-500 mb-4">
                                <p className="text-sm text-slate-300 italic">"{region.story.intro}"</p>
                            </div>
                        )}

                        {/* Progress stats */}
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="text-xl text-yellow-400">⭐</span>
                                <span className="font-bold">{totalStars}</span>
                                <span className="text-slate-500">/ {maxStars}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xl">✓</span>
                                <span className="font-bold">{completedQuests}</span>
                                <span className="text-slate-500">/ {quests.length} quests</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quest Path */}
            <div className="relative">
                {/* Vertical path line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-700" />

                {/* Quests */}
                <div className="space-y-4">
                    {quests.map((quest, index) => {
                        const isLocked = !quest.isUnlocked;
                        const isCompleted = quest.progress?.isCompleted;
                        const stars = quest.progress?.stars || 0;

                        return (
                            <div
                                key={quest._id}
                                onClick={() => handleQuestClick(quest)}
                                className={`
                  relative pl-16 cursor-pointer group
                  ${isLocked ? "opacity-50 cursor-not-allowed" : ""}
                `}
                            >
                                {/* Node on path */}
                                <div className={`
                  absolute left-3 w-6 h-6 rounded-full flex items-center justify-center
                  transition-all duration-300 z-10
                  ${isCompleted
                                        ? "bg-emerald-500 text-white"
                                        : isLocked
                                            ? "bg-slate-700 text-slate-500"
                                            : "bg-slate-800 border-2 border-emerald-500 group-hover:bg-emerald-500/20"
                                    }
                `}>
                                    {isCompleted ? (
                                        <span className="text-xs">✓</span>
                                    ) : isLocked ? (
                                        <span className="text-xs">🔒</span>
                                    ) : (
                                        <span className="text-xs">{index + 1}</span>
                                    )}
                                </div>

                                {/* Quest Card */}
                                <div className={`
                  glass-card p-4 transition-all duration-300
                  ${isLocked
                                        ? "bg-slate-800/30 border-slate-700"
                                        : isCompleted
                                            ? "border-emerald-500/50 hover:border-emerald-500"
                                            : "border-slate-700 hover:border-emerald-500 hover:bg-slate-800/80"
                                    }
                  ${quest.isBoss ? "border-yellow-500/50" : ""}
                `}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {/* Quest Icon */}
                                            <span className={`text-2xl ${isLocked ? "grayscale" : ""}`}>
                                                {quest.icon}
                                            </span>

                                            <div>
                                                {/* Quest Title */}
                                                <div className="flex items-center gap-2">
                                                    <h3 className={`font-semibold ${isLocked ? "text-slate-500" : "text-white"
                                                        }`}>
                                                        {quest.title}
                                                    </h3>
                                                    {quest.isBoss && (
                                                        <span className="badge bg-yellow-500/20 text-yellow-400 text-xs">
                                                            BOSS
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Quest meta */}
                                                <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                                    <span>+{quest.xpReward} XP</span>
                                                    <span>Difficulty {quest.difficulty}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stars / Lock */}
                                        <div className="flex flex-col items-end">
                                            {isLocked ? (
                                                <span className="text-slate-500 text-sm">
                                                    Need {quest.requiredStars}⭐
                                                </span>
                                            ) : (
                                                renderStars(stars)
                                            )}

                                            {/* Best score */}
                                            {quest.progress?.bestScore > 0 && (
                                                <span className="text-xs text-slate-500 mt-1">
                                                    Best: {quest.progress.bestScore}%
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description (for unlocked quests on hover) */}
                                    {!isLocked && quest.description && (
                                        <p className="text-sm text-slate-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {quest.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Region complete message */}
            {region?.progress?.isCompleted && region?.story?.completion && (
                <div className="mt-8 glass-card p-6 border-emerald-500 bg-emerald-500/10 text-center">
                    <span className="text-4xl mb-2 block">🏆</span>
                    <p className="text-emerald-400 font-semibold">{region.story.completion}</p>
                </div>
            )}

            {/* Empty state */}
            {quests.length === 0 && (
                <div className="text-center py-16 glass-card">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-semibold mb-2">No Quests Yet</h3>
                    <p className="text-slate-400">Quests for this region are coming soon!</p>
                </div>
            )}
        </div>
    );
}

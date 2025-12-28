/**
 * WorldMap Page
 * 
 * Visual overview of all training regions with progress indicators.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRegions } from "../services/api";

// Color mapping for Tailwind classes
const colorMap = {
    emerald: { bg: "bg-emerald-500/20", border: "border-emerald-500", text: "text-emerald-400", glow: "shadow-emerald-500/30" },
    blue: { bg: "bg-blue-500/20", border: "border-blue-500", text: "text-blue-400", glow: "shadow-blue-500/30" },
    purple: { bg: "bg-purple-500/20", border: "border-purple-500", text: "text-purple-400", glow: "shadow-purple-500/30" },
    red: { bg: "bg-red-500/20", border: "border-red-500", text: "text-red-400", glow: "shadow-red-500/30" },
    orange: { bg: "bg-orange-500/20", border: "border-orange-500", text: "text-orange-400", glow: "shadow-orange-500/30" },
    yellow: { bg: "bg-yellow-500/20", border: "border-yellow-500", text: "text-yellow-400", glow: "shadow-yellow-500/30" },
};

export default function WorldMap() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalStars, setTotalStars] = useState(0);

    useEffect(() => {
        loadRegions();
    }, []);

    const loadRegions = async () => {
        try {
            const data = await getRegions();
            setRegions(Array.isArray(data) ? data : []);

            // Calculate total stars
            const stars = data.reduce((sum, r) => sum + (r.progress?.totalStars || 0), 0);
            setTotalStars(stars);
        } catch (error) {
            console.error("Failed to load regions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegionClick = (region) => {
        if (region.isUnlocked) {
            navigate(`/region/${region._id}`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-2">
                    🗺️ <span className="gradient-text">Cyber Defense Map</span>
                </h1>
                <p className="text-slate-400">
                    Master each region to become an Elite Cyber Defender
                </p>

                {/* Overall Progress */}
                <div className="mt-4 inline-flex items-center gap-4 px-6 py-3 bg-slate-800/50 rounded-full">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">⭐</span>
                        <span className="text-xl font-bold text-yellow-400">{totalStars}</span>
                        <span className="text-slate-400">Stars</span>
                    </div>
                    <div className="w-px h-6 bg-slate-700" />
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🏆</span>
                        <span className="text-xl font-bold text-emerald-400">
                            {regions.filter(r => r.progress?.isCompleted).length}
                        </span>
                        <span className="text-slate-400">/ {regions.length} Regions</span>
                    </div>
                </div>
            </div>

            {/* Region Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {regions.map((region, index) => {
                    const colors = colorMap[region.color] || colorMap.emerald;
                    const isLocked = !region.isUnlocked;
                    const progress = region.progress;
                    const completionPercent = progress
                        ? Math.round((progress.questsCompleted / region.totalQuests) * 100)
                        : 0;

                    return (
                        <div
                            key={region._id}
                            onClick={() => handleRegionClick(region)}
                            className={`
                relative group cursor-pointer
                ${isLocked ? "opacity-60 cursor-not-allowed" : ""}
              `}
                        >
                            {/* Card */}
                            <div className={`
                glass-card p-6 h-full border-2 transition-all duration-300
                ${isLocked
                                    ? "border-slate-700 bg-slate-800/30"
                                    : `${colors.border} ${colors.bg} hover:shadow-xl hover:${colors.glow} hover:scale-105`
                                }
              `}>
                                {/* Lock overlay */}
                                {isLocked && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-xl z-10">
                                        <div className="text-center">
                                            <span className="text-4xl">🔒</span>
                                            <p className="text-sm text-slate-400 mt-2">
                                                Complete previous region
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Region Icon */}
                                <div className={`text-5xl mb-4 ${isLocked ? "grayscale" : ""}`}>
                                    {region.icon}
                                </div>

                                {/* Title */}
                                <h2 className={`text-xl font-bold mb-2 ${isLocked ? "text-slate-500" : "text-white"}`}>
                                    {region.name}
                                </h2>

                                {/* Description */}
                                <p className={`text-sm mb-4 ${isLocked ? "text-slate-600" : "text-slate-400"}`}>
                                    {region.description}
                                </p>

                                {/* Progress */}
                                {!isLocked && (
                                    <div className="mt-auto">
                                        {/* Stars */}
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex gap-1">
                                                {[...Array(3)].map((_, i) => (
                                                    <span
                                                        key={i}
                                                        className={`text-lg ${(progress?.totalStars || 0) > i * (region.totalQuests / 3)
                                                                ? "text-yellow-400"
                                                                : "text-slate-600"
                                                            }`}
                                                    >
                                                        ⭐
                                                    </span>
                                                ))}
                                            </div>
                                            <span className={`text-sm ${colors.text}`}>
                                                {progress?.totalStars || 0} / {region.maxStars}
                                            </span>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${colors.bg.replace('/20', '')} transition-all duration-500`}
                                                style={{ width: `${completionPercent}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1 text-right">
                                            {progress?.questsCompleted || 0} / {region.totalQuests} quests
                                        </p>

                                        {/* Completed badge */}
                                        {progress?.isCompleted && (
                                            <div className="absolute top-4 right-4">
                                                <span className="badge badge-success">✓ Complete</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Coming Soon badge */}
                                {region.status === "coming_soon" && (
                                    <div className="absolute top-4 right-4">
                                        <span className="badge bg-slate-700 text-slate-400">Coming Soon</span>
                                    </div>
                                )}
                            </div>

                            {/* Connection line to next region (except last) */}
                            {index < regions.length - 1 && (
                                <div className="hidden lg:block absolute -right-3 top-1/2 w-6 h-0.5 bg-slate-700" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Empty state */}
            {regions.length === 0 && (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">🗺️</div>
                    <h3 className="text-xl font-semibold mb-2">No Regions Available</h3>
                    <p className="text-slate-400">Check back soon for new training content!</p>
                </div>
            )}

            {/* Legend */}
            <div className="mt-12 text-center">
                <div className="inline-flex items-center gap-6 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                        <span className="text-yellow-400">⭐</span> Star earned
                    </div>
                    <div className="flex items-center gap-2">
                        <span>🔒</span> Locked region
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="badge badge-success text-xs">✓</span> Completed
                    </div>
                </div>
            </div>
        </div>
    );
}

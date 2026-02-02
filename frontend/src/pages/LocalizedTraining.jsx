import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    getRandomScenario,
    submitScenarioAnswer,
    getLocaleStats,
    updateUserLocale
} from "../services/api";

const LOCALES = [
    { code: "IN", name: "India", flag: "🇮🇳", description: "UPI, NEFT, Income Tax scams" },
    { code: "US", name: "United States", flag: "🇺🇸", description: "IRS, Amazon, Banking scams" },
    { code: "UK", name: "United Kingdom", flag: "🇬🇧", description: "HMRC, NHS, Royal Mail scams" },
    { code: "GLOBAL", name: "Global", flag: "🌍", description: "Universal phishing patterns" }
];

const CATEGORIES = [
    { id: "all", name: "All Categories", icon: "📧" },
    { id: "banking", name: "Banking", icon: "🏦" },
    { id: "payment", name: "Payment", icon: "💳" },
    { id: "government", name: "Government", icon: "🏛️" },
    { id: "shopping", name: "Shopping", icon: "🛒" },
    { id: "tech_support", name: "Tech Support", icon: "💻" },
    { id: "delivery", name: "Delivery", icon: "📦" },
    { id: "social", name: "Social", icon: "👥" }
];

export default function LocalizedTraining() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [currentLocale, setCurrentLocale] = useState(user?.locale || "GLOBAL");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [scenario, setScenario] = useState(null);
    const [loading, setLoading] = useState(false);
    const [gameState, setGameState] = useState("menu"); // menu, playing, result
    const [result, setResult] = useState(null);
    const [stats, setStats] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [score, setScore] = useState({ correct: 0, total: 0 });

    useEffect(() => {
        loadStats();
    }, [currentLocale]);

    const loadStats = async () => {
        try {
            const data = await getLocaleStats();
            setStats(data.stats);
        } catch (e) {
            console.error(e);
        }
    };

    const handleLocaleChange = async (locale) => {
        setCurrentLocale(locale);
        try {
            await updateUserLocale(locale);
        } catch (e) {
            console.error(e);
        }
    };

    const startTraining = async () => {
        setLoading(true);
        try {
            const options = {};
            if (selectedCategory !== "all") {
                options.category = selectedCategory;
            }
            const data = await getRandomScenario(options);
            if (data._id) {
                setScenario(data);
                setGameState("playing");
                setStartTime(Date.now());
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const submitAnswer = async (answer) => {
        if (!scenario) return;

        const timeSpent = Math.round((Date.now() - startTime) / 1000);

        try {
            const data = await submitScenarioAnswer(scenario._id, answer, timeSpent);
            setResult(data);
            setGameState("result");
            setScore(prev => ({
                correct: prev.correct + (data.isCorrect ? 1 : 0),
                total: prev.total + 1
            }));
        } catch (e) {
            console.error(e);
        }
    };

    const nextScenario = () => {
        setScenario(null);
        setResult(null);
        startTraining();
    };

    const backToMenu = () => {
        setGameState("menu");
        setScenario(null);
        setResult(null);
        setScore({ correct: 0, total: 0 });
    };

    // Render functions for each state
    const renderMenu = () => (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    🌍 <span className="gradient-text">Localized Threat Training</span>
                </h1>
                <p className="text-slate-400">
                    Practice detecting region-specific phishing attacks
                </p>
            </div>

            {/* Locale Selection */}
            <div className="glass-card p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Select Your Region</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {LOCALES.map(locale => (
                        <button
                            key={locale.code}
                            onClick={() => handleLocaleChange(locale.code)}
                            className={`p-4 rounded-xl border-2 transition-all ${currentLocale === locale.code
                                    ? "border-emerald-500 bg-emerald-500/10"
                                    : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                                }`}
                        >
                            <div className="text-3xl mb-2">{locale.flag}</div>
                            <div className="font-medium">{locale.name}</div>
                            <div className="text-xs text-slate-400 mt-1">{locale.description}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Category Selection */}
            <div className="glass-card p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Select Category</h2>
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${selectedCategory === cat.id
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                }`}
                        >
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="glass-card p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Your Region Stats</h2>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-emerald-400">{stats.totalScenarios || 0}</div>
                            <div className="text-sm text-slate-400">Scenarios Available</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-cyan-400">{stats.categories?.length || 0}</div>
                            <div className="text-sm text-slate-400">Categories</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-yellow-400">{Math.round(stats.avgSuccessRate || 0)}%</div>
                            <div className="text-sm text-slate-400">Avg. Success Rate</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Start Button */}
            <button
                onClick={startTraining}
                disabled={loading}
                className="btn-primary w-full text-lg py-4"
            >
                {loading ? "Loading..." : "🎯 Start Training"}
            </button>
        </div>
    );

    const renderScenario = () => {
        if (!scenario) return null;

        const content = scenario.content;

        return (
            <div className="max-w-3xl mx-auto">
                {/* Score */}
                <div className="flex justify-between items-center mb-6">
                    <button onClick={backToMenu} className="text-slate-400 hover:text-white">
                        ← Back to Menu
                    </button>
                    <div className="text-sm">
                        Score: <span className="text-emerald-400 font-bold">{score.correct}/{score.total}</span>
                    </div>
                </div>

                {/* Scenario Card */}
                <div className="glass-card p-6 mb-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <span className="badge bg-slate-700">{scenario.category}</span>
                        <span className="text-sm text-slate-400">
                            Difficulty: {"⭐".repeat(scenario.difficulty)}
                        </span>
                    </div>

                    {/* Message Type */}
                    <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                        {content.type === "email" && (
                            <>
                                <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                                    <span>From:</span>
                                    <span className="text-white">{content.sender?.name}</span>
                                    <span>&lt;{content.sender?.email}&gt;</span>
                                </div>
                                {content.subject && (
                                    <div className="text-sm text-slate-400 mb-4">
                                        <span>Subject: </span>
                                        <span className="text-white font-medium">{content.subject}</span>
                                    </div>
                                )}
                            </>
                        )}

                        {content.type === "sms" && (
                            <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                                <span>📱 SMS from:</span>
                                <span className="text-white">{content.sender?.name || content.sender?.phone}</span>
                            </div>
                        )}

                        {/* Body */}
                        <div className="whitespace-pre-wrap text-slate-200 leading-relaxed">
                            {content.body}
                        </div>

                        {/* CTA Button Preview */}
                        {content.ctaButton && (
                            <div className="mt-4 p-3 bg-blue-600 text-white rounded-lg text-center font-medium">
                                {content.ctaButton.text}
                            </div>
                        )}

                        {/* Links Preview */}
                        {content.links?.length > 0 && (
                            <div className="mt-4 text-sm">
                                <span className="text-slate-400">Links in message: </span>
                                {content.links.map((link, i) => (
                                    <span key={i} className="text-blue-400 underline ml-1">
                                        {link.displayText}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Question */}
                    <div className="text-center mb-6">
                        <h3 className="text-xl font-semibold mb-2">Is this message...</h3>
                        <p className="text-slate-400">Trust your instincts and look for red flags!</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => submitAnswer("legitimate")}
                            className="p-4 rounded-xl border-2 border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 transition group"
                        >
                            <div className="text-3xl mb-2">✅</div>
                            <div className="font-semibold text-emerald-400">Legitimate</div>
                            <div className="text-xs text-slate-400">Safe to interact</div>
                        </button>
                        <button
                            onClick={() => submitAnswer("phishing")}
                            className="p-4 rounded-xl border-2 border-red-500/50 bg-red-500/10 hover:bg-red-500/20 transition group"
                        >
                            <div className="text-3xl mb-2">🚨</div>
                            <div className="font-semibold text-red-400">Phishing</div>
                            <div className="text-xs text-slate-400">Suspicious/malicious</div>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderResult = () => {
        if (!result) return null;

        return (
            <div className="max-w-3xl mx-auto">
                {/* Result Header */}
                <div className={`glass-card p-8 text-center mb-6 ${result.isCorrect ? "border-emerald-500/50" : "border-red-500/50"
                    }`}>
                    <div className="text-6xl mb-4">
                        {result.isCorrect ? "🎉" : "😬"}
                    </div>
                    <h2 className={`text-2xl font-bold mb-2 ${result.isCorrect ? "text-emerald-400" : "text-red-400"
                        }`}>
                        {result.isCorrect ? "Correct!" : "Incorrect!"}
                    </h2>
                    {result.isCorrect && (
                        <p className="text-emerald-400">+{result.xpEarned} XP earned!</p>
                    )}
                </div>

                {/* Explanation */}
                <div className="glass-card p-6 mb-6">
                    <h3 className="font-semibold mb-3">
                        This was: <span className={result.scenario.isPhishing ? "text-red-400" : "text-emerald-400"}>
                            {result.scenario.isPhishing ? "🚨 PHISHING" : "✅ LEGITIMATE"}
                        </span>
                    </h3>

                    <p className="text-slate-300 mb-4">{result.scenario.explanation}</p>

                    {result.scenario.culturalContext && (
                        <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                            <h4 className="text-sm font-medium text-cyan-400 mb-2">🌍 Cultural Context</h4>
                            <p className="text-sm text-slate-300">{result.scenario.culturalContext}</p>
                        </div>
                    )}

                    {/* Red Flags */}
                    {result.scenario.redFlags?.length > 0 && (
                        <div>
                            <h4 className="font-medium mb-3">🚩 Red Flags to Remember:</h4>
                            <div className="space-y-2">
                                {result.scenario.redFlags.map((flag, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm">
                                        <span className="text-red-400 mt-1">•</span>
                                        <div>
                                            <span className="font-medium text-yellow-400">{flag.type}: </span>
                                            <span className="text-slate-300">{flag.description}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button onClick={backToMenu} className="btn-secondary flex-1">
                        Back to Menu
                    </button>
                    <button onClick={nextScenario} className="btn-primary flex-1">
                        Next Scenario →
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="animate-fadeIn p-4">
            {gameState === "menu" && renderMenu()}
            {gameState === "playing" && renderScenario()}
            {gameState === "result" && renderResult()}
        </div>
    );
}

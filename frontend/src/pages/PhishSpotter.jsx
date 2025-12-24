import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Sample phishing scenarios for rapid-fire mode
const SCENARIOS = [
    { id: 1, subject: "Your Account Has Been Suspended", sender: "support@amaz0n-security.com", isPhishing: true },
    { id: 2, subject: "Weekly Team Meeting Notes", sender: "sarah.manager@company.com", isPhishing: false },
    { id: 3, subject: "URGENT: Verify Your Identity NOW", sender: "security@bankofamerica.secure-login.tk", isPhishing: true },
    { id: 4, subject: "Your Invoice #12345", sender: "billing@dropbox.com", isPhishing: false },
    { id: 5, subject: "You've Won a $500 Gift Card!", sender: "rewards@walmart-prizes.net", isPhishing: true },
    { id: 6, subject: "Password Expiring in 24 Hours", sender: "it-dept@micr0soft-support.com", isPhishing: true },
    { id: 7, subject: "Project Update: Q4 Goals", sender: "john.director@company.com", isPhishing: false },
    { id: 8, subject: "Package Delivery Failed", sender: "tracking@fed-ex-delivery.info", isPhishing: true },
    { id: 9, subject: "Quarterly Newsletter", sender: "newsletter@company.com", isPhishing: false },
    { id: 10, subject: "Click Here to Claim Your Prize", sender: "winner@lottery-international.cc", isPhishing: true },
    { id: 11, subject: "Meeting Invitation: Strategy Review", sender: "calendar@company.com", isPhishing: false },
    { id: 12, subject: "Your Netflix Account is On Hold", sender: "support@netfl1x-billing.com", isPhishing: true },
    { id: 13, subject: "Performance Review Scheduled", sender: "hr@company.com", isPhishing: false },
    { id: 14, subject: "Unusual Sign-in Activity Detected", sender: "no-reply@google.com.suspicious-verify.tk", isPhishing: true },
    { id: 15, subject: "Holiday Schedule Update", sender: "admin@company.com", isPhishing: false },
];

export default function PhishSpotter() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [gameState, setGameState] = useState("ready"); // ready, playing, finished
    const [timeLeft, setTimeLeft] = useState(30);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [currentScenario, setCurrentScenario] = useState(null);
    const [scenarios, setScenarios] = useState([]);
    const [results, setResults] = useState([]);
    const [feedback, setFeedback] = useState(null);

    // Shuffle scenarios
    const shuffleScenarios = useCallback(() => {
        const shuffled = [...SCENARIOS].sort(() => Math.random() - 0.5);
        setScenarios(shuffled);
        return shuffled;
    }, []);

    // Start game
    const startGame = () => {
        const shuffled = shuffleScenarios();
        setGameState("playing");
        setTimeLeft(30);
        setScore(0);
        setStreak(0);
        setResults([]);
        setFeedback(null);
        setCurrentScenario(shuffled[0]);
    };

    // Timer
    useEffect(() => {
        if (gameState !== "playing") return;
        if (timeLeft <= 0) {
            setGameState("finished");
            return;
        }
        const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, gameState]);

    // Handle answer
    const handleAnswer = (answer) => {
        if (gameState !== "playing" || !currentScenario) return;

        const isCorrect = (answer === "phishing") === currentScenario.isPhishing;
        const multiplier = 1 + Math.min(streak * 0.1, 0.5);
        const points = isCorrect ? Math.round(10 * multiplier) : 0;

        setResults(prev => [...prev, { ...currentScenario, userAnswer: answer, correct: isCorrect }]);

        if (isCorrect) {
            setScore(s => s + points);
            setStreak(s => s + 1);
            setFeedback({ type: "correct", points });
        } else {
            setStreak(0);
            setFeedback({ type: "wrong" });
        }

        // Clear feedback after animation
        setTimeout(() => setFeedback(null), 500);

        // Next scenario
        const currentIndex = scenarios.findIndex(s => s.id === currentScenario.id);
        if (currentIndex < scenarios.length - 1) {
            setCurrentScenario(scenarios[currentIndex + 1]);
        } else {
            // Ran out of scenarios
            setGameState("finished");
        }
    };

    const correctCount = results.filter(r => r.correct).length;
    const accuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        ⚡ <span className="gradient-text">Phish Spotter</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Rapid-fire phishing detection challenge</p>
                </div>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="text-slate-400 hover:text-white transition"
                >
                    ← Back
                </button>
            </div>

            {/* READY STATE */}
            {gameState === "ready" && (
                <div className="glass-card p-8 text-center max-w-xl mx-auto">
                    <div className="text-6xl mb-4">🎯</div>
                    <h2 className="text-2xl font-bold mb-4">Ready to Test Your Skills?</h2>
                    <p className="text-slate-400 mb-6">
                        You have 30 seconds to identify as many phishing emails as possible.
                        Build streaks for bonus points!
                    </p>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="stat-card">
                            <div className="text-2xl font-bold text-cyan-400">30s</div>
                            <div className="text-xs text-slate-400">Time Limit</div>
                        </div>
                        <div className="stat-card">
                            <div className="text-2xl font-bold text-emerald-400">10+</div>
                            <div className="text-xs text-slate-400">Points Each</div>
                        </div>
                        <div className="stat-card">
                            <div className="text-2xl font-bold text-orange-400">1.5x</div>
                            <div className="text-xs text-slate-400">Max Streak</div>
                        </div>
                    </div>

                    <button onClick={startGame} className="btn-primary text-lg px-8 py-3">
                        Start Challenge
                    </button>
                </div>
            )}

            {/* PLAYING STATE */}
            {gameState === "playing" && currentScenario && (
                <div className="max-w-2xl mx-auto">
                    {/* Game HUD */}
                    <div className="glass-card p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`text-2xl font-bold font-mono ${timeLeft <= 10 ? "text-red-400" : "text-white"}`}>
                                    {timeLeft}s
                                </div>
                                <div className="h-8 w-px bg-slate-700"></div>
                                <div>
                                    <div className="text-xs text-slate-400">Score</div>
                                    <div className="text-xl font-bold text-emerald-400">{score}</div>
                                </div>
                            </div>

                            {streak > 0 && (
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400">
                                    <span className="streak-fire">🔥</span>
                                    <span className="font-bold">{streak}x</span>
                                    <span className="text-xs">streak</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Email Card */}
                    <div className={`glass-card p-6 relative overflow-hidden transition-all ${feedback?.type === "correct" ? "ring-2 ring-emerald-500" :
                            feedback?.type === "wrong" ? "ring-2 ring-red-500" : ""
                        }`}>
                        {/* Feedback Overlay */}
                        {feedback && (
                            <div className={`absolute inset-0 flex items-center justify-center text-6xl animate-countUp ${feedback.type === "correct" ? "bg-emerald-500/20" : "bg-red-500/20"
                                }`}>
                                {feedback.type === "correct" ? "✓" : "✗"}
                            </div>
                        )}

                        <div className="mb-4">
                            <div className="text-xs text-slate-400 mb-1">FROM</div>
                            <div className="text-lg font-mono text-slate-300">{currentScenario.sender}</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-400 mb-1">SUBJECT</div>
                            <div className="text-xl font-semibold">{currentScenario.subject}</div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <button
                            onClick={() => handleAnswer("safe")}
                            className="btn-secondary py-6 text-lg flex flex-col items-center gap-2 hover:bg-emerald-500/20 hover:border-emerald-500"
                        >
                            <span className="text-3xl">✅</span>
                            <span>Safe</span>
                        </button>
                        <button
                            onClick={() => handleAnswer("phishing")}
                            className="btn-secondary py-6 text-lg flex flex-col items-center gap-2 hover:bg-red-500/20 hover:border-red-500"
                        >
                            <span className="text-3xl">🚨</span>
                            <span>Phishing</span>
                        </button>
                    </div>
                </div>
            )}

            {/* FINISHED STATE */}
            {gameState === "finished" && (
                <div className="max-w-2xl mx-auto">
                    <div className="glass-card p-8 text-center mb-6">
                        <div className="text-6xl mb-4">
                            {accuracy >= 80 ? "🏆" : accuracy >= 60 ? "👍" : "💪"}
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Challenge Complete!</h2>

                        <div className="grid grid-cols-3 gap-4 my-6">
                            <div className="stat-card">
                                <div className="text-3xl font-bold gradient-text">{score}</div>
                                <div className="text-xs text-slate-400">Points</div>
                            </div>
                            <div className="stat-card">
                                <div className="text-3xl font-bold text-cyan-400">{correctCount}/{results.length}</div>
                                <div className="text-xs text-slate-400">Correct</div>
                            </div>
                            <div className="stat-card">
                                <div className="text-3xl font-bold text-emerald-400">{accuracy}%</div>
                                <div className="text-xs text-slate-400">Accuracy</div>
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button onClick={startGame} className="btn-primary">
                                Play Again
                            </button>
                            <button onClick={() => navigate("/dashboard")} className="btn-secondary">
                                Back to Dashboard
                            </button>
                        </div>
                    </div>

                    {/* Results Breakdown */}
                    <div className="card">
                        <h3 className="font-semibold mb-4">Results Breakdown</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {results.map((r, i) => (
                                <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${r.correct ? "bg-emerald-500/10" : "bg-red-500/10"
                                    }`}>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">{r.subject}</div>
                                        <div className="text-xs text-slate-400 truncate">{r.sender}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`badge ${r.isPhishing ? "badge-danger" : "badge-success"}`}>
                                            {r.isPhishing ? "Phishing" : "Safe"}
                                        </span>
                                        <span className={r.correct ? "text-emerald-400" : "text-red-400"}>
                                            {r.correct ? "✓" : "✗"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

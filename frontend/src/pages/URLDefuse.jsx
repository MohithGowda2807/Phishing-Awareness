import { useState } from "react";
import { useNavigate } from "react-router-dom";

// URL scenarios
const URL_CHALLENGES = [
    {
        id: 1,
        url: "https://www.paypa1.com/signin",
        issues: {
            protocol: false,
            domain: true, // paypa1 instead of paypal
            path: false,
            suspicious: true
        },
        hints: ["Check the domain spelling carefully", "Look for typosquatting"],
        answer: "The domain uses '1' instead of 'l' in paypal - classic typosquatting!",
        isMalicious: true,
        timer: 30
    },
    {
        id: 2,
        url: "http://secure-banking.update-info.tk/verify",
        issues: {
            protocol: true, // HTTP not HTTPS
            domain: true, // .tk is suspicious
            path: true, // /verify is phishing pattern
            suspicious: true
        },
        hints: ["No HTTPS encryption", "Check the top-level domain", "Verify path authenticity"],
        answer: "Multiple red flags: HTTP (not HTTPS), .tk domain (free/suspicious), and /verify path commonly used in phishing.",
        isMalicious: true,
        timer: 45
    },
    {
        id: 3,
        url: "https://github.com/username/repository",
        issues: {
            protocol: false,
            domain: false,
            path: false,
            suspicious: false
        },
        hints: ["Legitimate service", "Proper HTTPS", "Official domain"],
        answer: "This is a legitimate GitHub URL with proper HTTPS and official domain.",
        isMalicious: false,
        timer: 20
    },
    {
        id: 4,
        url: "https://amaz0n-deals.shop/products/iphone",
        issues: {
            protocol: false,
            domain: true, // amaz0n and .shop
            path: false,
            suspicious: true
        },
        hints: ["Check domain spelling", "Is .shop the real Amazon domain?"],
        answer: "Uses '0' instead of 'o' in amazon, and .shop is not Amazon's official domain (.com is).",
        isMalicious: true,
        timer: 30
    },
    {
        id: 5,
        url: "https://accounts.google.com/signin/v2/identifier",
        issues: {
            protocol: false,
            domain: false,
            path: false,
            suspicious: false
        },
        hints: ["Official Google service", "Proper subdomain", "Legitimate path"],
        answer: "This is an authentic Google sign-in URL with proper HTTPS and official domain.",
        isMalicious: false,
        timer: 20
    }
];

export default function URLDefuse() {
    const navigate = useNavigate();
    const [gameStarted, setGameStarted] = useState(false);
    const [currentLevel, setCurrentLevel] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [selectedWires, setSelectedWires] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [defused, setDefused] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    const currentURL = URL_CHALLENGES[currentLevel];

    const startGame = () => {
        setGameStarted(true);
        setTimeLeft(URL_CHALLENGES[0].timer);
        startTimer();
    };

    const startTimer = () => {
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    explode();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const toggleWire = (wire) => {
        if (showResult) return;

        setSelectedWires(prev => {
            if (prev.includes(wire)) {
                return prev.filter(w => w !== wire);
            }
            return [...prev, wire];
        });
    };

    const attemptDefuse = () => {
        const isCorrect = currentURL.isMalicious
            ? selectedWires.length > 0 // For malicious URLs, need to cut at least one wire
            : selectedWires.length === 0; // For safe URLs, don't cut anything

        setDefused(isCorrect);
        setShowResult(true);

        if (isCorrect) {
            setScore(prev => prev + (timeLeft * 10));

            setTimeout(() => {
                if (currentLevel < URL_CHALLENGES.length - 1) {
                    setCurrentLevel(prev => prev + 1);
                    setSelectedWires([]);
                    setShowResult(false);
                    setTimeLeft(URL_CHALLENGES[currentLevel + 1].timer);
                } else {
                    setGameOver(true);
                }
            }, 3000);
        } else {
            explode();
        }
    };

    const explode = () => {
        setShowResult(true);
        setDefused(false);
        setTimeout(() => {
            setGameOver(true);
        }, 2000);
    };

    // Game over
    if (gameOver) {
        return (
            <div className="animate-fadeIn">
                <div className="max-w-2xl mx-auto">
                    <div className="glass-card p-8 text-center">
                        <div className="text-6xl mb-4">{defused ? "🎉" : "💥"}</div>
                        <h2 className="text-3xl font-bold mb-2">
                            {defused ? "Mission Complete!" : "Game Over!"}
                        </h2>
                        <p className="text-lg text-secondary mb-6">
                            {defused
                                ? `You successfully defused all ${URL_CHALLENGES.length} URL bombs!`
                                : "The URL exploded! Better luck next time."
                            }
                        </p>

                        <div className="bg-surface p-6 rounded-lg mb-6">
                            <div className="text-sm text-secondary mb-1">Final Score</div>
                            <div className="text-4xl font-bold text-primary">{score}</div>
                            <div className="text-sm text-muted mt-1">
                                Levels Completed: {currentLevel + (defused ? 1 : 0)}/{URL_CHALLENGES.length}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    setGameStarted(false);
                                    setCurrentLevel(0);
                                    setScore(0);
                                    setSelectedWires([]);
                                    setShowResult(false);
                                    setGameOver(false);
                                }}
                                className="btn-primary w-full"
                            >
                                🔄 Play Again
                            </button>
                            <button onClick={() => navigate("/training")} className="btn-secondary w-full">
                                ← Back to Training Hub
                            </button>
                        </div>
                    </div>
                </div>
            </div>);
    }

    // Start screen
    if (!gameStarted) {
        return (
            <div className="animate-fadeIn">
                <div className="max-w-2xl mx-auto">
                    <div className="glass-card p-8 text-center">
                        <div className="text-6xl mb-4">💣</div>
                        <h1 className="text-3xl font-bold mb-4">URL Defuse</h1>
                        <p className="text-lg text-secondary mb-6">
                            Defuse malicious URLs before they explode! Cut the right wires to neutralize threats.
                        </p>

                        <div className="bg-hover rounded-lg p-6 mb-6 text-left">
                            <h3 className="font-bold mb-3">How to Play:</h3>
                            <ul className="space-y-2 text-sm text-secondary">
                                <li>• Analyze the URL for security issues</li>
                                <li>• Click wires to cut them (protocol, domain, path)</li>
                                <li>• For malicious URLs: cut the suspicious wires</li>
                                <li>• For safe URLs: don't cut any wires!</li>
                                <li>• Defuse before time runs out!</li>
                            </ul>
                        </div>

                        <button onClick={startGame} className="btn-primary text-xl px-8 py-4">
                            💣 Start Defusing
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main game
    return (
        <div className="animate-fadeIn">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold">💣 URL Defuse</div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="stat-card">
                            <div className="text-xs text-secondary">Level</div>
                            <div className="text-lg font-bold">{currentLevel + 1}/{URL_CHALLENGES.length}</div>
                        </div>
                        <div className="stat-card">
                            <div className="text-xs text-secondary">Score</div>
                            <div className="text-lg font-bold text-primary">{score}</div>
                        </div>
                        <div className={`stat-card ${timeLeft <= 10 ? "animate-pulse border-red-500" : ""}`}>
                            <div className="text-xs text-secondary">Time</div>
                            <div className={`text-lg font-bold ${timeLeft <= 10 ? "text-red-400" : "text-orange-400"}`}>
                                {timeLeft}s
                            </div>
                        </div>
                    </div>
                </div>

                {/* URL Bomb */}
                <div className="glass-card p-8 mb-6">
                    <div className={`bg-surface rounded-lg p-6 mb-6 ${showResult ? (defused ? "border-4 border-emerald-500" : "border-4 border-red-500 animate-pulse") : ""}`}>
                        <div className="text-center text-6xl mb-4">
                            {showResult ? (defused ? "✅" : "💥") : "💣"}
                        </div>
                        <div className="font-mono text-lg text-center break-all mb-4 py-3 bg-hover rounded px-4">
                            {currentURL.url}
                        </div>

                        {showResult && (
                            <div className={`p-4 rounded-lg text-center ${defused ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                                <div className="font-bold mb-2">{defused ? "Defused! ✅" : "Exploded! 💥"}</div>
                                <div className="text-sm">{currentURL.answer}</div>
                            </div>
                        )}
                    </div>

                    {/* Wires to Cut */}
                    {!showResult && (
                        <div className="space-y-4 mb-6">
                            <div className="text-center text-sm text-secondary mb-4">
                                Click wires to cut them (cut suspicious parts only!)
                            </div>

                            <button
                                onClick={() => toggleWire("protocol")}
                                className={`w-full p-4 rounded-lg border-4 transition-all ${selectedWires.includes("protocol")
                                        ? "border-red-500 bg-red-500/20 line-through"
                                        : "border-blue-500 bg-blue-500/10 hover:bg-blue-500/20"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-mono">{currentURL.url.split("://")[0]}://</span>
                                    <span className="text-xs text-secondary">PROTOCOL</span>
                                </div>
                            </button>

                            <button
                                onClick={() => toggleWire("domain")}
                                className={`w-full p-4 rounded-lg border-4 transition-all ${selectedWires.includes("domain")
                                        ? "border-red-500 bg-red-500/20 line-through"
                                        : "border-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-mono">{currentURL.url.split("/")[2]}</span>
                                    <span className="text-xs text-secondary">DOMAIN</span>
                                </div>
                            </button>

                            <button
                                onClick={() => toggleWire("path")}
                                className={`w-full p-4 rounded-lg border-4 transition-all ${selectedWires.includes("path")
                                        ? "border-red-500 bg-red-500/20 line-through"
                                        : "border-green-500 bg-green-500/10 hover:bg-green-500/20"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-mono">/{currentURL.url.split("/").slice(3).join("/")}</span>
                                    <span className="text-xs text-secondary">PATH</span>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* Hints */}
                    {!showResult && (
                        <div className="bg-hover rounded-lg p-4 mb-6">
                            <div className="text-sm font-semibold mb-2">💡 Hints:</div>
                            <ul className="space-y-1 text-xs text-secondary">
                                {currentURL.hints.map((hint, i) => (
                                    <li key={i}>• {hint}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Defuse Button */}
                    {!showResult && (
                        <button
                            onClick={attemptDefuse}
                            className="btn-primary w-full py-4 text-lg"
                        >
                            ✂️ Attempt Defuse
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

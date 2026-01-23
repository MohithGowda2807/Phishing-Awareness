import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Sample emails for the game
const EMAIL_POOL = [
    // SPAM
    { id: 1, from: "prince.nigeria@gmail.com", subject: "URGENT: Claim your $10,000,000 inheritance!", isSpam: true, difficulty: 1 },
    { id: 2, from: "winner@lottery-prizes.xyz", subject: "YOU WON! Claim prize now!", isSpam: true, difficulty: 1 },
    { id: 3, from: "security@paypa1-verify.com", subject: "Verify your account immediately", isSpam: true, difficulty: 2 },
    { id: 4, from: "support@amazon-refund.tk", subject: "Refund pending - click here", isSpam: true, difficulty: 2 },
    { id: 5, from: "noreply@microsoft-securityalert.net", subject: "Windows license expired", isSpam: true, difficulty: 3 },
    { id: 6, from: "jobs@remote-work-now.biz", subject: "$500/day work from home!", isSpam: true, difficulty: 1 },
    { id: 7, from: "admin@yourbank-secure.com", subject: "Account locked - verify identity", isSpam: true, difficulty: 3 },
    { id: 8, from: "no-reply@facebook-security.org", subject: "Someone logged into your account", isSpam: true, difficulty: 2 },

    // LEGITIMATE
    { id: 101, from: "noreply@github.com", subject: "Your GitHub security alert", isSpam: false, difficulty: 1 },
    { id: 102, from: "receipts@amazon.com", subject: "Your Amazon.com order confirmation", isSpam: false, difficulty: 1 },
    { id: 103, from: "notifications@linkedin.com", subject: "You have 3 new connection requests", isSpam: false, difficulty: 2 },
    { id: 104, from: "no-reply@accounts.google.com", subject: "Security alert: New sign-in", isSpam: false, difficulty: 2 },
    { id: 105, from: "team@slack.com", subject: "New message from workspace", isSpam: false, difficulty: 1 },
    { id: 106, from: "support@netflix.com", subject: "Your payment was successful", isSpam: false, difficulty: 1 },
    { id: 107, from: "hello@stripe.com", subject: "Payment received - Invoice #12345", isSpam: false, difficulty: 2 },
    { id: 108, from: "noreply@dropbox.com", subject: "File shared with you", isSpam: false, difficulty: 1 }
];

export default function SpamEmailBattle() {
    const navigate = useNavigate();
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [lives, setLives] = useState(3);
    const [currentEmail, setCurrentEmail] = useState(null);
    const [emailQueue, setEmailQueue] = useState([]);
    const [draggedItem, setDraggedItem] = useState(null);
    const [spamCount, setSpamCount] = useState(0);
    const [legitCount, setLegitCount] = useState(0);

    // Initialize game
    const startGame = () => {
        setGameStarted(true);
        setGameOver(false);
        setLevel(1);
        setScore(0);
        setCombo(0);
        setLives(3);
        setSpamCount(0);
        setLegitCount(0);
        generateNewEmail();
    };

    // Generate new email based on level
    const generateNewEmail = () => {
        const availableEmails = EMAIL_POOL.filter(e => e.difficulty <= Math.ceil(level / 2));
        const randomEmail = availableEmails[Math.floor(Math.random() * availableEmails.length)];
        setCurrentEmail({ ...randomEmail, id: Date.now() }); // Unique ID for each instance
    };

    // Handle email classification
    const classifyEmail = (userSaysSpam) => {
        if (!currentEmail) return;

        const correct = (userSaysSpam && currentEmail.isSpam) || (!userSaysSpam && !currentEmail.isSpam);

        if (correct) {
            // Correct classification
            const basePoints = 10 * level;
            const comboBonus = combo * 5;
            const totalPoints = basePoints + comboBonus;

            setScore(prev => prev + totalPoints);
            setCombo(prev => prev + 1);

            if (currentEmail.isSpam) {
                setSpamCount(prev => prev + 1);
            } else {
                setLegitCount(prev => prev + 1);
            }

            // Level up every 10 correct
            if ((spamCount + legitCount + 1) % 10 === 0) {
                setLevel(prev => prev + 1);
            }
        } else {
            // Wrong classification
            setCombo(0);
            setLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) {
                    setGameOver(true);
                    return 0;
                }
                return newLives;
            });
        }

        // Generate next email
        setTimeout(() => {
            if (!gameOver) {
                generateNewEmail();
            }
        }, 500);
    };

    const handleDragStart = (type) => {
        setDraggedItem(type);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (zone) => {
        if (draggedItem === "email") {
            classifyEmail(zone === "spam");
        }
        setDraggedItem(null);
    };

    // Game over screen
    if (gameOver) {
        return (
            <div className="animate-fadeIn">
                <div className="max-w-2xl mx-auto">
                    <div className="glass-card p-8 text-center">
                        <div className="text-6xl mb-4">📧</div>
                        <h2 className="text-3xl font-bold mb-2">Game Over!</h2>
                        <p className="text-lg text-secondary mb-6">Your inbox is overwhelmed!</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-surface p-4 rounded-lg">
                                <div className="text-sm text-secondary mb-1">Final Score</div>
                                <div className="text-2xl font-bold text-primary">{score}</div>
                            </div>
                            <div className="bg-surface p-4 rounded-lg">
                                <div className="text-sm text-secondary mb-1">Level Reached</div>
                                <div className="text-2xl font-bold text-cyan-400">{level}</div>
                            </div>
                            <div className="bg-surface p-4 rounded-lg">
                                <div className="text-sm text-secondary mb-1">Spam Blocked</div>
                                <div className="text-2xl font-bold text-red-400">{spamCount}</div>
                            </div>
                            <div className="bg-surface p-4 rounded-lg">
                                <div className="text-sm text-secondary mb-1">Legit Saved</div>
                                <div className="text-2xl font-bold text-emerald-400">{legitCount}</div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button onClick={startGame} className="btn-primary w-full">
                                🔄 Play Again
                            </button>
                            <button onClick={() => navigate("/training")} className="btn-secondary w-full">
                                ← Back to Training Hub
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Start screen
    if (!gameStarted) {
        return (
            <div className="animate-fadeIn">
                <div className="max-w-2xl mx-auto">
                    <div className="glass-card p-8 text-center">
                        <div className="text-6xl mb-4">📧</div>
                        <h1 className="text-3xl font-bold mb-4">Spam Email Battle</h1>
                        <p className="text-lg text-secondary mb-6">
                            Defend your inbox! Drag emails to the correct folder before time runs out.
                        </p>

                        <div className="bg-hover rounded-lg p-6 mb-6 text-left">
                            <h3 className="font-bold mb-3">How to Play:</h3>
                            <ul className="space-y-2 text-sm text-secondary">
                                <li>• Drag spam emails to the 🗑️ Spam folder</li>
                                <li>• Drag legitimate emails to the 📥 Inbox</li>
                                <li>• Build combos for bonus points!</li>
                                <li>• 3 mistakes and it's game over</li>
                                <li>• Difficulty increases as you level up</li>
                            </ul>
                        </div>

                        <button onClick={startGame} className="btn-primary text-xl px-8 py-4">
                            🎮 Start Game
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
                {/* Header Stats */}
                <div className="grid grid-cols-5 gap-4 mb-6">
                    <div className="stat-card text-center">
                        <div className="text-xs text-secondary mb-1">Score</div>
                        <div className="text-lg font-bold text-primary">{score}</div>
                    </div>
                    <div className="stat-card text-center">
                        <div className="text-xs text-secondary mb-1">Level</div>
                        <div className="text-lg font-bold text-cyan-400">{level}</div>
                    </div>
                    <div className="stat-card text-center">
                        <div className="text-xs text-secondary mb-1">Combo</div>
                        <div className={`text-lg font-bold ${combo > 0 ? "text-orange-400 animate-pulse" : "text-muted"}`}>
                            {combo > 0 ? `${combo}x` : "-"}
                        </div>
                    </div>
                    <div className="stat-card text-center">
                        <div className="text-xs text-secondary mb-1">Lives</div>
                        <div className="text-lg">
                            {Array(3).fill(0).map((_, i) => (
                                <span key={i} className={i < lives ? "text-red-500" : "text-muted"}>
                                    {i < lives ? "❤️" : "🖤"}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="stat-card text-center">
                        <button
                            onClick={() => {
                                setGameOver(true);
                                setGameStarted(false);
                            }}
                            className="text-xs text-secondary hover:text-red-400"
                        >
                            End Game
                        </button>
                    </div>
                </div>

                {/* Email Display */}
                {currentEmail && (
                    <div className="glass-card p-6 mb-6">
                        <div
                            draggable
                            onDragStart={() => handleDragStart("email")}
                            className="bg-surface p-6 rounded-lg cursor-move hover:bg-hover transition-all border-2 border-dashed border-border hover:border-primary"
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                    📧
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-semibold truncate">{currentEmail.from}</div>
                                        <div className="text-xs text-muted">Just now</div>
                                    </div>
                                    <div className="text-sm font-medium mb-2">{currentEmail.subject}</div>
                                    <div className="text-xs text-secondary">
                                        Click and drag this email to classify it
                                    </div>
                                </div>
                            </div>

                            <div className="text-center text-sm text-primary font-semibold">
                                👆 Drag me to the correct folder!
                            </div>
                        </div>
                    </div>
                )}

                {/* Drop Zones */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Inbox */}
                    <div
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop("inbox")}
                        className={`glass-card p-8 text-center transition-all ${draggedItem === "email"
                                ? "border-4 border-emerald-500 bg-emerald-500/10 scale-105"
                                : "border-2 border-border"
                            }`}
                    >
                        <div className="text-6xl mb-4">📥</div>
                        <h3 className="text-xl font-bold mb-2 text-emerald-400">Inbox</h3>
                        <p className="text-sm text-secondary mb-4">Legitimate Emails</p>
                        <div className="text-3xl font-bold text-emerald-400">{legitCount}</div>
                    </div>

                    {/* Spam */}
                    <div
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop("spam")}
                        className={`glass-card p-8 text-center transition-all ${draggedItem === "email"
                                ? "border-4 border-red-500 bg-red-500/10 scale-105"
                                : "border-2 border-border"
                            }`}
                    >
                        <div className="text-6xl mb-4">🗑️</div>
                        <h3 className="text-xl font-bold mb-2 text-red-400">Spam</h3>
                        <p className="text-sm text-secondary mb-4">Junk & Phishing</p>
                        <div className="text-3xl font-bold text-red-400">{spamCount}</div>
                    </div>
                </div>

                {/* Quick Action Buttons (for mobile/no drag) */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                    <button
                        onClick={() => classifyEmail(false)}
                        className="btn-primary bg-emerald-500 hover:bg-emerald-600 py-4"
                    >
                        ✅ Legitimate
                    </button>
                    <button
                        onClick={() => classifyEmail(true)}
                        className="btn-primary bg-red-500 hover:bg-red-600 py-4"
                    >
                        🗑️ Spam
                    </button>
                </div>
            </div>
        </div>
    );
}

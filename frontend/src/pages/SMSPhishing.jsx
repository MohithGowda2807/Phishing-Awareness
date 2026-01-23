import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Sample SMS dataset
const SMS_MESSAGES = [
    {
        id: 1,
        sender: "+1-555-BANK",
        senderName: "Bank Alert",
        message: "URGENT: Your account has been locked due to suspicious activity. Verify now: bit.ly/securbank23",
        time: "2 min ago",
        isPhishing: true,
        redFlags: ["Urgency", "Shortened URL", "Suspicious sender", "Account threat"],
        explanation: "This is a phishing attempt. Banks never send urgent security alerts via SMS with links. The shortened URL hides the real destination, and 'bit.ly' is a common phishing tactic."
    },
    {
        id: 2,
        sender: "+1-800-123-4567",
        senderName: "Amazon",
        message: "Your package #AMZ-9847 has been delivered to your front door. Thank you for shopping with us!",
        time: "5 min ago",
        isPhishing: false,
        redFlags: [],
        explanation: "This is a legitimate delivery notification. It doesn't ask for any action, has a proper tracking number, and is informational only."
    },
    {
        id: 3,
        sender: "+91-99999-PRIZE",
        senderName: "Lottery Winner",
        message: "CONGRATULATIONS! You've won $50,000 in our sweepstakes! Claim now: www.prize-claim-center.tk Reply YES to confirm",
        time: "10 min ago",
        isPhishing: true,
        redFlags: ["Too good to be true", "Suspicious domain (.tk)", "Reply to claim", "Unsolicited prize"],
        explanation: "Classic prize scam. You can't win contests you didn't enter. The .tk domain is free and commonly used by scammers. Never reply to unknown numbers."
    },
    {
        id: 4,
        sender: "Netflix",
        senderName: "Netflix",
        message: "Your Netflix subscription will renew on Dec 25. We'll charge $15.99 to your card ending in 4532.",
        time: "1 hour ago",
        isPhishing: false,
        redFlags: [],
        explanation: "Legitimate subscription reminder. It's informational, doesn't require action, and mentions specific account details."
    },
    {
        id: 5,
        sender: "+1-234-567-8900",
        senderName: "Unknown",
        message: "Hi Mom, my phone broke. This is my new number. I need money urgently. Can you send $500 to this Venmo: @emergency2024",
        time: "20 min ago",
        isPhishing: true,
        redFlags: ["Family impersonation", "Urgency", "Money request", "New number claim"],
        explanation: "Family emergency scam. Always verify by calling the old number or another family member. Scammers prey on parental concern."
    },
    {
        id: 6,
        sender: "FedEx",
        senderName: "FedEx",
        message: "Delivery attempted. Package requires $2.50 customs fee. Pay here: fedex-redeliver.com/track",
        time: "30 min ago",
        isPhishing: true,
        redFlags: ["Small fee request", "Fake domain", "Unexpected customs fee"],
        explanation: "Phishing scam. FedEx uses fedex.com, not look-alike domains. Small fees ($2-5) are psychological tricks to seem legitimate."
    },
    {
        id: 7,
        sender: "+1-555-2FA",
        senderName: "Google",
        message: "Your Google verification code is: 847392. Never share this code with anyone.",
        time: "Just now",
        isPhishing: false,
        redFlags: [],
        explanation: "Legitimate 2FA code. The warning not to share is a security feature. However, if you didn't request it, someone may be trying to access your account."
    },
    {
        id: 8,
        sender: "+1-IRS-GOV",
        senderName: "IRS",
        message: "FINAL NOTICE: You owe $4,782 in back taxes. Pay within 24 hours to avoid arrest. Call 1-800-555-FAKE immediately.",
        time: "15 min ago",
        isPhishing: true,
        redFlags: ["Government impersonation", "Threat of arrest", "Urgency", "Phone number"],
        explanation: "IRS scam. The IRS never contacts taxpayers via SMS, never threatens arrest, and always sends official mail first."
    },
    {
        id: 9,
        sender: "Uber",
        senderName: "Uber",
        message: "Your ride receipt: $18.50 from Home to Airport. Thanks for riding with Uber!",
        time: "2 hours ago",
        isPhishing: false,
        redFlags: [],
        explanation: "Legitimate Uber receipt. It's a simple confirmation of a completed ride with no links or requests for action."
    },
    {
        id: 10,
        sender: "+1-800-COVID",
        senderName: "Health Dept",
        message: "You were exposed to COVID-19. Schedule free testing: covidtest-schedule.net/book Bring ID and insurance.",
        time: "45 min ago",
        isPhishing: true,
        redFlags: ["Health scare", "Suspicious domain", "Request for personal info"],
        explanation: "COVID-19 phishing scam. Government health departments use .gov domains and don't send unsolicited exposure notifications via SMS."
    }
];

export default function SMSPhishingSimulator() {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [lastDecision, setLastDecision] = useState(null);
    const [gameComplete, setGameComplete] = useState(false);
    const [streak, setStreak] = useState(0);

    const currentMessage = SMS_MESSAGES[currentIndex];

    const handleSwipe = (direction) => {
        const userSaysPhishing = direction === "left";
        const isCorrect = (userSaysPhishing && currentMessage.isPhishing) ||
            (!userSaysPhishing && !currentMessage.isPhishing);

        setSwipeDirection(direction);
        setLastDecision({
            correct: isCorrect,
            userChoice: userSaysPhishing ? "Phishing" : "Safe",
            actualAnswer: currentMessage.isPhishing ? "Phishing" : "Safe"
        });

        if (isCorrect) {
            setScore(score + 10);
            setStreak(streak + 1);
        } else {
            setStreak(0);
        }

        setShowFeedback(true);

        setTimeout(() => {
            if (currentIndex < SMS_MESSAGES.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setShowFeedback(false);
                setSwipeDirection(null);
            } else {
                setGameComplete(true);
            }
        }, 3000);
    };

    const getFinalScore = () => {
        const maxScore = SMS_MESSAGES.length * 10;
        const percentage = Math.round((score / maxScore) * 100);
        if (percentage >= 90) return { grade: "A+", message: "Security Expert!", color: "text-emerald-400" };
        if (percentage >= 80) return { grade: "A", message: "Great Job!", color: "text-green-400" };
        if (percentage >= 70) return { grade: "B", message: "Good Work!", color: "text-blue-400" };
        if (percentage >= 60) return { grade: "C", message: "Keep Practicing", color: "text-yellow-400" };
        return { grade: "D", message: "Needs Improvement", color: "text-red-400" };
    };

    if (gameComplete) {
        const result = getFinalScore();
        const maxScore = SMS_MESSAGES.length * 10;
        const percentage = Math.round((score / maxScore) * 100);

        return (
            <div className="animate-fadeIn">
                <div className="max-w-md mx-auto">
                    <div className="glass-card p-8 text-center">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-3xl font-bold mb-2">Game Complete!</h2>

                        <div className={`text-6xl font-bold mb-4 ${result.color}`}>
                            {result.grade}
                        </div>
                        <p className="text-xl mb-6">{result.message}</p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-surface p-4 rounded-lg">
                                <div className="text-sm text-secondary mb-1">Score</div>
                                <div className="text-2xl font-bold text-primary">{score}/{maxScore}</div>
                            </div>
                            <div className="bg-surface p-4 rounded-lg">
                                <div className="text-sm text-secondary mb-1">Accuracy</div>
                                <div className="text-2xl font-bold text-primary">{percentage}%</div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    setCurrentIndex(0);
                                    setScore(0);
                                    setStreak(0);
                                    setGameComplete(false);
                                }}
                                className="btn-primary w-full"
                            >
                                🔄 Play Again
                            </button>
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="btn-secondary w-full"
                            >
                                ← Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="max-w-md mx-auto mb-4">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="text-secondary hover:text-base"
                    >
                        ← Back
                    </button>
                    <h1 className="text-xl font-bold">📱 SMS Phishing Detector</h1>
                    <div className="text-sm text-secondary">
                        {currentIndex + 1}/{SMS_MESSAGES.length}
                    </div>
                </div>

                {/* Score Bar */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-secondary">Score:</span>
                        <span className="text-lg font-bold text-primary">{score}</span>
                    </div>
                    {streak > 1 && (
                        <div className="flex items-center gap-1 animate-pulse">
                            <span className="text-sm">🔥</span>
                            <span className="text-sm font-bold text-orange-400">{streak} streak!</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Phone Simulator */}
            <div className="max-w-md mx-auto">
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-4 shadow-2xl border-8 border-slate-700">
                    {/* Phone Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl"></div>

                    {/* Status Bar */}
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-4 pt-2">
                        <span>9:41 AM</span>
                        <div className="flex items-center gap-1">
                            <span>📶</span>
                            <span>🔋 85%</span>
                        </div>
                    </div>

                    {/* Message Card */}
                    <div
                        className={`bg-surface rounded-2xl p-4 shadow-lg transition-all duration-300 ${swipeDirection === "left" ? "transform -translate-x-96 opacity-0" : ""
                            } ${swipeDirection === "right" ? "transform translate-x-96 opacity-0" : ""
                            }`}
                    >
                        {/* Sender Info */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                                {currentMessage.senderName[0]}
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold">{currentMessage.senderName}</div>
                                <div className="text-xs text-secondary">{currentMessage.sender}</div>
                            </div>
                            <div className="text-xs text-muted">{currentMessage.time}</div>
                        </div>

                        {/* Message Content */}
                        <div className="bg-hover p-4 rounded-lg mb-4">
                            <p className="text-base leading-relaxed">{currentMessage.message}</p>
                        </div>

                        {/* Swipe Instructions */}
                        {!showFeedback && (
                            <div className="flex items-center justify-center gap-8 py-4">
                                <div className="text-center">
                                    <div className="text-3xl mb-2">👈</div>
                                    <div className="text-xs text-secondary">Swipe Left</div>
                                    <div className="text-sm font-bold text-red-400">Phishing</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl mb-2">👉</div>
                                    <div className="text-xs text-secondary">Swipe Right</div>
                                    <div className="text-sm font-bold text-emerald-400">Safe</div>
                                </div>
                            </div>
                        )}

                        {/* Feedback */}
                        {showFeedback && lastDecision && (
                            <div className={`p-4 rounded-lg ${lastDecision.correct
                                    ? "bg-emerald-500/10 border border-emerald-500/50"
                                    : "bg-red-500/10 border border-red-500/50"
                                }`}>
                                <div className={`text-center mb-2 ${lastDecision.correct ? "text-emerald-400" : "text-red-400"
                                    }`}>
                                    <div className="text-3xl mb-1">
                                        {lastDecision.correct ? "✅" : "❌"}
                                    </div>
                                    <div className="font-bold">
                                        {lastDecision.correct ? "Correct!" : "Wrong!"}
                                    </div>
                                    <div className="text-sm">
                                        You said: {lastDecision.userChoice} | Answer: {lastDecision.actualAnswer}
                                    </div>
                                </div>

                                {currentMessage.redFlags.length > 0 && (
                                    <div className="mb-2">
                                        <div className="text-xs text-secondary mb-1">🚩 Red Flags:</div>
                                        <div className="flex flex-wrap gap-1">
                                            {currentMessage.redFlags.map((flag, i) => (
                                                <span key={i} className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                                                    {flag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="text-sm text-secondary">
                                    {currentMessage.explanation}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    {!showFeedback && (
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <button
                                onClick={() => handleSwipe("left")}
                                className="bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500/50 text-red-400 font-bold py-4 rounded-xl transition-all hover:scale-105"
                            >
                                🚨 Phishing
                            </button>
                            <button
                                onClick={() => handleSwipe("right")}
                                className="bg-emerald-500/20 hover:bg-emerald-500/30 border-2 border-emerald-500/50 text-emerald-400 font-bold py-4 rounded-xl transition-all hover:scale-105"
                            >
                                ✅ Safe
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Tips */}
            <div className="max-w-md mx-auto mt-6 p-4 bg-hover rounded-lg text-sm text-secondary">
                <div className="font-semibold mb-2">💡 Quick Tips:</div>
                <ul className="space-y-1 text-xs">
                    <li>• Check sender for suspicious numbers</li>
                    <li>• Hover over links to see real URL</li>
                    <li>• Watch for urgency and threats</li>
                    <li>• Verify unexpected prizes or fees</li>
                </ul>
            </div>
        </div>
    );
}

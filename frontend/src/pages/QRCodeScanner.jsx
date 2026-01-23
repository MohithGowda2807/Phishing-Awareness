import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Sample QR code scenarios
const QR_SCENARIOS = [
    {
        id: 1,
        qrData: "https://bit.ly/free-iphone",
        actualURL: "https://malicious-phishing-site.tk/steal-data",
        isMalicious: true,
        redFlags: ["Shortened URL hides real destination", "Free iPhone = too good to be true", ".tk domain suspicious"],
        description: "Restaurant menu QR code (compromised)",
        context: "Found on a table at a restaurant"
    },
    {
        id: 2,
        qrData: "https://github.com/torvalds/linux",
        actualURL: "https://github.com/torvalds/linux",
        isMalicious: false,
        redFlags: [],
        description: "GitHub repository link",
        context: "Shared in a programming conference"
    },
    {
        id: 3,
        qrData: "https://parking-payment.xyz/pay?lot=A47",
        actualURL: "https://parking-payment.xyz/pay?lot=A47",
        isMalicious: true,
        redFlags: ["Unusual domain for parking", ".xyz TLD often used in scams", "Requests payment"],
        description: "Parking payment QR code",
        context: "Posted on a parking meter"
    },
    {
        id: 4,
        qrData: "https://menu.restaurant-name.com/digital-menu",
        actualURL: "https://menu.restaurant-name.com/digital-menu",
        isMalicious: false,
        redFlags: [],
        description: "Restaurant digital menu",
        context: "Official restaurant QR code"
    },
    {
        id: 5,
        qrData: "https://tinyurl.com/urgent-update",
        actualURL: "https://fake-windows-update.com/ransomware.exe",
        isMalicious: true,
        redFlags: ["Shortened URL", "Urgency tactic", "Links to .exe file", "Fake Windows domain"],
        description: "Windows Update notification",
        context: "Sticker on public computer"
    }
];

export default function QRCodeScanner() {
    const navigate = useNavigate();
    const [gameStarted, setGameStarted] = useState(false);
    const [currentLevel, setCurrentLevel] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [userDecision, setUserDecision] = useState(null);
    const [scanned, setScanned] = useState(false);

    const currentQR = QR_SCENARIOS[currentLevel];

    const startGame = () => {
        setGameStarted(true);
        setCurrentLevel(0);
        setScore(0);
    };

    const scanQR = () => {
        setScanned(true);
    };

    const makeDecision = (isSafe) => {
        const correct = (isSafe && !currentQR.isMalicious) || (!isSafe && currentQR.isMalicious);

        setUserDecision({ isSafe, correct });
        setShowResult(true);

        if (correct) {
            setScore(prev => prev + 100);
        }

        setTimeout(() => {
            if (currentLevel < QR_SCENARIOS.length - 1) {
                setCurrentLevel(prev => prev + 1);
                setScanned(false);
                setShowResult(false);
                setUserDecision(null);
            } else {
                // Game complete
            }
        }, 3000);
    };

    // Start screen
    if (!gameStarted) {
        return (
            <div className="animate-fadeIn">
                <div className="max-w-2xl mx-auto">
                    <div className="glass-card p-8 text-center">
                        <div className="text-6xl mb-4">📱</div>
                        <h1 className="text-3xl font-bold mb-4">QR Code Scanner</h1>
                        <p className="text-lg text-secondary mb-6">
                            Learn to identify malicious QR codes before scanning them!
                        </p>

                        <div className="bg-hover rounded-lg p-6 mb-6 text-left">
                            <h3 className="font-bold mb-3">How to Play:</h3>
                            <ul className="space-y-2 text-sm text-secondary">
                                <li>• Click "Scan QR Code" to reveal the destination</li>
                                <li>• Analyze the URL for red flags</li>
                                <li>• Decide if it's safe or malicious</li>
                                <li>• Learn what makes QR codes dangerous</li>
                                <li>• Never scan unknown QR codes in real life!</li>
                            </ul>
                        </div>

                        <button onClick={startGame} className="btn-primary text-xl px-8 py-4">
                            📱 Start Scanning
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
                        <button onClick={() => navigate("/training")} className="text-secondary hover:text-base">
                            ← Back
                        </button>
                        <h1 className="text-2xl font-bold">📱 QR Code Scanner</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="stat-card">
                            <div className="text-xs text-secondary">QR Code</div>
                            <div className="text-lg font-bold">{currentLevel + 1}/{QR_SCENARIOS.length}</div>
                        </div>
                        <div className="stat-card">
                            <div className="text-xs text-secondary">Score</div>
                            <div className="text-lg font-bold text-primary">{score}</div>
                        </div>
                    </div>
                </div>

                {/* Context */}
                <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">📍</span>
                        <span className="font-semibold">Context:</span>
                    </div>
                    <p className="text-secondary">{currentQR.context}</p>
                </div>

                {/* QR Code Display */}
                <div className="glass-card p-8 mb-6">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* QR Code Visual */}
                        <div className="flex-1 flex flex-col items-center">
                            <div className="text-sm text-secondary mb-4">{currentQR.description}</div>
                            <div className="w-64 h-64 bg-white rounded-lg p-4 flex items-center justify-center border-4 border-border">
                                {/* Simple QR code representation */}
                                <div className="grid grid-cols-8 gap-1">
                                    {Array(64).fill(0).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-6 h-6 ${Math.random() > 0.5 ? "bg-black" : "bg-white"}`}
                                        ></div>
                                    ))}
                                </div>
                            </div>

                            {!scanned && (
                                <button
                                    onClick={scanQR}
                                    className="btn-primary mt-6 px-8 py-3"
                                >
                                    📷 Scan QR Code
                                </button>
                            )}
                        </div>

                        {/* URL Analysis */}
                        <div className="flex-1">
                            {scanned && (
                                <div className="animate-fadeIn">
                                    <div className="bg-surface rounded-lg p-6 mb-4">
                                        <div className="text-sm text-secondary mb-2">QR Code Contains:</div>
                                        <div className="font-mono text-sm break-all mb-4 p-3 bg-hover rounded">
                                            {currentQR.qrData}
                                        </div>

                                        <div className="text-sm text-secondary mb-2">Actual Destination:</div>
                                        <div className="font-mono text-sm break-all p-3 bg-hover rounded">
                                            {currentQR.actualURL}
                                        </div>
                                    </div>

                                    {/* Red Flags */}
                                    {currentQR.redFlags.length > 0 && !showResult && (
                                        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-4">
                                            <div className="font-semibold mb-2 text-red-400">🚩 Potential Red Flags:</div>
                                            <ul className="space-y-1 text-sm text-secondary">
                                                {currentQR.redFlags.map((flag, i) => (
                                                    <li key={i}>• {flag}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Decision Buttons */}
                                    {!showResult && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => makeDecision(true)}
                                                className="btn-primary bg-emerald-500 hover:bg-emerald-600 py-4"
                                            >
                                                ✅ Safe to Visit
                                            </button>
                                            <button
                                                onClick={() => makeDecision(false)}
                                                className="btn-primary bg-red-500 hover:bg-red-600 py-4"
                                            >
                                                🚨 Malicious
                                            </button>
                                        </div>
                                    )}

                                    {/* Result */}
                                    {showResult && (
                                        <div className={`p-6 rounded-lg text-center ${userDecision.correct
                                                ? "bg-emerald-500/20 border border-emerald-500/50"
                                                : "bg-red-500/20 border border-red-500/50"
                                            }`}>
                                            <div className="text-4xl mb-2">{userDecision.correct ? "✅" : "❌"}</div>
                                            <div className={`font-bold mb-2 ${userDecision.correct ? "text-emerald-400" : "text-red-400"}`}>
                                                {userDecision.correct ? "Correct!" : "Wrong!"}
                                            </div>
                                            <div className="text-sm text-secondary">
                                                This QR code is {currentQR.isMalicious ? "malicious" : "safe"}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {!scanned && (
                                <div className="bg-hover rounded-lg p-6 h-full flex items-center justify-center">
                                    <div className="text-center text-secondary">
                                        <div className="text-4xl mb-2">📷</div>
                                        <div className="text-sm">Scan the QR code to reveal its destination</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tips */}
                <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
                    <div className="font-semibold mb-2">💡 QR Code Safety Tips:</div>
                    <ul className="space-y-1 text-sm text-secondary">
                        <li>• Always preview URLs before visiting (use QR scanner with preview)</li>
                        <li>• Watch for shortened URLs (bit.ly, tinyurl) that hide destinations</li>
                        <li>• Be cautious of QR codes in public places (easily replaced by attackers)</li>
                        <li>• Never scan QR codes that request immediate payment</li>
                        <li>• Verify the domain matches the expected business/service</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

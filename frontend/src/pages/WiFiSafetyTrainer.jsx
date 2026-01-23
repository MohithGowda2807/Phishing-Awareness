import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Wi-Fi network scenarios
const WIFI_SCENARIOS = [
    {
        id: 1,
        location: "Coffee Shop",
        networks: [
            {
                ssid: "CoffeeShop_Free_WiFi",
                encryption: "Open",
                signalStrength: 85,
                isMalicious: false,
                isSecure: false,
                reason: "Legitimate but unsecured - use with VPN"
            },
            {
                ssid: "CoffeeShop_Free_WiFi ",
                encryption: "Open",
                signalStrength: 90,
                isMalicious: true,
                isSecure: false,
                reason: "Evil twin attack! Note the extra space in the name"
            },
            {
                ssid: "ATT-WIFI-7543",
                encryption: "WPA2",
                signalStrength: 65,
                isMalicious: false,
                isSecure: true,
                reason: "Legitimate encrypted network from nearby business"
            }
        ]
    },
    {
        id: 2,
        location: "Airport",
        networks: [
            {
                ssid: "Airport_Public_WiFi",
                encryption: "Open",
                signalStrength: 95,
                isMalicious: true,
                isSecure: false,
                reason: "Fake airport network - Real airport WiFi requires login"
            },
            {
                ssid: "Airport_Guest",
                encryption: "WPA2-Enterprise",
                signalStrength: 88,
                isMalicious: false,
                isSecure: true,
                reason: "Official airport network with proper enterprise security"
            },
            {
                ssid: "Free_Internet_Access",
                encryption: "Open",
                signalStrength: 92,
                isMalicious: true,
                isSecure: false,
                reason: "Generic malicious hotspot - criminals often use vague names"
            },
            {
                ssid: "Starbucks",
                encryption: "Open",
                signalStrength: 70,
                isMalicious: false,
                isSecure: false,
                reason: "Actual Starbucks network from airport cafe"
            }
        ]
    },
    {
        id: 3,
        location: "Hotel",
        networks: [
            {
                ssid: "HOTEL_GUEST_WIFI",
                encryption: "WPA2",
                signalStrength: 90,
                isMalicious: false,
                isSecure: true,
                reason: "Legitimate hotel network with encryption"
            },
            {
                ssid: "Hotel_Guest_WiFi",
                encryption: "Open",
                signalStrength: 95,
                isMalicious: true,
                isSecure: false,
                reason: "Evil twin! Similar name but open (real one is encrypted)"
            },
            {
                ssid: "Room_305_WiFi",
                encryption: "WPA3",
                signalStrength: 75,
                isMalicious: false,
                isSecure: true,
                reason: "Guest's personal hotspot - properly secured"
            }
        ]
    }
];

export default function WiFiSafetyTrainer() {
    const navigate = useNavigate();
    const [gameStarted, setGameStarted] = useState(false);
    const [currentScenario, setCurrentScenario] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedNetwork, setSelectedNetwork] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [safeNetworks, setSafeNetworks] = useState(0);
    const [avoidedThreats, setAvoidedThreats] = useState(0);

    const scenario = WIFI_SCENARIOS[currentScenario];

    const startGame = () => {
        setGameStarted(true);
        setScore(0);
        setCurrentScenario(0);
        setSafeNetworks(0);
        setAvoidedThreats(0);
    };

    const selectNetwork = (network) => {
        setSelectedNetwork(network);
        setShowFeedback(true);

        const isGoodChoice = !network.isMalicious;

        if (isGoodChoice) {
            setScore(prev => prev + 100);
            if (network.isSecure) setSafeNetworks(prev => prev + 1);
        } else {
            setAvoidedThreats(prev => prev - 1); // Penalty
        }

        setTimeout(() => {
            if (currentScenario < WIFI_SCENARIOS.length - 1) {
                setCurrentScenario(prev => prev + 1);
                setSelectedNetwork(null);
                setShowFeedback(false);
            }
        }, 4000);
    };

    const skipNetwork = () => {
        setAvoidedThreats(prev => prev + 1);
        setScore(prev => prev + 50);

        setTimeout(() => {
            if (currentScenario < WIFI_SCENARIOS.length - 1) {
                setCurrentScenario(prev => prev + 1);
                setSelectedNetwork(null);
                setShowFeedback(false);
            }
        }, 2000);
    };

    // Start screen
    if (!gameStarted) {
        return (
            <div className="animate-fadeIn">
                <div className="max-w-2xl mx-auto">
                    <div className="glass-card p-8 text-center">
                        <div className="text-6xl mb-4">📡</div>
                        <h1 className="text-3xl font-bold mb-4">Wi-Fi Safety Trainer</h1>
                        <p className="text-lg text-secondary mb-6">
                            Learn to identify safe Wi-Fi networks and avoid evil twin attacks
                        </p>

                        <div className="bg-hover rounded-lg p-6 mb-6 text-left">
                            <h3 className="font-bold mb-3">How to Play:</h3>
                            <ul className="space-y-2 text-sm text-secondary">
                                <li>• Analyze available Wi-Fi networks</li>
                                <li>• Check encryption type  and signal strength</li>
                                <li>• Identify evil twin attacks (fake networks)</li>
                                <li>• Choose safe networks or skip risky ones</li>
                                <li>• Learn when to use VPN for protection</li>
                            </ul>
                        </div>

                        <button onClick={startGame} className="btn-primary text-xl px-8 py-4">
                            📡 Start Scanning
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main game
    return (
        <div className="animate-fadeIn">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate("/training")} className="text-secondary hover:text-base">
                            ← Back
                        </button>
                        <h1 className="text-2xl font-bold">📡 Wi-Fi Safety Trainer</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="stat-card">
                            <div className="text-xs text-secondary">Location</div>
                            <div className="text-sm font-bold">{currentScenario + 1}/{WIFI_SCENARIOS.length}</div>
                        </div>
                        <div className="stat-card">
                            <div className="text-xs text-secondary">Score</div>
                            <div className="text-lg font-bold text-primary">{score}</div>
                        </div>
                    </div>
                </div>

                {/* Location Context */}
                <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">📍</span>
                        <div>
                            <div className="font-bold">Current Location: {scenario.location}</div>
                            <div className="text-sm text-secondary">Scanning for available Wi-Fi networks...</div>
                        </div>
                    </div>
                </div>

                {/* Network List */}
                <div className="glass-card p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Available Networks</h2>
                    <div className="space-y-3">
                        {scenario.networks.map((network, i) => (
                            <div
                                key={i}
                                className={`p-4 rounded-lg border-2 transition-all ${selectedNetwork?.ssid === network.ssid
                                        ? "border-primary bg-primary/10"
                                        : "border-border bg-surface hover:border-primary/50"
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="text-2xl">
                                            {network.encryption === "Open" ? "🔓" : "🔒"}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold font-mono">{network.ssid}</div>
                                            <div className="flex items-center gap-4 text-xs text-secondary mt-1">
                                                <span className={`px-2 py-0.5 rounded ${network.encryption.includes("WPA3") ? "bg-emerald-500/20 text-emerald-400" :
                                                        network.encryption.includes("WPA2") ? "bg-blue-500/20 text-blue-400" :
                                                            "bg-red-500/20 text-red-400"
                                                    }`}>
                                                    {network.encryption}
                                                </span>
                                                <span>Signal: {network.signalStrength}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Signal Strength Visual */}
                                    <div className="flex items-end gap-1 h-8">
                                        {[20, 40, 60, 80, 100].map(threshold => (
                                            <div
                                                key={threshold}
                                                className={`w-2 transition-all ${network.signalStrength >= threshold
                                                        ? "bg-primary"
                                                        : "bg-muted"
                                                    }`}
                                                style={{ height: `${(threshold / 100) * 32}px` }}
                                            ></div>
                                        ))}
                                    </div>
                                </div>

                                {/* Feedback */}
                                {showFeedback && selectedNetwork?.ssid === network.ssid && (
                                    <div className={`animate-fadeIn p-3 rounded-lg ${network.isMalicious
                                            ? "bg-red-500/20 border border-red-500/50"
                                            : "bg-emerald-500/20 border border-emerald-500/50"
                                        }`}>
                                        <div className={`font-bold mb-1 ${network.isMalicious ? "text-red-400" : "text-emerald-400"}`}>
                                            {network.isMalicious ? "⚠️ Dangerous Network!" : "✅ Safe Choice!"}
                                        </div>
                                        <div className="text-sm text-secondary">{network.reason}</div>
                                    </div>
                                )}

                                {!showFeedback && (
                                    <button
                                        onClick={() => selectNetwork(network)}
                                        className="btn-secondary w-full mt-2 py-2 text-sm"
                                    >
                                        Connect to this network
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {!showFeedback && (
                        <button
                            onClick={skipNetwork}
                            className="btn-primary w-full mt-4 bg-yellow-500 hover:bg-yellow-600"
                        >
                            🛡️ Skip All (Use Mobile Data/VPN)
                        </button>
                    )}
                </div>

                {/* Education Panel */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-4">
                        <h3 className="font-bold text-emerald-400 mb-2">✅ Safe Network Signs:</h3>
                        <ul className="space-y-1 text-sm text-secondary">
                            <li>• WPA2 or WPA3 encryption</li>
                            <li>• Official venue name (exact match)</li>
                            <li>• Requires portal login</li>
                            <li>• Known trusted networks</li>
                            <li>• Enterprise security (WPA2-E)</li>
                        </ul>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                        <h3 className="font-bold text-red-400 mb-2">🚨 Danger Signs:</h3>
                        <ul className="space-y-1 text-sm text-secondary">
                            <li>• Open/unencrypted networks</li>
                            <li>• Slight name variations (evil twin)</li>
                            <li>• Generic names ("Free WiFi")</li>
                            <li>• Unusually strong signal</li>
                            <li>• Multiple similar names</li>
                        </ul>
                    </div>
                </div>

                {/* VPN Recommendation */}
                <div className="mt-4 bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">🛡️</span>
                        <div>
                            <div className="font-bold mb-1">Always Use a VPN on Public Wi-Fi</div>
                            <div className="text-sm text-secondary">
                                Even on "safe" networks, a VPN encrypts your traffic and protects against man-in-the-middle attacks
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

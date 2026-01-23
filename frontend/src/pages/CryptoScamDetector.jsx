import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Crypto scam scenarios
const CRYPTO_SC AMS = [
    {
        id: 1,
        title: "Elon Musk Bitcoin Giveaway",
        platform: "Twitter/X",
        screenshot: true,
        details: {
            promoter: "@ElonMuskOfficia1",
            followers: "2.3M",
            verified: false,
            offer: "Send 0.1 BTC, get 1 BTC back instantly!",
            website: "elonmusk-btc-giveaway.com",
            urgency: "Only for the next 2 hours!"
        },
        redFlags: [
            "Typosquatting in username (number 1 instead of letter l)",
            "Not verified Twitter account",
            "Too good to be true (10x return instantly)",
            "Urgency tactics (limited time)",
            "Requests you send crypto first",
            "Suspicious domain name"
        ],
        isScam: true,
        explanation: "Classic crypto giveaway scam. Celebrities never ask you to send crypto first. These scams have stolen millions by impersonating famous people."
    },
    {
        id: 2,
        title: "New DeFi Protocol - 5000% APY",
        platform: "Telegram",
        details: {
            promoter: "DeFi Moon Protocol",
            members: "45,000",
            tokenPrice: "$0.00001",
            APY: "5000%",
            website: "defi-moon-protocol.xyz",
            audit: "No audit available",
            liquidityLocked: "No"
        },
        redFlags: [
            "Unsustainable APY (5000% is impossible long-term)",
            "No code audit from reputable firm",
            "Liquidity not locked (rug pull risk)",
            ".xyz domain (often used by scams)",
            "Anonymous team",
            "Pressure to buy before launch"
        ],
        isScam: true,
        explanation: "DeFi rug pull scam. The creators will drain the liquidity pool after enough people invest. Always check for audits, locked liquidity, and doxxed teams."
    },
    {
        id: 3,
        title: "Coinbase Wallet Verification",
        platform: "Email",
        details: {
            sender: "security@coinbase-verify.com",
            subject: "Urgent: Verify your wallet or lose access",
            content: "Your Coinbase wallet requires immediate verification. Click here to verify within 24 hours.",
            link: "coinbase-wallet-verify.com/login",
            certificate: "Self-signed SSL"
        },
        redFlags: [
            "Not from official @coinbase.com domain",
            "Urgency and threats",
            "Requests login credentials",
            "Phishing link to fake site",
            "Self-signed SSL (not official)",
            "Coinbase never asks for verification via email links"
        ],
        isScam: true,
        explanation: "Phishing scam to steal login credentials. Coinbase and legitimate exchanges never ask you to verify via email links. Always access exchanges directly through bookmarked URLs."
    },
    {
        id: 4,
        title: "Uniswap V4 Token Launch",
        platform: "Uniswap DEX",
        details: {
            protocol: "Uniswap",
            tokenName: "UNI",
            contract: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
            audit: "Trail of Bits (verified)",
            teamDoxxed: true,
            liquidityLocked: true,
            marketCap: "$4.2B"
        },
        redFlags: [],
        isScam: false,
        explanation: "This is the legitimate Uniswap (UNI) token. It has proper audits, a known team, and is listed on major exchanges. Always verify contract addresses on official sources."
    },
    {
        id: 5,
        title: "Crypto Recovery Service",
        platform: "Reddit DM",
        details: {
            service: "Crypto Recovery Experts",
            claim: "We can recover your lost crypto from scams",
            fee: "50% of recovered amount upfront",
            guarantee: "100% recovery guaranteed",
            testimonials: "Fake looking screenshots",
            contact: "Telegram only"
        },
        redFlags: [
            "Upfront fees for 'recovery'",
            "100% guarantee (impossible)",
            "Fake testimonials",
            "Only contactable via Telegram",
            "Unsolicited DM",
            "Recovery scams targeting scam victims"
        ],
        isScam: true,
        explanation: "Recovery scam - scamming people who already lost crypto. If crypto is sent to a scammer, it's almost impossible to recover. These 'recovery services' are additional scams."
    },
    {
        id: 6,
        title: "MetaMask Mobile App",
        platform: "Official App Store",
        details: {
            developer: "MetaMask (Consensys)",
            downloads: "10M+",
            rating: "4.3/5",
            lastUpdate: "2 days ago",
            permissions: "Standard wallet permissions",
            verified: true
        },
        redFlags: [],
        isScam: false,
        explanation: "Legitimate MetaMask app from the official developer. Always download crypto wallets from official app stores and verify the developer name matches the official project."
    }
];

export default function CryptoScamDetector() {
    const navigate = useNavigate();
    const [gameStarted, setGameStarted] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [userDecision, setUserDecision] = useState(null);
    const [scamsAvoided, setScamsAvoided] = useState(0);
    const [correctIdentifications, setCorrectIdentifications] = useState(0);

    const currentScam = CRYPTO_SCAMS[currentIndex];

    const startGame = () => {
        setGameStarted(true);
        setCurrentIndex(0);
        setScore(0);
        setScamsAvoided(0);
        setCorrectIdentifications(0);
    };

    const makeDecision = (isScam) => {
        const correct = (isScam && currentScam.isScam) || (!isScam && !currentScam.isScam);

        setUserDecision({ isScam, correct });
        setShowFeedback(true);

        if (correct) {
            setScore(prev => prev + 100);
            setCorrectIdentifications(prev => prev + 1);
            if (currentScam.isScam) {
                setScamsAvoided(prev => prev + 1);
            }
        }

        setTimeout(() => {
            if (currentIndex < CRYPTO_SCAMS.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setShowFeedback(false);
                setUserDecision(null);
            }
        }, 5000);
    };

    // Start screen
    if (!gameStarted) {
        return (
            <div className="animate-fadeIn">
                <div className="max-w-2xl mx-auto">
                    <div className="glass-card p-8 text-center">
                        <div className="text-6xl mb-4">₿</div>
                        <h1 className="text-3xl font-bold mb-4">Crypto Scam Detector</h1>
                        <p className="text-lg text-secondary mb-6">
                            Learn to identify cryptocurrency scams, rug pulls, and phishing attempts
                        </p>

                        <div className="bg-hover rounded-lg p-6 mb-6 text-left">
                            <h3 className="font-bold mb-3">How to Play:</h3>
                            <ul className="space-y-2 text-sm text-secondary">
                                <li>• Analyze crypto investment opportunities</li>
                                <li>• Check for red flags and scam indicators</li>
                                <li>• Identify legitimate vs fraudulent projects</li>
                                <li>• Learn about different types of crypto scams</li>
                                <li>• Protect yourself from losing money</li>
                            </ul>
                        </div>

                        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
                            <div className="text-sm font-semibold mb-2">⚠️ Important:</div>
                            <div className="text-xs text-secondary">
                                Crypto scams have stolen billions. If it sounds too good to be true, it probably is. Never invest more than you can afford to lose.
                            </div>
                        </div>

                        <button onClick={startGame} className="btn-primary text-xl px-8 py-4">
                            ₿ Start Analyzing
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
                        <h1 className="text-2xl font-bold">₿ Crypto Scam Detector</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="stat-card">
                            <div className="text-xs text-secondary">Case</div>
                            <div className="text-lg font-bold">{currentIndex + 1}/{CRYPTO_SCAMS.length}</div>
                        </div>
                        <div className="stat-card">
                            <div className="text-xs text-secondary">Score</div>
                            <div className="text-lg font-bold text-primary">{score}</div>
                        </div>
                        <div className="stat-card">
                            <div className="text-xs text-secondary">Scams Avoided</div>
                            <div className="text-lg font-bold text-emerald-400">{scamsAvoided}</div>
                        </div>
                    </div>
                </div>

                {/* Platform Badge */}
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-secondary">Platform:</span>
                    <span className="px-3 py-1 bg-surface rounded-full text-sm font-semibold">
                        {currentScam.platform}
                    </span>
                </div>

                {/* Scam Details Card */}
                <div className="glass-card p-6 mb-6">
                    <h2 className="text-2xl font-bold mb-4">{currentScam.title}</h2>

                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        {Object.entries(currentScam.details).map(([key, value]) => (
                            <div key={key} className="bg-surface rounded-lg p-4">
                                <div className="text-xs text-secondary mb-1 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                                <div className={`font-mono text-sm ${typeof value === 'boolean'
                                        ? value ? 'text-emerald-400' : 'text-red-400'
                                        : 'text-base'
                                    }`}>
                                    {typeof value === 'boolean' ? (value ? 'Yes ✓' : 'No ✗') : value}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Decision Buttons */}
                    {!showFeedback && (
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => makeDecision(false)}
                                className="btn-primary bg-emerald-500 hover:bg-emerald-600 py-4"
                            >
                                ✅ Legitimate
                            </button>
                            <button
                                onClick={() => makeDecision(true)}
                                className="btn-primary bg-red-500 hover:bg-red-600 py-4"
                            >
                                🚨 SCAM
                            </button>
                        </div>
                    )}

                    {/* Feedback */}
                    {showFeedback && (
                        <div className={`animate-fadeIn p-6 rounded-lg ${userDecision.correct
                                ? "bg-emerald-500/20 border border-emerald-500/50"
                                : "bg-red-500/20 border border-red-500/50"
                            }`}>
                            <div className="text-center mb-4">
                                <div className="text-5xl mb-2">{userDecision.correct ? "✅" : "❌"}</div>
                                <div className={`text-2xl font-bold mb-2 ${userDecision.correct ? "text-emerald-400" : "text-red-400"
                                    }`}>
                                    {userDecision.correct ? "Correct!" : "Wrong!"}
                                </div>
                                <div className="text-lg mb-4">
                                    This is {currentScam.isScam ? "a SCAM" : "LEGITIMATE"}
                                </div>
                            </div>

                            <div className="bg-surface rounded-lg p-4 mb-4">
                                <div className="font-semibold mb-2">Explanation:</div>
                                <div className="text-sm text-secondary">{currentScam.explanation}</div>
                            </div>

                            {currentScam.redFlags.length > 0 && (
                                <div>
                                    <div className="font-semibold mb-2 text-red-400">🚩 Red Flags:</div>
                                    <div className="grid md:grid-cols-2 gap-2">
                                        {currentScam.redFlags.map((flag, i) => (
                                            <div key={i} className="flex items-start gap-2 text-sm">
                                                <span className="text-red-400 mt-0.5">•</span>
                                                <span className="text-secondary">{flag}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Education Panel */}
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                        <h3 className="font-bold text-red-400 mb-2 text-sm">🚨 Common Scams:</h3>
                        <ul className="space-y-1 text-xs text-secondary">
                            <li>• Fake giveaways</li>
                            <li>• Rug pulls</li>
                            <li>• Ponzi schemes</li>
                            <li>• Phishing sites</li>
                            <li>• Pump and dumps</li>
                        </ul>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
                        <h3 className="font-bold text-yellow-400 mb-2 text-sm">⚠️ Warning Signs:</h3>
                        <ul className="space-y-1 text-xs text-secondary">
                            <li>• Guaranteed returns</li>
                            <li>• Pressure to act fast</li>
                            <li>• No audit/transparency</li>
                            <li>• Anonymous teams</li>
                            <li>• Too good to be true</li>
                        </ul>
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-4">
                        <h3 className="font-bold text-emerald-400 mb-2 text-sm">✅ Safety Checks:</h3>
                        <ul className="space-y-1 text-xs text-secondary">
                            <li>• Verify contract addresses</li>
                            <li>• Check for audits</li>
                            <li>• Research the team</li>
                            <li>• Look for locked liquidity</li>
                            <li>• Use official links only</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

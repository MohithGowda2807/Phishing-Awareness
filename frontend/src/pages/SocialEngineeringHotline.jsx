import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Vishing (voice phishing) call scenarios with branching dialogue
const CALL_SCENARIOS = [
    {
        id: 1,
        title: "IRS Tax Scam",
        caller: "Agent Johnson - IRS",
        callerID: "+1-800-555-IRS",
        suspicionLevel: "High",
        scenario: [
            {
                id: "start",
                speaker: "caller",
                text: "This is Agent Johnson from the Internal Revenue Service. We've detected serious irregularities in your tax returns from 2022 and 2023. This is your final notice before we proceed with legal action.",
                responses: [
                    { text: "What irregularities? I filed correctly.", next: "challenge", suspicion: 0 },
                    { text: "Oh no! What do I need to do?", next: "panic", suspicion: -10 },
                    { text: "Can you provide your badge number and IRS office?", next: "verify", suspicion: +15 }
                ]
            },
            {
                id: "challenge",
                speaker: "caller",
                text: "Our records show unreported income of $45,000. You owe $12,500 in back taxes plus penalties. We need immediate payment to avoid arrest.",
                responses: [
                    { text: "I'll call my lawyer.", next: "lawyer", suspicion: +20 },
                    { text: "How can I pay right now?", next: "payment", suspicion: -15 },
                    { text: "The IRS doesn't make threatening calls.", next: "expose", suspicion: +30 }
                ]
            },
            {
                id: "panic",
                speaker: "caller",
                text: "You need to purchase $5,000 in iTunes gift cards immediately and provide the codes. This is the only way to settle your debt and avoid arrest.",
                responses: [
                    { text: "iTunes cards for taxes? That's not real.", next: "expose", suspicion: +25 },
                    { text: "Where do I buy them?", next: "scammed", suspicion: -20 },
                    { text: "I want to verify this with the IRS directly.", next: "verify", suspicion: +15 }
                ]
            },
            {
                id: "verify",
                speaker: "caller",
                text: "There's no time for that! The warrant for your arrest has already been issued. You must act NOW!",
                responses: [
                    { text: "I'm hanging up and calling IRS.gov's number.", next: "expose", suspicion: +30 },
                    { text: "Okay, I'll pay! Please don't arrest me!", next: "payment", suspicion: -15 }
                ]
            },
            {
                id: "lawyer",
                speaker: "caller",
                text: "*Click* The caller hung up immediately.",
                isEnd: true,
                result: "success",
                explanation: "Scammers hang up when you mention lawyers or verification. Real IRS agents would never threaten immediate arrest."
            },
            {
                id: "expose",
                speaker: "caller",
                text: "*Click* The caller hung up.",
                isEnd: true,
                result: "success",
                explanation: "You identified the scam! The IRS NEVER calls to demand immediate payment, threatens arrest, or asks for gift cards."
            },
            {
                id: "payment",
                speaker: "caller",
                text: "Perfect! Go to the nearest store and purchase $5,000 in gift cards. Call this number when you have them.",
                isEnd: true,
                result: "failure",
                explanation: "You fell for the scam. The IRS always contacts taxpayers by mail first, never demands gift cards, and doesn't threaten immediate arrest."
            },
            {
                id: "scammed",
                speaker: "caller",
                text: "Any major retailer. Target, Walmart, CVS. I'll stay on the line while you go.",
                isEnd: true,
                result: "failure",
                explanation: "You were scammed! This is a classic vishing attack. Gift cards are untraceable and the IRS never uses them."
            }
        ],
        redFlags: [
            "Threatens immediate arrest",
            "Demands gift card payment",
            "Creates urgency and panic",
            "Caller ID can be spoofed",
            "IRS never calls first"
        ]
    },
    {
        id: 2,
        title: "Tech Support Scam",
        caller: "Microsoft Security Team",
        callerID: "+1-888-555-MSFT",
        suspicionLevel: "High",
        scenario: [
            {
                id: "start",
                speaker: "caller",
                text: "Hello, this is David from Microsoft Security Team. We've detected a virus on your computer that's transmitting your personal data to hackers right now. We can help you fix this immediately.",
                responses: [
                    { text: "How did you detect this?", next: "explain", suspicion: +10 },
                    { text: "Oh no! What should I do?", next: "panic", suspicion: -10 },
                    { text: "Microsoft doesn't make unsolicited calls.", next: "expose", suspicion: +25 }
                ]
            },
            {
                id: "explain",
                speaker: "caller",
                text: "Your computer is sending error reports to our servers. I need you to turn on your computer and let me remote access it so I can remove the virus.",
                responses: [
                    { text: "I'll take it to a local repair shop.", next: "refuse", suspicion: +20 },
                    { text: "How do I give you access?", next: "access", suspicion: -15 },
                    { text: "Microsoft doesn't work this way.", next: "expose", suspicion: +30 }
                ]
            },
            {
                id: "panic",
                speaker: "caller",
                text: "We need to act fast! Download TeamViewer so I can access your computer remotely and clean it. Your bank accounts could be compromised!",
                responses: [
                    { text: "I'm not downloading anything from a cold caller.", next: "expose", suspicion: +25 },
                    { text: "Okay, I'm downloading it now.", next: "compromised", suspicion: -20 }
                ]
            },
            {
                id: "refuse",
                speaker: "caller",
                text: "*Click* Caller hung up.",
                isEnd: true,
                result: "success",
                explanation: "Good job! Scammers hang up when you refuse remote access or mention independent verification."
            },
            {
                id: "expose",
                speaker: "caller",
                text: "*Angry noises* *Click*",
                isEnd: true,
                result: "success",
                explanation: "Correct! Microsoft never makes unsolicited calls about viruses. This is a classic tech support scam."
            },
            {
                id: "access",
                speaker: "caller",
                text: "Download TeamViewer from teamviewer.com and give me the ID and password.",
                isEnd: true,
                result: "failure",
                explanation: "You were about to be scammed! Never give remote access to unsolicited callers. They can install malware and steal data."
            },
            {
                id: "compromised",
                speaker: "caller",
                text: "Great! Now read me the 9-digit ID and password that appears.",
                isEnd: true,
                result: "failure",
                explanation: "Your computer is now compromised! The scammer has full access to install malware, steal passwords, and access your files."
            }
        ],
        redFlags: [
            "Unsolicited call from 'Microsoft'",
            "Claims computer is infected",
            "Requests remote access",
            "Creates urgency",
            "Microsoft doesn't call customers"
        ]
    },
    {
        id: 3,
        title: "Grandparent Scam",
        caller: "Your Grandson",
        callerID: "+1-555-123-4567",
        suspicionLevel: "Medium",
        scenario: [
            {
                id: "start",
                speaker: "caller",
                text: "*Crying* Grandma? It's me... I'm in trouble. I was in a car accident in Mexico and I need money to get out of jail. Please don't tell mom and dad!",
                responses: [
                    { text: "Which grandchild are you?", next: "verify", suspicion: +20 },
                    { text: "Are you okay?! How much do you need?", next: "panic", suspicion: -10 },
                    { text: "Let me call your parents first.", next: "parents", suspicion: +25 }
                ]
            },
            {
                id: "verify",
                speaker: "caller",
                text: "It's Tommy! My voice is different because I broke my nose in the accident. I need $5,000 wired immediately for bail.",
                responses: [
                    { text: "What's your mother's name?", next: "quiz", suspicion: +15 },
                    { text: "I'll send it right away!", next: "scammed", suspicion: -20 },
                    { text: "I'm calling the police to verify.", next: "expose", suspicion: +30 }
                ]
            },
            {
                id: "panic",
                speaker: "caller",
                text: "I need $5,000 wired to this account in the next hour. The lawyer says if you don't pay, I'll be stuck here for months!",
                responses: [
                    { text: "Let me speak to the lawyer.", next: "lawyer", suspicion: +15 },
                    { text: "I'll go to Western Union now.", next: "scammed", suspicion: -25 },
                    { text: "I'm calling your parents.", next: "parents", suspicion: +20 }
                ]
            },
            {
                id: "quiz",
                speaker: "caller",
                text: "Uhhh... Sarah? Look, grandma, there's no time for questions! I need help NOW!",
                isEnd: true,
                result: "success",
                explanation: "You caught the scammer! Asking personal questions they can't answer exposes the fraud."
            },
            {
                id: "parents",
                speaker: "caller",
                text: "*Click* Line goes dead.",
                isEnd: true,
                result: "success",
                explanation: "Perfect! Scammers hang up when you mention verifying with family. Always verify emergency calls independently."
            },
            {
                id: "lawyer",
                speaker: "caller",
                text: "*Different voice* Hello, I'm Attorney Rodriguez. Your grandson needs bail money immediately. Wire to this account...",
                responses: [
                    { text: "Give me your bar association number.", next: "expose", suspicion: +30 },
                    { text: "I'll send it now.", next: "scammed", suspicion: -20 }
                ]
            },
            {
                id: "expose",
                speaker: "caller",
                text: "*Click*",
                isEnd: true,
                result: "success",
                explanation: "You identified the scam! Real lawyers can provide credentials. This is the grandparent scam targeting emotions."
            },
            {
                id: "scammed",
                speaker: "caller",
                text: "Thank you! Wire the money to account #...",
                isEnd: true,
                result: "failure",
                explanation: "You were scammed! Always verify emergency calls by calling family members directly. Never wire money based on urgent calls."
            }
        ],
        redFlags: [
            "Emergency involving family",
            "Requests secrecy from other family",
            "Urgency and emotional manipulation",
            "Wiring money immediately",
            "Unclear or changing details"
        ]
    }
];

export default function SocialEngineeringHotline() {
    const navigate = useNavigate();
    const [gameStarted, setGameStarted] = useState(false);
    const [currentScenario, setCurrentScenario] = useState(0);
    const [currentNode, setCurrentNode] = useState("start");
    const [conversationHistory, setConversationHistory] = useState([]);
    const [suspicionScore, setSuspicionScore] = useState(50);
    const [gameResult, setGameResult] = useState(null);

    const scenario = CALL_SCENARIOS[currentScenario];
    const currentDialogue = scenario?.scenario.find(node => node.id === currentNode);

    const startGame = () => {
        setGameStarted(true);
        setCurrentScenario(0);
        setCurrentNode("start");
        setConversationHistory([]);
        setSuspicionScore(50);
        setGameResult(null);
    };

    const handleResponse = (response) => {
        // Add to history
        setConversationHistory(prev => [
            ...prev,
            { speaker: "caller", text: currentDialogue.text },
            { speaker: "you", text: response.text }
        ]);

        // Update suspicion
        setSuspicionScore(prev => Math.max(0, Math.min(100, prev + response.suspicion)));

        // Move to next node
        const nextNode = scenario.scenario.find(node => node.id === response.next);
        setCurrentNode(response.next);

        // Check if call ended
        if (nextNode.isEnd) {
            setGameResult({
                result: nextNode.result,
                explanation: nextNode.explanation,
                suspicionScore: suspicionScore + response.suspicion
            });
        }
    };

    const nextScenario = () => {
        if (currentScenario < CALL_SCENARIOS.length - 1) {
            setCurrentScenario(prev => prev + 1);
            setCurrentNode("start");
            setConversationHistory([]);
            setSuspicionScore(50);
            setGameResult(null);
        } else {
            setGameStarted(false);
        }
    };

    // Start screen
    if (!gameStarted) {
        return (
            <div className="animate-fadeIn">
                <div className="max-w-2xl mx-auto">
                    <div className="glass-card p-8 text-center">
                        <div className="text-6xl mb-4">📞</div>
                        <h1 className="text-3xl font-bold mb-4">Social Engineering Hotline</h1>
                        <p className="text-lg text-secondary mb-6">
                            Defend against vishing (voice phishing) attacks through realistic call scenarios
                        </p>

                        <div className="bg-hover rounded-lg p-6 mb-6 text-left">
                            <h3 className="font-bold mb-3">How to Play:</h3>
                            <ul className="space-y-2 text-sm text-secondary">
                                <li>• Read the caller's statements carefully</li>
                                <li>• Choose your responses wisely</li>
                                <li>• Build suspicion by asking verification questions</li>
                                <li>• Avoid giving information or agreeing to demands</li>
                                <li>• Learn common social engineering tactics</li>
                            </ul>
                        </div>

                        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
                            <div className="text-sm font-semibold mb-2">⚠️ Real Life Warning:</div>
                            <div className="text-xs text-secondary">
                                These scenarios are based on real scams. Never give personal info, money, or remote access to unsolicited callers.
                            </div>
                        </div>

                        <button onClick={startGame} className="btn-primary text-xl px-8 py-4">
                            📞 Answer First Call
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Game result screen
    if (gameResult) {
        return (
            <div className="animate-fadeIn">
                <div className="max-w-3xl mx-auto">
                    <div className="glass-card p-8">
                        <div className={`text-center mb-6 p-6 rounded-lg ${gameResult.result === "success"
                                ? "bg-emerald-500/20 border border-emerald-500/50"
                                : "bg-red-500/20 border border-red-500/50"
                            }`}>
                            <div className="text-6xl mb-4">
                                {gameResult.result === "success" ? "✅" : "❌"}
                            </div>
                            <h2 className="text-2xl font-bold mb-2">
                                {gameResult.result === "success" ? "Call Defended!" : "Scam Successful"}
                            </h2>
                            <p className="text-secondary">{gameResult.explanation}</p>
                        </div>

                        {/* Suspicion Meter */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold">Your Suspicion Level:</span>
                                <span className={`font-bold ${gameResult.suspicionScore >= 70 ? "text-emerald-400" :
                                        gameResult.suspicionScore >= 40 ? "text-yellow-400" :
                                            "text-red-400"
                                    }`}>
                                    {gameResult.suspicionScore}/100
                                </span>
                            </div>
                            <div className="h-4 bg-surface rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all ${gameResult.suspicionScore >= 70 ? "bg-emerald-500" :
                                            gameResult.suspicionScore >= 40 ? "bg-yellow-500" :
                                                "bg-red-500"
                                        }`}
                                    style={{ width: `${gameResult.suspicionScore}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Red Flags */}
                        <div className="bg-hover rounded-lg p-6 mb-6">
                            <h3 className="font-bold mb-3">🚩 Red Flags in This Call:</h3>
                            <ul className="space-y-2 text-sm">
                                {scenario.redFlags.map((flag, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-red-400 mt-1">•</span>
                                        <span className="text-secondary">{flag}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Conversation History */}
                        <div className="bg-surface rounded-lg p-4 mb-6 max-h-60 overflow-y-auto">
                            <h3 className="font-bold mb-3 text-sm">Call Transcript:</h3>
                            <div className="space-y-3">
                                {conversationHistory.map((msg, i) => (
                                    <div key={i} className={`text-sm ${msg.speaker === "you" ? "text-right" : ""}`}>
                                        <div className={`inline-block px-3 py-2 rounded-lg ${msg.speaker === "you"
                                                ? "bg-blue-500/20 text-blue-400"
                                                : "bg-red-500/10 text-secondary"
                                            }`}>
                                            <div className="font-semibold text-xs mb-1">
                                                {msg.speaker === "you" ? "You" : scenario.caller}
                                            </div>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {currentScenario < CALL_SCENARIOS.length - 1 ? (
                                <button onClick={nextScenario} className="btn-primary col-span-2">
                                    📞 Next Call
                                </button>
                            ) : (
                                <>
                                    <button onClick={startGame} className="btn-primary">🔄 Restart</button>
                                    <button onClick={() => navigate("/training")} className="btn-secondary">
                                        ← Training Hub
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main call interface
    return (
        <div className="animate-fadeIn">
            <div className="max-w-4xl mx-auto">
                {/* Call Header */}
                <div className="glass-card p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold mb-1">📞 Incoming Call...</h2>
                            <div className="text-sm text-secondary">Call {currentScenario + 1} of {CALL_SCENARIOS.length}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-secondary mb-1">Caller ID</div>
                            <div className="font-mono text-sm">{scenario.callerID}</div>
                        </div>
                    </div>

                    {/* Suspicion Meter */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold">Suspicion Level:</span>
                            <span className={`font-bold text-sm ${suspicionScore >= 70 ? "text-emerald-400" :
                                    suspicionScore >= 40 ? "text-yellow-400" :
                                        "text-red-400"
                                }`}>
                                {suspicionScore}/100
                            </span>
                        </div>
                        <div className="h-3 bg-surface rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all ${suspicionScore >= 70 ? "bg-emerald-500" :
                                        suspicionScore >= 40 ? "bg-yellow-500" :
                                            "bg-red-500"
                                    }`}
                                style={{ width: `${suspicionScore}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Conversation */}
                <div className="glass-card p-6 mb-6">
                    {/* Caller Statement */}
                    <div className="bg-red-500/10 border-l-4 border-red-500 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-xl">🎭</span>
                            </div>
                            <div className="flex-1">
                                <div className="font-bold mb-2 text-red-400">{scenario.caller}</div>
                                <p className="text-base leading-relaxed">{currentDialogue.text}</p>
                            </div>
                        </div>
                    </div>

                    {/* Your Response Options */}
                    <div>
                        <div className="text-sm font-semibold mb-3">Your Response:</div>
                        <div className="space-y-3">
                            {currentDialogue.responses.map((response, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleResponse(response)}
                                    className="w-full text-left p-4 rounded-lg bg-surface hover:bg-hover border-2 border-border hover:border-primary transition-all group"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="group-hover:text-primary transition-colors">{response.text}</span>
                                        <span className="text-xs text-muted">
                                            {response.suspicion > 0 ? "🔍" : response.suspicion < 0 ? "⚠️" : ""}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tips */}
                <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
                    <div className="font-semibold mb-2 text-sm">💡 Vishing Defense Tips:</div>
                    <ul className="space-y-1 text-xs text-secondary">
                        <li>• Verify caller identity through official channels</li>
                        <li>• Never give personal/financial info to unknown callers</li>
                        <li>• Hang up and call back on official numbers</li>
                        <li>• Be suspicious of urgency and threats</li>
                        <li>• Government agencies don't demand immediate payment</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

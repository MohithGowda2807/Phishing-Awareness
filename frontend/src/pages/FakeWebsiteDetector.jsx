import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Website scenarios
const WEBSITE_SCENARIOS = [
    {
        id: 1,
        name: "PayPal Login",
        real: {
            url: "https://www.paypal.com/signin",
            ssl: "✅ Valid (PayPal Inc.)",
            domain: "paypal.com",
            https: true,
            issues: []
        },
        fake: {
            url: "https://www.paypa1.com/signin",
            ssl: "⚠️ Self-signed",
            domain: "paypa1.com",
            https: true,
            issues: [
                { id: 1, type: "Typosquatting", description: "Uses '1' instead of 'l' in paypal", severity: "high" },
                { id: 2, type: "Invalid SSL", description: "Self-signed certificate, not from PayPal Inc.", severity: "high" },
                { id: 3, type: "Different Domain", description: "paypa1.com is not the official paypal.com", severity: "critical" }
            ]
        }
    },
    {
        id: 2,
        name: "Amazon Product Page",
        real: {
            url: "https://www.amazon.com/product/B08N5WRWNW",
            ssl: "✅ Valid (Amazon.com Inc.)",
            domain: "amazon.com",
            https: true,
            issues: []
        },
        fake: {
            url: "http://amaz0n-deals.shop/product/B08N5WRWNW",
            ssl: "❌ No certificate",
            domain: "amaz0n-deals.shop",
            https: false,
            issues: [
                { id: 1, type: "No HTTPS", description: "Uses HTTP instead of HTTPS - not secure", severity: "critical" },
                { id: 2, type: "Typosquatting", description: "Uses '0' instead of 'o' in amazon", severity: "high" },
                { id: 3, type: "Suspicious TLD", description: ".shop domain instead of .com", severity: "medium" },
                { id: 4, type: "No SSL", description: "No encryption - data sent in plain text", severity: "critical" }
            ]
        }
    },
    {
        id: 3,
        name: "Bank Login",
        real: {
            url: "https://online.wellsfargo.com/",
            ssl: "✅ Valid (Wells Fargo & Company)",
            domain: "wellsfargo.com",
            https: true,
            issues: []
        },
        fake: {
            url: "https://wellsfargo-secure.com/login",
            ssl: "⚠️ Invalid",
            domain: "wellsfargo-secure.com",
            https: true,
            issues: [
                { id: 1, type: "Different Domain", description: "wellsfargo-secure.com is not the official domain", severity: "critical" },
                { id: 2, type: "Misleading Name", description: "'secure' added to seem trustworthy", severity: "high" },
                { id: 3, type: "Invalid SSL", description: "Certificate not issued to Wells Fargo", severity: "high" }
            ]
        }
    }
];

export default function FakeWebsiteDetector() {
    const navigate = useNavigate();
    const [currentScenario, setCurrentScenario] = useState(0);
    const [score, setScore] = useState(0);
    const [foundIssues, setFoundIssues] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [gameComplete, setGameComplete] = useState(false);

    const scenario = WEBSITE_SCENARIOS[currentScenario];
    const totalIssues = scenario.fake.issues.length;

    const handleIssueClick = (issue) => {
        if (!foundIssues.find(i => i.id === issue.id)) {
            setFoundIssues([...foundIssues, issue]);
            const points = issue.severity === "critical" ? 30 : issue.severity === "high" ? 20 : 10;
            setScore(score + points);
        }
    };

    const handleNext = () => {
        if (currentScenario < WEBSITE_SCENARIOS.length - 1) {
            setCurrentScenario(currentScenario + 1);
            setFoundIssues([]);
            setShowResults(false);
        } else {
            setGameComplete(true);
        }
    };

    if (gameComplete) {
        return (
            <div className="animate-fadeIn">
                <div className="max-w-4xl mx-auto">
                    <div className="glass-card p-8 text-center">
                        <div className="text-6xl mb-4">🎯</div>
                        <h2 className="text-3xl font-bold mb-4">Website Detective Complete!</h2>
                        <div className="text-5xl font-bold text-primary mb-6">{score} Points</div>

                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    setCurrentScenario(0);
                                    setScore(0);
                                    setFoundIssues([]);
                                    setShowResults(false);
                                    setGameComplete(false);
                                }}
                                className="btn-primary w-full"
                            >
                                🔄 Play Again
                            </button>
                            <button onClick={() => navigate("/dashboard")} className="btn-secondary w-full">
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
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate("/dashboard")} className="text-secondary hover:text-base">
                            ← Back
                        </button>
                        <h1 className="text-2xl font-bold">🌐 Fake Website Detector</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-sm">
                            Scenario {currentScenario + 1} / {WEBSITE_SCENARIOS.length}
                        </div>
                        <div className="text-lg font-bold text-primary">Score: {score}</div>
                    </div>
                </div>

                {/* Instructions */}
                {!showResults && (
                    <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">💡</span>
                            <div>
                                <div className="font-semibold mb-1">Find the Security Issues</div>
                                <div className="text-sm text-secondary">
                                    Click on security issues in the FAKE website to identify what makes it suspicious.
                                    Found: {foundIssues.length}/{totalIssues}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Website Comparison */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Real Website */}
                    <div className="glass-card p-6">
                        <div className="bg-emerald-500/10  border border-emerald-500/50 rounded-lg p-3 mb-4">
                            <div className="font-bold text-emerald-400">✅ REAL {scenario.name}</div>
                        </div>

                        {/* Browser Bar */}
                        <div className="bg-surface rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex gap-1">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-hover px-3 py-2 rounded">
                                <span className="text-emerald-400">🔒</span>
                                <span className="text-sm font-mono">{scenario.real.url}</span>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-secondary">SSL Certificate:</span>
                                <span className="text-emerald-400">{scenario.real.ssl}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-secondary">Domain:</span>
                                <span className="font-mono">{scenario.real.domain}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-secondary">HTTPS:</span>
                                <span className="text-emerald-400">✅ Enabled</span>
                            </div>
                        </div>
                    </div>

                    {/* Fake Website */}
                    <div className="glass-card p-6">
                        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4">
                            <div className="font-bold text-red-400">🚨 FAKE {scenario.name}</div>
                        </div>

                        {/* Browser Bar */}
                        <div className="bg-surface rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex gap-1">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-hover px-3 py-2 rounded">
                                {scenario.fake.https ? <span className="text-yellow-400">⚠️</span> : <span className="text-red-400">🔓</span>}
                                <span className="text-sm font-mono">{scenario.fake.url}</span>
                            </div>
                        </div>

                        {/* Clickable Issues */}
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-secondary">SSL Certificate:</span>
                                <button
                                    onClick={() => handleIssueClick(scenario.fake.issues.find(i => i.type.includes("SSL") || i.type.includes("certificate")))}
                                    className={`px-2 py-1 rounded text-xs transition-all ${foundIssues.find(i => i.type.includes("SSL") || i.type.includes("certificate"))
                                            ? "bg-red-500/20 text-red-400 border border-red-500/50"
                                            : "hover:bg-red-500/10 cursor-pointer"
                                        }`}
                                >
                                    {scenario.fake.ssl}
                                </button>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-secondary">Domain:</span>
                                <button
                                    onClick={() => handleIssueClick(scenario.fake.issues.find(i => i.type.includes("Domain") || i.type.includes("Typo")))}
                                    className={`px-2 py-1 rounded font-mono text-xs transition-all ${foundIssues.find(i => i.type.includes("Domain") || i.type.includes("Typo"))
                                            ? "bg-red-500/20 text-red-400 border border-red-500/50"
                                            : "hover:bg-red-500/10 cursor-pointer"
                                        }`}
                                >
                                    {scenario.fake.domain}
                                </button>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-secondary">HTTPS:</span>
                                <button
                                    onClick={() => handleIssueClick(scenario.fake.issues.find(i => i.type.includes("HTTPS") || i.type.includes("HTTP")))}
                                    className={`px-2 py-1 rounded text-xs transition-all ${foundIssues.find(i => i.type.includes("HTTPS") || i.type.includes("HTTP"))
                                            ? "bg-red-500/20 text-red-400 border border-red-500/50"
                                            : "hover:bg-red-500/10 cursor-pointer"
                                        }`}
                                >
                                    {scenario.fake.https ? "⚠️ Suspicious" : "❌ Disabled"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Found Issues */}
                {foundIssues.length > 0 && (
                    <div className="glass-card p-6 mb-6">
                        <h3 className="font-bold mb-4">🔍 Issues Found ({foundIssues.length}/{totalIssues})</h3>
                        <div className="space-y-3">
                            {foundIssues.map(issue => (
                                <div key={issue.id} className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">🚩</span>
                                        <div className="flex-1">
                                            <div className="font-semibold text-red-400">{issue.type}</div>
                                            <div className="text-sm text-secondary">{issue.description}</div>
                                        </div>
                                        <div className={`text-xs px-2 py-1 rounded ${issue.severity === "critical" ? "bg-red-500/20 text-red-400" :
                                                issue.severity === "high" ? "bg-orange-500/20 text-orange-400" :
                                                    "bg-yellow-500/20 text-yellow-400"
                                            }`}>
                                            {issue.severity}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between">
                    <button
                        onClick={() => setShowResults(true)}
                        className="btn-secondary"
                        disabled={showResults}
                    >
                        👁️ Show All Issues
                    </button>
                    <button
                        onClick={handleNext}
                        className="btn-primary"
                        disabled={foundIssues.length < totalIssues && !showResults}
                    >
                        {currentScenario < WEBSITE_SCENARIOS.length - 1 ? "Next Scenario →" : "Finish"}
                    </button>
                </div>

                {/* Results */}
                {showResults && (
                    <div className="mt-6 glass-card p-6 bg-blue-500/5">
                        <h3 className="font-bold mb-4">📋 All Security Issues</h3>
                        <div className="space-y-3">
                            {scenario.fake.issues.map(issue => (
                                <div
                                    key={issue.id}
                                    className={`rounded-lg p-3 border ${foundIssues.find(i => i.id === issue.id)
                                            ? "bg-emerald-500/10 border-emerald-500/50"
                                            : "bg-red-500/10 border-red-500/50"
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">
                                            {foundIssues.find(i => i.id === issue.id) ? "✅" : "❌"}
                                        </span>
                                        <div className="flex-1">
                                            <div className="font-semibold">{issue.type}</div>
                                            <div className="text-sm text-secondary">{issue.description}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Password strength calculator
const calculateStrength = (password) => {
    let score = 0;
    const checks = {
        length: password.length >= 12,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        numbers: /[0-9]/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        noCommon: !["password", "123456", "qwerty", "admin", "letmein"].some(common =>
            password.toLowerCase().includes(common)
        )
    };

    if (checks.length) score += 20;
    if (checks.uppercase) score += 15;
    if (checks.lowercase) score += 15;
    if (checks.numbers) score += 15;
    if (checks.special) score += 20;
    if (checks.noCommon) score += 15;
    if (password.length >= 16) score += 10;
    if (password.length >= 20) score += 10;

    return { score: Math.min(score, 100), checks };
};

// Estimate crack time
const estimateCrackTime = (password) => {
    const chars = password.length;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    let charset = 0;
    if (hasLower) charset += 26;
    if (hasUpper) charset += 26;
    if (hasNumber) charset += 10;
    if (hasSpecial) charset += 32;

    const combinations = Math.pow(charset, chars);
    const guessesPerSecond = 1000000000; // 1 billion guesses/sec

    const seconds = combinations / (guessesPerSecond * 2);

    if (seconds < 1) return "Instant";
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 2592000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 31536000) return `${Math.round(seconds / 2592000)} months`;
    if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} years`;
    return `${Math.round(seconds / 31536000000)} centuries`;
};

// Attack simulations
const ATTACK_TYPES = [
    { name: "Brute Force", icon: "🔨", speed: 1000000000, description: "Tries every possible combination" },
    { name: "Dictionary", icon: "📖", speed: 10000000, description: "Uses common words and patterns" },
    { name: "Rainbow Table", icon: "🌈", speed: 100000000, description: "Pre-computed hash lookups" }
];

export default function PasswordStrengthBattle() {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [strength, setStrength] = useState({ score: 0, checks: {} });
    const [crackTime, setCrackTime] = useState("N/A");
    const [activeAttack, setActiveAttack] = useState(null);
    const [attackProgress, setAttackProgress] = useState(0);
    const [showMFA, setShowMFA] = useState(false);

    useEffect(() => {
        if (password) {
            const str = calculateStrength(password);
            setStrength(str);
            setCrackTime(estimateCrackTime(password));
        } else {
            setStrength({ score: 0, checks: {} });
            setCrackTime("N/A");
        }
    }, [password]);

    useEffect(() => {
        if (activeAttack) {
            const interval = setInterval(() => {
                setAttackProgress(prev => {
                    if (prev >= 100) {
                        setActiveAttack(null);
                        return 0;
                    }
                    // Speed based on password strength
                    const increment = strength.score < 30 ? 10 : strength.score < 60 ? 2 : 0.5;
                    return Math.min(prev + increment, 100);
                });
            }, 100);

            return () => clearInterval(interval);
        }
    }, [activeAttack, strength.score]);

    const getStrengthColor = () => {
        if (strength.score >= 80) return "text-emerald-400";
        if (strength.score >= 60) return "text-blue-400";
        if (strength.score >= 40) return "text-yellow-400";
        if (strength.score >= 20) return "text-orange-400";
        return "text-red-400";
    };

    const getStrengthLabel = () => {
        if (strength.score >= 80) return "Very Strong 💪";
        if (strength.score >= 60) return "Strong 👍";
        if (strength.score >= 40) return "Moderate ⚠️";
        if (strength.score >= 20) return "Weak 😟";
        return "Very Weak 🚨";
    };

    const suggestions = [];
    if (!strength.checks.length) suggestions.push("Use at least 12 characters");
    if (!strength.checks.uppercase) suggestions.push("Add uppercase letters (A-Z)");
    if (!strength.checks.lowercase) suggestions.push("Add lowercase letters (a-z)");
    if (!strength.checks.numbers) suggestions.push("Add numbers (0-9)");
    if (!strength.checks.special) suggestions.push("Add special characters (!@#$%)");
    if (!strength.checks.noCommon) suggestions.push("Avoid common words");

    return (
        <div className="animate-fadeIn">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate("/dashboard")} className="text-secondary hover:text-base">
                            ← Back
                        </button>
                        <h1 className="text-2xl font-bold">⚔️ Password Strength Battle</h1>
                    </div>
                </div>

                {/* Main Battle Area */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Your Defense */}
                    <div className="glass-card p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span>🛡️</span> Your Defense
                        </h2>

                        {/* Password Input */}
                        <div className="mb-6">
                            <label className="block text-sm text-secondary mb-2">Create Your Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password..."
                                    className="input pr-12"
                                    autoFocus
                                />
                                <button
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-base"
                                >
                                    {showPassword ? "👁️" : "👁️‍🗨️"}
                                </button>
                            </div>
                        </div>

                        {/* Strength Meter */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-secondary">Strength</span>
                                <span className={`font-bold ${getStrengthColor()}`}>
                                    {getStrengthLabel()}
                                </span>
                            </div>
                            <div className="h-4 bg-surface rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${strength.score >= 80 ? "bg-emerald-500" :
                                            strength.score >= 60 ? "bg-blue-500" :
                                                strength.score >= 40 ? "bg-yellow-500" :
                                                    strength.score >= 20 ? "bg-orange-500" :
                                                        "bg-red-500"
                                        }`}
                                    style={{ width: `${strength.score}%` }}
                                ></div>
                            </div>
                            <div className="text-right text-xs text-muted mt-1">{strength.score}/100</div>
                        </div>

                        {/* Requirements Checklist */}
                        <div className="space-y-2 mb-6">
                            <div className="text-sm font-semibold mb-2">Requirements:</div>
                            {[
                                { key: "length", label: "12+ characters", value: strength.checks.length },
                                { key: "uppercase", label: "Uppercase (A-Z)", value: strength.checks.uppercase },
                                { key: "lowercase", label: "Lowercase (a-z)", value: strength.checks.lowercase },
                                { key: "numbers", label: "Numbers (0-9)", value: strength.checks.numbers },
                                { key: "special", label: "Special (!@#$%)", value: strength.checks.special },
                                { key: "noCommon", label: "No common words", value: strength.checks.noCommon }
                            ].map(req => (
                                <div key={req.key} className="flex items-center gap-2 text-sm">
                                    <span className={req.value ? "text-emerald-400" : "text-muted"}>
                                        {req.value ? "✅" : "⭕"}
                                    </span>
                                    <span className={req.value ? "" : "text-muted"}>{req.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Time to Crack */}
                        <div className="bg-hover rounded-lg p-4">
                            <div className="text-sm text-secondary mb-1">⏱️ Time to Crack</div>
                            <div className={`text-2xl font-bold ${getStrengthColor()}`}>
                                {crackTime}
                            </div>
                            <div className="text-xs text-muted mt-1">
                                At 1 billion guesses/second
                            </div>
                        </div>
                    </div>

                    {/* Attacker Simulation */}
                    <div className="glass-card p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span>🎯</span> AI Attacker
                        </h2>

                        {/* Attack Selection */}
                        <div className="mb-6">
                            <div className="text-sm text-secondary mb-3">Choose Attack Method:</div>
                            <div className="grid gap-2">
                                {ATTACK_TYPES.map(attack => (
                                    <button
                                        key={attack.name}
                                        onClick={() => {
                                            setActiveAttack(attack);
                                            setAttackProgress(0);
                                        }}
                                        disabled={!password || activeAttack}
                                        className={`p-3 rounded-lg text-left transition-all ${activeAttack?.name === attack.name
                                                ? "bg-red-500/20 border-2 border-red-500/50"
                                                : "bg-surface hover:bg-hover border border-border"
                                            } ${!password || activeAttack ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xl">{attack.icon}</span>
                                            <span className="font-semibold">{attack.name}</span>
                                        </div>
                                        <div className="text-xs text-secondary">{attack.description}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Attack Progress */}
                        {activeAttack && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-secondary">Attack Progress</span>
                                    <span className="text-sm font-bold text-red-400">{Math.round(attackProgress)}%</span>
                                </div>
                                <div className="h-4 bg-surface rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-100"
                                        style={{ width: `${attackProgress}%` }}
                                    ></div>
                                </div>

                                {attackProgress >= 100 && (
                                    <div className="mt-4 bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-center">
                                        <div className="text-3xl mb-2">💥</div>
                                        <div className="font-bold text-red-400">Password Cracked!</div>
                                        <div className="text-sm text-secondary mt-1">
                                            The attacker broke through your defenses
                                        </div>
                                    </div>
                                )}

                                {attackProgress < 100 && strength.score >= 80 && (
                                    <div className="mt-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg p-4 text-center">
                                        <div className="text-3xl mb-2">🛡️</div>
                                        <div className="font-bold text-emerald-400">Defense Holding!</div>
                                        <div className="text-sm text-secondary mt-1">
                                            Your password is very strong
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Suggestions */}
                        {suggestions.length > 0 && (
                            <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
                                <div className="font-semibold mb-2">💡 How to Improve:</div>
                                <ul className="space-y-1 text-sm">
                                    {suggestions.map((suggestion, i) => (
                                        <li key={i} className="text-secondary">• {suggestion}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* MFA Section */}
                <div className="glass-card p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-3xl">
                                🔐
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2">Multi-Factor Authentication (MFA)</h3>
                            <p className="text-secondary mb-4">
                                Even the strongest password can be stolen. MFA adds an extra layer by requiring a second form of verification.
                            </p>

                            <button
                                onClick={() => setShowMFA(!showMFA)}
                                className="btn-primary"
                            >
                                {showMFA ? "Hide" : "Learn About"} MFA
                            </button>

                            {showMFA && (
                                <div className="mt-4 grid md:grid-cols-3 gap-4">
                                    <div className="bg-surface p-4 rounded-lg">
                                        <div className="text-2xl mb-2">📱</div>
                                        <div className="font-semibold mb-1">Authenticator App</div>
                                        <div className="text-sm text-secondary">Google Authenticator, Authy, etc.</div>
                                    </div>
                                    <div className="bg-surface p-4 rounded-lg">
                                        <div className="text-2xl mb-2">💬</div>
                                        <div className="font-semibold mb-1">SMS Code</div>
                                        <div className="text-sm text-secondary">Text message verification</div>
                                    </div>
                                    <div className="bg-surface p-4 rounded-lg">
                                        <div className="text-2xl mb-2">🔑</div>
                                        <div className="font-semibold mb-1">Hardware Key</div>
                                        <div className="text-sm text-secondary">YubiKey, security keys</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Best Practices */}
                <div className="mt-6 grid md:grid-cols-2 gap-6">
                    <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-4">
                        <h4 className="font-bold text-emerald-400 mb-2">✅ DO:</h4>
                        <ul className="space-y-1 text-sm">
                            <li>• Use a password manager</li>
                            <li>• Create unique passwords for each account</li>
                            <li>• Use 12+ characters with mixed types</li>
                            <li>• Enable MFA everywhere possible</li>
                            <li>• Use passphrases (e.g., "Coffee!Morning@2024")</li>
                        </ul>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                        <h4 className="font-bold text-red-400 mb-2">❌ DON'T:</h4>
                        <ul className="space-y-1 text-sm">
                            <li>• Reuse passwords across accounts</li>
                            <li>• Use personal information (name, birthday)</li>
                            <li>• Use common words or patterns</li>
                            <li>• Share passwords with anyone</li>
                            <li>• Store passwords in plain text</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

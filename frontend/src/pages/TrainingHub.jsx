import { useNavigate } from "react-router-dom";

const TRAINING_MODULES = [
    // Phase 1
    {
        id: "sms-phishing",
        title: "SMS Phishing Simulator",
        description: "Swipe to identify phishing texts - like Tinder for scams!",
        icon: "📱",
        difficulty: "Easy",
        time: "5-10 min",
        path: "/training/sms-phishing",
        color: "from-blue-500 to-cyan-500",
        features: ["10 realistic scenarios", "Swipe mechanics", "Instant feedback"]
    },
    {
        id: "fake-website",
        title: "Fake Website Detector",
        description: "Spot security issues in fake websites vs real ones",
        icon: "🌐",
        difficulty: "Medium",
        time: "10-15 min",
        path: "/training/fake-website",
        color: "from-purple-500 to-pink-500",
        features: ["Side-by-side comparison", "Click to find issues", "SSL & domain analysis"]
    },
    {
        id: "password-battle",
        title: "Password Strength Battle",
        description: "Watch AI try to crack your password in real-time",
        icon: "⚔️",
        difficulty: "Easy",
        time: "5-10 min",
        path: "/training/password-battle",
        color: "from-emerald-500 to-teal-500",
        features: ["Live crack simulation", "Strength meter", "MFA education"]
    },
    // Phase 2
    {
        id: "spam-battle",
        title: "Spam Email Battle",
        description: "Defend your inbox! Drag emails to spam or inbox",
        icon: "📧",
        difficulty: "Medium",
        time: "5-10 min",
        path: "/training/spam-battle",
        color: "from-red-500 to-orange-500",
        features: ["Drag & drop", "Combo system", "Level progression"]
    },
    {
        id: "url-defuse",
        title: "URL Defuse",
        description: "Bomb disposal for URLs - cut the malicious wires!",
        icon: "💣",
        difficulty: "Medium",
        time: "10-15 min",
        path: "/training/url-defuse",
        color: "from-yellow-500 to-red-500",
        features: ["Wire cutting mechanics", "Timer countdown", "URL analysis"]
    },
    // Phase 3
    {
        id: "qr-scanner",
        title: "QR Code Scanner",
        description: "Learn to identify malicious QR codes before scanning",
        icon: "📷",
        difficulty: "Medium",
        time: "10 min",
        path: "/training/qr-scanner",
        color: "from-indigo-500 to-purple-500",
        features: ["QR analysis", "URL preview", "Red flag detection"]
    },
    {
        id: "attachment-quarantine",
        title: "Attachment Quarantine",
        description: "Airport security for files - scan and quarantine threats",
        icon: "🦠",
        difficulty: "Hard",
        time: "10 min",
        path: "/training/attachment-quarantine",
        color: "from-pink-500 to-red-500",
        features: ["X-ray scanner", "Extension checker", "Lives system"]
    },
    // Advanced
    {
        id: "vishing-defense",
        title: "Social Engineering Hotline",
        description: "Defend against vishing attacks with branching dialogues",
        icon: "📞",
        difficulty: "Hard",
        time: "15 min",
        path: "/training/vishing-defense",
        color: "from-orange-500 to-red-500",
        features: ["Branching scenarios", "Suspicion tracking", "Call transcripts"]
    },
    {
        id: "wifi-safety",
        title: "Wi-Fi Safety Trainer",
        description: "Identify evil twins and secure networks in public places",
        icon: "📡",
        difficulty: "Medium",
        time: "10 min",
        path: "/training/wifi-safety",
        color: "from-cyan-500 to-blue-500",
        features: ["Network visualization", "Encryption analysis", "Evil twin detection"]
    },
    {
        id: "crypto-scams",
        title: "Crypto Scam Detector",
        description: "Spot cryptocurrency scams, rug pulls, and phishing",
        icon: "₿",
        difficulty: "Hard",
        time: "15 min",
        path: "/training/crypto-scams",
        color: "from-yellow-500 to-orange-500",
        features: ["6 detailed scenarios", "Red flag analysis", "DeFi safety"]
    }
];

export default function TrainingHub() {
    const navigate = useNavigate();

    return (
        <div className="animate-fadeIn">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">
                        <span className="gradient-text">🎮 Interactive Training Hub</span>
                    </h1>
                    <p className="text-xl text-secondary max-w-2xl mx-auto mb-4">
                        Complete cybersecurity training through 10 interactive games and simulations
                    </p>
                    <div className="flex items-center justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span className="text-secondary">3 Easy</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <span className="text-secondary">4 Medium</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-secondary">3 Hard</span>
                        </div>
                    </div>
                </div>

                {/* Module Grid */}
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                    {TRAINING_MODULES.map(module => (
                        <div
                            key={module.id}
                            className="glass-card p-6 hover:scale-105 transition-all cursor-pointer group"
                            onClick={() => navigate(module.path)}
                        >
                            {/* Icon Badge */}
                            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform`}>
                                {module.icon}
                            </div>

                            {/* Title & Description */}
                            <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                {module.title}
                            </h3>
                            <p className="text-sm text-secondary mb-4 line-clamp-2">
                                {module.description}
                            </p>

                            {/* Metadata */}
                            <div className="flex items-center gap-3 mb-4 text-xs">
                                <span className={`px-2 py-1 rounded ${module.difficulty === "Easy" ? "bg-emerald-500/20 text-emerald-400" :
                                        module.difficulty === "Medium" ? "bg-yellow-500/20 text-yellow-400" :
                                            "bg-red-500/20 text-red-400"
                                    }`}>
                                    {module.difficulty}
                                </span>
                                <span className="text-muted">⏱️ {module.time}</span>
                            </div>

                            {/* Features */}
                            <div className="space-y-1 mb-4">
                                {module.features.slice(0, 2).map((feature, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs text-secondary">
                                        <span className="text-primary">✓</span>
                                        <span className="line-clamp-1">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA */}
                            <button className="btn-primary w-full text-sm group-hover:bg-primary/80">
                                Start Training →
                            </button>
                        </div>
                    ))}
                </div>

                {/* Stats Section */}
                <div className="grid md:grid-cols-4 gap-6">
                    <div className="stat-card text-center">
                        <div className="text-4xl font-bold text-primary mb-2">10</div>
                        <div className="text-sm text-secondary">Training Modules</div>
                    </div>
                    <div className="stat-card text-center">
                        <div className="text-4xl font-bold text-emerald-400 mb-2">90+</div>
                        <div className="text-sm text-secondary">Scenarios</div>
                    </div>
                    <div className="stat-card text-center">
                        <div className="text-4xl font-bold text-cyan-400 mb-2">100+</div>
                        <div className="text-sm text-secondary">Minutes of Training</div>
                    </div>
                    <div className="stat-card text-center">
                        <div className="text-4xl font-bold text-purple-400 mb-2">ALL</div>
                        <div className="text-sm text-secondary">Attack Vectors</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useNavigate } from "react-router-dom";

const TRAINING_MODULES = [
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
    }
];

export default function TrainingHub() {
    const navigate = useNavigate();

    return (
        <div className="animate-fadeIn">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">
                        <span className="gradient-text">🎮 Interactive Training Hub</span>
                    </h1>
                    <p className="text-xl text-secondary max-w-2xl mx-auto">
                        Learn cybersecurity through fun, interactive games and simulations
                    </p>
                </div>

                {/* Module Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
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
                            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                                {module.title}
                            </h3>
                            <p className="text-sm text-secondary mb-4">
                                {module.description}
                            </p>

                            {/* Metadata */}
                            <div className="flex items-center gap-4 mb-4 text-xs">
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
                                {module.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs text-secondary">
                                        <span className="text-primary">✓</span>
                                        <span>{feature}</span>
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

                {/* Coming Soon */}
                <div className="glass-card p-8 text-center bg-gradient-to-br from-blue-500/5 to-purple-500/5">
                    <h2 className="text-2xl font-bold mb-4">🚀 More Modules Coming Soon</h2>
                    <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                        {[
                            { icon: "🦠", name: "Attachment Quarantine", status: "Phase 3" },
                            { icon: "📱", name: "QR Code Scanner", status: "Phase 3" },
                            { icon: "📞", name: "Vishing Detector", status: "Phase 3" }
                        ].map((module, i) => (
                            <div key={i} className="bg-surface p-4 rounded-lg opacity-60">
                                <div className="text-3xl mb-2">{module.icon}</div>
                                <div className="text-sm font-semibold mb-1">{module.name}</div>
                                <div className="text-xs text-muted">{module.status}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats Section */}
                <div className="mt-12 grid md:grid-cols-3 gap-6">
                    <div className="stat-card text-center">
                        <div className="text-4xl font-bold text-primary mb-2">5</div>
                        <div className="text-sm text-secondary">Training Modules</div>
                    </div>
                    <div className="stat-card text-center">
                        <div className="text-4xl font-bold text-emerald-400 mb-2">50+</div>
                        <div className="text-sm text-secondary">Interactive Scenarios</div>
                    </div>
                    <div className="stat-card text-center">
                        <div className="text-4xl font-bold text-cyan-400 mb-2">45</div>
                        <div className="text-sm text-secondary">Min Total Training</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE = "http://localhost:5000/api";

const CATEGORIES = [
    { id: "banking", label: "Banking", icon: "🏦" },
    { id: "payroll", label: "Payroll", icon: "💰" },
    { id: "academic", label: "Academic", icon: "🎓" },
    { id: "healthcare", label: "Healthcare", icon: "🏥" },
    { id: "social", label: "Social Engineering", icon: "👥" },
    { id: "technical", label: "Technical", icon: "💻" },
    { id: "shipping", label: "Shipping", icon: "📦" },
    { id: "prize", label: "Prize/Lottery", icon: "🎰" },
    { id: "internal", label: "Internal/HR", icon: "🏢" },
];

export default function CreateChallenge() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [step, setStep] = useState(1);

    const [form, setForm] = useState({
        title: "",
        type: "phishing",
        difficulty: 3,
        category: "banking",
        fromName: "",
        fromEmail: "",
        subject: "",
        body: "",
        spf: "fail",
        dkim: "none",
        dmarc: "fail",
        clues: "",
        explanation: ""
    });

    const canCreate = (user?.missionsCompleted || 0) >= 5;

    if (!canCreate) {
        return (
            <div className="max-w-2xl mx-auto animate-fadeIn">
                <div className="glass-card p-8 text-center">
                    <div className="text-5xl mb-4">🔒</div>
                    <h2 className="text-2xl font-bold mb-4">Unlock Challenge Creation</h2>
                    <p className="text-slate-400 mb-6">
                        You need to complete at least 5 missions before creating challenges.
                    </p>
                    <div className="mb-6">
                        <div className="text-3xl font-bold text-emerald-400">
                            {user?.missionsCompleted || 0} / 5
                        </div>
                        <div className="text-sm text-slate-500">missions completed</div>
                    </div>
                    <button
                        onClick={() => navigate("/inbox")}
                        className="btn-primary"
                    >
                        Play Missions →
                    </button>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const cluesArray = form.clues.split(",").map(c => c.trim()).filter(Boolean);

        if (cluesArray.length < 2) {
            setError("Please provide at least 2 clues");
            setLoading(false);
            return;
        }

        const challengeData = {
            title: form.title,
            type: form.type,
            difficulty: parseInt(form.difficulty),
            category: form.category,
            emailContent: {
                fromName: form.fromName,
                from: form.fromEmail,
                subject: form.subject,
                body: form.body,
                headers: {
                    spf: form.spf,
                    dkim: form.dkim,
                    dmarc: form.dmarc
                }
            },
            clues: cluesArray,
            explanation: form.explanation
        };

        try {
            const res = await fetch(`${API_BASE}/challenges`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(challengeData)
            });

            const data = await res.json();

            if (res.ok) {
                navigate("/community", { state: { success: true } });
            } else {
                setError(data.message || "Failed to create challenge");
            }
        } catch (err) {
            setError("Connection error. Please try again.");
        }
        setLoading(false);
    };

    return (
        <div className="max-w-3xl mx-auto animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">✏️ Create Challenge</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Share your phishing knowledge with the community
                    </p>
                </div>
                <button
                    onClick={() => navigate("/community")}
                    className="text-slate-400 hover:text-white"
                >
                    Cancel
                </button>
            </div>

            {/* Progress Steps */}
            <div className="flex gap-2 mb-8">
                {[1, 2, 3].map((s) => (
                    <div
                        key={s}
                        className={`flex-1 h-2 rounded-full ${s <= step ? "bg-emerald-500" : "bg-slate-700"
                            }`}
                    />
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                {/* Step 1: Basic Info */}
                {step === 1 && (
                    <div className="glass-card p-6 space-y-4">
                        <h2 className="text-lg font-semibold mb-4">Step 1: Basic Information</h2>

                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Challenge Title</label>
                            <input
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="e.g., Suspicious Bank Alert"
                                className="input"
                                required
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Type</label>
                                <select
                                    name="type"
                                    value={form.type}
                                    onChange={handleChange}
                                    className="input"
                                >
                                    <option value="phishing">🚨 Phishing</option>
                                    <option value="legitimate">✅ Legitimate</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Difficulty</label>
                                <select
                                    name="difficulty"
                                    value={form.difficulty}
                                    onChange={handleChange}
                                    className="input"
                                >
                                    <option value="1">1 - Very Easy</option>
                                    <option value="2">2 - Easy</option>
                                    <option value="3">3 - Medium</option>
                                    <option value="4">4 - Hard</option>
                                    <option value="5">5 - Expert</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Category</label>
                            <div className="grid grid-cols-3 gap-2">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, category: cat.id }))}
                                        className={`p-3 rounded-lg text-sm transition ${form.category === cat.id
                                                ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400"
                                                : "bg-slate-800 border border-slate-700 hover:bg-slate-700"
                                            }`}
                                    >
                                        <span className="mr-1">{cat.icon}</span>
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="btn-primary"
                                disabled={!form.title}
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Email Content */}
                {step === 2 && (
                    <div className="glass-card p-6 space-y-4">
                        <h2 className="text-lg font-semibold mb-4">Step 2: Email Content</h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Sender Name</label>
                                <input
                                    name="fromName"
                                    value={form.fromName}
                                    onChange={handleChange}
                                    placeholder="John Smith"
                                    className="input"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Sender Email</label>
                                <input
                                    name="fromEmail"
                                    value={form.fromEmail}
                                    onChange={handleChange}
                                    placeholder="john@suspicious-domain.com"
                                    className="input"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Subject Line</label>
                            <input
                                name="subject"
                                value={form.subject}
                                onChange={handleChange}
                                placeholder="URGENT: Your account needs verification"
                                className="input"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Email Body</label>
                            <textarea
                                name="body"
                                value={form.body}
                                onChange={handleChange}
                                placeholder="Write the email content here..."
                                className="input min-h-[200px] resize-y"
                                required
                            />
                        </div>

                        {/* Headers */}
                        <div className="p-4 bg-slate-800/50 rounded-lg">
                            <h4 className="text-sm font-medium mb-3">Email Headers (for investigation tools)</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">SPF</label>
                                    <select name="spf" value={form.spf} onChange={handleChange} className="input text-sm py-2">
                                        <option value="pass">Pass ✓</option>
                                        <option value="fail">Fail ✗</option>
                                        <option value="neutral">Neutral</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">DKIM</label>
                                    <select name="dkim" value={form.dkim} onChange={handleChange} className="input text-sm py-2">
                                        <option value="pass">Pass ✓</option>
                                        <option value="fail">Fail ✗</option>
                                        <option value="none">None</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">DMARC</label>
                                    <select name="dmarc" value={form.dmarc} onChange={handleChange} className="input text-sm py-2">
                                        <option value="pass">Pass ✓</option>
                                        <option value="fail">Fail ✗</option>
                                        <option value="none">None</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                                ← Back
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep(3)}
                                className="btn-primary"
                                disabled={!form.fromEmail || !form.subject || !form.body}
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Clues & Submit */}
                {step === 3 && (
                    <div className="glass-card p-6 space-y-4">
                        <h2 className="text-lg font-semibold mb-4">Step 3: Clues & Explanation</h2>

                        <div>
                            <label className="block text-sm text-slate-400 mb-1">
                                Clues (comma-separated, min 2)
                            </label>
                            <input
                                name="clues"
                                value={form.clues}
                                onChange={handleChange}
                                placeholder="suspicious sender, urgency, mismatched link"
                                className="input"
                                required
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                What indicators should users look for?
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-1">
                                Explanation (shown after challenge)
                            </label>
                            <textarea
                                name="explanation"
                                value={form.explanation}
                                onChange={handleChange}
                                placeholder="Explain why this is phishing/legitimate and what users should learn..."
                                className="input min-h-[100px] resize-y"
                            />
                        </div>

                        {/* Preview */}
                        <div className="p-4 bg-slate-800/50 rounded-lg">
                            <h4 className="text-sm font-medium mb-3">Preview</h4>
                            <div className="text-sm space-y-2">
                                <div><strong>Title:</strong> {form.title}</div>
                                <div><strong>Type:</strong> {form.type === "phishing" ? "🚨 Phishing" : "✅ Legitimate"}</div>
                                <div><strong>From:</strong> {form.fromName} &lt;{form.fromEmail}&gt;</div>
                                <div><strong>Subject:</strong> {form.subject}</div>
                                <div><strong>Clues:</strong> {form.clues || "None"}</div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 rounded-lg px-4 py-3 text-red-400">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-between">
                            <button type="button" onClick={() => setStep(2)} className="btn-secondary">
                                ← Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !form.clues}
                                className="btn-primary flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    <>Submit for Review</>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </form>

            {/* Info */}
            <div className="mt-6 p-4 bg-slate-800/50 rounded-lg text-sm text-slate-400">
                <strong>Note:</strong> Your challenge will be reviewed by moderators before it appears
                in the community hub. Make sure it's educational and follows community guidelines.
            </div>
        </div>
    );
}

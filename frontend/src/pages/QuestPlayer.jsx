/**
 * QuestPlayer Page
 * 
 * Handles standalone quests (tutorials, boss fights) that don't link to missions/questions.
 * For quests with linked content, users are redirected to MissionViewer/QuestionPlayer.
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getQuestById, completeQuest } from "../services/api";

export default function QuestPlayer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [quest, setQuest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    useEffect(() => {
        loadQuest();
    }, [id]);

    const loadQuest = async () => {
        try {
            const data = await getQuestById(id);
            if (data.error || data.message) {
                navigate("/world-map");
                return;
            }
            setQuest(data);

            // If quest has linked content, redirect there
            if (data.linkedContent?.missionId) {
                navigate(`/mission/${data.linkedContent.missionId._id || data.linkedContent.missionId}`);
                return;
            }
            if (data.linkedContent?.questionId) {
                navigate(`/question/${data.linkedContent.questionId._id || data.linkedContent.questionId}`);
                return;
            }
        } catch (err) {
            navigate("/world-map");
        } finally {
            setLoading(false);
        }
    };

    // Demo questions for tutorial quests
    const getTutorialContent = () => {
        switch (quest?.title) {
            case "Spot the Fake Sender":
                return {
                    question: "Which of these email addresses looks suspicious?",
                    options: [
                        { id: 1, text: "john.smith@company.com", correct: false },
                        { id: 2, text: "support@amaz0n-security.com", correct: true },
                        { id: 3, text: "hr@internal.company.com", correct: false },
                        { id: 4, text: "billing@company.com", correct: false },
                    ],
                    explanation: "The suspicious address uses '0' instead of 'o' in 'amazon' and has an unusual domain. Legitimate companies use their official domain, not variations like 'amaz0n-security.com'."
                };
            case "Link Inspection 101":
                return {
                    question: "You hover over a 'Click here to verify' link. The URL shows: https://secure-bankofamerica.malicious-site.com/login. Is this safe?",
                    options: [
                        { id: 1, text: "Yes, it says 'secure' and 'bankofamerica'", correct: false },
                        { id: 2, text: "No, the real domain is 'malicious-site.com'", correct: true },
                        { id: 3, text: "Maybe, I should click to check", correct: false },
                    ],
                    explanation: "The actual domain is 'malicious-site.com'. Attackers add legitimate-looking subdomains to fool users. Always check the main domain before the first '/'."
                };
            case "Urgency Red Flags":
                return {
                    question: "An email says 'ACT NOW! Your account will be suspended in 2 hours unless you verify your password!' What should you do?",
                    options: [
                        { id: 1, text: "Click the link immediately to avoid suspension", correct: false },
                        { id: 2, text: "Forward to colleagues so they can verify too", correct: false },
                        { id: 3, text: "Ignore the urgency, verify directly on the official website", correct: true },
                        { id: 4, text: "Reply asking for more time", correct: false },
                    ],
                    explanation: "Urgency is a classic phishing tactic. Real companies don't threaten account suspension with extreme deadlines. Always go directly to the official website instead of clicking email links."
                };
            case "CEO Impersonation":
                return {
                    question: "You receive this email: 'Hi, I'm currently in a meeting and need you to urgently purchase $500 in gift cards for client appreciation. Keep this confidential. - Sent from CEO's iPhone'. What do you do?",
                    options: [
                        { id: 1, text: "Purchase the gift cards immediately to help the CEO", correct: false },
                        { id: 2, text: "Reply to ask which type of gift cards", correct: false },
                        { id: 3, text: "Verify through a separate channel (call/Slack the CEO directly)", correct: true },
                        { id: 4, text: "Forward to your manager to handle", correct: false },
                    ],
                    explanation: "This is a classic Business Email Compromise (BEC) attack. The urgency, request for confidentiality, and unusual payment method (gift cards) are red flags. ALWAYS verify such requests through a known, separate communication channel - never trust email alone for financial requests."
                };
            case "Phishing Boss: BEC Attack":
                return {
                    question: "SCENARIO: You've received 3 emails today: 1) IT asking to verify your credentials via a link, 2) HR announcing a 'mandatory policy update' requiring your SSN, 3) A vendor invoice with an attachment named 'invoice.pdf.exe'. How many of these are DEFINITELY suspicious?",
                    options: [
                        { id: 1, text: "Just 1 - only the .exe file is dangerous", correct: false },
                        { id: 2, text: "Just 2 - IT and the attachment", correct: false },
                        { id: 3, text: "All 3 are suspicious and should be verified", correct: true },
                        { id: 4, text: "None - these are normal business emails", correct: false },
                    ],
                    explanation: "ALL THREE are suspicious! 1) IT departments don't ask for credentials via email links, 2) HR wouldn't request SSN via email - this is a data harvesting attempt, 3) The .exe hidden in a PDF name is an obvious malware attempt. When in doubt, verify ALL unusual requests through known channels."
                };
            default:
                return {
                    question: "Test your phishing awareness! Select the best security practice:",
                    options: [
                        { id: 1, text: "Always verify unexpected requests through a separate channel", correct: true },
                        { id: 2, text: "Trust emails from people you know", correct: false },
                        { id: 3, text: "Click links to check if they're safe", correct: false },
                        { id: 4, text: "Respond quickly to urgent requests", correct: false },
                    ],
                    explanation: "The safest approach is always to verify unexpected or unusual requests through a known, separate communication channel. Email accounts can be compromised, so never trust email alone for sensitive matters."
                };
        }
    };

    const handleSubmit = async () => {
        if (!selectedAnswer) return;

        setSubmitting(true);
        const content = getTutorialContent();
        const isCorrect = content.options.find(o => o.id === selectedAnswer)?.correct;

        // Calculate score
        const score = isCorrect ? 100 : 25;

        try {
            const response = await completeQuest(id, score);
            setResult({
                isCorrect,
                score,
                ...response,
                explanation: content.explanation
            });
            setShowResult(true);
        } catch (err) {
            setResult({
                isCorrect,
                score,
                stars: isCorrect ? 3 : 0,
                explanation: content.explanation,
                error: true
            });
            setShowResult(true);
        }
        setSubmitting(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!quest) {
        return (
            <div className="text-center py-16">
                <p className="text-red-400 mb-4">Quest not found</p>
                <button onClick={() => navigate("/world-map")} className="btn-primary">
                    Back to Map
                </button>
            </div>
        );
    }

    const content = getTutorialContent();

    // Result screen
    if (showResult) {
        return (
            <div className="max-w-2xl mx-auto animate-fadeIn">
                <div className={`glass-card p-8 text-center ${result.isCorrect ? "border-emerald-500" : "border-orange-500"}`}>
                    {/* Icon */}
                    <div className="text-6xl mb-4">
                        {result.isCorrect ? "🎉" : "💡"}
                    </div>

                    {/* Title */}
                    <h2 className={`text-2xl font-bold mb-2 ${result.isCorrect ? "text-emerald-400" : "text-orange-400"}`}>
                        {result.isCorrect ? "Correct!" : "Keep Learning!"}
                    </h2>

                    {/* Stars */}
                    <div className="flex justify-center gap-2 my-4">
                        {[1, 2, 3].map(star => (
                            <span key={star} className={`text-3xl ${star <= (result.stars || 0) ? "text-yellow-400" : "text-slate-600"}`}>
                                ⭐
                            </span>
                        ))}
                    </div>

                    {/* Score */}
                    <p className="text-slate-400 mb-4">Score: {result.score}%</p>

                    {/* XP */}
                    {result.xpEarned > 0 && (
                        <p className="text-emerald-400 font-semibold mb-4">+{result.xpEarned} XP</p>
                    )}

                    {/* Explanation */}
                    <div className="p-4 bg-slate-800/50 rounded-lg text-left mb-6">
                        <h3 className="font-semibold mb-2 text-slate-200">Explanation:</h3>
                        <p className="text-slate-400 text-sm">{result.explanation}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => navigate(`/region/${quest.region?._id || quest.region}`)}
                            className="btn-primary"
                        >
                            Continue →
                        </button>
                        {!result.isCorrect && (
                            <button
                                onClick={() => {
                                    setShowResult(false);
                                    setSelectedAnswer(null);
                                    setResult(null);
                                }}
                                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                            >
                                Try Again
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Quest screen
    return (
        <div className="max-w-2xl mx-auto animate-fadeIn">
            {/* Back button */}
            <button
                onClick={() => navigate(`/region/${quest.region?._id || quest.region}`)}
                className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition mb-6"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Region
            </button>

            {/* Quest Header */}
            <div className="glass-card p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <span className="text-4xl">{quest.icon}</span>
                    <div>
                        <h1 className="text-xl font-bold">{quest.title}</h1>
                        <p className="text-slate-400 text-sm">{quest.description}</p>
                    </div>
                </div>

                {/* Story intro */}
                {quest.story?.intro && (
                    <div className="p-4 bg-slate-800/50 rounded-lg border-l-4 border-emerald-500">
                        <p className="text-sm text-slate-300 italic">"{quest.story.intro}"</p>
                    </div>
                )}
            </div>

            {/* Question */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold mb-4">{content.question}</h2>

                {/* Options */}
                <div className="space-y-3 mb-6">
                    {content.options.map(option => (
                        <button
                            key={option.id}
                            onClick={() => setSelectedAnswer(option.id)}
                            className={`w-full p-4 text-left rounded-lg border-2 transition ${selectedAnswer === option.id
                                ? "border-emerald-500 bg-emerald-500/10"
                                : "border-slate-700 hover:border-slate-600 bg-slate-800/50"
                                }`}
                        >
                            {option.text}
                        </button>
                    ))}
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={!selectedAnswer || submitting}
                    className="btn-primary w-full py-3 disabled:opacity-50"
                >
                    {submitting ? "Checking..." : "Submit Answer"}
                </button>
            </div>

            {/* XP info */}
            <div className="mt-4 text-center text-sm text-slate-500">
                <span>🎯 {quest.xpReward} XP</span>
                <span className="mx-2">•</span>
                <span>⭐ Up to 3 stars</span>
            </div>
        </div>
    );
}

/**
 * QuestionPlayer Page
 * 
 * Interactive question player with weighted scoring, 
 * similar to MissionViewer but for question-based assessments.
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getQuestionById, submitQuestionAnswer } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { AnswerSelect } from "../components/TaxonomyDropdown";

const XP_PER_LEVEL = 500;

export default function QuestionPlayer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();

    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Game state
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);

    const level = Math.floor((user?.xp || 0) / XP_PER_LEVEL) + 1;
    const xpProgress = (((user?.xp || 0) % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;

    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                const data = await getQuestionById(id);
                if (data.message) {
                    setError(data.message);
                } else {
                    setQuestion(data);
                }
            } catch (err) {
                setError("Failed to load question");
            } finally {
                setLoading(false);
            }
        };
        fetchQuestion();
    }, [id]);

    const handleSubmit = async () => {
        if (submitting || selectedAnswers.length === 0) return;
        setSubmitting(true);

        try {
            const response = await submitQuestionAnswer(id, selectedAnswers, user?._id);

            if (response.error) {
                setError(response.error);
                setSubmitting(false);
                return;
            }

            setResult(response);
            refreshUser();
        } catch (err) {
            setError("Failed to submit answer");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading question...</p>
                </div>
            </div>
        );
    }

    if (error || !question) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error || "Question not found"}</p>
                    <button
                        onClick={() => navigate("/inbox")}
                        className="btn-primary"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Render content based on content type
    const renderContent = () => {
        switch (question.contentType) {
            case "email":
                return (
                    <div className="glass-card p-6">
                        {/* Email header */}
                        <div className="border-b border-slate-700 pb-4 mb-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg">
                                    {question.content?.emailHeaders?.fromName?.charAt(0) || "?"}
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-white">
                                        {question.content?.emailHeaders?.fromName || "Unknown Sender"}
                                    </div>
                                    <div className="text-sm text-slate-400">
                                        &lt;{question.content?.emailHeaders?.from || "unknown"}&gt;
                                    </div>
                                </div>
                                {/* Email authentication badges */}
                                <div className="flex gap-2">
                                    <span className={`text-xs px-2 py-1 rounded ${question.content?.emailHeaders?.spf === "pass"
                                            ? "bg-emerald-500/20 text-emerald-400"
                                            : "bg-red-500/20 text-red-400"
                                        }`}>
                                        SPF: {question.content?.emailHeaders?.spf || "none"}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded ${question.content?.emailHeaders?.dkim === "pass"
                                            ? "bg-emerald-500/20 text-emerald-400"
                                            : "bg-red-500/20 text-red-400"
                                        }`}>
                                        DKIM: {question.content?.emailHeaders?.dkim || "none"}
                                    </span>
                                </div>
                            </div>
                            <div className="text-slate-300 font-medium">
                                Subject: {question.content?.emailHeaders?.subject || "No Subject"}
                            </div>
                        </div>
                        {/* Email body */}
                        <div className="prose prose-invert max-w-none">
                            <p className="text-slate-300 whitespace-pre-wrap">
                                {question.content?.emailBody}
                            </p>
                        </div>
                    </div>
                );

            case "sms":
                return (
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                            <span>📱</span>
                            <span>SMS from: {question.content?.smsFrom || "Unknown"}</span>
                        </div>
                        <div className="bg-slate-800 rounded-xl p-4 max-w-sm">
                            <p className="text-white">{question.content?.smsBody}</p>
                        </div>
                    </div>
                );

            case "url":
                return (
                    <div className="glass-card p-6">
                        <div className="text-sm text-slate-400 mb-2">🔗 URL to analyze:</div>
                        <div className="bg-slate-800 rounded-lg p-4 font-mono text-sm text-red-400 break-all">
                            {question.content?.urlToAnalyze}
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="glass-card p-6">
                        <p className="text-slate-400">Content preview not available</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Top Bar */}
            <div className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur border-b border-slate-800">
                <div className="flex justify-between items-center px-6 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>

                    {/* Question type badge */}
                    <div className="flex items-center gap-2">
                        <span className={`badge ${question.questionType === "multi" ? "badge-warning" : "badge-success"
                            }`}>
                            {question.questionType === "multi" ? "Multi-Select" : "Single Answer"}
                        </span>
                        <span className={`badge ${question.tags?.difficulty <= 2 ? "badge-success" :
                                question.tags?.difficulty === 3 ? "badge-warning" : "badge-danger"
                            }`}>
                            Difficulty {question.tags?.difficulty || 3}
                        </span>
                    </div>
                </div>

                {/* XP Bar */}
                <div className="px-6 py-2 border-t border-slate-800/50">
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-400">Level {level}</span>
                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
                                style={{ width: `${xpProgress}%` }}
                            />
                        </div>
                        <span className="text-sm text-emerald-400">{user?.xp || 0} XP</span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6 space-y-6 animate-fadeIn">
                {/* Question Prompt */}
                <div className="glass-card p-6">
                    <h1 className="text-xl font-bold text-white mb-2">{question.prompt}</h1>
                    <div className="flex gap-2 flex-wrap">
                        {question.channelVectors?.map((channel) => (
                            <span key={channel} className="badge bg-purple-500/20 text-purple-400">
                                {channel}
                            </span>
                        ))}
                        {question.tags?.topic?.map((topic) => (
                            <span key={topic} className="badge bg-slate-700 text-slate-300">
                                {topic}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Content Display */}
                {renderContent()}

                {/* Answer Selection (before submission) */}
                {!result && (
                    <>
                        <div>
                            <h3 className="text-sm text-slate-400 mb-3">
                                🎯 {question.questionType === "multi" ? "Select all that apply" : "Choose the best answer"}
                            </h3>
                            <AnswerSelect
                                answers={question.answers || []}
                                questionType={question.questionType}
                                selectedAnswers={selectedAnswers}
                                onChange={setSelectedAnswers}
                                disabled={false}
                                showResults={false}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || selectedAnswers.length === 0}
                            className={`w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-2 ${selectedAnswers.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
                                    Analyzing...
                                </>
                            ) : (
                                <>Submit Answer</>
                            )}
                        </button>
                    </>
                )}

                {/* Results */}
                {result && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Score Card */}
                        <div className="glass-card p-8 text-center">
                            <div className={`text-6xl mb-4 ${result.scoring?.isOptimal || result.scoring?.isPerfect ? "" : "grayscale"}`}>
                                {result.scoring?.isOptimal || result.scoring?.isPerfect ? "🎉" :
                                    result.scoring?.isCorrect ? "👍" : "😔"}
                            </div>
                            <div className="text-4xl font-bold mb-2">
                                {result.score}/{result.maxPoints}
                            </div>
                            <div className="text-slate-400 mb-4">
                                {result.percentage}% Score
                            </div>

                            {/* XP Gained */}
                            {result.userUpdate && (
                                <div className="flex items-center justify-center gap-2 text-emerald-400 text-xl mb-4 xp-gain">
                                    <span>+{result.userUpdate.xpGained} XP</span>
                                </div>
                            )}

                            {/* Feedback message */}
                            <div className={`p-4 rounded-lg ${result.scoring?.isOptimal || result.scoring?.isPerfect
                                    ? "bg-emerald-500/20 border border-emerald-500/50"
                                    : result.scoring?.isCorrect
                                        ? "bg-yellow-500/20 border border-yellow-500/50"
                                        : "bg-red-500/20 border border-red-500/50"
                                }`}>
                                <p className="text-white">{result.feedback}</p>
                            </div>
                        </div>

                        {/* Answer Review */}
                        <div>
                            <h3 className="text-sm text-slate-400 mb-3">📋 Your Answers</h3>
                            <AnswerSelect
                                answers={question.answers || []}
                                questionType={question.questionType}
                                selectedAnswers={result.selectedAnswers || []}
                                onChange={() => { }}
                                disabled={true}
                                showResults={true}
                                correctAnswers={result.correctAnswers || []}
                            />
                        </div>

                        {/* Scoring Breakdown */}
                        {result.scoring?.breakdown && (
                            <div className="glass-card p-6">
                                <h3 className="font-semibold mb-3">📊 Scoring Breakdown</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    {question.questionType === "multi" ? (
                                        <>
                                            <div className="text-slate-400">Correct Selected:</div>
                                            <div className="text-white">
                                                {result.scoring.breakdown.correctSelected}/{result.scoring.breakdown.totalCorrect}
                                            </div>
                                            <div className="text-slate-400">Wrong Selections:</div>
                                            <div className={result.scoring.breakdown.wrongSelections > 0 ? "text-red-400" : "text-emerald-400"}>
                                                {result.scoring.breakdown.wrongSelections}
                                            </div>
                                            {result.scoring.breakdown.perfectBonus && (
                                                <>
                                                    <div className="text-slate-400">Perfect Bonus:</div>
                                                    <div className="text-emerald-400">+10%</div>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-slate-400">Best Answer:</div>
                                            <div className={result.scoring.isOptimal ? "text-emerald-400" : "text-yellow-400"}>
                                                {result.scoring.isOptimal ? "Selected ✓" : "Not selected"}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Explanation */}
                        {result.explanation && (
                            <div className="glass-card p-6">
                                <button
                                    onClick={() => setShowExplanation(!showExplanation)}
                                    className="flex items-center justify-between w-full text-left"
                                >
                                    <h3 className="font-semibold">📚 Explanation</h3>
                                    <span className="text-slate-400">{showExplanation ? "▲" : "▼"}</span>
                                </button>
                                {showExplanation && (
                                    <div className="mt-4 animate-fadeIn">
                                        <p className="text-slate-300">{result.explanation}</p>

                                        {/* Clues */}
                                        {result.clues && result.clues.length > 0 && (
                                            <div className="mt-4">
                                                <h4 className="text-sm text-slate-400 mb-2">🔍 Key Indicators:</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {result.clues.map((clue, i) => (
                                                        <span key={i} className="badge bg-emerald-500/20 text-emerald-400">
                                                            {clue}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex gap-4 justify-center">
                            <Link to="/inbox" className="btn-primary">
                                Continue Training →
                            </Link>
                            <Link to="/profile" className="btn-secondary">
                                View Profile
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

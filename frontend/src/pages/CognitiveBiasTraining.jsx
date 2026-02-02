import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getAllBiases,
    getBiasDetails,
    getBiasExercise,
    submitBiasExerciseAnswer,
    getBiasProgress
} from "../services/api";

export default function CognitiveBiasTraining() {
    const navigate = useNavigate();
    const { biasId } = useParams();

    const [biases, setBiases] = useState([]);
    const [userProgress, setUserProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState("list"); // list, detail, exercise, result
    const [selectedBias, setSelectedBias] = useState(null);
    const [currentExercise, setCurrentExercise] = useState(null);
    const [exerciseIndex, setExerciseIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [exerciseResult, setExerciseResult] = useState(null);
    const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 });

    useEffect(() => {
        loadBiases();
    }, []);

    useEffect(() => {
        if (biasId) {
            loadBiasDetail(biasId);
        }
    }, [biasId]);

    const loadBiases = async () => {
        setLoading(true);
        try {
            const data = await getAllBiases();
            setBiases(data.biases || []);
            setUserProgress(data.userProgress);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const loadBiasDetail = async (id) => {
        setLoading(true);
        try {
            const data = await getBiasDetails(id);
            setSelectedBias(data.bias);
            setView("detail");
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const startExercises = async () => {
        if (!selectedBias) return;

        try {
            const data = await getBiasExercise(selectedBias.biasId, 0);
            setCurrentExercise(data);
            setExerciseIndex(0);
            setView("exercise");
            setSessionScore({ correct: 0, total: 0 });
        } catch (e) {
            console.error(e);
        }
    };

    const submitAnswer = async () => {
        if (selectedOption === null || !currentExercise) return;

        try {
            const data = await submitBiasExerciseAnswer(
                currentExercise.biasId,
                currentExercise.exerciseIndex,
                selectedOption
            );
            setExerciseResult(data);
            setView("result");
            setSessionScore(prev => ({
                correct: prev.correct + (data.isCorrect ? 1 : 0),
                total: prev.total + 1
            }));
        } catch (e) {
            console.error(e);
        }
    };

    const nextExercise = async () => {
        if (!exerciseResult) return;

        if (exerciseResult.isLastExercise) {
            // Module complete
            setView("complete");
            loadBiases(); // Refresh progress
        } else {
            // Load next exercise
            const nextIndex = exerciseIndex + 1;
            try {
                const data = await getBiasExercise(selectedBias.biasId, nextIndex);
                setCurrentExercise(data);
                setExerciseIndex(nextIndex);
                setSelectedOption(null);
                setExerciseResult(null);
                setView("exercise");
            } catch (e) {
                console.error(e);
            }
        }
    };

    const backToList = () => {
        setView("list");
        setSelectedBias(null);
        setCurrentExercise(null);
        setExerciseResult(null);
        setSelectedOption(null);
        navigate("/training/cognitive-bias");
    };

    // Render list of biases
    const renderBiasList = () => (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    🧠 <span className="gradient-text">Cognitive Bias Training</span>
                </h1>
                <p className="text-slate-400 max-w-xl mx-auto">
                    Learn how attackers exploit psychological biases to manipulate you.
                    Understanding these tricks is your best defense.
                </p>
            </div>

            {/* Progress */}
            {userProgress && (
                <div className="glass-card p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold">Your Progress</h2>
                        <span className="text-emerald-400 font-bold">
                            {userProgress.completedCount}/{userProgress.totalCount} completed
                        </span>
                    </div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all"
                            style={{ width: `${(userProgress.completedCount / userProgress.totalCount) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Bias Cards */}
            {loading ? (
                <div className="grid md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="skeleton h-40 rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {biases.map(bias => (
                        <div
                            key={bias.biasId}
                            onClick={() => loadBiasDetail(bias.biasId)}
                            className={`glass-card p-5 cursor-pointer transition-all hover:scale-[1.02] ${bias.isCompleted ? "border-emerald-500/50" : ""
                                }`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="text-4xl">{bias.icon}</div>
                                {bias.isCompleted && (
                                    <span className="badge badge-success">✓ Complete</span>
                                )}
                            </div>
                            <h3 className="text-lg font-semibold mb-2">{bias.name}</h3>
                            <p className="text-sm text-slate-400 mb-3">{bias.shortDescription}</p>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">{bias.exerciseCount} exercises</span>
                                <span className="text-emerald-400">→</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // Render bias detail
    const renderBiasDetail = () => {
        if (!selectedBias) return null;

        return (
            <div className="max-w-3xl mx-auto">
                <button onClick={backToList} className="text-slate-400 hover:text-white mb-6">
                    ← Back to All Biases
                </button>

                {/* Header */}
                <div className="glass-card p-6 mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="text-5xl">{selectedBias.icon}</div>
                        <div>
                            <h1 className="text-2xl font-bold">{selectedBias.name}</h1>
                            <p className="text-slate-400">{selectedBias.shortDescription}</p>
                        </div>
                    </div>
                </div>

                {/* Explanation */}
                <div className="glass-card p-6 mb-6">
                    <h2 className="font-semibold mb-3">What is this bias?</h2>
                    <p className="text-slate-300 whitespace-pre-line">{selectedBias.detailedExplanation}</p>
                </div>

                {/* Attacker Exploitation */}
                <div className="glass-card p-6 mb-6 border-red-500/30">
                    <h2 className="font-semibold mb-3 text-red-400">⚠️ How Attackers Exploit This</h2>
                    <p className="text-slate-300 whitespace-pre-line">{selectedBias.attackerExploitation}</p>
                </div>

                {/* Defense Strategies */}
                <div className="glass-card p-6 mb-6 border-emerald-500/30">
                    <h2 className="font-semibold mb-3 text-emerald-400">🛡️ Defense Strategies</h2>
                    <div className="space-y-3">
                        {selectedBias.defenseStrategies?.map((strategy, i) => (
                            <div key={i} className="bg-slate-800/50 rounded-lg p-4">
                                <h4 className="font-medium text-emerald-400 mb-1">{strategy.strategy}</h4>
                                <p className="text-sm text-slate-400">{strategy.explanation}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Examples */}
                {selectedBias.examples?.length > 0 && (
                    <div className="glass-card p-6 mb-6">
                        <h2 className="font-semibold mb-3">📚 Real-World Examples</h2>
                        <div className="space-y-4">
                            {selectedBias.examples.map((example, i) => (
                                <div key={i} className="bg-slate-800/50 rounded-lg p-4">
                                    <p className="font-medium mb-2">{example.scenario}</p>
                                    <p className="text-sm text-slate-400 mb-2">{example.howItWorks}</p>
                                    {example.redFlags?.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {example.redFlags.map((flag, j) => (
                                                <span key={j} className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                                                    🚩 {flag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Start Exercises */}
                <button onClick={startExercises} className="btn-primary w-full text-lg py-4">
                    🎯 Start Exercises ({selectedBias.exerciseCount} questions)
                </button>
            </div>
        );
    };

    // Render exercise
    const renderExercise = () => {
        if (!currentExercise) return null;

        const { exercise, totalExercises } = currentExercise;

        return (
            <div className="max-w-3xl mx-auto">
                {/* Progress Header */}
                <div className="flex justify-between items-center mb-6">
                    <button onClick={backToList} className="text-slate-400 hover:text-white">
                        ← Exit
                    </button>
                    <div className="text-center">
                        <span className="text-slate-400">Question </span>
                        <span className="font-bold">{exerciseIndex + 1}</span>
                        <span className="text-slate-400"> of </span>
                        <span className="font-bold">{totalExercises}</span>
                    </div>
                    <div className="text-sm">
                        <span className="text-emerald-400">{sessionScore.correct}</span>
                        <span className="text-slate-400">/{sessionScore.total}</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-slate-700 rounded-full mb-8 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all"
                        style={{ width: `${((exerciseIndex + 1) / totalExercises) * 100}%` }}
                    />
                </div>

                {/* Exercise Card */}
                <div className="glass-card p-6 mb-6">
                    {/* Type Badge */}
                    <div className="flex items-center justify-between mb-4">
                        <span className="badge bg-purple-500/20 text-purple-400 capitalize">
                            {exercise.type}
                        </span>
                        <span className="text-sm text-slate-400">
                            +{exercise.xpReward} XP
                        </span>
                    </div>

                    {/* Prompt */}
                    <h2 className="text-xl font-semibold mb-4">{exercise.prompt}</h2>

                    {/* Scenario (if present) */}
                    {exercise.scenario && (
                        <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                            {exercise.scenario.sender && (
                                <div className="text-sm text-slate-400 mb-2">
                                    From: {exercise.scenario.sender}
                                </div>
                            )}
                            {exercise.scenario.context && (
                                <div className="text-xs text-slate-500 mb-2">
                                    {exercise.scenario.context}
                                </div>
                            )}
                            <div className="text-slate-200 whitespace-pre-wrap">
                                {exercise.scenario.content}
                            </div>
                        </div>
                    )}

                    {/* Options */}
                    <div className="space-y-3">
                        {exercise.options.map((option, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedOption(i)}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedOption === i
                                        ? "border-emerald-500 bg-emerald-500/10"
                                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedOption === i
                                            ? "border-emerald-500 bg-emerald-500"
                                            : "border-slate-600"
                                        }`}>
                                        {selectedOption === i && (
                                            <span className="text-xs">✓</span>
                                        )}
                                    </div>
                                    <span>{option.text}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <button
                    onClick={submitAnswer}
                    disabled={selectedOption === null}
                    className={`btn-primary w-full ${selectedOption === null ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    Submit Answer
                </button>
            </div>
        );
    };

    // Render result
    const renderResult = () => {
        if (!exerciseResult) return null;

        return (
            <div className="max-w-3xl mx-auto">
                {/* Result Header */}
                <div className={`glass-card p-8 text-center mb-6 ${exerciseResult.isCorrect ? "border-emerald-500/50" : "border-red-500/50"
                    }`}>
                    <div className="text-6xl mb-4">
                        {exerciseResult.isCorrect ? "✅" : "❌"}
                    </div>
                    <h2 className={`text-2xl font-bold mb-2 ${exerciseResult.isCorrect ? "text-emerald-400" : "text-red-400"
                        }`}>
                        {exerciseResult.isCorrect ? "Correct!" : "Not quite right"}
                    </h2>
                    {exerciseResult.isCorrect && (
                        <p className="text-emerald-400">+{currentExercise?.exercise?.xpReward || 20} XP</p>
                    )}
                </div>

                {/* Explanation */}
                <div className="glass-card p-6 mb-6">
                    <h3 className="font-semibold mb-3">Explanation</h3>
                    <p className="text-slate-300 mb-4">{exerciseResult.explanation}</p>

                    {exerciseResult.optionExplanation && (
                        <div className="bg-slate-800/50 rounded-lg p-4">
                            <p className="text-sm text-slate-400">{exerciseResult.optionExplanation}</p>
                        </div>
                    )}
                </div>

                {/* Next Button */}
                <button onClick={nextExercise} className="btn-primary w-full">
                    {exerciseResult.isLastExercise ? "Complete Module 🎉" : "Next Question →"}
                </button>
            </div>
        );
    };

    // Render completion
    const renderComplete = () => (
        <div className="max-w-2xl mx-auto text-center">
            <div className="glass-card p-8 mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h1 className="text-3xl font-bold mb-2">
                    <span className="gradient-text">Module Complete!</span>
                </h1>
                <p className="text-slate-400 mb-6">
                    You've completed the {selectedBias?.name} module!
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-800/50 rounded-xl p-4">
                        <div className="text-3xl font-bold text-emerald-400">{sessionScore.correct}</div>
                        <div className="text-sm text-slate-400">Correct Answers</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4">
                        <div className="text-3xl font-bold text-cyan-400">
                            {Math.round((sessionScore.correct / sessionScore.total) * 100)}%
                        </div>
                        <div className="text-sm text-slate-400">Accuracy</div>
                    </div>
                </div>

                <p className="text-slate-400 mb-4">
                    Remember: Recognizing these biases in yourself is the first step to resisting manipulation.
                </p>
            </div>

            <div className="flex gap-4">
                <button onClick={backToList} className="btn-secondary flex-1">
                    Back to Training
                </button>
                <button onClick={() => navigate("/training")} className="btn-primary flex-1">
                    Training Hub →
                </button>
            </div>
        </div>
    );

    return (
        <div className="animate-fadeIn p-4">
            {view === "list" && renderBiasList()}
            {view === "detail" && renderBiasDetail()}
            {view === "exercise" && renderExercise()}
            {view === "result" && renderResult()}
            {view === "complete" && renderComplete()}
        </div>
    );
}

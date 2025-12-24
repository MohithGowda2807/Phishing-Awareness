import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMissionById, submitMission } from "../services/api";
import { useAuth } from "../context/AuthContext";

const XP_PER_LEVEL = 500;

export default function MissionViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);

  // GAME STATE
  const [timeLeft, setTimeLeft] = useState(180);
  const [decision, setDecision] = useState(null);
  const [decisionLocked, setDecisionLocked] = useState(false);
  const [confidence, setConfidence] = useState(50);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // TOOLS
  const [activePanel, setActivePanel] = useState(null);
  const [toolsUsed, setToolsUsed] = useState({
    sender: false,
    headers: false,
    link: false,
    language: false,
  });

  const level = Math.floor((user?.xp || 0) / XP_PER_LEVEL) + 1;
  const xpProgress = ((user?.xp || 0) % XP_PER_LEVEL) / XP_PER_LEVEL * 100;

  useEffect(() => {
    getMissionById(id)
      .then(setMission)
      .finally(() => setLoading(false));
  }, [id]);

  // TIMER
  useEffect(() => {
    if (loading || decisionLocked || result) return;
    if (timeLeft <= 0) {
      setDecision("timeout");
      setDecisionLocked(true);
      handleSubmit("timeout");
      return;
    }
    const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, decisionLocked, result, loading]);

  if (loading || !mission) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading mission...</p>
        </div>
      </div>
    );
  }

  const markTool = (t) => setToolsUsed((p) => ({ ...p, [t]: true }));

  const makeDecision = (d) => {
    if (decisionLocked) return;
    setDecision(d);
    setDecisionLocked(true);
  };

  const handleSubmit = async (forcedDecision = null) => {
    if (submitting) return;
    setSubmitting(true);

    const finalDecision = forcedDecision || decision;
    const isPhishing = mission.isPhishing === true;
    const correct = isPhishing ? "report" : "ignore";

    let score = 40;
    let feedback = [];

    if (finalDecision === correct) {
      score += 40;
      feedback.push("✅ Correct action taken.");
    } else if (finalDecision === "timeout") {
      score -= 20;
      feedback.push("⏰ No action taken before deadline.");
    } else {
      score -= 25;
      feedback.push("❌ Unsafe response.");
    }

    const toolCount = Object.values(toolsUsed).filter(Boolean).length;
    score += toolCount * 5;
    feedback.push(`🔍 Investigation depth: ${toolCount}/4 tools used.`);

    if (confidence > 75 && finalDecision !== correct) {
      score -= 15;
      feedback.push("⚠️ Overconfidence penalty.");
    }

    if (score < 0) score = 0;
    if (score > 100) score = 100;

    const earnedXp = Math.round(score * 0.6);

    // Submit to backend
    try {
      await submitMission({
        userId: user?.id,
        missionId: id,
        verdict: finalDecision === "report",
        selectedClues: Object.entries(toolsUsed)
          .filter(([, used]) => used)
          .map(([tool]) => tool),
      });
      refreshUser();
    } catch (e) {
      console.error("Submit error:", e);
    }

    setResult({ score, feedback, earnedXp, correct: finalDecision === correct });
    setSubmitting(false);
  };

  const tools = [
    { key: "sender", label: "Inspect Sender", icon: "👤", info: mission.emailHeaders?.from || "Unknown sender - suspicious!" },
    { key: "headers", label: "View Headers", icon: "📋", info: `SPF: ${mission.emailHeaders?.spf || "fail"} | DKIM: ${mission.emailHeaders?.dkim || "none"} | DMARC: ${mission.emailHeaders?.dmarc || "fail"}` },
    { key: "link", label: "Hover Link", icon: "🔗", info: "Displayed link mismatches actual destination URL." },
    { key: "language", label: "Language Analysis", icon: "📝", info: "Urgency + authority pressure detected in email tone." },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* TOP BAR */}
      <div className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur border-b border-slate-800">
        <div className="flex justify-between items-center px-6 py-4">
          <button
            onClick={() => navigate("/inbox")}
            className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Inbox
          </button>

          {/* Timer */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeLeft <= 30 ? "bg-red-500/20 text-red-400" : "bg-slate-800 text-slate-300"
            }`}>
            <span className="text-lg">⏱</span>
            <span className="font-mono font-bold">
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* XP BAR */}
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
        {/* EMAIL HEADER */}
        <div className="glass-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg">
                  {mission.ranger?.name?.charAt(0) || "?"}
                </div>
                <div>
                  <div className="font-semibold">{mission.ranger?.name || "Unknown Sender"}</div>
                  <div className="text-sm text-slate-400">&lt;{mission.emailHeaders?.from}&gt;</div>
                </div>
              </div>
              <div className="text-lg font-medium text-slate-200">{mission.title}</div>
            </div>
            <span className={`badge ${mission.difficulty <= 2 ? "badge-success" : mission.difficulty === 3 ? "badge-warning" : "badge-danger"}`}>
              Difficulty {mission.difficulty}
            </span>
          </div>
        </div>

        {/* INVESTIGATION TOOLS */}
        <div>
          <h3 className="text-sm text-slate-400 mb-3">🔍 Investigation Tools</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tools.map((tool) => (
              <button
                key={tool.key}
                onClick={() => {
                  markTool(tool.key);
                  setActivePanel(activePanel === tool.key ? null : tool.key);
                }}
                className={`p-3 rounded-lg border transition-all ${toolsUsed[tool.key]
                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                    : "bg-slate-800/50 border-slate-700/50 text-slate-300 hover:border-slate-600"
                  } ${activePanel === tool.key ? "ring-2 ring-emerald-500/50" : ""}`}
              >
                <span className="text-xl mb-1 block">{tool.icon}</span>
                <span className="text-xs">{tool.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* PANEL OUTPUT */}
        {activePanel && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 animate-fadeIn">
            <div className="flex items-center gap-2 text-emerald-400 text-sm mb-2">
              <span>{tools.find(t => t.key === activePanel)?.icon}</span>
              <span className="font-medium">{tools.find(t => t.key === activePanel)?.label} Result</span>
            </div>
            <p className="text-slate-300">{tools.find(t => t.key === activePanel)?.info}</p>
          </div>
        )}

        {/* EMAIL BODY */}
        <div className="glass-card p-6">
          <div className="prose prose-invert max-w-none">
            <p className="text-slate-300 whitespace-pre-wrap">{mission.emailBody}</p>
          </div>
        </div>

        {/* FOLLOW-UP ATTACKER EMAIL */}
        {decisionLocked && decision !== "report" && !result && (
          <div className="bg-red-900/30 border border-red-700/50 p-4 rounded-lg animate-fadeIn">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <span className="text-xl">⚠️</span>
              <span className="font-medium">Follow-up Email Received</span>
            </div>
            <p className="text-red-200/80">
              "This is urgent. Failure to comply will result in payroll suspension."
            </p>
          </div>
        )}

        {/* DECISIONS */}
        {!result && (
          <div>
            <h3 className="text-sm text-slate-400 mb-3">🎯 Your Decision</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: "report", label: "Report", icon: "🚨", desc: "Flag as phishing" },
                { key: "reply", label: "Reply", icon: "💬", desc: "Respond to sender" },
                { key: "click", label: "Click Link", icon: "🔗", desc: "Open the link" },
                { key: "ignore", label: "Ignore", icon: "👍", desc: "Mark as safe" },
              ].map((d) => (
                <button
                  key={d.key}
                  disabled={decisionLocked}
                  onClick={() => makeDecision(d.key)}
                  className={`p-4 rounded-lg border transition-all ${decision === d.key
                      ? "bg-emerald-500 text-slate-900 border-emerald-500"
                      : decisionLocked
                        ? "bg-slate-800/30 border-slate-700/30 opacity-40 cursor-not-allowed"
                        : "bg-slate-800/50 border-slate-700/50 hover:border-emerald-500/50"
                    }`}
                >
                  <span className="text-2xl block mb-1">{d.icon}</span>
                  <span className="font-medium block">{d.label}</span>
                  <span className="text-xs text-slate-400">{d.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CONFIDENCE SLIDER */}
        {decisionLocked && !result && (
          <div className="glass-card p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-300">How confident are you?</span>
              <span className={`font-bold ${confidence >= 75 ? "text-emerald-400" : confidence >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                {confidence}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
        )}

        {/* SUBMIT */}
        {decisionLocked && !result && (
          <button
            onClick={() => handleSubmit()}
            disabled={submitting}
            className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
                Analyzing...
              </>
            ) : (
              <>Submit Analysis</>
            )}
          </button>
        )}

        {/* RESULT */}
        {result && (
          <div className="glass-card p-8 text-center animate-fadeIn">
            <div className={`text-6xl mb-4 ${result.correct ? "" : "grayscale"}`}>
              {result.correct ? "🎉" : "😔"}
            </div>
            <div className="text-4xl font-bold mb-2">{result.score}/100</div>
            <div className="flex items-center justify-center gap-2 text-emerald-400 text-xl mb-6 xp-gain">
              <span>+{result.earnedXp} XP</span>
            </div>
            <div className="space-y-2 text-left max-w-md mx-auto mb-6">
              {result.feedback.map((f, i) => (
                <div key={i} className="text-slate-300">{f}</div>
              ))}
            </div>
            <button
              onClick={() => navigate("/inbox")}
              className="btn-primary"
            >
              Continue to Inbox
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

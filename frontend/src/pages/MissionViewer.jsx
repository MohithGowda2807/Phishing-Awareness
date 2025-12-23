import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const XP_PER_LEVEL = 100;

export default function MissionViewer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mission, setMission] = useState(null);

  // GAME STATE
  const [timeLeft, setTimeLeft] = useState(180); // 3 min
  const [decision, setDecision] = useState(null);
  const [decisionLocked, setDecisionLocked] = useState(false);
  const [confidence, setConfidence] = useState(50);
  const [result, setResult] = useState(null);

  // PLAYER STATE
  const [xp, setXp] = useState(120); // mock existing XP
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpProgress = xp % XP_PER_LEVEL;

  // TOOLS
  const [activePanel, setActivePanel] = useState(null);
  const [toolsUsed, setToolsUsed] = useState({
    sender: false,
    headers: false,
    link: false,
    language: false,
  });

  useEffect(() => {
    fetch(`http://localhost:5000/api/missions/${id}`)
      .then((r) => r.json())
      .then(setMission);
  }, [id]);

  // TIMER
  useEffect(() => {
    if (decisionLocked || result) return;
    if (timeLeft <= 0) {
      setDecision("timeout");
      setDecisionLocked(true);
      submitAnalysis("timeout");
      return;
    }
    const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, decisionLocked, result]);

  if (!mission) {
    return <div className="p-6 text-slate-400 bg-slate-900 min-h-screen">Loading…</div>;
  }

  const markTool = (t) =>
    setToolsUsed((p) => ({ ...p, [t]: true }));

  const makeDecision = (d) => {
    if (decisionLocked) return;
    setDecision(d);
    setDecisionLocked(true);
  };

  const submitAnalysis = (forcedDecision = null) => {
    const finalDecision = forcedDecision || decision;
    const isPhishing = mission.isPhishing === true;
    const correct = isPhishing ? "report" : "ignore";

    let score = 40;
    let feedback = [];

    if (finalDecision === correct) {
      score += 40;
      feedback.push("Correct action taken.");
    } else if (finalDecision === "timeout") {
      score -= 20;
      feedback.push("No action taken before deadline.");
    } else {
      score -= 25;
      feedback.push("Unsafe response.");
    }

    const toolCount = Object.values(toolsUsed).filter(Boolean).length;
    score += toolCount * 5;
    feedback.push(`Investigation depth: ${toolCount} tools used.`);

    if (confidence > 75 && finalDecision !== correct) {
      score -= 15;
      feedback.push("Overconfidence penalty.");
    }

    if (score < 0) score = 0;
    if (score > 100) score = 100;

    const earnedXp = Math.round(score * 0.6);
    setXp((x) => x + earnedXp);

    setResult({ score, feedback, earnedXp });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">

      {/* TOP BAR */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
        <button onClick={() => navigate("/inbox")} className="text-emerald-400">← Inbox</button>
        <div className="text-sm text-slate-400">
          ⏱ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </div>
      </div>

      {/* XP BAR */}
      <div className="px-6 py-3 border-b border-slate-800">
        <div className="text-sm mb-1">Level {level}</div>
        <div className="w-full bg-slate-700 rounded h-2">
          <div
            className="bg-emerald-500 h-2 rounded"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">

        {/* EMAIL META */}
        <div className="bg-slate-800 p-4 rounded border border-slate-700">
          <div className="font-semibold">{mission.ranger?.name}</div>
          <div className="text-sm text-slate-400">&lt;{mission.emailHeaders?.from}&gt;</div>
        </div>

        {/* TOOLS */}
        <div className="flex gap-3 flex-wrap">
          <Tool label="Inspect Sender" onClick={() => { markTool("sender"); setActivePanel("sender"); }} />
          <Tool label="View Headers" onClick={() => { markTool("headers"); setActivePanel("headers"); }} />
          <Tool label="Hover Link" onClick={() => { markTool("link"); setActivePanel("link"); }} />
          <Tool label="Language Analysis" onClick={() => { markTool("language"); setActivePanel("language"); }} />
        </div>

        {/* PANELS */}
        {activePanel && (
          <Panel>
            {activePanel === "sender" && "External domain not trusted."}
            {activePanel === "headers" && "SPF fail · DKIM none · DMARC fail"}
            {activePanel === "link" && "Displayed link mismatches destination."}
            {activePanel === "language" && "Urgency + authority pressure detected."}
          </Panel>
        )}

        {/* EMAIL BODY */}
        <div className="bg-slate-800 p-6 rounded border border-slate-700">
          {mission.emailBody}
        </div>

        {/* FOLLOW-UP ATTACKER EMAIL */}
        {decisionLocked && decision !== "report" && !result && (
          <div className="bg-red-900/40 border border-red-700 p-4 rounded">
            ⚠ Follow-up Email Received:  
            “This is urgent. Failure to comply will result in payroll suspension.”
          </div>
        )}

        {/* DECISIONS */}
        <div className="grid md:grid-cols-2 gap-3">
          {["report", "reply", "click", "ignore"].map((d) => (
            <button
              key={d}
              disabled={decisionLocked}
              onClick={() => makeDecision(d)}
              className={`p-4 rounded border transition ${
                decision === d
                  ? "bg-emerald-500 text-slate-900"
                  : "bg-slate-800 border-slate-600 hover:bg-slate-700"
              } ${decisionLocked && decision !== d ? "opacity-40" : ""}`}
            >
              {d.toUpperCase()}
            </button>
          ))}
        </div>

        {/* CONFIDENCE */}
        {decisionLocked && !result && (
          <div className="bg-slate-800 p-4 rounded border border-slate-700">
            <div>Confidence: {confidence}%</div>
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
            onClick={() => submitAnalysis()}
            className="w-full bg-emerald-500 py-3 rounded font-bold text-slate-900"
          >
            Submit Analysis
          </button>
        )}

        {/* RESULT */}
        {result && (
          <div className="bg-slate-800 p-6 rounded border border-slate-700 space-y-2">
            <div className="text-2xl font-bold">Score: {result.score}/100</div>
            <div className="text-emerald-400">+{result.earnedXp} XP</div>
            <ul className="list-disc pl-6">
              {result.feedback.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/* COMPONENTS */
function Tool({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded border border-slate-700 hover:bg-slate-700 text-sm"
    >
      {label}
    </button>
  );
}

function Panel({ children }) {
  return (
    <div className="bg-slate-900 border border-slate-700 p-4 rounded text-sm">
      {children}
    </div>
  );
}

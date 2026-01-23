import { useState } from "react";
import { createMission } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function Admin() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [form, setForm] = useState({
    title: "",
    emailBody: "",
    from: "",
    isPhishing: "true",
    difficulty: "3",
    rangerName: "",
    rangerDepartment: "",
    helpRequest: "",
    clues: "",
  });

  // Redirect non-admins
  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const missionData = {
      title: form.title,
      emailBody: form.emailBody,
      isPhishing: form.isPhishing === "true",
      difficulty: parseInt(form.difficulty),
      helpRequest: form.helpRequest,
      ranger: {
        name: form.rangerName,
        department: form.rangerDepartment,
      },
      emailHeaders: {
        from: form.from,
        spf: "fail",
        dkim: "none",
        dmarc: "fail",
      },
      clues: form.clues.split(",").map((c) => c.trim()).filter(Boolean),
      scoreWeight: 50,
      status: "published",
    };

    try {
      const res = await createMission(missionData);
      if (res._id) {
        setMessage({ type: "success", text: "Mission created successfully!" });
        setForm({
          title: "",
          emailBody: "",
          from: "",
          isPhishing: "true",
          difficulty: "3",
          rangerName: "",
          rangerDepartment: "",
          helpRequest: "",
          clues: "",
        });
      } else {
        setMessage({ type: "error", text: res.message || "Failed to create mission" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Connection failed. Please try again." });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            ⚙️ <span className="gradient-text">Admin Panel</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Create and manage phishing missions</p>
        </div>
        <span className="badge bg-purple-500/20 text-purple-400">Admin</span>
      </div>

      {/* Mission Builder */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <span>📧</span> Create New Mission
        </h2>

        <form onSubmit={submit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Mission Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Urgent: Password Reset Required"
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Sender Email</label>
              <input
                name="from"
                value={form.from}
                onChange={handleChange}
                placeholder="security@not-real-bank.com"
                className="input"
                required
              />
            </div>
          </div>

          {/* Ranger Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Sender Name</label>
              <input
                name="rangerName"
                value={form.rangerName}
                onChange={handleChange}
                placeholder="John Smith"
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Department</label>
              <input
                name="rangerDepartment"
                value={form.rangerDepartment}
                onChange={handleChange}
                placeholder="IT Security"
                className="input"
              />
            </div>
          </div>

          {/* Help Request / Subject Preview */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Subject Line Preview</label>
            <input
              name="helpRequest"
              value={form.helpRequest}
              onChange={handleChange}
              placeholder="Your account has been compromised. Immediate action required."
              className="input"
              required
            />
          </div>

          {/* Email Body */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email Body</label>
            <textarea
              name="emailBody"
              value={form.emailBody}
              onChange={handleChange}
              placeholder="Dear valued customer,&#10;&#10;We have detected unusual activity on your account..."
              className="input min-h-[150px] resize-y"
              required
            />
          </div>

          {/* Options */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Type</label>
              <select
                name="isPhishing"
                value={form.isPhishing}
                onChange={handleChange}
                className="input"
              >
                <option value="true">🚨 Phishing</option>
                <option value="false">✅ Legitimate</option>
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

          {/* Clues */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Clues (comma-separated)
            </label>
            <input
              name="clues"
              value={form.clues}
              onChange={handleChange}
              placeholder="suspicious sender, urgency, mismatched link"
              className="input"
            />
            <p className="text-xs text-slate-500 mt-1">
              Clues that users should identify when analyzing this email
            </p>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`${message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
              : "bg-red-500/10 border-red-500/50 text-red-400"
              } border rounded-lg px-4 py-3`}>
              {message.text}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
                Creating...
              </>
            ) : (
              <>
                <span>📤</span> Create Mission
              </>
            )}
          </button>
        </form>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="stat-card text-center">
          <div className="text-2xl font-bold text-emerald-400">—</div>
          <div className="text-sm text-slate-400">Total Missions</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-2xl font-bold text-cyan-400">—</div>
          <div className="text-sm text-slate-400">Active Users</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-2xl font-bold text-purple-400">—</div>
          <div className="text-sm text-slate-400">Submissions Today</div>
        </div>
      </div>
    </div>
  );
}

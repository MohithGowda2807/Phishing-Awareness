import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import { registerUser } from "../services/api";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    setLoading(true);

    try {
      const res = await registerUser(form);
      if (res.message === "User registered successfully") {
        setMsg({ type: "success", text: "Account created! Redirecting to login..." });
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMsg({ type: "error", text: res.message || "Registration failed" });
      }
    } catch (err) {
      setMsg({ type: "error", text: "Connection failed. Please try again." });
    }
    setLoading(false);
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    const { password } = form;
    if (!password) return { width: "0%", color: "bg-slate-700", text: "" };
    if (password.length < 6) return { width: "33%", color: "bg-red-500", text: "Weak" };
    if (password.length < 10) return { width: "66%", color: "bg-yellow-500", text: "Medium" };
    return { width: "100%", color: "bg-emerald-500", text: "Strong" };
  };

  const strength = getPasswordStrength();

  return (
    <AuthCard
      title="Create Account"
      subtitle="Join the fight against phishing!"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-400 hover:underline font-medium">
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Username</label>
          <input
            className="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
            placeholder="CyberDefender123"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Email</label>
          <input
            className="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
            placeholder="you@example.com"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Password</label>
          <input
            className="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
            placeholder="••••••••"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={6}
          />
          {form.password && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500">Password strength</span>
                <span className={`${strength.color === "bg-emerald-500" ? "text-emerald-400" : strength.color === "bg-yellow-500" ? "text-yellow-400" : "text-red-400"}`}>
                  {strength.text}
                </span>
              </div>
              <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strength.color} transition-all duration-300`}
                  style={{ width: strength.width }}
                />
              </div>
            </div>
          )}
        </div>

        {msg.text && (
          <div className={`${msg.type === "success" ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "bg-red-500/10 border-red-500/50 text-red-400"} border rounded-lg px-4 py-2 text-sm`}>
            {msg.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-900 font-bold py-3 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>
    </AuthCard>
  );
}

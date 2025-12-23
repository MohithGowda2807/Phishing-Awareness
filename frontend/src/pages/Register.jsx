import { useState } from "react";
import { Link } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import { registerUser } from "../services/api";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    const res = await registerUser(form);
    setMsg(res.message || "Registered");
  };

  return (
    <AuthCard
      title="Create Account"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-400 hover:underline">
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <input
          className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        <input
          className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        {msg && <p className="text-slate-300 text-sm">{msg}</p>}
        <button className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold py-2 transition">
          Register
        </button>
      </form>
    </AuthCard>
  );
}

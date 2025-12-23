import { useState } from "react";
import { Link } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import { loginUser } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();


  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await loginUser(form);
    if (res.token) {
  localStorage.setItem("token", res.token);
  navigate("/inbox");   // 🔥 THIS WAS MISSING
}
 else {
      setError(res.message || "Login failed");
    }
  };

  return (
    <AuthCard
      title="Secure Login"
      footer={
        <>
          New here?{" "}
          <Link to="/register" className="text-emerald-400 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
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
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold py-2 transition">
          Login
        </button>
      </form>
    </AuthCard>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/users/me", {
      headers: { Authorization: `Bearer ${localStorage.token}` },
    })
      .then(res => res.json())
      .then(setUser);
  }, []);

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">
        Welcome, {user.name}
      </h1>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Stat label="Level" value={user.level} />
        <Stat label="XP" value={user.xp} />
        <Stat label="Accuracy" value={`${user.accuracy}%`} />
        <Stat label="Role" value={user.role} />
      </div>

      <div className="flex gap-4 flex-wrap">
        <Btn onClick={() => navigate("/inbox")}>Inbox</Btn>
        <Btn onClick={() => navigate("/leaderboard")}>Leaderboard</Btn>
        <Btn onClick={() => navigate("/profile")}>Profile</Btn>
        {user.role === "admin" && (
          <Btn onClick={() => navigate("/admin")}>Admin</Btn>
        )}
      </div>
    </div>
  );
}

const Stat = ({ label, value }) => (
  <div className="bg-slate-800 p-4 rounded border border-slate-700">
    <div className="text-slate-400">{label}</div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);

const Btn = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="bg-emerald-500 px-6 py-3 rounded font-bold text-slate-900"
  >
    {children}
  </button>
);

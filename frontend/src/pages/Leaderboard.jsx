import { useEffect, useState } from "react";
import { getLeaderboard } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { user } = useAuth();

  useEffect(() => {
    getLeaderboard()
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const getTier = (level) => {
    if (level >= 50) return { name: "Diamond", color: "text-cyan-300", bg: "bg-cyan-500/20" };
    if (level >= 30) return { name: "Platinum", color: "text-slate-300", bg: "bg-slate-400/20" };
    if (level >= 20) return { name: "Gold", color: "text-yellow-400", bg: "bg-yellow-500/20" };
    if (level >= 10) return { name: "Silver", color: "text-slate-400", bg: "bg-slate-400/20" };
    return { name: "Bronze", color: "text-orange-400", bg: "bg-orange-500/20" };
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500/20 to-transparent border-l-4 border-yellow-500";
    if (rank === 2) return "bg-gradient-to-r from-slate-400/20 to-transparent border-l-4 border-slate-400";
    if (rank === 3) return "bg-gradient-to-r from-orange-600/20 to-transparent border-l-4 border-orange-600";
    return "";
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🏆 <span className="gradient-text">Leaderboard</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Top cyber defenders in the community</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {["all", "weekly", "monthly"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === f
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-16 rounded-lg" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <div className="text-4xl mb-2">🏆</div>
            <p>No rankings yet</p>
            <p className="text-sm mt-1">Complete missions to appear on the leaderboard!</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="py-4 px-6 text-left text-slate-400 text-sm font-medium">Rank</th>
                <th className="py-4 px-6 text-left text-slate-400 text-sm font-medium">Player</th>
                <th className="py-4 px-6 text-center text-slate-400 text-sm font-medium">Tier</th>
                <th className="py-4 px-6 text-center text-slate-400 text-sm font-medium">Level</th>
                <th className="py-4 px-6 text-center text-slate-400 text-sm font-medium">XP</th>
                <th className="py-4 px-6 text-center text-slate-400 text-sm font-medium">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                const tier = getTier(u.level);
                const isCurrentUser = user?.username === u.username;

                return (
                  <tr
                    key={u.rank}
                    className={`table-row border-b border-slate-700/30 ${getRankStyle(u.rank)} ${isCurrentUser ? "bg-emerald-500/10" : ""
                      }`}
                  >
                    {/* Rank */}
                    <td className="py-4 px-6">
                      <span className={`text-lg ${u.rank <= 3 ? "text-2xl" : "text-slate-400"}`}>
                        {getRankIcon(u.rank)}
                      </span>
                    </td>

                    {/* Player */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-slate-900">
                          {u.username?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className={`font-medium ${isCurrentUser ? "text-emerald-400" : ""}`}>
                            {u.username}
                            {isCurrentUser && <span className="text-xs ml-2">(You)</span>}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Tier */}
                    <td className="py-4 px-6 text-center">
                      <span className={`badge ${tier.bg} ${tier.color}`}>
                        {tier.name}
                      </span>
                    </td>

                    {/* Level */}
                    <td className="py-4 px-6 text-center">
                      <span className="font-bold text-lg">{u.level}</span>
                    </td>

                    {/* XP */}
                    <td className="py-4 px-6 text-center">
                      <span className="text-emerald-400 font-medium">{u.xp?.toLocaleString()}</span>
                    </td>

                    {/* Accuracy */}
                    <td className="py-4 px-6 text-center">
                      <span className={`font-medium ${u.accuracy >= 80 ? "text-emerald-400" :
                          u.accuracy >= 60 ? "text-yellow-400" :
                            "text-red-400"
                        }`}>
                        {u.accuracy}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

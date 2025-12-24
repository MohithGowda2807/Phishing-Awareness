import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserStats } from "../services/api";

export default function Profile() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (user?._id) {
      getUserStats(user._id)
        .then(setStats)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const getTier = (level) => {
    if (level >= 50) return { name: "Diamond", color: "text-cyan-300", bg: "bg-cyan-500/20", ring: "ring-cyan-400" };
    if (level >= 30) return { name: "Platinum", color: "text-slate-300", bg: "bg-slate-400/20", ring: "ring-slate-300" };
    if (level >= 20) return { name: "Gold", color: "text-yellow-400", bg: "bg-yellow-500/20", ring: "ring-yellow-400" };
    if (level >= 10) return { name: "Silver", color: "text-slate-400", bg: "bg-slate-400/20", ring: "ring-slate-400" };
    return { name: "Bronze", color: "text-orange-400", bg: "bg-orange-500/20", ring: "ring-orange-400" };
  };

  const tier = getTier(user?.level || 1);
  const xpForNextLevel = 500;
  const currentLevelXP = (user?.xp || 0) % xpForNextLevel;
  const xpProgress = (currentLevelXP / xpForNextLevel) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn">
      <h1 className="text-2xl font-bold mb-6">👤 Profile</h1>

      {/* Profile Header */}
      <div className="glass-card p-8 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-4xl font-bold ring-4 ${tier.ring}`}>
            {user?.username?.charAt(0)?.toUpperCase() || "U"}
            <div className="absolute -bottom-2 -right-2 bg-slate-800 rounded-full px-2 py-0.5 text-xs border border-slate-700">
              Lv.{user?.level || 1}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold mb-1">{user?.username || "User"}</h2>
            <p className="text-slate-400 mb-2">{user?.email}</p>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className={`badge ${tier.bg} ${tier.color}`}>{tier.name} Tier</span>
              {user?.streak > 0 && (
                <span className="badge bg-orange-500/20 text-orange-400 streak-fire">🔥 {user.streak} day streak</span>
              )}
            </div>
          </div>

          {/* XP & Reputation */}
          <div className="text-center">
            <div className="text-4xl font-bold gradient-text">{user?.xp || 0}</div>
            <div className="text-slate-400 text-sm">Total XP</div>
            {stats?.stats?.reputationScore && (
              <div className="mt-2">
                <div className="text-lg font-bold text-purple-400">{stats.stats.reputationScore}/100</div>
                <div className="text-slate-500 text-xs">Reputation</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {["overview", "skills", "history", "badges"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium capitalize whitespace-nowrap transition ${activeTab === tab
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-card text-center">
              <div className="text-3xl font-bold text-emerald-400">{user?.level || 1}</div>
              <div className="text-slate-400 text-sm">Level</div>
            </div>
            <div className="stat-card text-center">
              <div className="text-3xl font-bold text-cyan-400">{user?.missionsCompleted || 0}</div>
              <div className="text-slate-400 text-sm">Missions</div>
            </div>
            <div className="stat-card text-center">
              <div className={`text-3xl font-bold ${(stats?.stats?.overallAccuracy || 0) >= 70 ? "text-emerald-400" : (stats?.stats?.overallAccuracy || 0) >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                {stats?.stats?.overallAccuracy || 0}%
              </div>
              <div className="text-slate-400 text-sm">Accuracy</div>
            </div>
            <div className="stat-card text-center">
              <div className="text-3xl font-bold text-orange-400 streak-fire">{user?.streak || 0}</div>
              <div className="text-slate-400 text-sm">Day Streak</div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="card">
            <h3 className="font-semibold mb-4">Level Progress</h3>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold">{user?.level || 1}</span>
              <div className="flex-1">
                <div className="flex justify-between text-sm text-slate-400 mb-1">
                  <span>{currentLevelXP} XP</span>
                  <span>{xpForNextLevel} XP</span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>
              <span className="text-2xl font-bold text-slate-500">{(user?.level || 1) + 1}</span>
            </div>
          </div>

          {/* Accuracy Over Time */}
          {stats?.stats?.accuracyOverTime?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold mb-4">📈 Accuracy Trend</h3>
              <div className="flex items-end gap-1 h-32">
                {stats.stats.accuracyOverTime.map((point, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-full rounded-t transition-all ${point.accuracy >= 70 ? "bg-emerald-500" : point.accuracy >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                      style={{ height: `${point.accuracy}%` }}
                      title={`Mission ${point.index}: ${point.accuracy}%`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>Oldest</span>
                <span>Most Recent</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Skills Tab */}
      {activeTab === "skills" && (
        <div className="space-y-6">
          {/* Skill Breakdown */}
          <div className="card">
            <h3 className="font-semibold mb-4">🎯 Skill Breakdown</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-300">Technical Detection</span>
                  <span className="text-emerald-400">{stats?.stats?.skillBreakdown?.technical || 50}%</span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${stats?.stats?.skillBreakdown?.technical || 50}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Headers, domains, spoofing detection</p>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-300">Social Engineering Defense</span>
                  <span className="text-cyan-400">{stats?.stats?.skillBreakdown?.social || 50}%</span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 transition-all"
                    style={{ width: `${stats?.stats?.skillBreakdown?.social || 50}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Urgency, authority, manipulation tactics</p>
              </div>
            </div>
          </div>

          {/* Difficulty Performance */}
          <div className="card">
            <h3 className="font-semibold mb-4">📊 Performance by Difficulty</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((diff) => {
                const data = stats?.stats?.difficultyStats?.[diff] || { correct: 0, total: 0 };
                const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                const label = diff <= 2 ? "Easy" : diff === 3 ? "Medium" : "Hard";
                return (
                  <div key={diff} className="flex items-center gap-4">
                    <span className="w-20 text-sm text-slate-400">Level {diff}</span>
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-16 text-sm text-right">{data.total > 0 ? `${pct}%` : "—"}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weaknesses */}
          {stats?.stats?.weaknesses?.length > 0 && (
            <div className="card border-red-500/30">
              <h3 className="font-semibold mb-4 text-red-400">⚠️ Areas to Improve</h3>
              <div className="space-y-2">
                {stats.stats.weaknesses.map((w, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-red-500/10">
                    <span className="capitalize">{w.category}</span>
                    <div className="text-right">
                      <span className="text-red-400 font-medium">{w.accuracy}%</span>
                      <span className="text-slate-500 text-sm ml-2">({w.attempts} attempts)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Type Breakdown */}
          <div className="card">
            <h3 className="font-semibold mb-4">🎭 Detection by Type</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-red-400">🚨 Phishing Emails</span>
                  <span className="font-bold">
                    {stats?.stats?.typeStats?.phishing?.total > 0
                      ? `${Math.round((stats.stats.typeStats.phishing.correct / stats.stats.typeStats.phishing.total) * 100)}%`
                      : "—"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {stats?.stats?.typeStats?.phishing?.correct || 0}/{stats?.stats?.typeStats?.phishing?.total || 0} correctly identified
                </p>
              </div>
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400">✅ Legitimate Emails</span>
                  <span className="font-bold">
                    {stats?.stats?.typeStats?.legitimate?.total > 0
                      ? `${Math.round((stats.stats.typeStats.legitimate.correct / stats.stats.typeStats.legitimate.total) * 100)}%`
                      : "—"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {stats?.stats?.typeStats?.legitimate?.correct || 0}/{stats?.stats?.typeStats?.legitimate?.total || 0} correctly identified
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="card">
          <h3 className="font-semibold mb-4">📜 Recent Missions</h3>
          {stats?.recentSubmissions?.length > 0 ? (
            <div className="space-y-2">
              {stats.recentSubmissions.map((sub, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-lg ${sub.correct ? "bg-emerald-500/10" : "bg-red-500/10"}`}
                >
                  <div>
                    <div className="font-medium">{sub.missionTitle}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(sub.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${sub.correct ? "text-emerald-400" : "text-red-400"}`}>
                      {sub.score}/100
                    </div>
                    <div className="text-xs text-slate-500">
                      {sub.correct ? "Correct" : "Incorrect"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <div className="text-4xl mb-2">📭</div>
              <p>No missions completed yet</p>
            </div>
          )}
        </div>
      )}

      {/* Badges Tab */}
      {activeTab === "badges" && (
        <div className="card">
          <h3 className="font-semibold mb-4">🏆 Badges Earned ({user?.badges?.length || 0})</h3>
          {user?.badges && user.badges.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {user.badges.map((badge, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/50 transition"
                >
                  <span className="text-2xl">{badge.split(" ")[0]}</span>
                  <span className="text-sm font-medium">{badge.split(" ").slice(1).join(" ")}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <div className="text-4xl mb-2">🎖️</div>
              <p>No badges yet</p>
              <p className="text-sm">Complete missions to earn badges!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

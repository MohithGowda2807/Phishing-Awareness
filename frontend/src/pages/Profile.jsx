import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

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
  const accuracy = user?.totalDecisions > 0
    ? Math.round((user.correctDecisions / user.totalDecisions) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
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
            <span className={`badge ${tier.bg} ${tier.color}`}>
              {tier.name} Tier
            </span>
          </div>

          {/* XP Display */}
          <div className="text-center">
            <div className="text-4xl font-bold gradient-text">{user?.xp || 0}</div>
            <div className="text-slate-400 text-sm">Total XP</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card text-center">
          <div className="text-3xl font-bold text-emerald-400">{user?.level || 1}</div>
          <div className="text-slate-400 text-sm">Level</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-bold text-cyan-400">{user?.missionsCompleted || 0}</div>
          <div className="text-slate-400 text-sm">Missions</div>
        </div>
        <div className="stat-card text-center">
          <div className={`text-3xl font-bold ${accuracy >= 70 ? "text-emerald-400" : accuracy >= 50 ? "text-yellow-400" : "text-red-400"}`}>
            {accuracy}%
          </div>
          <div className="text-slate-400 text-sm">Accuracy</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-bold text-orange-400 streak-fire">{user?.streak || 0}</div>
          <div className="text-slate-400 text-sm">Day Streak</div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="card mb-6">
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
        <p className="text-slate-400 text-sm mt-2">
          {xpForNextLevel - currentLevelXP} XP needed to reach level {(user?.level || 1) + 1}
        </p>
      </div>

      {/* Badges */}
      <div className="card">
        <h3 className="font-semibold mb-4">🏆 Badges Earned ({user?.badges?.length || 0})</h3>
        {user?.badges && user.badges.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {user.badges.map((badge, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/50 transition"
              >
                <span className="text-xl">{badge.split(" ")[0]}</span>
                <span className="text-sm">{badge.split(" ").slice(1).join(" ")}</span>
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
    </div>
  );
}

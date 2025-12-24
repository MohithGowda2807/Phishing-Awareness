import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "🏠" },
    { path: "/inbox", label: "Inbox", icon: "📥" },
    { path: "/phish-spotter", label: "Phish Spotter", icon: "⚡" },
    { path: "/challenges", label: "Challenges", icon: "🏅" },
    { path: "/community", label: "Community", icon: "🌍" },
    { path: "/leaderboard", label: "Leaderboard", icon: "🏆" },
    { path: "/profile", label: "Profile", icon: "👤" },
  ];

  const isActive = (path) => location.pathname === path;

  // Calculate tier for sidebar display
  const getTier = (level) => {
    if (level >= 50) return { name: "Diamond", color: "text-cyan-300" };
    if (level >= 30) return { name: "Platinum", color: "text-slate-300" };
    if (level >= 20) return { name: "Gold", color: "text-yellow-400" };
    if (level >= 10) return { name: "Silver", color: "text-slate-400" };
    return { name: "Bronze", color: "text-orange-400" };
  };

  const tier = getTier(user?.level || 1);

  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800/50 border-r border-slate-700/50 p-6 flex flex-col">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-xl font-bold gradient-text flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            PhishGuard
          </h1>
          <p className="text-xs text-slate-500 mt-1">Cyber Awareness Training</p>
        </div>

        {/* User Info Card */}
        <div className="glass-card p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center font-bold">
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.username || "User"}</p>
              <p className={`text-xs ${tier.color}`}>
                {tier.name} • Lv.{user?.level || 1}
              </p>
            </div>
          </div>

          {/* XP Progress */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>XP</span>
              <span>{user?.xp || 0}</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                style={{ width: `${((user?.xp || 0) % 500) / 5}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(item.path)
                ? "bg-emerald-500/10 text-emerald-400 active"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}

          {/* Admin Link */}
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className={`nav-link flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive("/admin")
                ? "bg-purple-500/10 text-purple-400 active"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
            >
              <span className="text-lg">⚙️</span>
              <span className="font-medium">Admin</span>
            </Link>
          )}

          {/* Moderation Link */}
          {(user?.role === "admin" || user?.role === "moderator") && (
            <Link
              to="/moderation"
              className={`nav-link flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive("/moderation")
                ? "bg-purple-500/10 text-purple-400 active"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
            >
              <span className="text-lg">🛡️</span>
              <span className="font-medium">Moderation</span>
            </Link>
          )}
        </nav>

        {/* Logout */}
        <div className="pt-4 border-t border-slate-700/50">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <span className="text-lg">🚪</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

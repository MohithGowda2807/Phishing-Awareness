import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "🏠" },
    { path: "/inbox", label: "Inbox", icon: "📥" },
    { path: "/world-map", label: "World Map", icon: "🗺️" },
    { path: "/phish-spotter", label: "Phish Spotter", icon: "⚡" },
    { path: "/challenges", label: "Challenges", icon: "🏅" },
    { path: "/community", label: "Community", icon: "🌍" },
    { path: "/leaderboard", label: "Leaderboard", icon: "🏆" },
    { path: "/profile", label: "Profile", icon: "👤" },
  ];

  const isActive = (path) => location.pathname === path;

  const getTier = (level) => {
    if (level >= 50) return { name: "Diamond", color: "text-cyan-300" };
    if (level >= 30) return { name: "Platinum", color: "text-slate-300" };
    if (level >= 20) return { name: "Gold", color: "text-yellow-400" };
    if (level >= 10) return { name: "Silver", color: "text-slate-400" };
    return { name: "Bronze", color: "text-orange-400" };
  };

  const tier = getTier(user?.level || 1);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-base text-base">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-surface border-b border-border flex items-center justify-between px-4 z-30 lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-hover"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-bold gradient-text flex items-center gap-2">
          🛡️ PhishGuard
        </h1>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-hover"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-surface border-r border-border p-6 flex flex-col z-50 transform transition-transform duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Close button for mobile */}
        <button
          onClick={closeSidebar}
          className="absolute top-4 right-4 p-2 lg:hidden"
        >
          ✕
        </button>

        {/* Logo & Theme Toggle */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold gradient-text flex items-center gap-2">
              <span className="text-2xl">🛡️</span>
              PhishGuard
            </h1>
            <p className="text-xs text-muted mt-1">Cyber Awareness Training</p>
          </div>
          <button
            onClick={toggleTheme}
            className="hidden lg:flex p-2 rounded-lg hover:bg-hover transition"
            title={theme === "dark" ? "Light Mode" : "Dark Mode"}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
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
            <div className="flex justify-between text-xs text-muted mb-1">
              <span>XP</span>
              <span>{user?.xp || 0}</span>
            </div>
            <div className="h-1.5 bg-hover rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                style={{ width: `${((user?.xp || 0) % 500) / 5}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={`nav-link flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(item.path)
                ? "bg-primary/10 text-primary active"
                : "text-secondary hover:text-base hover:bg-hover"
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
              onClick={closeSidebar}
              className={`nav-link flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive("/admin")
                ? "bg-purple-500/10 text-purple-400 active"
                : "text-secondary hover:text-base hover:bg-hover"
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
              onClick={closeSidebar}
              className={`nav-link flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive("/moderation")
                ? "bg-purple-500/10 text-purple-400 active"
                : "text-secondary hover:text-base hover:bg-hover"
                }`}
            >
              <span className="text-lg">🛡️</span>
              <span className="font-medium">Moderation</span>
            </Link>
          )}
        </nav>

        {/* Logout */}
        <div className="pt-4 border-t border-border">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-secondary hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <span className="text-lg">🚪</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 pt-18 lg:pt-8 lg:p-8 overflow-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

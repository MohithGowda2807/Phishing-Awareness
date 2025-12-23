import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 p-6 space-y-4">
        <h1 className="text-xl font-bold text-emerald-400">
          PhishInbox
        </h1>

        <nav className="space-y-3">
          <Link className="block hover:text-emerald-400" to="/inbox">
            📥 Inbox
          </Link>
          <Link className="block hover:text-emerald-400" to="/leaderboard">
            🏆 Leaderboard
          </Link>
          <Link className="block hover:text-emerald-400" to="/profile">
            👤 Profile
          </Link>
          <Link className="block hover:text-emerald-400" to="/admin">
            🛠 Admin
          </Link>
        </nav>
      </aside>

      {/* Page Content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

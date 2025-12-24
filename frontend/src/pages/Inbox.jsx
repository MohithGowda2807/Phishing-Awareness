import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMissions } from "../services/api";
import { useAuth } from "../context/AuthContext";
import MissionRow from "../components/MissionRow";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Inbox() {
  const { user } = useAuth();
  const [missions, setMissions] = useState([]);
  const [completedMissions, setCompletedMissions] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, completed
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      getMissions(),
      fetchCompletedMissions()
    ]).then(([missionsData]) => {
      setMissions(missionsData);
    }).finally(() => setLoading(false));
  }, [user]);

  const fetchCompletedMissions = async () => {
    if (!user?._id) return;
    try {
      const res = await fetch(`${API_BASE}/users/${user._id}/submissions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setCompletedMissions(new Set(data.map(s => s.missionId)));
      }
    } catch (e) {
      console.error("Failed to fetch submissions:", e);
    }
  };

  const filteredMissions = missions.filter(m => {
    if (filter === "pending") return !completedMissions.has(m._id);
    if (filter === "completed") return completedMissions.has(m._id);
    return true;
  });

  const pendingCount = missions.filter(m => !completedMissions.has(m._id)).length;
  const completedCount = missions.filter(m => completedMissions.has(m._id)).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">📥 Inbox</h1>
          <p className="text-slate-400 text-sm mt-1">
            {pendingCount} pending • {completedCount} completed
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {[
            { id: "all", label: "All" },
            { id: "pending", label: "Pending", count: pendingCount },
            { id: "completed", label: "Done", count: completedCount }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === tab.id
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1 text-xs opacity-70">({tab.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
        {filteredMissions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <div className="text-4xl mb-2">
              {filter === "completed" ? "📭" : filter === "pending" ? "✅" : "📭"}
            </div>
            <p>
              {filter === "completed"
                ? "No completed missions yet"
                : filter === "pending"
                  ? "All missions completed!"
                  : "No missions available"}
            </p>
          </div>
        ) : (
          filteredMissions.map((m) => (
            <MissionRow
              key={m._id}
              mission={m}
              isCompleted={completedMissions.has(m._id)}
              onOpen={(id) => navigate(`/mission/${id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}

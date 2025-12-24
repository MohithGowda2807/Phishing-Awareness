import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMissions } from "../services/api";
import MissionRow from "../components/MissionRow";

export default function Inbox() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getMissions()
      .then(setMissions)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📥 Inbox</h1>
        <span className="text-slate-400 text-sm">
          {missions.length} mission{missions.length !== 1 ? "s" : ""} available
        </span>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
        {missions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <div className="text-4xl mb-2">📭</div>
            <p>No missions available</p>
            <p className="text-sm mt-1">Check back later for new challenges!</p>
          </div>
        ) : (
          missions.map((m) => (
            <MissionRow
              key={m._id}
              mission={m}
              onOpen={(id) => navigate(`/mission/${id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}

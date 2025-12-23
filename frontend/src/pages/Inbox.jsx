import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMissions } from "../services/api";
import MissionRow from "../components/MissionRow";

export default function Inbox() {
  const [missions, setMissions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getMissions().then(setMissions);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      {/* Sidebar (simple for now) */}
      <aside className="w-60 border-r border-slate-800 p-4">
        <h2 className="text-emerald-400 font-bold text-xl mb-6">
          PhishInbox
        </h2>
        <div className="text-slate-400 text-sm">📥 Inbox</div>
      </aside>

      {/* Inbox */}
      <main className="flex-1">
        <div className="border-b border-slate-800 px-4 py-3 text-slate-300">
          Missions
        </div>

        {missions.length === 0 ? (
          <div className="p-6 text-slate-500">
            No missions available
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
      </main>
    </div>
  );
}

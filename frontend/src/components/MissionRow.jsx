export default function MissionRow({ mission, onOpen }) {
  return (
    <div
      onClick={() => onOpen(mission._id)}
      className="flex items-center gap-4 px-4 py-3 cursor-pointer
                 hover:bg-slate-800 transition border-b border-slate-800"
    >
      {/* Difficulty dot */}
      <div
        className={`h-3 w-3 rounded-full ${
          mission.difficulty <= 2
            ? "bg-green-400"
            : mission.difficulty === 3
            ? "bg-yellow-400"
            : "bg-red-400"
        }`}
      />

      {/* Email-like content */}
      <div className="flex-1">
        <div className="flex justify-between">
          <span className="text-slate-200 font-medium">
            {mission.ranger?.name || "Ranger"}
          </span>
          <span className="text-xs text-slate-400">
            Difficulty {mission.difficulty}
          </span>
        </div>

        <div className="text-slate-400 text-sm truncate">
          {mission.title}
        </div>
      </div>

      {/* Phishing tag (hidden later for realism) */}
      <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">
        Mission
      </span>
    </div>
  );
}

export default function MissionRow({ mission, onOpen }) {
  const getDifficultyInfo = (difficulty) => {
    if (difficulty <= 2) return { label: "Easy", color: "text-emerald-400", bg: "bg-emerald-500/20" };
    if (difficulty === 3) return { label: "Medium", color: "text-yellow-400", bg: "bg-yellow-500/20" };
    return { label: "Hard", color: "text-red-400", bg: "bg-red-500/20" };
  };

  const difficultyInfo = getDifficultyInfo(mission.difficulty);

  return (
    <div
      onClick={() => onOpen(mission._id)}
      className="mission-card flex items-center gap-4 px-4 py-4 cursor-pointer
                 hover:bg-emerald-500/5 border-b border-slate-700/50"
    >
      {/* Unread indicator */}
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>

      {/* Email-like content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4 mb-1">
          <span className="text-slate-200 font-medium truncate">
            {mission.ranger?.name || "Unknown Sender"}
          </span>
          <span className="text-xs text-slate-500 whitespace-nowrap">
            {mission.emailHeaders?.from || "external@domain.com"}
          </span>
        </div>

        <div className="text-slate-300 truncate mb-1">
          {mission.title}
        </div>

        <div className="text-slate-500 text-sm truncate">
          {mission.helpRequest || mission.emailBody?.substring(0, 60)}...
        </div>
      </div>

      {/* Difficulty & XP */}
      <div className="flex flex-col items-end gap-2">
        <span className={`badge ${difficultyInfo.bg} ${difficultyInfo.color}`}>
          {difficultyInfo.label}
        </span>
        <span className="text-xs text-emerald-400">
          +{mission.scoreWeight || 50} XP
        </span>
      </div>

      {/* Arrow */}
      <svg
        className="w-5 h-5 text-slate-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}

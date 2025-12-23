import { useEffect, useState } from "react";

export default function Leaderboard() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/users/leaderboard")
      .then(res => res.json())
      .then(setRows);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">🏆 Leaderboard</h1>

      <table className="w-full border border-slate-700">
        <thead className="bg-slate-800">
          <tr>
            <th className="p-3">#</th>
            <th className="p-3 text-left">User</th>
            <th className="p-3">Level</th>
            <th className="p-3">XP</th>
            <th className="p-3">Accuracy</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((u) => (
            <tr key={u.rank} className="border-t border-slate-700">
              <td className="p-3 text-center">{u.rank}</td>
              <td className="p-3">{u.username}</td>
              <td className="p-3 text-center">{u.level}</td>
              <td className="p-3 text-center">{u.xp}</td>
              <td className="p-3 text-center">{u.accuracy}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { useEffect, useState } from "react";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/users/me", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(res => res.json())
      .then(setUser);
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-4">👤 Profile</h1>

      <div className="bg-slate-800 p-6 rounded-lg space-y-2">
        <p><b>Username:</b> {user.username}</p>
        <p><b>Email:</b> {user.email}</p>
        <p><b>Level:</b> {user.level}</p>
        <p><b>XP:</b> {user.xp}</p>
        <p><b>Missions Completed:</b> {user.missionsCompleted}</p>
        <p><b>Badges:</b> {user.badges.join(" ")}</p>
      </div>
    </div>
  );
}

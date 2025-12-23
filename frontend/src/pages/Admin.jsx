export default function Admin() {
  const submit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));

    await fetch("http://localhost:5000/api/admin/missions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.token}`,
      },
      body: JSON.stringify(data),
    });

    alert("Mission created");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      <form onSubmit={submit} className="space-y-4 max-w-xl">
        <input name="title" placeholder="Title" className="w-full p-3 bg-slate-800" />
        <textarea name="emailBody" placeholder="Email body" className="w-full p-3 bg-slate-800" />
        <input name="from" placeholder="From email" className="w-full p-3 bg-slate-800" />
        <select name="isPhishing" className="w-full p-3 bg-slate-800">
          <option value="true">Phishing</option>
          <option value="false">Legitimate</option>
        </select>
        <button className="bg-emerald-500 px-6 py-3 font-bold text-slate-900">
          Create Mission
        </button>
      </form>
    </div>
  );
}

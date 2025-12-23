export default function AuthCard({ title, children, footer }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/70 backdrop-blur border border-slate-700 shadow-2xl p-8">
        <h1 className="text-2xl font-bold text-emerald-400 text-center mb-6">
          {title}
        </h1>
        {children}
        {footer && <div className="mt-6 text-center text-slate-400">{footer}</div>}
      </div>
    </div>
  );
}

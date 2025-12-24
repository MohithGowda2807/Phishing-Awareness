import { useState, useEffect } from "react";

// Floating particle component
function FloatingParticle({ delay, duration, size, left, top, type }) {
  const icons = {
    shield: "🛡️",
    lock: "🔒",
    key: "🔑",
    warning: "⚠️",
    email: "📧",
    binary: Math.random() > 0.5 ? "0" : "1"
  };

  return (
    <div
      className="absolute text-emerald-500/30 pointer-events-none animate-float-particle"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        fontSize: `${size}px`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`
      }}
    >
      {icons[type] || icons.shield}
    </div>
  );
}

// Animated grid lines
function CyberGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <div className="cyber-grid" />
    </div>
  );
}

// Scanning line effect
function ScanLine() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="scan-line" />
    </div>
  );
}

export default function AuthCard({ title, subtitle, children, footer }) {
  const [particles, setParticles] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    // Generate random particles
    const types = ["shield", "lock", "key", "warning", "email", "binary", "binary", "binary"];
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 10,
      size: 12 + Math.random() * 24,
      left: Math.random() * 100,
      top: Math.random() * 100,
      type: types[Math.floor(Math.random() * types.length)]
    }));
    setParticles(newParticles);
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Animated Background Gradient */}
      <div
        className="absolute inset-0 transition-all duration-500 ease-out"
        style={{
          background: `
            radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 40%),
            radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 40%),
            linear-gradient(135deg, #0f172a 0%, #020617 50%, #0f172a 100%)
          `
        }}
      />

      {/* Cyber Grid Background */}
      <CyberGrid />

      {/* Floating Particles */}
      {particles.map((p) => (
        <FloatingParticle key={p.id} {...p} />
      ))}

      {/* Scan Line Effect */}
      <ScanLine />

      {/* Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }} />

      {/* Main Card */}
      <div className="w-full max-w-md relative z-10">
        {/* Animated Border Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 rounded-2xl blur-lg opacity-30 animate-gradient-rotate" />

        {/* Card Content */}
        <div className="relative glass-card-premium p-8 rounded-2xl animate-card-appear">
          {/* Shield Icon with Animation */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              {/* Outer Ring Animation */}
              <div className="absolute -inset-4 rounded-full border-2 border-emerald-500/30 animate-spin-slow" />
              <div className="absolute -inset-6 rounded-full border border-cyan-500/20 animate-reverse-spin" />

              {/* Shield Icon */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 via-cyan-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/50 animate-float">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>

              {/* Pulse Effect */}
              <div className="absolute inset-0 rounded-2xl bg-emerald-500/50 animate-ping-slow" />
            </div>
          </div>

          {/* Title with Typing Effect */}
          <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent animate-gradient-text bg-300%">
            {title}
          </h1>

          {subtitle && (
            <p className="text-slate-400 text-center text-sm mb-8 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
              {subtitle}
            </p>
          )}

          {/* Decorative Lines */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
            <span className="text-emerald-500/50 text-xs">SECURE ACCESS</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          </div>

          {/* Form Content */}
          <div className="animate-fadeIn" style={{ animationDelay: '0.5s' }}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="mt-6 pt-6 border-t border-slate-700/50 text-center text-slate-400 text-sm animate-fadeIn" style={{ animationDelay: '0.7s' }}>
              {footer}
            </div>
          )}

          {/* Bottom Security Badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
            <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>256-bit encryption</span>
          </div>
        </div>
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-emerald-500/20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-cyan-500/20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-purple-500/20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-emerald-500/20 pointer-events-none" />

      {/* Binary Rain Effect (CSS only) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-emerald-500 font-mono text-xs animate-binary-rain"
            style={{
              left: `${i * 10 + 5}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${5 + Math.random() * 5}s`
            }}
          >
            {Array.from({ length: 20 }).map((_, j) => (
              <div key={j}>{Math.random() > 0.5 ? "1" : "0"}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

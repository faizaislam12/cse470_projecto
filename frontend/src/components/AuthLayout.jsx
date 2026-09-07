// Decorative side panel shown next to auth forms on wide screens.
// Built entirely from inline SVG shapes (no external images), so it has
// no network dependency and no copyright/licensing concerns.
const AuthLayout = ({ children }) => {
  return (
    <div className="auth-shell">
      <div className="auth-illustration">
        <svg viewBox="0 0 400 400" className="auth-illustration-svg" aria-hidden="true">
          <circle cx="200" cy="200" r="160" className="ring ring-1" />
          <circle cx="200" cy="200" r="120" className="ring ring-2" />

          {/* leaf */}
          <g className="float-slow">
            <path
              d="M200 120 C260 120 300 160 300 220 C300 260 260 280 220 280 C160 280 140 220 160 180 C170 158 185 140 200 120 Z"
              fill="#2fa572"
            />
            <path d="M200 130 C200 190 210 240 240 270" stroke="#1f8a5f" strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>

          {/* recycling arrows */}
          <g className="spin-slow" style={{ transformOrigin: '200px 200px' }}>
            <path d="M140 150 L165 150 L152 128 Z" fill="#ffffff" opacity="0.9" />
            <path d="M255 165 L270 188 L282 165 Z" fill="#ffffff" opacity="0.9" />
            <path d="M215 275 L190 275 L203 297 Z" fill="#ffffff" opacity="0.9" />
          </g>

          {/* floating dots */}
          <circle cx="90" cy="120" r="6" className="float-fast" fill="#a7e3c4" />
          <circle cx="320" cy="260" r="8" className="float-medium" fill="#a7e3c4" />
          <circle cx="310" cy="100" r="5" className="float-fast" fill="#ffffff" opacity="0.8" />
        </svg>
        <h2>Recycle smarter.</h2>
        <p>List, collect, and track recyclables with your community on GreenLoop.</p>
      </div>

      <div className="auth-form-panel">
        <div className="auth-card">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;

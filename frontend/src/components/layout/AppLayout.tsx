import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  const location = useLocation();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-canvas)' }}>
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0 }}>
        <div key={location.pathname} className="route-transition">
          <Outlet />
        </div>
      </main>
      <style>{`
        .route-transition {
          animation: route-enter var(--duration-base) var(--ease-out);
        }
        @keyframes route-enter {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .route-transition { animation: none; }
        }
      `}</style>
    </div>
  );
}
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ProjectTabs } from './ProjectTabs';

export function AppLayout() {
  const location = useLocation();
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-canvas)' }}>
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0 }}>
        {projectId && <ProjectTabs projectId={projectId} />}
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
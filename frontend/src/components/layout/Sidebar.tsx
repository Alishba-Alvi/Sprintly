import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { Logo } from '../Logo';
import { Avatar } from '../ui/Avatar';

const navItemStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-3)',
  padding: '9px 12px',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--text-sm)',
  fontWeight: 500,
  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
  background: isActive ? 'var(--accent-dim)' : 'transparent',
  transition: 'background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)',
});

function NavDot({ active }: { active: boolean }) {
  return (
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: active ? 'var(--accent)' : 'var(--text-tertiary)',
        flexShrink: 0,
      }}
    />
  );
}

export function Sidebar() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--border-subtle)',
        background: 'var(--bg-canvas-elevated)',
        padding: 'var(--space-5) var(--space-3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: '0 var(--space-2)', marginBottom: 'var(--space-6)' }}>
        <Logo size={26} />
        <span style={{ fontWeight: 600, fontSize: 'var(--text-md)' }}>Sprintly</span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <NavLink to="/dashboard" style={navItemStyle}>
          {({ isActive }) => (
            <>
              <NavDot active={isActive} />
              Dashboard
            </>
          )}
        </NavLink>
        <NavLink to="/projects" style={navItemStyle}>
          {({ isActive }) => (
            <>
              <NavDot active={isActive} />
              Projects
            </>
          )}
        </NavLink>
      </nav>

      <div style={{ flex: 1 }} />

      {user && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2)',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: 'var(--space-4)',
          }}
        >
          <Avatar name={user.name || user.email} size={30} />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.name || user.email}
            </div>
            <div
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text-tertiary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.email}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
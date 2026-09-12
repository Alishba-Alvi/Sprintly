import { NavLink } from 'react-router-dom';

const tabStyle = ({ isActive }: { isActive: boolean }) => ({
  padding: '8px 4px',
  fontSize: 'var(--text-sm)',
  fontWeight: 500,
  color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
  borderBottom: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
  textDecoration: 'none',
});

export function ProjectTabs({ projectId }: { projectId: string }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--space-5)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 var(--space-6)',
      }}
    >
      <NavLink to={`/projects/${projectId}/members`} style={tabStyle} end>
        Members
      </NavLink>
      <NavLink to={`/projects/${projectId}/issues`} style={tabStyle}>
        Issues
      </NavLink>
    </div>
  );
}
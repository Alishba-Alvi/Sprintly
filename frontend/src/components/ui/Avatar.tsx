const AVATAR_COLORS = [
  '#6a5ce0',
  '#2f7bd6',
  '#2f9160',
  '#b8791a',
  '#c94a3f',
  '#8367e8',
  '#3b8fa6',
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface AvatarProps {
  name: string;
  size?: number;
}

export function Avatar({ name, size = 28 }: AvatarProps) {
  const color = AVATAR_COLORS[hashString(name) % AVATAR_COLORS.length];

  return (
    <div
      title={name}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.38,
        fontWeight: 600,
        flexShrink: 0,
        border: '2px solid var(--bg-surface)',
      }}
    >
      {getInitials(name || '?')}
    </div>
  );
}

interface AvatarGroupProps {
  names: string[];
  max?: number;
  size?: number;
}

export function AvatarGroup({ names, max = 4, size = 28 }: AvatarGroupProps) {
  const visible = names.slice(0, max);
  const overflow = names.length - visible.length;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {visible.map((name, i) => (
        <div key={name + i} style={{ marginLeft: i === 0 ? 0 : -8 }}>
          <Avatar name={name} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          style={{
            marginLeft: -8,
            width: size,
            height: size,
            borderRadius: '50%',
            background: 'var(--bg-surface-2)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size * 0.34,
            fontWeight: 600,
            border: '2px solid var(--bg-surface)',
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
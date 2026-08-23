import { useState } from 'react';
import { useLazySearchUserByEmailQuery } from '../../app/api';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ErrorBanner } from '../ui/ErrorBanner';

interface AssigneePickerProps {
  currentAssigneeId: string | null;
  onAssign: (userId: string | null) => void;
  disabled?: boolean;
}

export function AssigneePicker({ currentAssigneeId, onAssign, disabled = false }: AssigneePickerProps) {
  const [searching, setSearching] = useState(false);
  const [email, setEmail] = useState('');
  const [searchUser, { data: foundUser, isFetching, error }] = useLazySearchUserByEmailQuery();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchUser(email);
  };

  const handlePick = () => {
    if (!foundUser) return;
    onAssign(foundUser.id);
    setSearching(false);
    setEmail('');
  };

  if (!searching) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: currentAssigneeId ? 'var(--bg-surface-2)' : 'transparent',
            border: currentAssigneeId
              ? '1px solid var(--border-subtle)'
              : '1.5px dashed var(--border-strong)',
          }}
        >
          {currentAssigneeId && (
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--text-tertiary)' }} />
          )}
        </div>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', flex: 1 }}>
          {currentAssigneeId ? 'Assigned' : 'Unassigned'}
        </span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setSearching(true)}
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--accent)',
            fontWeight: 500,
            opacity: disabled ? 0.55 : 1,
          }}
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <div style={{ flex: 1 }}>
          <Input
            type="email"
            placeholder="Search by email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={disabled}
            autoFocus
          />
        </div>
        <Button type="submit" variant="secondary" size="sm" loading={isFetching} disabled={disabled}>
          Search
        </Button>
      </form>

      {error && <ErrorBanner message="No user found with that email." />}

      {foundUser && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface-2)',
          }}
        >
          <span style={{ fontSize: 'var(--text-sm)', flex: 1 }}>{foundUser.name}</span>
          <Button variant="primary" size="sm" onClick={handlePick} disabled={disabled}>
            Assign
          </Button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        {currentAssigneeId && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              onAssign(null);
              setSearching(false);
            }}
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--danger)',
              fontWeight: 500,
              opacity: disabled ? 0.55 : 1,
            }}
          >
            Unassign
          </button>
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setSearching(false)}
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-tertiary)',
            fontWeight: 500,
            opacity: disabled ? 0.55 : 1,
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
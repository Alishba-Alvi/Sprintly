import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export interface IssueFilterState {
  search: string;
  status: string;
  type: string;
  priority: string;
}

interface IssueFiltersProps {
  filters: IssueFilterState;
  onChange: (filters: IssueFilterState) => void;
}

export function IssueFilters({ filters, onChange }: IssueFiltersProps) {
  const update = (key: keyof IssueFilterState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-4)',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: '1 1 220px', minWidth: 180 }}>
        <Input
          placeholder="Search issues..."
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
        />
      </div>

      <div style={{ width: 150 }}>
        <Select value={filters.status} onChange={(e) => update('status', e.target.value)}>
          <option value="">All statuses</option>
          <option value="to_do">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="in_review">In Review</option>
          <option value="done">Done</option>
        </Select>
      </div>

      <div style={{ width: 130 }}>
        <Select value={filters.type} onChange={(e) => update('type', e.target.value)}>
          <option value="">All types</option>
          <option value="task">Task</option>
          <option value="bug">Bug</option>
          <option value="story">Story</option>
          <option value="epic">Epic</option>
        </Select>
      </div>

      <div style={{ width: 140 }}>
        <Select value={filters.priority} onChange={(e) => update('priority', e.target.value)}>
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </Select>
      </div>

      {(filters.search || filters.status || filters.type || filters.priority) && (
        <button
          onClick={() => onChange({ search: '', status: '', type: '', priority: '' })}
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-tertiary)',
            fontWeight: 500,
            padding: '6px 8px',
          }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
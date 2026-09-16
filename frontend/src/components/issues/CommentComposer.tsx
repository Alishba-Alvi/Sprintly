import { useState } from 'react';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { ErrorBanner } from '../ui/ErrorBanner';

interface CommentComposerProps {
  onSubmit: (body: string) => Promise<void>;
  submitting?: boolean;
}

export function CommentComposer({ onSubmit, submitting = false }: CommentComposerProps) {
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;

    setError(null);
    try {
      await onSubmit(trimmed);
      setBody('');
    } catch (err) {
      const fetchError = err as { data?: { message?: string | string[] } };
      const rawMessage = fetchError?.data?.message;
      const message = Array.isArray(rawMessage) ? rawMessage[0] : rawMessage;
      setError(message ?? 'Could not post your comment.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {error && <ErrorBanner message={error} />}
      <Textarea
        placeholder="Write a comment…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={submitting}
        rows={3}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" size="sm" loading={submitting} disabled={!body.trim()}>
          Comment
        </Button>
      </div>
    </form>
  );
}

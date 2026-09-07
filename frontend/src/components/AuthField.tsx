import { useState } from 'react';
import type { InputHTMLAttributes } from 'react';

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode;
  isPassword?: boolean;
  error?: string;
}

function EyeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.9 19.9 0 0 1 5.06-5.94M9.9 4.24A10.6 10.6 0 0 1 12 4c7 0 11 8 11 8a19.86 19.86 0 0 1-2.34 3.33M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export function AuthField({ icon, isPassword, type, error, ...props }: AuthFieldProps) {
  const [visible, setVisible] = useState(false);
  const resolvedType = isPassword ? (visible ? 'text' : 'password') : type;

  return (
    <div className="authL-field-group">
      <div className={`authL-field${error ? ' authL-field--error' : ''}`}>
        <span className="authL-field-icon">{icon}</span>
        <input {...props} type={resolvedType} className="authL-input" />
        {isPassword && (
          <button
            type="button"
            className="authL-field-toggle"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {error && <span className="authL-field-error">{error}</span>}
    </div>
  );
}
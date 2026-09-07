interface Rule {
  label: string;
  test: (v: string) => boolean;
}

const RULES: Rule[] = [
  { label: '8+ characters', test: (v) => v.length >= 8 },
  { label: 'Uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'Lowercase letter', test: (v) => /[a-z]/.test(v) },
  { label: 'Number', test: (v) => /[0-9]/.test(v) },
  { label: 'Special character', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export function isPasswordStrong(password: string): boolean {
  return RULES.every((rule) => rule.test(password));
}

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  return (
    <div className="pwStrength">
      {RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <span key={rule.label} className={`pwStrength-item${met ? ' pwStrength-item--met' : ''}`}>
            <span className="pwStrength-dot" aria-hidden="true">
              {met && (
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6.2l2.2 2.2L9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            {rule.label}
          </span>
        );
      })}
    </div>
  );
}
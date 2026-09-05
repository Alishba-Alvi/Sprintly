// LandingPage.tsx
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import './LandingPage.css';

const ISSUE_TYPES = [
  { label: 'Task', tone: 'blue' as const },
  { label: 'Bug', tone: 'coral' as const },
  { label: 'Story', tone: 'green' as const },
  { label: 'Epic', tone: 'navy' as const },
];

const BOARD_COLUMNS = [
  {
    name: 'To Do',
    tone: 'muted' as const,
    cards: [
      { key: 'SP-18', title: 'Set up CI pipeline', tone: 'blue' as const },
      { key: 'SP-21', title: 'Draft onboarding copy', tone: 'green' as const },
    ],
  },
  {
    name: 'In Progress',
    tone: 'blue' as const,
    cards: [{ key: 'SP-14', title: 'Board drag-and-drop', tone: 'coral' as const }],
  },
  {
    name: 'Done',
    tone: 'green' as const,
    cards: [
      { key: 'SP-09', title: 'Auth refresh flow', tone: 'blue' as const },
      { key: 'SP-11', title: 'Project roles', tone: 'green' as const },
    ],
  },
];

const WORKFLOW_STEPS = ['To Do', 'In Progress', 'In Review', 'Done'];

const FEATURE_CARDS = [
  {
    tone: 'blue' as const,
    title: 'Real-time board',
    body: 'Every card updates the moment status changes. No refresh, no guessing.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="3" width="5" height="14" rx="1.4" stroke="currentColor" strokeWidth="1.5" />
        <rect x="8.5" y="3" width="5" height="9" rx="1.4" stroke="currentColor" strokeWidth="1.5" />
        <rect x="15" y="3" width="3" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    tone: 'coral' as const,
    title: 'One-click assignment',
    body: 'Hand an issue to any project member, or leave it open for someone to grab.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="7" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 17c0-3 2.2-5 5-5s5 2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M13 9l2 2 3.5-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    tone: 'green' as const,
    title: 'A workflow that holds',
    body: 'Status only moves through valid transitions, so nothing skips ahead by mistake.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 6h6M3 10h9M3 14h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M15 12l2 2 3-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    tone: 'blue' as const,
    title: 'Threaded comments',
    body: 'Discussion stays attached to the exact issue it belongs to, in order.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M2.5 4.5h15v9h-8L5 17v-3.5H2.5v-9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    tone: 'coral' as const,
    title: 'Fast filtering',
    body: 'Cut hundreds of issues down by status, type, or assignee in seconds.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M2.5 4h15L12 10.5V16l-4 1.5v-7L2.5 4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const STACK_OFFSETS = [-240, -120, 0, 120, 240];
const STACK_ROTATIONS = [-7, -4, 0, 4, 7];

const STATS = [
  { id: 'issues', label: 'Issues moved through the workflow', value: 128400, suffix: '+', decimals: 0 },
  { id: 'time', label: 'Avg. time to first status change', value: 6, suffix: 'm', decimals: 0 },
  { id: 'uptime', label: 'Uptime this quarter', value: 99.9, suffix: '%', decimals: 1 },
];

type FooterLink =
  | { label: string; kind: 'anchor'; href: string }
  | { label: string; kind: 'route'; to: string };

const FOOTER_LINKS: FooterLink[] = [
  { label: 'Board', kind: 'anchor', href: '#board' },
  { label: 'Workflow', kind: 'anchor', href: '#workflow' },
  { label: 'Features', kind: 'anchor', href: '#features' },
  { label: 'Sign in', kind: 'route', to: '/login' },
  { label: 'Create account', kind: 'route', to: '/register' },
];

function useReveal(reducedMotion: boolean) {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (reducedMotion) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -60px 0px' },
    );
    targets.forEach((el) => {
      // If a deep link (e.g. #features) already scrolled this element out of
      // view above the viewport, it would never intersect and would stay
      // invisible forever — reveal it immediately instead of waiting.
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0) {
        el.classList.add('is-visible');
      } else {
        observer.observe(el);
      }
    });
    return () => observer.disconnect();
  }, [reducedMotion]);
}

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    let raf = 0;
    const duration = 1500;
    const tick = (t: number) => {
      if (start === null) start = t;
      const progress = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target]);
  return value;
}

function StatBlock({ stat }: { stat: (typeof STATS)[number] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const value = useCountUp(stat.value, active);
  const display = stat.decimals ? value.toFixed(stat.decimals) : Math.round(value).toLocaleString();

  return (
    <div className="lp-stat" ref={ref}>
      <span className="lp-stat-value">
        {display}
        {stat.suffix}
      </span>
      <span className="lp-stat-label">{stat.label}</span>
    </div>
  );
}

export function LandingPage() {
  useDocumentTitle('Sprintly — Track work that actually moves.');

  const [reducedMotion, setReducedMotion] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [stackOpen, setStackOpen] = useState(false);
  const [ctaOpen, setCtaOpen] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const stackRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLElement | null>(null);
  const magneticRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      setScrollProgress(scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useReveal(reducedMotion);

  // Card deck: sits stacked until it scrolls into view, then fans out horizontally.
  useEffect(() => {
    if (reducedMotion) {
      setStackOpen(true);
      return;
    }
    const el = stackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.bottom < 0) {
      setStackOpen(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStackOpen(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  // Final CTA: sits closed like a folded card, opens flat the moment it scrolls into view.
  useEffect(() => {
    if (reducedMotion) {
      setCtaOpen(true);
      return;
    }
    const el = ctaRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.bottom < 0) {
      setCtaOpen(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCtaOpen(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 8, y: y * -6 });
  };

  const handleStageMouseLeave = () => setTilt({ x: 0, y: 0 });

  const handleMagnetMove = (id: string) => (e: React.MouseEvent<HTMLSpanElement>) => {
    if (reducedMotion) return;
    const el = magneticRefs.current[id];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.setProperty('--mx', `${x * 0.3}px`);
    el.style.setProperty('--my', `${y * 0.3}px`);
  };

  const handleMagnetLeave = (id: string) => () => {
    const el = magneticRefs.current[id];
    if (el) {
      el.style.setProperty('--mx', '0px');
      el.style.setProperty('--my', '0px');
    }
  };

  return (
    <div className="lp">
      <div className="lp-progress" style={{ width: `${scrollProgress}%` }} aria-hidden="true" />

      <header className={`lp-nav${scrolled ? ' lp-nav--scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <div className="lp-brand">
            <span className="lp-brand-mark">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="9" fill="var(--surface-2)" />
                <rect x="5" y="5" width="8" height="8" rx="2" fill="var(--coral)" />
                <rect x="15" y="5" width="8" height="8" rx="2" fill="var(--burgundy)" />
                <rect x="5" y="15" width="8" height="8" rx="2" fill="var(--green)" />
                <path d="M16 20.5L20 24.5L27.5 14" stroke="var(--burgundy)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="lp-brand-name">
              sprint<span className="lp-brand-name-accent">ly</span>
            </span>
          </div>
          <nav className="lp-nav-links">
            <a href="#board">Board</a>
            <a href="#workflow">Workflow</a>
            <a href="#features">Features</a>
          </nav>
          <div className="lp-nav-actions">
            <Link to="/login" className="lp-link">Sign in</Link>
            <Link to="/register" className="lp-btn lp-btn--primary lp-btn--sm">
              Sign up
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ---------- hero ---------- */}
        <section className="lp-hero">
          <div className="lp-hero-inner">
            <div className="lp-hero-copy">
              <p className="lp-kicker" data-reveal="up">
                <span className="lp-kicker-dot" />
                All systems live
              </p>
              <h1 className="lp-headline" data-reveal="up">
                Track work that<br />actually <em>moves.</em>
              </h1>
              <span
                className="lp-magnet"
                ref={(el) => { magneticRefs.current.heroCta = el; }}
                onMouseMove={handleMagnetMove('heroCta')}
                onMouseLeave={handleMagnetLeave('heroCta')}
              >
                <Link to="/register" className="lp-btn lp-btn--primary lp-btn--lg" data-reveal="up">
                  Get started free
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </Link>
              </span>
            </div>

            <div
              id="board"
              className="lp-hero-visual"
              ref={stageRef}
              onMouseMove={handleStageMouseMove}
              onMouseLeave={handleStageMouseLeave}
            >
              <div
                className="lp-visual-note"
                data-reveal="left"
                style={reducedMotion ? undefined : { transform: `translate(${tilt.x * 0.5}px, ${tilt.y * 0.5}px) rotate(-7deg)` }}
              >
                <span className="lp-visual-note-icon">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <p>Sprint 12<br />wraps Friday</p>
              </div>

              <div
                className="lp-visual-avatars"
                data-reveal="right"
                style={reducedMotion ? undefined : { transform: `translate(${tilt.x * 0.7}px, ${tilt.y * 0.7}px)` }}
              >
                <span className="lp-avatar-dot lp-avatar-dot--1" />
                <span className="lp-avatar-dot lp-avatar-dot--2" />
                <span className="lp-avatar-dot lp-avatar-dot--3" />
                <div>
                  <strong>Assigned to you</strong>
                  <span>SP-14</span>
                </div>
              </div>

              <div
                className="lp-board"
                data-reveal="scale"
                style={reducedMotion ? undefined : { transform: `perspective(1400px) rotateX(${tilt.y * 0.5}deg) rotateY(${tilt.x * 0.5}deg)` }}
              >
                <div className="lp-board-frame">
                  <div className="lp-board-head">
                    <span className="lp-board-head-key">SP</span>
                    <span className="lp-board-head-title">Sprintly board</span>
                    <span className="lp-board-head-dot" />
                  </div>
                  <div className="lp-board-cols">
                    {BOARD_COLUMNS.map((col) => (
                      <div className="lp-board-col" key={col.name}>
                        <div className="lp-board-col-head">
                          <i className={`lp-dot lp-dot--${col.tone}`} />
                          {col.name}
                          <span>{col.cards.length}</span>
                        </div>
                        {col.cards.map((c) => (
                          <div className={`lp-board-card lp-board-card--${c.tone}`} key={c.key}>
                            <span className="lp-board-card-key">{c.key}</span>
                            <p>{c.title}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- issue types + live stats: a distinct surface band ---------- */}
        <div className="lp-band">
          <section id="types" className="lp-chips" data-reveal="up">
            <span className="lp-chips-label">Every issue has a type</span>
            <div className="lp-chips-row">
              {ISSUE_TYPES.map((t) => (
                <span className={`lp-chip lp-chip--${t.tone}`} key={t.label}>{t.label}</span>
              ))}
            </div>
          </section>

          <section className="lp-stats">
            {STATS.map((s) => (
              <StatBlock stat={s} key={s.id} />
            ))}
          </section>
        </div>

        {/* ---------- workflow: standalone geometric diagram ---------- */}
        <section id="workflow" className="lp-workflow-section">
          <p className="lp-section-eyebrow" data-reveal="up">The workflow</p>
          <h2 data-reveal="up">Status can only move one way forward.</h2>

          <div className="lp-workflow-panel" data-reveal="scale">
            <span className="lp-corner--tr" aria-hidden="true" />
            <span className="lp-corner--bl" aria-hidden="true" />

            <div className="lp-workflow-chain">
              <span className="lp-workflow-node" aria-hidden="true" />
              {WORKFLOW_STEPS.map((step, i) => (
                <div className="lp-workflow-step-wrap" key={step}>
                  <span className={`lp-workflow-step lp-workflow-step--${i}`}>{step}</span>
                  {i < WORKFLOW_STEPS.length - 1 ? (
                    <svg className="lp-workflow-arrow" width="26" height="14" viewBox="0 0 26 14" fill="none">
                      <path d="M1 7h22M17 1l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span className="lp-workflow-node" aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>
            <div className="lp-workflow-track" aria-hidden="true" />
            <p className="lp-workflow-note">
              In Review can bounce back to In Progress. Done can reopen. Everything else is rejected.
            </p>
          </div>
        </section>

        {/* ---------- feature deck: stacked, fans out horizontally on scroll ---------- */}
        <section id="features" className="lp-stack-section">
          <p className="lp-section-eyebrow" data-reveal="up">Everything included</p>
          <h2 data-reveal="up">Built for how teams actually work.</h2>
          <div className={`lp-stack-row${stackOpen ? ' is-open' : ''}`} ref={stackRef}>
            {FEATURE_CARDS.map((f, i) => (
              <div
                className={`lp-stack-card lp-stack-card--${f.tone}`}
                key={f.title}
                style={
                  reducedMotion
                    ? undefined
                    : {
                        transform: stackOpen
                          ? 'translateX(0) rotate(0deg) scale(1)'
                          : `translateX(${STACK_OFFSETS[i]}px) rotate(${STACK_ROTATIONS[i]}deg) scale(0.9)`,
                        transitionDelay: `${i * 70}ms`,
                        zIndex: stackOpen ? 1 : 10 - Math.abs(i - 2),
                      }
                }
              >
                <span className="lp-stack-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- cta ---------- */}
        <section
          className={`lp-cta${ctaOpen ? ' is-open' : ''}`}
          ref={(el) => { ctaRef.current = el; }}
        >
          <p className="lp-cta-eyebrow">Start free</p>
          <h2>Ready to get organized?</h2>
          <p className="lp-cta-body">Create your first project in under a minute. No credit card, no setup calls.</p>
          <div className="lp-cta-actions">
            <span
              className="lp-magnet"
              ref={(el) => { magneticRefs.current.finalCta = el; }}
              onMouseMove={handleMagnetMove('finalCta')}
              onMouseLeave={handleMagnetLeave('finalCta')}
            >
              <Link to="/register" className="lp-btn lp-btn--inverse lp-btn--lg">
                Create your first project
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
            </span>
            <Link to="/login" className="lp-link lp-link--inverse">Already have an account? Sign in</Link>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <div className="lp-brand lp-brand--footer">
              <span className="lp-brand-mark">
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                  <rect x="5" y="5" width="8" height="8" rx="2" fill="var(--paper)" />
                  <rect x="15" y="5" width="8" height="8" rx="2" fill="var(--paper)" />
                  <rect x="5" y="15" width="8" height="8" rx="2" fill="var(--paper)" />
                  <path d="M16 20.5L20 24.5L27.5 14" stroke="var(--paper)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="lp-brand-name lp-brand-name--footer">sprintly</span>
            </div>
            <p>Boards, issues, and status that keep your whole team in sync.</p>
          </div>

          <nav className="lp-footer-links">
            {FOOTER_LINKS.map((link) =>
              link.kind === 'route' ? (
                <Link key={link.label} to={link.to}>{link.label}</Link>
              ) : (
                <a key={link.label} href={link.href}>{link.label}</a>
              ),
            )}
          </nav>
        </div>
        <div className="lp-footer-bottom">
          <span>© 2026 Sprintly</span>
          <span className="lp-footer-status">
            <i className="lp-dot lp-dot--paper" /> All systems operational
          </span>
        </div>
      </footer>
    </div>
  );
}

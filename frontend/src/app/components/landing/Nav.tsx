import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../../lib/theme';

export function Nav() {
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[var(--bg)]/80 backdrop-blur-md border-b border-[var(--line)]' : ''}`}>
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <span className="w-2 h-2 bg-[var(--accent)] rotate-45" />
          <span className="mono uppercase tracking-[0.22em] text-[0.78rem]">Fluxora</span>
        </Link>
        <nav className="hidden md:flex items-center gap-10 mono uppercase tracking-[0.18em] text-[0.7rem]">
          <a href="#platform" className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition">Platform</a>
          <a href="#stakeholders" className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition">Residences</a>
          <a href="#intelligence" className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition">Intelligence</a>
          <a href="#pricing" className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition">Pricing</a>
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={toggle} className="w-9 h-9 grid place-items-center border border-[var(--line)] hover:border-[var(--accent)] transition" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={14} strokeWidth={1.5} /> : <Moon size={14} strokeWidth={1.5} />}
          </button>
          <Link to="/login" className="hidden sm:inline-flex items-center h-9 px-3 mono text-[0.66rem] uppercase tracking-[0.18em] border border-[var(--line)] hover:border-[var(--accent)]">Sign in</Link>
          <Link to="/signup" className="group inline-flex items-center gap-2 px-4 h-9 bg-[var(--ink)] text-[var(--bg-raised)] mono uppercase tracking-[0.18em] text-[0.7rem] hover:bg-[var(--accent)] hover:text-[var(--accent-ink)] transition-colors">
            Begin tenancy <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

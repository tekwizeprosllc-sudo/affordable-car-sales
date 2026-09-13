'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Phone, Sun, Moon, Menu, X, MessageCircle } from 'lucide-react';
import Logo from './Logo';
import { NAV, DEALER, ROUTES } from '@/lib/site';

function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch (e) {}
  };

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full border transition hover:border-crimson/70 hover:text-crimson"
      style={{ borderColor: 'var(--line-strong)' }}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

export default function Header({ overlay = false }) {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={overlay ? 'absolute inset-x-0 top-0 z-50' : 'sticky top-0 z-50 backdrop-blur'}
      style={overlay ? undefined : { background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 py-4">
        <Link href={ROUTES.home} aria-label={`${DEALER.name} home`} className="shrink-0">
          <Logo className="h-11" />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[12px] font-bold uppercase tracking-[0.16em] transition hover:text-crimson"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href={DEALER.phoneHref} className="hidden text-right leading-tight md:block">
            <span className="flex items-center gap-2 text-[14px] font-bold transition hover:text-crimson">
              <Phone size={14} className="text-crimson" />
              {DEALER.phone}
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--muted)' }}>
              {DEALER.hours}
            </span>
          </a>
          <ThemeToggle />
          <Link href={ROUTES.contact} className="btn-red hidden sm:inline-flex">
            <MessageCircle size={14} /> Talk With Ava
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="grid h-10 w-10 place-items-center rounded-full border lg:hidden"
            style={{ borderColor: 'var(--line-strong)' }}
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="panel mx-6 mb-3 rounded-[5px] p-4 lg:hidden">
          <div className="flex flex-col">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b py-3 text-[12px] font-bold uppercase tracking-[0.16em] last:border-0"
                style={{ borderColor: 'var(--line)' }}
              >
                {item.label}
              </Link>
            ))}
            <Link href={ROUTES.contact} onClick={() => setOpen(false)} className="btn-red mt-4">
              Talk With Ava
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

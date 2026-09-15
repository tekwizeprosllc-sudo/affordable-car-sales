'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2 } from 'lucide-react';
import Logo from './Logo';
import { useForceDarkTheme } from './admin/AdminShell';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  useForceDarkTheme();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      const json = await res.json().catch(() => ({}));
      setError(json.error || 'Incorrect password.');
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-6" style={{ background: 'var(--bg)' }}>
      <form onSubmit={submit} className="panel w-full max-w-sm rounded-[6px] p-8">
        <Logo className="mx-auto h-12" />
        <h1 className="mt-6 text-center font-display text-xl font-black uppercase tracking-[0.1em]">Lead Dashboard</h1>
        <p className="mt-1 text-center text-[12px]" style={{ color: 'var(--muted)' }}>
          Staff access only
        </p>

        <label className="mt-6 flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
            autoFocus
            required
          />
        </label>

        {error && <p className="mt-3 text-[12px] font-semibold text-crimson">{error}</p>}

        <button type="submit" disabled={loading} className="btn-red mt-5 w-full disabled:opacity-60">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Lock size={14} />}
          {loading ? 'Checking…' : 'Sign In'}
        </button>
      </form>
    </main>
  );
}

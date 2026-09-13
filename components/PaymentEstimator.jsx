'use client';
import { useState } from 'react';
import { Calculator, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/site';

const TERMS = [36, 48, 60, 72];

export default function PaymentEstimator({ price }) {
  const [down, setDown] = useState(() => Math.min(2000, Math.round((price || 0) * 0.1)));
  const [term, setTerm] = useState(60);
  const [rate, setRate] = useState(9.9);

  if (!price) return null;

  const financed = Math.max(price - down, 0);
  const monthlyRate = rate / 100 / 12;
  const payment =
    monthlyRate > 0
      ? (financed * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term))
      : financed / term;

  return (
    <div className="panel rounded-[5px] p-6">
      <h2 className="flex items-center gap-2 font-display text-lg font-black uppercase">
        <Calculator size={17} className="text-crimson" /> Estimate a Payment
      </h2>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <div className="font-display text-[40px] font-black leading-none text-crimson">
            ${financed > 0 ? Math.round(payment).toLocaleString() : 0}
          </div>
          <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
            per month · estimated
          </div>
        </div>
        <div className="text-right text-[12px]" style={{ color: 'var(--muted)' }}>
          ${financed.toLocaleString()} financed
          <br />
          over {term} months
        </div>
      </div>

      <label className="mt-6 block">
        <span className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
          Down payment <span className="text-accent">${down.toLocaleString()}</span>
        </span>
        <input
          type="range"
          min={0}
          max={Math.max(price - 500, 500)}
          step={250}
          value={down}
          onChange={(e) => setDown(Number(e.target.value))}
          className="mt-2 w-full accent-crimson"
          aria-label="Down payment"
        />
      </label>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
            Term
          </span>
          <select className="field" value={term} onChange={(e) => setTerm(Number(e.target.value))} aria-label="Loan term">
            {TERMS.map((t) => (
              <option key={t} value={t}>
                {t} months
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
            Sample rate %
          </span>
          <input
            type="number"
            min={0}
            max={36}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Math.min(36, Math.max(0, Number(e.target.value))))}
            className="field"
            aria-label="Annual percentage rate"
          />
        </label>
      </div>

      <Link href={ROUTES.financing} className="btn-red mt-5 w-full">
        Get Your Real Numbers <ArrowRight size={14} />
      </Link>

      <p className="mt-3 text-[11px] leading-relaxed" style={{ color: 'var(--muted)' }}>
        Estimate only, using a sample rate you can change. This is not an offer of credit and not a
        quote. All credit types considered; actual rate, term, and approval are set by the lender.
      </p>
    </div>
  );
}

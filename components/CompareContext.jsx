'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CompareContext = createContext(null);
const KEY = 'acs_compare';
const MAX = 3;

export function useCompare() {
  return useContext(CompareContext) || { ids: [], toggle: () => {}, clear: () => {}, has: () => false, full: false };
}

export default function CompareProvider({ children }) {
  const [ids, setIds] = useState([]);

  useEffect(() => {
    try {
      const raw = JSON.parse(sessionStorage.getItem(KEY) || '[]');
      // Entries were plain ids before labels existed; normalise so an older
      // session does not render blank chips.
      setIds(
        raw
          .map((x) => (typeof x === 'string' ? { id: x, label: `#${x.replace(/^m/, '')}` } : x))
          .filter((x) => x && x.id)
      );
    } catch (e) {}
  }, []);

  const persist = (next) => {
    setIds(next);
    try {
      sessionStorage.setItem(KEY, JSON.stringify(next));
    } catch (e) {}
  };

  const value = useMemo(
    () => ({
      ids,
      full: ids.length >= MAX,
      has: (id) => ids.some((x) => x.id === id),
      toggle: (id, label) =>
        persist(
          ids.some((x) => x.id === id)
            ? ids.filter((x) => x.id !== id)
            : ids.length >= MAX
              ? ids
              : [...ids, { id, label: label || String(id) }]
        ),
      clear: () => persist([]),
    }),
    [ids]
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

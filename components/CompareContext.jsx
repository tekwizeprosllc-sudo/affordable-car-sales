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
      setIds(JSON.parse(sessionStorage.getItem(KEY) || '[]'));
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
      has: (id) => ids.includes(id),
      toggle: (id) =>
        persist(ids.includes(id) ? ids.filter((x) => x !== id) : ids.length >= MAX ? ids : [...ids, id]),
      clear: () => persist([]),
    }),
    [ids]
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

'use client';
import { usePathname } from 'next/navigation';
import CompareContextProvider from './CompareContext';
import CompareTray from './CompareTray';

export default function CompareProvider({ children }) {
  const pathname = usePathname();
  const staffArea = pathname?.startsWith('/admin');

  return (
    <CompareContextProvider>
      {children}
      {!staffArea && <CompareTray />}
    </CompareContextProvider>
  );
}

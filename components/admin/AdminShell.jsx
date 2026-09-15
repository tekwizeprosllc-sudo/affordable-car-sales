'use client';
import { createContext, useContext, useState } from 'react';
import AdminSidebar from './AdminSidebar';

const SidebarToggleContext = createContext(() => {});
export function useAdminSidebarToggle() {
  return useContext(SidebarToggleContext);
}

export default function AdminShell({ counts, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SidebarToggleContext.Provider value={() => setMobileOpen((v) => !v)}>
      <div className="flex h-screen" style={{ background: 'var(--bg)' }}>
        <div className="hidden w-[260px] shrink-0 lg:block">
          <AdminSidebar counts={counts} />
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-[260px]">
              <AdminSidebar counts={counts} onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </SidebarToggleContext.Provider>
  );
}

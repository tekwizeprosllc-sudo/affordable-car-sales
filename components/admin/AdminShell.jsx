'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import NewLeadModal from './NewLeadModal';

const AdminContext = createContext({
  search: '',
  setSearch: () => {},
  counts: null,
  toggleSidebar: () => {},
  openNewLead: () => {},
});

export function useAdmin() {
  return useContext(AdminContext);
}

// Kept for the few call sites that only need the drawer toggle.
export function useAdminSidebarToggle() {
  return useContext(AdminContext).toggleSidebar;
}

export function useForceDarkTheme() {
  // The root theme script already forces dark on a hard load of /admin; this
  // covers client-side navigation in from the public site.
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);
}

export default function AdminShell({ counts, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const router = useRouter();
  useForceDarkTheme();

  const value = {
    search,
    setSearch,
    counts,
    toggleSidebar: () => setMobileOpen((v) => !v),
    openNewLead: () => setNewLeadOpen(true),
  };

  return (
    <AdminContext.Provider value={value}>
      <div className="admin-theme flex h-screen overflow-hidden">
        <div className="hidden w-[256px] shrink-0 lg:block">
          <AdminSidebar counts={counts} />
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/75" onClick={() => setMobileOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-[264px] max-w-[85vw]">
              <AdminSidebar counts={counts} onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar />
          <div className="adm-scroll min-h-0 flex-1 overflow-y-auto">{children}</div>
        </div>

        {newLeadOpen && (
          <NewLeadModal
            onClose={() => setNewLeadOpen(false)}
            onCreated={() => router.refresh()}
          />
        )}
      </div>
    </AdminContext.Provider>
  );
}

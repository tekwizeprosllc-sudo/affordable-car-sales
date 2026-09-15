'use client';
import { useState } from 'react';
import { PlayCircle, ChevronDown, ChevronUp } from 'lucide-react';
import LeadsWorkspace from './LeadsWorkspace';

export default function AdminMessenger({ initialLeads, counts, settings }) {
  const [simOpen, setSimOpen] = useState(false);

  return (
    <LeadsWorkspace
      initialLeads={initialLeads}
      counts={counts}
      settings={settings}
      lockChannel="facebook"
      heading="Messenger"
      showHero={
        settings?.facebookAutomationEnabled === 'false' ? (
          <div className="panel rounded-[6px] p-4 text-[12.5px]" style={{ color: 'var(--muted)' }}>
            Facebook automation is turned off in <span className="font-semibold text-crimson">Settings</span> — quick
            replies still work here, but nothing sends automatically.
          </div>
        ) : null
      }
      afterGrid={
        <div className="panel overflow-hidden rounded-[6px]">
          <button
            onClick={() => setSimOpen((v) => !v)}
            className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:text-crimson"
          >
            <span className="flex items-center gap-2 font-display text-[13px] font-bold uppercase tracking-[0.08em]">
              <PlayCircle size={15} className="text-crimson" /> Messenger Simulator (demo)
            </span>
            {simOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {simOpen && (
            <div style={{ borderTop: '1px solid var(--line)' }}>
              <iframe
                src="/dealer-suite/messenger.html"
                title="Messenger Simulator"
                className="h-[600px] w-full"
                style={{ border: 0 }}
              />
            </div>
          )}
        </div>
      }
    />
  );
}

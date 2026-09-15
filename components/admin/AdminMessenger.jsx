'use client';
import { useState } from 'react';
import { PlayCircle, ChevronDown, ChevronUp } from 'lucide-react';
import LeadsWorkspace from './LeadsWorkspace';

export default function AdminMessenger({ initialLeads, counts, settings, vehicleIndex }) {
  const [simOpen, setSimOpen] = useState(false);

  return (
    <LeadsWorkspace
      initialLeads={initialLeads}
      counts={counts}
      settings={settings}
      vehicleIndex={vehicleIndex}
      showSimulate
      lockChannel="facebook"
      heading="Messenger"
      showHero={
        settings?.facebookAutomationEnabled === 'false' ? (
          <div className="adm-card px-4 py-3 text-[13px] text-[#aab3ba]">
            Facebook automation is turned off in <span className="font-semibold text-[#ff4a42]">Settings</span> — quick
            replies still copy and log here, but nothing sends automatically.
          </div>
        ) : null
      }
      afterGrid={
        <div className="adm-card overflow-hidden">
          <button
            onClick={() => setSimOpen((v) => !v)}
            aria-expanded={simOpen}
            className="flex w-full items-center justify-between px-5 py-3.5 text-left text-[#e6eaed] transition hover:text-white"
          >
            <span className="flex items-center gap-2.5 text-[14px] font-semibold">
              <PlayCircle size={17} strokeWidth={1.8} className="text-[#ff2a22]" /> Messenger Simulator
              <span className="text-[12px] font-normal text-[#89939c]">demo</span>
            </span>
            {simOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
          </button>
          {simOpen && (
            <div style={{ borderTop: '1px solid var(--admin-border)' }}>
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

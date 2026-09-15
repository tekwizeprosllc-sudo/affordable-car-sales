'use client';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { DEALER } from '@/lib/site';

// Local tone, no data-endpoint: she runs entirely in the browser, so this stays
// free on Vercel. The Claude-backed variant needs ANTHROPIC_API_KEY and is not
// mounted here on purpose.
export default function AvaScript() {
  const pathname = usePathname();

  // Staff tooling is not a showroom — keep the concierge off /admin.
  if (pathname?.startsWith('/admin')) return null;

  return (
    <Script
      src="/ava/ava.js"
      strategy="afterInteractive"
      data-dealer="Affordable Car Sales"
      data-phone={DEALER.phone}
      data-hours={`${DEALER.hours} · ${DEALER.hoursWeekend}`}
      data-city="Middletown, OH"
      data-avatar="/ava/ava.jpg"
      data-accent="#E10600"
      data-voice="on"
      data-greeting="/ava/ava-hello.mp3"
      data-voice-base="/ava/voice/"
      data-leads="/api/leads"
      data-inventory="/api/inventory/public"
    />
  );
}

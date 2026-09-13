import { Camera, Phone, HeartHandshake, MessageSquare, DollarSign, FileText, Timer, Tag } from 'lucide-react';

// Generated artwork rather than stock photography. A library shot of a stranger
// on a different lot adds nothing and looks bought; this is on-brand, weighs
// nothing, and can never be mistaken for a photo of this dealership.
const TOPICS = {
  photos: { icon: Camera, from: '#E10600', to: '#5B0400', pattern: 'grid' },
  phone: { icon: Phone, from: '#C40500', to: '#2B0200', pattern: 'rings' },
  trade: { icon: HeartHandshake, from: '#8E0300', to: '#1A0100', pattern: 'diag' },
  followup: { icon: MessageSquare, from: '#E10600', to: '#3A0200', pattern: 'rings' },
  finance: { icon: DollarSign, from: '#A00400', to: '#220100', pattern: 'diag' },
  listing: { icon: FileText, from: '#D10500', to: '#3A0200', pattern: 'grid' },
  speed: { icon: Timer, from: '#E10600', to: '#2B0200', pattern: 'rings' },
  pricing: { icon: Tag, from: '#B40400', to: '#1A0100', pattern: 'diag' },
  floor: { icon: Tag, from: '#C40500', to: '#2B0200', pattern: 'grid' },
};

export default function PlaybookArt({ topic = 'floor', className = 'h-32', label }) {
  const t = TOPICS[topic] || TOPICS.floor;
  const Icon = t.icon;

  return (
    <div className={`relative w-full overflow-hidden ${className}`} style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}>
      <svg className="absolute inset-0 h-full w-full opacity-25" aria-hidden="true">
        {t.pattern === 'grid' && (
          <>
            <defs>
              <pattern id={`g-${topic}`} width="26" height="26" patternUnits="userSpaceOnUse">
                <path d="M26 0H0V26" fill="none" stroke="white" strokeWidth="0.7" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#g-${topic})`} />
          </>
        )}
        {t.pattern === 'diag' && (
          <>
            <defs>
              <pattern id={`d-${topic}`} width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                <line x1="0" y1="0" x2="0" y2="18" stroke="white" strokeWidth="1.4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#d-${topic})`} />
          </>
        )}
        {t.pattern === 'rings' && (
          <g fill="none" stroke="white" strokeWidth="1">
            <circle cx="82%" cy="52%" r="26" />
            <circle cx="82%" cy="52%" r="46" />
            <circle cx="82%" cy="52%" r="68" />
          </g>
        )}
      </svg>

      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,0.45))]" />

      <Icon
        size={28}
        className="absolute left-5 top-1/2 -translate-y-1/2 text-white/90"
        strokeWidth={1.6}
        aria-hidden="true"
      />

      {label && (
        <span className="absolute bottom-3 left-5 text-[9px] font-extrabold uppercase tracking-[0.2em] text-white/75">
          {label}
        </span>
      )}
    </div>
  );
}

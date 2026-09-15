// Admin-only badge palette: bright text + hairline border on a faint tint of
// the same hue, readable on the near-black command-center surfaces. The
// white-on-fill STATUS_COLORS in lib/leads.js stay for the public-style boards.
export const STATUS_BADGE = {
  new: { label: 'New', fg: '#ff4a42', bg: 'rgba(242,13,13,0.12)', border: 'rgba(242,13,13,0.55)' },
  contacted: { label: 'Contacted', fg: '#f2ad45', bg: 'rgba(242,166,50,0.1)', border: 'rgba(242,166,50,0.5)' },
  scheduled: { label: 'Scheduled', fg: '#5aa5ff', bg: 'rgba(64,145,255,0.11)', border: 'rgba(64,145,255,0.5)' },
  showed: { label: 'Showed', fg: '#3fd0d3', bg: 'rgba(44,198,201,0.1)', border: 'rgba(44,198,201,0.45)' },
  'no-show': { label: 'No Show', fg: '#a3acb4', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.18)' },
  won: { label: 'Won', fg: '#3ed986', bg: 'rgba(43,214,123,0.1)', border: 'rgba(43,214,123,0.45)' },
  lost: { label: 'Lost', fg: '#a3acb4', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.18)' },
};

export function statusBadge(status) {
  return STATUS_BADGE[status] || { label: status, fg: '#a3acb4', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.18)' };
}

// Selected state for the four vehicle-availability controls.
export const AVAILABILITY_STYLE = {
  live: { fg: '#fff', icon: '#3ed986', bg: 'rgba(33,168,96,0.28)', border: 'rgba(60,220,130,0.85)', glow: 'rgba(43,214,123,0.4)' },
  pending: { fg: '#fff', icon: '#f2ad45', bg: 'rgba(200,130,30,0.28)', border: 'rgba(242,166,50,0.85)', glow: 'rgba(242,166,50,0.35)' },
  sold: { fg: '#fff', icon: '#ff4a42', bg: 'rgba(190,12,10,0.3)', border: 'rgba(242,13,13,0.85)', glow: 'rgba(242,13,13,0.4)' },
  unknown: { fg: '#fff', icon: '#d5dade', bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.45)', glow: 'rgba(255,255,255,0.1)' },
};

export function initials(name) {
  return (name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
}

export function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} minute${m === 1 ? '' : 's'} ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? '' : 's'} ago`;
}

// "Today, 2:00 PM" / "Tomorrow" / "Apr 24, 11:00 AM"
export function dueLabel(iso) {
  const d = new Date(iso);
  const now = new Date();
  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(d) - startOf(now)) / 86400000);
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (days === 0) return `Today, ${time}`;
  if (days === 1) return `Tomorrow, ${time}`;
  if (days === -1) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, ${time}`;
}

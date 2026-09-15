// Where a lead came from, derived from the free-text `source` we already store.
// Web forms set page names ("Trade-in page", "VDP 123"), Ava sets "ava", and
// Facebook/Messenger leads set "facebook". Everything that isn't a messaging
// channel is treated as the website.

export const CHANNELS = {
  // Darker than Facebook's own brand blue (#1877F2) — that shade fails
  // WCAG AA contrast (4.23:1) against white at the small badge size used here.
  facebook: { key: 'facebook', label: 'Facebook', short: 'FB', color: '#0A4FA0' },
  website: { key: 'website', label: 'Website', short: 'Web', color: '#4A5568' },
};

// Shared across the lead inbox, detail panel, and test-drive board so every
// status chip meets WCAG AA (4.5:1) for white text at small badge sizes —
// the obvious brand-adjacent shades (amber, sky blue, teal, mid-gray, a
// brighter green) all fell short of that until darkened here.
export const STATUS_COLORS = {
  new: '#E10600',
  contacted: '#9C6300',
  scheduled: '#1D5FB0',
  showed: '#1D6E82',
  'no-show': '#5C6066',
  won: '#1A7A4C',
  lost: '#5C6066',
};

export function leadChannel(source) {
  const s = String(source || '').toLowerCase();
  if (/facebook|messenger|\bfb\b|\bmeta\b|instagram|\big\b/.test(s)) return 'facebook';
  return 'website';
}

export function channelMeta(source) {
  return CHANNELS[leadChannel(source)];
}

export const NEXT_ACTIONS = [
  'Call',
  'Text',
  'Email',
  'Follow Up',
  'Schedule Test Drive',
  'Send Photos',
  'Confirm Availability',
  'Other',
];

// Display-only relabeling for the test-drive board, which reuses the shared
// lead status column but reads more naturally with appointment-specific words.
export const TEST_DRIVE_STATUS_LABELS = {
  new: 'Requested',
  contacted: 'Contacted',
  scheduled: 'Confirmed',
  showed: 'Completed',
  'no-show': 'No Show',
  won: 'Won',
  lost: 'Canceled',
};

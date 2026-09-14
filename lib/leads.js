// Where a lead came from, derived from the free-text `source` we already store.
// Web forms set page names ("Trade-in page", "VDP 123"), Ava sets "ava", and
// Facebook/Messenger leads set "facebook". Everything that isn't a messaging
// channel is treated as the website.

export const CHANNELS = {
  facebook: { key: 'facebook', label: 'Facebook', short: 'FB', color: '#1877F2' },
  website: { key: 'website', label: 'Website', short: 'Web', color: '#8A9099' },
};

export function leadChannel(source) {
  const s = String(source || '').toLowerCase();
  if (/facebook|messenger|\bfb\b|\bmeta\b|instagram|\big\b/.test(s)) return 'facebook';
  return 'website';
}

export function channelMeta(source) {
  return CHANNELS[leadChannel(source)];
}

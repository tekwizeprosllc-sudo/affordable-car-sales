import { getSettings } from './db'

export const SETTINGS_DEFAULTS = {
  facebookAutomationEnabled: 'true',
  defaultUnknownReply: 'Needs staff confirmation.',
  testDriveLinkPattern: '/inventory/{id}?action=test-drive',
  websiteBaseUrl: '',
}

export async function getSettingsWithDefaults() {
  try {
    const stored = await getSettings()
    return { ...SETTINGS_DEFAULTS, ...stored }
  } catch {
    return { ...SETTINGS_DEFAULTS }
  }
}

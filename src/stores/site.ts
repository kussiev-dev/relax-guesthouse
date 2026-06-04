import { ref } from 'vue'
import api from '@/api'

export interface SiteSettings {
  header: { phone: string; phoneDisplay: string }
  footer: {
    description: string
    phones: { number: string; display: string; label: string }[]
    email: string
    address: string
  }
}

const siteSettings = ref<SiteSettings | null>(null)
let fetching: Promise<void> | null = null

export function useSiteSettings() {
  if (!fetching) {
    fetching = api.get('/settings/site')
      .then(({ data }) => { siteSettings.value = data })
      .catch(() => {})
  }
  return siteSettings
}

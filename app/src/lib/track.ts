// Tracking de eventos de la landing (anónimo, sin auth) → /api/tracking
export function track(evento: string, extra = '') {
  try {
    fetch('/api/tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ evento, extra }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // fire-and-forget, no rompe la UI
  }
}

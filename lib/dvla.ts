import "server-only"

export function isDvlaConfigured() {
  return Boolean(process.env.DVLA_API_KEY?.trim())
}

export function getDvlaApiKey() {
  return process.env.DVLA_API_KEY?.trim() || null
}

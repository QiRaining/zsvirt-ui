const STABLE_UUID = '00000000-0000-4000-8000-000000000000'

export function getListLen(): number {
  const raw = process.env.ZSV_MOCK_LIST_LEN
  const n = raw ? Number.parseInt(raw, 10) : Number.NaN
  return Number.isFinite(n) && n >= 0 ? n : 3
}

export const mockResolvers: Record<string, () => unknown> = {
  String: () => 'mock-string',
  Int: () => 1,
  Float: () => 1,
  Boolean: () => true,
  ID: () => STABLE_UUID,
  UUID: () => STABLE_UUID,
  Timestamp: () => Date.now(),
  Date: () => new Date().toISOString(),
  DateTime: () => new Date().toISOString(),
  JSON: () => ({}),
  JSONObject: () => ({})
}

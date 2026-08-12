type Env = Partial<Record<string, string | undefined>>

const DEFAULT_ZSV_BFF_BASE_PORT = 3100

const parseConfiguredPort = (value: string | undefined): number | undefined => {
  if (value === undefined) {
    return undefined
  }

  const port = Number(value)
  if (!Number.isInteger(port) || port <= 0 || port >= 65536) {
    throw new Error(`ZSV_BFF_PORT must be an integer between 1 and 65535, received: ${value}`)
  }

  return port
}

export const getZsvBffPort = (env: Env = process.env): number => {
  return parseConfiguredPort(env.ZSV_BFF_PORT) ?? DEFAULT_ZSV_BFF_BASE_PORT
}

type Env = Partial<Record<string, string | undefined>>;

const DEFAULT_BFF_PORT = 3100;

const parseConfiguredPort = (value: string | undefined): number | undefined => {
  if (value === undefined) {
    return undefined;
  }

  const port = Number(value);
  if (!Number.isInteger(port) || port <= 0 || port >= 65536) {
    throw new Error(
      `ZSV_BFF_PORT must be an integer between 1 and 65535, received: ${value}`,
    );
  }

  return port;
};

export const getConfiguredZsvBffPort = (env: Env = process.env): number => {
  return parseConfiguredPort(env.ZSV_BFF_PORT) ?? DEFAULT_BFF_PORT;
};

export const getLocalZsvBffServer = (
  host = "127.0.0.1",
  env: Env = process.env,
): string => {
  return `http://${host}:${getConfiguredZsvBffPort(env)}`;
};

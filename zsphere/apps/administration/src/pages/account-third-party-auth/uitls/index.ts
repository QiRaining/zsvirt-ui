import { LdapServerType } from "@zstack/zsphere-types";
import type {
  AccountThirdPartyAuth as IAccountThirdPartyAuth,
  ThirdPartyAuthVO as IThirdPartyAuthVO,
} from "@zstack/zsphere-types/graphql";

import { ServerType } from "../constant";

export const getSsoType = (
  current?: Partial<IAccountThirdPartyAuth & IThirdPartyAuthVO>,
) => {
  // OIDC 和 OAuth2 都是 OAuth2 类型
  const isOIDC = current?.type === ServerType.OAuth2;

  const isLdapServer = [
    LdapServerType.OpenLdap,
    LdapServerType.WindowsAD,
  ].includes(current?.serverType as LdapServerType);

  return { isOIDC, isLdapServer };
};

export const extractIpAndPort = (url: string) => {
  let ip: string | undefined;
  let port: string | undefined;

  if (!url) {
    return { ip, port };
  }

  const regex = /(?<=:\/\/)(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::(\d+))?/;
  const match = url.match(regex);

  if (match) {
    ip = match[1];
    port = match[2] || ""; // 如果没有端口号，默认为空字符串
  }

  return { ip, port };
};

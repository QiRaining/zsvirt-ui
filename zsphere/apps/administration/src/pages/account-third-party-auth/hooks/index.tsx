import { useIntl } from "react-intl";

import { ServerType } from "../constant";

export const useServerType = () => {
  const intl = useIntl();

  const serverTypeMap = new Map<ServerType, string>([
    [
      ServerType.OIDC,
      intl.formatMessage({ id: "OIDC", defaultMessage: "OIDC" }),
    ],
    [ServerType.AD, intl.formatMessage({ id: "AD", defaultMessage: "AD" })],
    [
      ServerType.LDAP,
      intl.formatMessage({ id: "LDAP", defaultMessage: "LDAP" }),
    ],
  ]);

  const serverTypeList = [...serverTypeMap.entries()].map(([key, label]) => ({
    key,
    label,
  }));

  return { serverTypeMap, serverTypeList };
};

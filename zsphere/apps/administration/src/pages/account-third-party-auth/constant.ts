export enum ServerType {
  AD = "WindowsAD",
  LDAP = "OpenLdap",
  OIDC = "OIDC",
  OAuth2 = "OAuth2",
  CAS = "CAS",
}

export default {
  [ServerType.AD]: {
    logonAttributeList: [
      { value: "cn" },
      { value: "displayname" },
      { value: "distinguishedName" },
      { value: "mail" },
      { value: "name" },
      { value: "sAMAccountName" },
      { value: "telephoneNumber" },
      { value: "userPrincipalName" },
    ],
  },
  [ServerType.LDAP]: {
    logonAttributeList: [
      { value: "cn" },
      { value: "dc" },
      { value: "displayName" },
      { value: "entryDN" },
      { value: "mail" },
      { value: "mobile" },
      { value: "uid" },
    ],
  },
  [ServerType.OIDC]: {
    logonAttributeList: [
      { value: "cn" },
      { value: "dc" },
      { value: "displayName" },
      { value: "entryDN" },
      { value: "mail" },
      { value: "mobile" },
      { value: "uid" },
    ],
  },
  [ServerType.OAuth2]: {
    logonAttributeList: [
      { value: "cn" },
      { value: "dc" },
      { value: "displayName" },
      { value: "entryDN" },
      { value: "mail" },
      { value: "mobile" },
      { value: "uid" },
    ],
  },
};

export const createServerName = window.location.hostname;
export const SSO_URL = window.location.origin;
export const SERVER_NAME = `http://${createServerName}:8080/`;

//用于sso传给后端的模板
export const getSSOURLTemplate = (ssoUrl = SSO_URL) => {
  return (
    `${ssoUrl}` +
    "/oauth1/verify/?username=${username}&sessionId=${sessionId}&userUuid=${userUuid}&accountUuid=${accountUuid}&loginType=${loginType}&userType=${userType}"
  );
};

export const SSO_URL_TEMPLATE =
  `${SSO_URL}` +
  "/oauth1/verify/?username=${username}&sessionId=${sessionId}&userUuid=${userUuid}&accountUuid=${accountUuid}&loginType=${loginType}&userType=${userType}";

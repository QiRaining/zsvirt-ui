import { useRequest } from "ahooks";
import { useIntl } from "react-intl";

import { fetchSsoClients, getPrimarySsoLoginUrl } from "./sso-client";

import style from "./style.module.less";

const ThirdPartyLogin = () => {
  const intl = useIntl();

  const { data } = useRequest(fetchSsoClients);
  const loginUrl = getPrimarySsoLoginUrl(data);

  if (loginUrl) {
    return (
      <div className={style["third-party-login"]}>
        <a href={loginUrl}>
          {intl.formatMessage({
            id: "third.party.login",
            defaultMessage: "Unified Identity Authentication",
          })}
        </a>
      </div>
    );
  }
  return null;
};

ThirdPartyLogin.displayName = "ThirdPartyLogin";

export default ThirdPartyLogin;

import { usePlatformStore } from "@zstack/zsphere-platform-store";
import type { FC } from "react";
import { useIntl } from "react-intl";

import ExceptionBase from "./exception-base";
import noRootImage from "./images/no-root.webp";

const clearReloginState = () => {
  [
    "currentUser",
    "currentZone",
    "loginType",
    "TOKEN",
    "sessionId",
    "authList",
    "agentVoucher",
  ].forEach((key) => localStorage.removeItem(key));
  sessionStorage.clear();
  window.location.replace("/login");
};

const Exception401: FC = () => {
  const intl = useIntl();
  // 分开订阅，避免订阅整个 store
  const currentUser = usePlatformStore((state) => state.currentUser);
  const hasLogin = !!currentUser?.sessionId;

  return (
    <ExceptionBase
      image={noRootImage}
      imageAlt="401"
      title={intl.formatMessage({
        id: "exception.page.401.alert",
        defaultMessage: "You have no access to this page.",
      })}
      description={intl.formatMessage({
        id: "exception.page.401.description",
        defaultMessage: "You do not have permission to view this page. To apply for permission, contact the administrator.",
      })}
      primaryAction={
        window.history.length > 2
          ? {
              label: intl.formatMessage({
                id: "backup.prevPage",
                defaultMessage: "Go Back",
              }),
              onClick: () => window.history.back(),
            }
          : undefined
      }
      secondaryAction={{
        label: intl.formatMessage({
          id: "login.back",
          defaultMessage: "Log in Again",
        }),
        onClick: clearReloginState,
      }}
      hasLogin={hasLogin}
    />
  );
};

export default Exception401;

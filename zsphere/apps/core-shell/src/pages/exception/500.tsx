import { usePlatformStore } from "@zstack/zsphere-platform-store";
import type { FC } from "react";
import { useIntl } from "react-intl";

import ExceptionBase from "./exception-base";
import errorImage from "./images/error.webp";

interface Exception500Props {
  hideBtn?: boolean;
}

const Exception500: FC<Exception500Props> = ({ hideBtn }) => {
  const intl = useIntl();
  // 分开订阅，避免订阅整个 store
  const currentUser = usePlatformStore((state) => state.currentUser);
  const hasLogin = !!currentUser?.sessionId;

  const getPrimaryAction = () => {
    if (hideBtn) {
      return;
    }

    if (hasLogin) {
      if (window.history.length > 2) {
        return {
          label: intl.formatMessage({
            id: "reload",
            defaultMessage: "Reload",
          }),
          onClick: () => window.history.back(),
        };
      }
      return {
        label: intl.formatMessage({
          id: "go.home",
          defaultMessage: "Go to Dashboard",
        }),
        onClick: () => (window.location.href = "/virtualization-dashboard"),
      };
    }

    return {
      label: intl.formatMessage({
        id: "login",
        defaultMessage: "Login",
      }),
      onClick: () => window.location.replace("/login"),
    };
  };

  const getSecondaryAction = () => {
    if (hideBtn) {
      return;
    }

    if (hasLogin && window.history.length > 2) {
      return {
        label: intl.formatMessage({
          id: "go.home",
          defaultMessage: "Go to Dashboard",
        }),
        to: "/virtualization-dashboard",
      };
    }

    return;
  };

  return (
    <ExceptionBase
      image={errorImage}
      imageAlt="500"
      code="500"
      title={intl.formatMessage({
        id: "exception.page.500.alert",
        defaultMessage: "This page isn't working.",
      })}
      primaryAction={getPrimaryAction()}
      secondaryAction={getSecondaryAction()}
      hideActions={hideBtn}
      hasLogin={hasLogin}
    />
  );
};

export default Exception500;

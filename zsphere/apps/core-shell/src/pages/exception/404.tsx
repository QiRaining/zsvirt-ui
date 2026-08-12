import { usePlatformStore } from "@zstack/zsphere-platform-store";
import type { FC } from "react";
import { useIntl } from "react-intl";

import ExceptionBase from "./exception-base";
import errorImage from "./images/error.webp";

const Exception404: FC = () => {
  const intl = useIntl();
  // 分开订阅，避免订阅整个 store
  const currentUser = usePlatformStore((state) => state.currentUser);
  const hasLogin = !!currentUser?.sessionId;

  return (
    <ExceptionBase
      image={errorImage}
      imageAlt="404"
      code="404"
      title={intl.formatMessage({
        id: "exception.page.404.alert",
        defaultMessage: "Page not found.",
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
          id: "go.home",
          defaultMessage: "Go to Dashboard",
        }),
        to: "/virtualization-dashboard",
      }}
      hasLogin={hasLogin}
    />
  );
};

export default Exception404;

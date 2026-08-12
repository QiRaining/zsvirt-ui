import { FC, useCallback, useState } from "react";
import { useIntl } from "react-intl";

import ErrorSvg from "../images/error.webp";

import style from "./style.module.less";

interface MountFailedProps {
  onRetry?: () => void;
}

const MountFailed: FC<MountFailedProps> = ({ onRetry }) => {
  const intl = useIntl();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = useCallback(() => {
    if (!onRetry || retrying) return;
    setRetrying(true);
    onRetry();
    // 给一段时间让重试流程启动，避免按钮闪烁
    setTimeout(() => setRetrying(false), 2000);
  }, [onRetry, retrying]);

  return (
    <div className={style.container}>
      <div className={style.box}>
        <img src={ErrorSvg} alt="500" />
        <p className={style.number}>500</p>
        <p className={style.alert}>
          {intl.formatMessage({
            id: "zmigrate.exception.mount.failed",
            defaultMessage: "Migration Service Load Failed",
          })}
        </p>
        <p className={style.description}>
          {intl.formatMessage({
            id: "zmigrate.exception.mount.failed.description",
            defaultMessage:
              "The migration service micro-app failed to load. Refresh the page and try again, or contact your administrator.",
          })}
        </p>
        {onRetry && (
          <div className={style.btn}>
            <button
              className={style.retryButton}
              onClick={handleRetry}
              disabled={retrying}
            >
              {retrying
                ? intl.formatMessage({
                    id: "zmigrate.exception.retrying",
                    defaultMessage: "Retrying",
                  })
                : intl.formatMessage({
                    id: "zmigrate.exception.retry",
                    defaultMessage: "Retry",
                  })}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MountFailed;

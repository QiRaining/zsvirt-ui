import { FC, useCallback, useState } from "react";
import { useIntl } from "react-intl";

import ErrorSvg from "../images/error.webp";

import style from "./style.module.less";

interface ServiceUnavailableProps {
  onRetry?: () => void;
}

const ServiceUnavailable: FC<ServiceUnavailableProps> = ({ onRetry }) => {
  const intl = useIntl();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = useCallback(() => {
    if (!onRetry || retrying) return;
    setRetrying(true);
    onRetry();
    setTimeout(() => setRetrying(false), 2000);
  }, [onRetry, retrying]);

  return (
    <div className={style.container}>
      <div className={style.box}>
        <img src={ErrorSvg} alt="503" />
        <p className={style.number}>503</p>
        <p className={style.alert}>
          {intl.formatMessage({
            id: "zmigrate.exception.service.unavailable",
            defaultMessage: "Migration Service Unavailable",
          })}
        </p>
        <p className={style.description}>
          {intl.formatMessage({
            id: "zmigrate.exception.service.unavailable.description",
            defaultMessage:
              "The migration service is either not deployed or unreachable. Verify that the migration service is running.",
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

export default ServiceUnavailable;

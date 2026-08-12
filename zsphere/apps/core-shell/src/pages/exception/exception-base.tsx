import { Button } from "@zstack/design";
import type { FC } from "react";
import { Link } from "react-router";

import style from "./style.module.less";

export interface ExceptionBaseProps {
  image: string;
  imageAlt: string;
  code?: string;
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    to?: string;
    onClick?: () => void;
  };
  hideActions?: boolean;
  hasLogin?: boolean;
}

const ExceptionBase: FC<ExceptionBaseProps> = ({
  image,
  imageAlt,
  code,
  title,
  description,
  primaryAction,
  secondaryAction,
  hideActions = false,
  hasLogin = true,
}) => {
  return (
    <div className={style.container}>
      <div className={style.box}>
        <img src={image} alt={imageAlt} />

        {code && <p className={style.number}>{code}</p>}

        <p className={description ? style.alert : style["second-alert"]}>
          {title}
        </p>

        {description && <p className={style.description}>{description}</p>}

        {!hideActions && primaryAction && (
          <p className={hasLogin ? style.btn : style.unLoginBtn}>
            <Button variant="primary" onClick={primaryAction.onClick}>
              {primaryAction.label}
            </Button>
          </p>
        )}

        {!hideActions && secondaryAction && (
          <p className={hasLogin ? style.link : style.unLoginLink}>
            {secondaryAction.to ? (
              <Link to={secondaryAction.to}>{secondaryAction.label}</Link>
            ) : (
              <a onClick={secondaryAction.onClick}>{secondaryAction.label}</a>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default ExceptionBase;

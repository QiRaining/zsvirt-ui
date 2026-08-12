import classNames from "classnames";
import React, { useMemo } from "react";

import { getBaseCls } from "../../../_utils/common";

import "./style.less";
import resultError from "../../../assets/modal/result-error.webp";
import resultSuccess from "../../../assets/modal/result-success.svg";

export interface IBaseResultProps {
  resultType?: "error" | "success";
  resultTitle: string | React.ReactNode;
  resultTip?: string | React.ReactNode;
  resultMessage?: string | object | React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const baseCls = getBaseCls("modal-base-result");

const resultImages = {
  success: resultSuccess,
  error: resultError,
};

const BaseResult: React.FC<IBaseResultProps> = ({
  resultType = "success",
  resultTitle,
  resultTip,
  resultMessage,
  className,
  style,
}) => {
  const msg = useMemo(() => {
    if (!resultMessage) {
      return;
    }

    return resultType === "success" ? (
      <div className={`${baseCls}-content-message-success`}>
        {typeof resultMessage === "object" &&
        !React.isValidElement(resultMessage)
          ? JSON.stringify(resultMessage, null, 2)
          : (resultMessage as React.ReactNode)}
      </div>
    ) : (
      <div className={`${baseCls}-content-message-error`}>
        {React.isValidElement(resultMessage)
          ? resultMessage
          : JSON.stringify(resultMessage, null, 2)}
      </div>
    );
  }, [resultMessage, resultType]);

  return (
    <div className={classNames(`${baseCls}-content`, className)} style={style}>
      <img
        className={`${baseCls}-content-img`}
        src={resultImages[resultType]}
        alt=""
      />
      <div className={`${baseCls}-content-title`}>{resultTitle}</div>
      {resultMessage && resultTip ? (
        <div className={`${baseCls}-content-tip`}>{resultTip}</div>
      ) : null}
      {msg}
    </div>
  );
};

export default BaseResult;

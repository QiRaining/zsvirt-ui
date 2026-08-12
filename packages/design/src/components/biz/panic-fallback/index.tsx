"use client";
import { useIntl } from "react-intl";

import { Button } from "../../primitive/button";
import PanicSvg from "./panic.svg?react";

export const PanicFallback = () => {
  const intl = useIntl();
  return (
    <div className="flex h-full w-full items-center justify-center bg-neutral-100">
      <div
        role="alert"
        className="bg-neutral-0 box-border flex h-102 w-148 flex-col items-center rounded-xs px-20 pt-15 shadow-sm"
      >
        <PanicSvg style={{ display: "block" }} />
        <h1 className="mb-3 text-xl text-neutral-800">
          {intl.formatMessage({
            id: "error.boundary.title",
            defaultMessage: "出错了",
          })}
        </h1>
        <p className="mt-0 mb-10 text-sm text-neutral-600">
          {intl.formatMessage({
            id: "error.boundary.detail",
            defaultMessage:
              "发生了一个未知异常，请尝试刷新页面，或者联系我们的客服人员以获取帮助",
          })}
        </p>
        <Button
          className="mb-3"
          onClick={() => {
            if (typeof window !== "undefined") {
              window?.location.reload();
            }
          }}
        >
          {intl.formatMessage({
            id: "error.boundary.reload",
            defaultMessage: "重新加载",
          })}
        </Button>
        <Button
          variant="link"
          onClick={() => {
            if (typeof window !== "undefined") {
              window?.history.back();
            }
          }}
        >
          {intl.formatMessage({
            id: "error.boundary.back",
            defaultMessage: "返回上一页",
          })}
        </Button>
      </div>
    </div>
  );
};

import { Button } from "@zstack/design";
import React from "react";
import { useIntl } from "react-intl";

const panicImageUrl = new URL("./assets/panic.webp", import.meta.url).href;

export interface PanicFallbackProps {
  className?: string;
  errorImage?: string;
  title?: string;
  description?: string;
  reloadText?: string;
  backText?: string;
  showReloadButton?: boolean;
  showBackButton?: boolean;
  onReload?: () => void;
  onBack?: () => void;
}

const goBackAndReload = () => {
  const currentPath = window.location.pathname;

  const getMainRoute = (path: string) => {
    const trimmedPath = path.startsWith("/") ? path.substring(1) : path;
    return `/${trimmedPath.split("/")[0]}`;
  };

  const isSameMainRoute = (_currentPath: string, _newPath: string) => {
    const currentMainRoute = getMainRoute(_currentPath);
    const newMainRoute = getMainRoute(_newPath);
    return currentMainRoute === newMainRoute && currentMainRoute !== "/";
  };

  const handlePopstate = () => {
    window.removeEventListener("popstate", handlePopstate);
    const newPath = window.location.pathname;

    if (isSameMainRoute(currentPath, newPath)) {
      window.location.reload();
    }
  };

  window.addEventListener("popstate", handlePopstate);
  window.history.back();
};

const joinClassNames = (...classNames: Array<string | undefined>) =>
  classNames.filter(Boolean).join(" ");

export const PanicFallback: React.FC<PanicFallbackProps> = ({
  className,
  errorImage,
  title,
  description,
  reloadText,
  backText,
  showReloadButton = true,
  showBackButton = true,
  onReload,
  onBack,
}) => {
  const intl = useIntl();

  const handleReload = () => {
    if (onReload) {
      onReload();
      return;
    }

    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    if (typeof window !== "undefined") {
      goBackAndReload();
    }
  };

  return (
    <div
      className={joinClassNames(
        "flex h-full min-h-screen w-full items-center justify-center bg-neutral-100",
        className,
      )}
    >
      <div
        role="alert"
        className="box-border flex flex-col items-center px-6 text-center"
      >
        <img
          src={errorImage ?? panicImageUrl}
          alt="panic"
          className="mb-3 block h-30 w-auto object-contain"
        />

        <h1 className="mb-3 text-xl font-semibold text-neutral-800">
          {title ??
            intl.formatMessage({
              id: "error.boundary.title",
              defaultMessage: "出错了",
            })}
        </h1>
        <p className="mt-0 mb-4 max-w-[595px] text-sm leading-[22px] text-neutral-600">
          {description ??
            intl.formatMessage({
              id: "error.boundary.detail",
              defaultMessage:
                "发生了一个未知异常，请尝试刷新页面，或者联系我们的客服人员以获取帮助",
            })}
        </p>

        <div className="flex items-center justify-center gap-3">
          {showReloadButton && (
            <Button className="min-h-[32px]" onClick={handleReload}>
              {reloadText ??
                intl.formatMessage({
                  id: "error.boundary.reload",
                  defaultMessage: "重新加载",
                })}
            </Button>
          )}
          {showBackButton && (
            <Button variant="link" onClick={handleBack}>
              {backText ??
                intl.formatMessage({
                  id: "error.boundary.back",
                  defaultMessage: "返回上一页",
                })}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

PanicFallback.displayName = "PanicFallback";

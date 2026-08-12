import type {
  OpenUploadConfirmModal,
  UploadConfirmModalHandle,
} from "@zstack/zsphere-hooks";
import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { RawIntlProvider } from "react-intl";

import Confirm from "../a-cloud-old-components/modal/confirm";

export const openZsvUploadConfirmModal: OpenUploadConfirmModal = ({
  intl,
  title,
  content,
  onOk,
  onCancel,
  cancelable = true,
  zIndex,
}) => {
  if (typeof document === "undefined") {
    return null;
  }

  const container = document.createElement("div");
  document.body.appendChild(container);

  const root: Root = createRoot(container);
  let destroyed = false;

  const destroy: UploadConfirmModalHandle["destroy"] = () => {
    if (destroyed) {
      return;
    }
    destroyed = true;
    window.setTimeout(() => {
      root.unmount();
      container.remove();
    }, 0);
  };

  const setVisible = (visible: boolean) => {
    if (!visible) {
      destroy();
    }
  };

  root.render(
    React.createElement(
      RawIntlProvider,
      { value: intl },
      React.createElement(Confirm, {
        alertMessage: content,
        alertType: "warning",
        cancelable,
        setVisible,
        title,
        visible: true,
        zIndex,
        onCancel: () => {
          onCancel?.();
          destroy();
        },
        onOk: () => {
          onOk?.();
        },
      }),
    ),
  );

  return { destroy };
};

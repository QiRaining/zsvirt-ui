import { DialogWeak } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { CertInfo } from "@zstack/zsphere-types/graphql";
import React, { useCallback } from "react";
import { useIntl } from "react-intl";

import { reset } from "../gql/cert.gql";

export default function RestoreDefault({
  visible,
  setVisible,
}: IActionWrapperProps<CertInfo>) {
  const intl = useIntl();
  const doAction = useAction();
  const submitHandle = useCallback(() => {
    doAction({
      mutation: reset,
      payload: "",
      name: intl.formatMessage({
        id: "cert.restore.http.actionName",
        defaultMessage: "Switch to HTTP",
      }),
      total: 1,
      type: "https.certificate",
      onFinish: (result) => {
        if (result.success === result.total) {
          setTimeout(() => {
            const url = new URL(window.location.href);
            const currentPath = url.pathname;
            url.protocol = "http:";
            url.port = "";
            url.pathname = "/login";
            url.search = "";
            url.searchParams.set("lang", intl.locale);
            url.searchParams.set("redirect", currentPath);
            window.location.replace(url);
          }, 1000);
        }
      },
    });
  }, [doAction, intl]);
  return (
    <DialogWeak
      type="warning"
      title={intl.formatMessage({
        id: "cert.restore.http.title",
        defaultMessage: "Switch to HTTP Login?",
      })}
      visible={visible}
      setVisible={setVisible}
      onConfirm={submitHandle}
      description={intl.formatMessage({
        id: "cert.restore.http.description",
        defaultMessage:
          "Switching to HTTP access may pose risks of data leakage and security breaches. Proceed with caution. To ensure data security, it's recommended to continue using HTTPS protocol for accessing.",
      })}
    />
  );
}

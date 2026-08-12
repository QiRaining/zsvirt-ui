import React, { useCallback, useRef } from "react";
import { useIntl } from "react-intl";

import ActionModal, { IProps as IModalProps, IResource } from "./index";

export interface IProps extends Omit<
  IModalProps,
  "resourceName" | "resourceList" | "visible" | "setVisible"
> {
  notSupportedList: IResource[];
  resourceName?: string;
}

export function useNotSupportedAction() {
  const intl = useIntl();
  const promiseRef = useRef<{
    resolve: (value: void | PromiseLike<void>) => void;
    reject: (reason?: any) => void;
  }>();

  const getSkipModal = useCallback(
    (params: IProps) => {
      const {
        onOk: originOk,
        onCancel: originCancel,
        notSupportedList = [],
        resourceName = "",
        ...rest
      } = params;

      const wrapperOnOk: IModalProps["onOk"] = (...args) => {
        originOk?.(...args);
        promiseRef.current?.resolve?.();
      };
      const wrapperOnCancel: IModalProps["onCancel"] = (...args) => {
        originCancel?.(...args);
        promiseRef.current?.reject?.();
      };
      console.log("debug debug");
      const SkipModal: React.FC<{ visible: boolean }> = ({ visible }) => (
        <ActionModal
          onOkText={intl.formatMessage({
            id: "skipAndContinue",
            defaultMessage: "Skip and Continue",
          })}
          selectMessage={intl.formatMessage(
            {
              id: "notSupportedCount.X",
              defaultMessage: "You could not perform this operation on these {total} items:",
            },
            { total: notSupportedList.length },
          )}
          {...rest}
          visible={visible}
          setVisible={() => {}}
          resourceList={notSupportedList}
          resourceName={resourceName}
          onOk={wrapperOnOk}
          onCancel={wrapperOnCancel}
        />
      );

      const isContinue = () =>
        new Promise<void>((resolve, reject) => {
          promiseRef.current = { resolve, reject };
        });

      return {
        SkipModal,
        isContinue,
      };
    },
    [intl],
  );

  return {
    getSkipModal,
  };
}

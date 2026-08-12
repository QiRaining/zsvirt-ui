import { DialogWeakP1 } from "@zstack/zsphere-design-biz";
import React, { useRef, useState, useCallback } from "react";

type ConfirmPromise = Promise<void> & {
  resolve?: () => void;
  reject?: () => void;
};

export interface IModalProps {
  alertMessage?: string;
  children?: any;
  confirmInputText?: string;
}

export default function useConfirm(modalProps?: Partial<IModalProps>) {
  const [confirmVisible, setConfirmVisible] = useState(false);
  const confirmPromiseRef = useRef<ConfirmPromise | null>(null);

  const waitConfirm = useCallback(async () => {
    let resolve: (() => void) | undefined;
    let reject: (() => void) | undefined;
    const confirmPromise: ConfirmPromise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    confirmPromise.resolve = resolve;
    confirmPromise.reject = reject;
    confirmPromiseRef.current = confirmPromise;
    setConfirmVisible(true);
    await confirmPromise;
  }, []);

  const confirmProps = {
    visible: confirmVisible,
    setVisible: setConfirmVisible,
    onConfirm: () => confirmPromiseRef.current?.resolve?.(),
    onCancel: () => confirmPromiseRef.current?.reject?.(),
  };

  const confirmModal = (
    <DialogWeakP1
      type="warning"
      title={String(modalProps?.alertMessage ?? "")}
      description={modalProps?.children}
      {...confirmProps}
    />
  );

  return { waitConfirm, confirmModal, confirmProps };
}

import { useState, useCallback } from "react";

import type { ConfirmModalType } from "../types";

export interface ModalState {
  isUploadModalVisible: boolean;
  isInstallModalVisible: boolean;
  isOperationLogVisible: boolean;
  confirmModalType: ConfirmModalType;
}

export interface ModalActions {
  openUploadModal: () => void;
  closeUploadModal: () => void;
  openInstallModal: () => void;
  closeInstallModal: () => void;
  openOperationLog: () => void;
  closeOperationLog: () => void;
  setConfirmModalType: (type: ConfirmModalType) => void;
}

export const useModalState = (): [ModalState, ModalActions] => {
  const [state, setState] = useState<ModalState>({
    isUploadModalVisible: false,
    isInstallModalVisible: false,
    isOperationLogVisible: false,
    confirmModalType: null,
  });

  const actions: ModalActions = {
    openUploadModal: useCallback(
      () => setState((s) => ({ ...s, isUploadModalVisible: true })),
      [],
    ),
    closeUploadModal: useCallback(
      () => setState((s) => ({ ...s, isUploadModalVisible: false })),
      [],
    ),
    openInstallModal: useCallback(
      () => setState((s) => ({ ...s, isInstallModalVisible: true })),
      [],
    ),
    closeInstallModal: useCallback(
      () => setState((s) => ({ ...s, isInstallModalVisible: false })),
      [],
    ),
    openOperationLog: useCallback(
      () => setState((s) => ({ ...s, isOperationLogVisible: true })),
      [],
    ),
    closeOperationLog: useCallback(
      () => setState((s) => ({ ...s, isOperationLogVisible: false })),
      [],
    ),
    setConfirmModalType: useCallback(
      (type: ConfirmModalType) =>
        setState((s) => ({ ...s, confirmModalType: type })),
      [],
    ),
  };

  return [state, actions];
};

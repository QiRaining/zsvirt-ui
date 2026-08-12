import React, { useCallback } from "react";
import OperationDetail from "zsv_shared/operation-log/detail";

import {
  ConfirmModal,
  UploadPackageModal,
  InstallServiceModal,
} from "../action";
import type { ModalState, ModalActions } from "../hooks/use-modal-state";
import type { MigrationPackageData } from "../types";
import { openUploadAfterCleanup } from "./reupload-orchestration";

interface ModalsContainerProps {
  modalState: ModalState;
  modalActions: ModalActions;
  packageData?: MigrationPackageData;
  currentActionId: string;
  startPolling: () => void;
  resetStatus: (options: { onFinish: () => void }) => void;
  checkBackupStorageBeforeUpload?: () => Promise<boolean>;
}

const ModalsContainer: React.FC<ModalsContainerProps> = ({
  modalState,
  modalActions,
  packageData,
  currentActionId,
  startPolling,
  resetStatus,
  checkBackupStorageBeforeUpload,
}) => {
  const handleConfirmReupload = useCallback(async () => {
    if (checkBackupStorageBeforeUpload) {
      const hasStorage = await checkBackupStorageBeforeUpload();
      if (!hasStorage) return;
    }
    openUploadAfterCleanup({
      resetStatus,
      openUpload: modalActions.openUploadModal,
    });
  }, [resetStatus, checkBackupStorageBeforeUpload, modalActions]);

  const handleProceedWithUpload = useCallback(async () => {
    if (checkBackupStorageBeforeUpload) {
      const hasStorage = await checkBackupStorageBeforeUpload();
      if (!hasStorage) return;
    }
    modalActions.openUploadModal();
  }, [checkBackupStorageBeforeUpload, modalActions]);

  return (
    <>
      {modalState.isUploadModalVisible && (
        <UploadPackageModal
          visible={modalState.isUploadModalVisible}
          setVisible={(v: boolean) => {
            if (!v) modalActions.closeUploadModal();
          }}
          onActionStartPolling={startPolling}
        />
      )}

      {modalState.isInstallModalVisible && (
        <InstallServiceModal
          visible={modalState.isInstallModalVisible}
          setVisible={(v: boolean) => {
            if (!v) modalActions.closeInstallModal();
          }}
          packageData={packageData}
          onActionStartPolling={startPolling}
        />
      )}

      {modalState.isOperationLogVisible && (
        <OperationDetail
          visible={modalState.isOperationLogVisible}
          setVisible={(v: boolean) => {
            if (!v) modalActions.closeOperationLog();
          }}
          actionId={currentActionId}
        />
      )}

      <ConfirmModal
        type={modalState.confirmModalType}
        onClose={() => modalActions.setConfirmModalType(null)}
        onConfirmReupload={handleConfirmReupload}
        onProceedWithUpload={handleProceedWithUpload}
      />
    </>
  );
};

export default ModalsContainer;

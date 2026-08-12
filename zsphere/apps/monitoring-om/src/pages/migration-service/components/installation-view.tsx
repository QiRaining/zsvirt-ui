import { gql, useLazyQuery } from "@apollo/client";
import { DialogWeak } from "@zstack/zsphere-design-biz";
import React, { useCallback, useState } from "react";
import { useIntl } from "react-intl";

import type { ModalState, ModalActions } from "../hooks/use-modal-state";
import type { StepType, TaskStatus, MigrationPackageData } from "../types";
import FunctionIntroCard from "./function-intro-card";
import InstallationDeployCard from "./installation-deploy-card";
import ModalsContainer from "./modals-container";

const CHECK_BACKUP_STORAGE_AVAILABLE = gql`
  query checkBackupStorageAvailable($conditions: [Condition!]) {
    backupStorageList(conditions: $conditions, limit: 1, replyWithCount: true) {
      total
    }
  }
`;

interface InstallationViewProps {
  currentStep: StepType;
  taskStatus: TaskStatus;
  packageData?: MigrationPackageData;
  currentActionId: string;
  startPolling: () => void;
  resetStatus: (options: { onFinish: () => void }) => void;
  refreshActionLogs: () => void;
  modalState: ModalState;
  modalActions: ModalActions;
}

const InstallationView: React.FC<InstallationViewProps> = ({
  currentStep,
  taskStatus,
  packageData,
  currentActionId,
  startPolling,
  resetStatus,
  refreshActionLogs,
  modalState,
  modalActions,
}) => {
  const intl = useIntl();
  const [noBackupStorageVisible, setNoBackupStorageVisible] = useState(false);

  const [fetchBackupStorage] = useLazyQuery(CHECK_BACKUP_STORAGE_AVAILABLE, {
    fetchPolicy: "no-cache",
  });

  const checkBackupStorageBeforeUpload = useCallback(async () => {
    try {
      const { data } = await fetchBackupStorage({
        variables: {
          conditions: [
            { key: "state", op: "eq", value: "Enabled" },
            { key: "status", op: "eq", value: "Connected" },
          ],
        },
      });
      const total = data?.backupStorageList?.total ?? 0;
      if (total === 0) {
        setNoBackupStorageVisible(true);
        return false;
      }
      return true;
    } catch {
      return true;
    }
  }, [fetchBackupStorage]);

  const handleStepProgression = useCallback(async () => {
    switch (currentStep) {
      case "upload": {
        const hasStorage = await checkBackupStorageBeforeUpload();
        if (hasStorage) {
          modalActions.openUploadModal();
        }
        break;
      }
      case "install":
        modalActions.openInstallModal();
        break;
      default:
        break;
    }
  }, [currentStep, checkBackupStorageBeforeUpload, modalActions]);

  const handleViewOperationLog = useCallback(() => {
    refreshActionLogs();
    modalActions.openOperationLog();
  }, [refreshActionLogs, modalActions]);

  const handleReuploadClick = useCallback(() => {
    modalActions.setConfirmModalType("ReuploadConfirmation");
  }, [modalActions]);

  return (
    <div style={{ padding: "24px" }}>
      <FunctionIntroCard />

      <InstallationDeployCard
        currentStep={currentStep}
        taskStatus={taskStatus}
        onStepProgression={handleStepProgression}
        onReuploadClick={handleReuploadClick}
        onViewOperationLog={handleViewOperationLog}
      />

      <ModalsContainer
        modalState={modalState}
        modalActions={modalActions}
        packageData={packageData}
        currentActionId={currentActionId}
        startPolling={startPolling}
        resetStatus={resetStatus}
        checkBackupStorageBeforeUpload={checkBackupStorageBeforeUpload}
      />

      {noBackupStorageVisible && (
        <DialogWeak
          type="warning"
          visible={noBackupStorageVisible}
          setVisible={setNoBackupStorageVisible}
          title={intl.formatMessage({
            id: "migration.upload.no.backup.storage.title",
            defaultMessage: "Cannot Upload Migration Service Package",
          })}
          description={intl.formatMessage({
            id: "migration.upload.no.backup.storage.content",
            defaultMessage:
              "Uploading the installation package requires image storage resources. No available image storage was detected on the platform. Add image storage first, then upload again.",
          })}
          onConfirm={() => setNoBackupStorageVisible(false)}
        />
      )}
    </div>
  );
};

export default InstallationView;

import React from "react";

import { InstallationView } from "../components";
import { useOperationLogActionId, useModalState } from "../hooks";
import type { MigrationPackageStatusResult } from "../hooks/use-migration-package-status";

interface MigrationInitProps {
  packageStatus: MigrationPackageStatusResult;
}

const MigrationInit: React.FC<MigrationInitProps> = ({ packageStatus }) => {
  const [modalState, modalActions] = useModalState();

  const { currentStep, taskStatus, resetStatus, packageData, startPolling } =
    packageStatus;

  const { currentActionId, refreshActionLogs } = useOperationLogActionId({
    currentStep,
    taskStatus,
    packageData,
  });

  return (
    <InstallationView
      currentStep={currentStep}
      taskStatus={taskStatus}
      packageData={packageData}
      currentActionId={currentActionId}
      startPolling={startPolling}
      resetStatus={resetStatus}
      refreshActionLogs={refreshActionLogs}
      modalState={modalState}
      modalActions={modalActions}
    />
  );
};

export default MigrationInit;

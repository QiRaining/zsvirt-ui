import { Spin } from "@zstack/design";
import { Header } from "@zstack/zsphere-components";
import { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import { ClearServiceDialog } from "./components/clear-service-dialog";
import { DeploymentWizard } from "./components/deployment-wizard";
import { ServiceOverviewCard } from "./components/service-overview-card";
import { TaskLogDialog } from "./components/task-log-dialog";
import type { DisasterRecoveryServicePrimaryAction } from "./types";
import { useDisasterRecoveryService } from "./use-disaster-recovery-service";
import { getPrimaryAction, shouldShowSetupWizard } from "./utils";

export default function DisasterRecoveryServicePage() {
  const intl = useIntl();
  const [taskLogOpen, setTaskLogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const {
    service,
    loading,
    prepareUpload,
    uploadPackage,
    installService,
    initializeSite,
    recheck,
    retry,
    forceClear,
  } = useDisasterRecoveryService();

  const primaryAction = useMemo<DisasterRecoveryServicePrimaryAction>(
    () =>
      service
        ? getPrimaryAction(service.status)
        : { key: "none", disabled: true },
    [service],
  );
  const showSetupWizard = service
    ? shouldShowSetupWizard(service.status)
    : false;

  const handlePrimaryAction = () => {
    if (!service) {
      return;
    }

    switch (primaryAction.key) {
      case "open-zlr":
        window.open(service.managementAddress, "_blank", "noopener,noreferrer");
        break;
      case "retry":
        void retry();
        break;
      case "view-blockers":
        setClearDialogOpen(true);
        break;
      case "prepare-upload":
      case "upload-package":
      case "install-service":
      case "initialize-site":
        setTaskLogOpen(true);
        break;
      case "view-task":
      case "none":
        setTaskLogOpen(true);
        break;
    }
  };

  const handleClearService = () => {
    setClearDialogOpen(true);
  };

  const handleConfirmClear = async () => {
    await forceClear();
    setClearDialogOpen(false);
  };

  return (
    <div className="main-list-header-tabs-container main-list-header-tabs-detail">
      <Header.List
        title={intl.formatMessage({
          id: "virtualization.disaster.recovery.service",
          defaultMessage: "Disaster Recovery Service",
        })}
      />
      {!service && (
        <div className="flex min-h-[320px] items-center justify-center">
          <Spin
            fullscreen={false}
            spinning={loading}
            tip={intl.formatMessage({
              id: "common.loading",
              defaultMessage: "Loading",
            })}
          />
        </div>
      )}
      {service && showSetupWizard && (
        <DeploymentWizard
          service={service}
          onPrepareUpload={prepareUpload}
          onInitializeSite={initializeSite}
          onInstallService={installService}
          onUploadPackage={uploadPackage}
          onViewTasks={() => setTaskLogOpen(true)}
        />
      )}
      {service && !showSetupWizard && (
        <div className="p-6">
          <ServiceOverviewCard
            service={service}
            primaryAction={primaryAction}
            onClearService={handleClearService}
            onPrimaryAction={handlePrimaryAction}
            onRecheck={recheck}
            onViewTasks={() => setTaskLogOpen(true)}
          />
        </div>
      )}

      {service && (
        <TaskLogDialog
          open={taskLogOpen}
          logs={service.taskLogs}
          onOpenChange={setTaskLogOpen}
        />
      )}
      {service && (
        <ClearServiceDialog
          open={clearDialogOpen}
          blockers={service.status === "clear-blocked" ? service.blockers : []}
          onOpenChange={setClearDialogOpen}
          onConfirmClear={handleConfirmClear}
        />
      )}
    </div>
  );
}

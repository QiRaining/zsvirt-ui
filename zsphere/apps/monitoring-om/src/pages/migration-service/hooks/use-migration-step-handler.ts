import { useCallback } from "react";

import type { StepType } from "../types";

export const useMigrationStepHandler = ({
  currentStep,
  setIsUploadModalVisible,
  setIsInstallModalVisible,
}: {
  currentStep: StepType;
  setIsUploadModalVisible: (visible: boolean) => void;
  setIsInstallModalVisible: (visible: boolean) => void;
}) => {
  return useCallback(() => {
    switch (currentStep) {
      case "upload":
        setIsUploadModalVisible(true);
        break;
      case "install":
        setIsInstallModalVisible(true);
        break;
      default:
        break;
    }
  }, [currentStep, setIsUploadModalVisible, setIsInstallModalVisible]);
};

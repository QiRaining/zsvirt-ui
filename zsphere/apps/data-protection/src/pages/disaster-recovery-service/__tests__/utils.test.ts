import { describe, expect, it } from "vitest";

import {
  getNextMockStatus,
  getPrimaryAction,
  getCurrentSetupStep,
  getServiceProgress,
  getSetupStepState,
  getSetupStepIndex,
  isServiceBusy,
  shouldShowSetupWizard,
} from "../utils";

describe("disaster recovery service status helpers", () => {
  it("advances the mock installation flow until the service is running", () => {
    expect(getNextMockStatus("not-installed")).toBe("package-missing");
    expect(getNextMockStatus("package-missing")).toBe("uploading");
    expect(getNextMockStatus("uploading")).toBe("package-uploaded");
    expect(getNextMockStatus("package-uploaded")).toBe("installing");
    expect(getNextMockStatus("installing")).toBe("initialization-required");
    expect(getNextMockStatus("initialization-required")).toBe("initializing");
    expect(getNextMockStatus("initializing")).toBe("running");
    expect(getNextMockStatus("running")).toBe("running");
  });

  it("keeps blocking or terminal states controlled by explicit user action", () => {
    expect(getNextMockStatus("abnormal")).toBe("abnormal");
    expect(getNextMockStatus("upgrade-in-progress")).toBe(
      "upgrade-in-progress",
    );
    expect(getNextMockStatus("clear-blocked")).toBe("clear-blocked");
    expect(getNextMockStatus("clearing")).toBe("not-installed");
  });

  it("returns the correct primary action for service states", () => {
    expect(getPrimaryAction("not-installed")).toEqual({
      key: "upload-package",
      disabled: false,
    });
    expect(getPrimaryAction("package-missing")).toEqual({
      key: "upload-package",
      disabled: false,
    });
    expect(getPrimaryAction("package-uploaded")).toEqual({
      key: "install-service",
      disabled: false,
    });
    expect(getPrimaryAction("initialization-required")).toEqual({
      key: "initialize-site",
      disabled: false,
    });
    expect(getPrimaryAction("running")).toEqual({
      key: "open-zlr",
      disabled: false,
    });
    expect(getPrimaryAction("installing")).toEqual({
      key: "view-task",
      disabled: true,
    });
    expect(getPrimaryAction("clear-blocked")).toEqual({
      key: "view-blockers",
      disabled: false,
    });
  });

  it("marks only background task states as busy", () => {
    expect(isServiceBusy("uploading")).toBe(true);
    expect(isServiceBusy("installing")).toBe(true);
    expect(isServiceBusy("initializing")).toBe(true);
    expect(isServiceBusy("upgrade-in-progress")).toBe(true);
    expect(isServiceBusy("running")).toBe(false);
    expect(isServiceBusy("abnormal")).toBe(false);
  });

  it("maps service states to stable progress percentages", () => {
    expect(getServiceProgress("not-installed")).toBe(0);
    expect(getServiceProgress("package-missing")).toBe(12);
    expect(getServiceProgress("uploading")).toBe(32);
    expect(getServiceProgress("package-uploaded")).toBe(45);
    expect(getServiceProgress("installing")).toBe(62);
    expect(getServiceProgress("initialization-required")).toBe(76);
    expect(getServiceProgress("initializing")).toBe(88);
    expect(getServiceProgress("running")).toBe(100);
  });

  it("keeps users in the setup wizard until the three forms are complete", () => {
    expect(shouldShowSetupWizard("not-installed")).toBe(true);
    expect(shouldShowSetupWizard("package-uploaded")).toBe(true);
    expect(shouldShowSetupWizard("initialization-required")).toBe(true);
    expect(shouldShowSetupWizard("running")).toBe(false);
    expect(shouldShowSetupWizard("abnormal")).toBe(false);
  });

  it("marks the active setup form from service status", () => {
    expect(getSetupStepState("not-installed", 1)).toBe("active");
    expect(getSetupStepState("package-uploaded", 1)).toBe("done");
    expect(getSetupStepState("package-uploaded", 2)).toBe("active");
    expect(getSetupStepState("initialization-required", 2)).toBe("done");
    expect(getSetupStepState("initialization-required", 3)).toBe("active");
    expect(getSetupStepState("running", 3)).toBe("done");
  });

  it("derives the single active setup step used by the storage-overview style flow", () => {
    expect(getCurrentSetupStep("not-installed")).toBe("upload");
    expect(getCurrentSetupStep("package-missing")).toBe("upload");
    expect(getCurrentSetupStep("package-uploaded")).toBe("install");
    expect(getCurrentSetupStep("initialization-required")).toBe("initialize");
    expect(getSetupStepIndex("upload")).toBe(1);
    expect(getSetupStepIndex("install")).toBe(2);
    expect(getSetupStepIndex("initialize")).toBe(3);
  });
});

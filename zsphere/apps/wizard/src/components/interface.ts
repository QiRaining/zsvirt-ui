import type { IActionResult } from "@zstack/zsphere-hooks";
import React from "react";

export interface IWizardFormProps {
  handleTaskFinished: (actionResult: IActionResult) => void;
  ref: React.Ref<React.ReactNode>;
  onArchLicenseConflictChange?: (isArchLicenseConflict: boolean) => void;
}

export interface IWizardFormHandler {
  submit: () => Promise<void>;
}

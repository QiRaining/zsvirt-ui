import { DomainMode, VmSpecPlatform } from "@zstack/zsphere-types";
import type {
  VmCustomSpecification,
  VmInstance,
} from "@zstack/zsphere-types/graphql";
import type { IntlShape } from "react-intl";

export enum HostnameConfigType {
  fromVm = "fromVm",
  manual = "manual",
}

function compareVersion(lhs: string, rhs: string) {
  const lhsParts = lhs.split(".").map(Number);
  const rhsParts = rhs.split(".").map(Number);
  for (let i = 0; i < Math.max(lhsParts.length, rhsParts.length); i++) {
    const lhsValue = lhsParts[i] || 0;
    const rhsValue = rhsParts[i] || 0;
    if (lhsValue !== rhsValue) {
      return lhsValue - rhsValue;
    }
  }
  return 0;
}

const minimumSupportedVmToolsVersion: Record<string, string> = {
  [VmSpecPlatform.Windows]: "1.5.7",
};

const versionRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

export function isVmToolsOutdated(vmTemplate?: VmInstance) {
  const version = vmTemplate?.guestToolsState?.version;
  const minimumVersion =
    minimumSupportedVmToolsVersion[vmTemplate?.platform ?? ""];
  if (!version || !minimumVersion || !versionRegex.test(version)) {
    return false;
  }
  return compareVersion(version, minimumVersion) < 0;
}

export function getVmSpecConfig(current: VmCustomSpecification) {
  const result: Record<string, any> = { adminPassword: { show: false } };
  if (current.hostname) {
    result.hostnameConfigType = HostnameConfigType.manual;
    result.hostname = current.hostname ?? "";
  } else {
    result.hostnameConfigType = HostnameConfigType.fromVm;
  }
  if (current.platform === VmSpecPlatform.Windows) {
    const domainMode = current.domainMode ?? DomainMode.WorkGroup;
    const domainModeInfo: Record<string, any> = {
      domainName: current.domainName ?? "",
    };
    if (domainMode === DomainMode.Domain) {
      domainModeInfo.domainUsername = current.domainUsername ?? "";
      domainModeInfo.organization = current.organization ?? "";
      domainModeInfo.domainPassword = { show: false };
    } else {
      domainModeInfo.generateSID = current.generateSID ?? false;
    }
    result.domainMode = domainMode;
    result[domainMode] = domainModeInfo;
  }
  return result;
}

function shouldResetPassword(passwordField?: Record<string, any>) {
  return (
    !!passwordField?.value && (!("show" in passwordField) || passwordField.show)
  );
}

export function getVmSpecPayload(
  platform: VmSpecPlatform,
  params?: Record<string, any> | null,
) {
  if (!params) {
    return;
  }
  const result: Record<string, any> = {};
  if (params.hostnameConfigType === HostnameConfigType.manual) {
    result.hostname = params.hostname ?? "";
  } else {
    result.hostname = "";
  }
  if (shouldResetPassword(params.adminPassword)) {
    result.rootPassword = params.adminPassword.value ?? "";
  }
  if (platform === VmSpecPlatform.Windows) {
    const domainMode = params.domainMode ?? DomainMode.WorkGroup;
    const domainModeInfo = params[domainMode] ?? {};
    result.domainMode = domainMode;
    result.domainName = domainModeInfo.domainName ?? "";
    if (domainMode === DomainMode.Domain) {
      result.generateSID = true;
      result.domainUsername = domainModeInfo.domainUsername ?? "";
      result.organization = domainModeInfo.organization ?? "";
      if (shouldResetPassword(domainModeInfo.domainPassword)) {
        result.domainPassword = domainModeInfo.domainPassword.value ?? "";
      }
    } else {
      result.generateSID = domainModeInfo.generateSID ?? false;
    }
  }
  return result;
}

export function validateDomainName(value: string | undefined, intl: IntlShape) {
  if (!value) {
    return Promise.resolve();
  }
  if (value.length > 26 || !/^[a-zA-Z0-9_.-]+$/.test(value)) {
    return Promise.reject(
      new Error(
        intl.formatMessage({
          id: "vm.spec.domain.name.validator.format",
          defaultMessage:
            "The domain name must be 1–26 characters in length and can contain letters, numbers, underscores (_), dots (.), and hyphens (-).",
        }),
      ),
    );
  }
  return Promise.resolve();
}

export function validateWorkgroupName(
  value: string | undefined,
  intl: IntlShape,
) {
  if (!value) {
    return Promise.resolve();
  }
  if (
    value.length > 15 ||
    !/^[\u4e00-\u9fa5a-zA-Z0-9._-]+$/.test(value) ||
    /^\d+$/.test(value)
  ) {
    return Promise.reject(
      new Error(
        intl.formatMessage({
          id: "vm.spec.workgroup.name.validator.format",
          defaultMessage:
            "The workgroup name must 1–15 characters in length and can contain letters, numbers, underscores (_), dots (.), and hyphens (-). The workgroup name cannot be all numbers.",
        }),
      ),
    );
  }
  return Promise.resolve();
}

export function validateDomainUsername(
  value: string | undefined,
  intl: IntlShape,
) {
  if (!value) {
    return Promise.resolve();
  }
  if (
    value.length > 15 ||
    !/^[\u4e00-\u9fa5a-zA-Z0-9._-]+$/.test(value) ||
    /^\d+$/.test(value)
  ) {
    return Promise.reject(
      new Error(
        intl.formatMessage({
          id: "vm.spec.domain.username.validator.format",
          defaultMessage:
            "The domain username must 1–15 characters in length and can contain letters, numbers, underscores (_), dots (.), and hyphens (-). The domain username cannot be all numbers.",
        }),
      ),
    );
  }
  return Promise.resolve();
}

const organizationRegex =
  /^(?:[A-Za-z][\w-]*|\d+(?:\.\d+)*)=(?:#(?:[\dA-Fa-f]{2})+|(?:[^,=+<>#;\\"]|\\[,=+<>#;\\"]|\\[\dA-Fa-f]{2})*|"(?:[^\\"]|\\[,=+<>#;\\"]|\\[\dA-Fa-f]{2})*")(?:\+(?:[A-Za-z][\w-]*|\d+(?:\.\d+)*)=(?:#(?:[\dA-Fa-f]{2})+|(?:[^,=+<>#;\\"]|\\[,=+<>#;\\"]|\\[\dA-Fa-f]{2})*|"(?:[^\\"]|\\[,=+<>#;\\"]|\\[\dA-Fa-f]{2})*"))*(?:,(?:[A-Za-z][\w-]*|\d+(?:\.\d+)*)=(?:#(?:[\dA-Fa-f]{2})+|(?:[^,=+<>#;\\"]|\\[,=+<>#;\\"]|\\[\dA-Fa-f]{2})*|"(?:[^\\"]|\\[,=+<>#;\\"]|\\[\dA-Fa-f]{2})*")(?:\+(?:[A-Za-z][\w-]*|\d+(?:\.\d+)*)=(?:#(?:[\dA-Fa-f]{2})+|(?:[^,=+<>#;\\"]|\\[,=+<>#;\\"]|\\[\dA-Fa-f]{2})*|"(?:[^\\"]|\\[,=+<>#;\\"]|\\[\dA-Fa-f]{2})*"))*)*$/;

export function validateOrganization(
  value: string | undefined,
  intl: IntlShape,
) {
  if (!value) {
    return Promise.resolve();
  }
  if (!organizationRegex.test(value)) {
    return Promise.reject(
      new Error(
        intl.formatMessage({
          id: "vm.spec.organization.validator.format",
          defaultMessage: "Invalid organization unit.",
        }),
      ),
    );
  }
  return Promise.resolve();
}

export function validateAdminPassword(
  value: string | undefined,
  intl: IntlShape,
) {
  if (!value) {
    return Promise.resolve();
  }
  if (value.length < 8 || value.length > 16) {
    return Promise.reject(
      new Error(
        intl.formatMessage({
          id: "vm.spec.admin.password.validator.format",
          defaultMessage:
            "The password must be 8 to 16 characters in length and contain at least two of the following: lowercase letters, uppercase letters, numbers, or special characters.",
        }),
      ),
    );
  }
  const hasLowerCase = +/[a-z]/.test(value);
  const hasUpperCase = +/[A-Z]/.test(value);
  const hasNumber = +/[0-9]/.test(value);
  const hasSpecialChar = +/[~`!@#$%^&*()_+-=\\|[\]{};':",.<>/?]/.test(value);
  if (hasLowerCase + hasUpperCase + hasNumber + hasSpecialChar < 2) {
    return Promise.reject(
      new Error(
        intl.formatMessage({
          id: "vm.spec.admin.password.validator.format",
          defaultMessage:
            "The password must be 8 to 16 characters in length and contain at least two of the following: lowercase letters, uppercase letters, numbers, or special characters.",
        }),
      ),
    );
  }
  return Promise.resolve();
}

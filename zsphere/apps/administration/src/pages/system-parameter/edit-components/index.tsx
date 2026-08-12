import AuditRetentionDuration from "./audit-retention-duration";
import Confirm from "./confirm";
import CpuModeSelect from "./cpuMode-select";
import DeletionPolicy from "./deletion-policy";
import ExpungeInterval from "./expunge-interval";
import HostAllocator from "./host-allocator";
import IAM2Expunge from "./iam2-expunge";
import IAM2ProjectLoginPortal from "./iam2-project-login-portal";
import InputWithNumber from "./input-with-number";
import InputWithNumberCompared from "./input-with-number-compared";
import InputWithPassword from "./input-with-password";
import InputWithUnit from "./input-with-unit";
import LinkageSelect from "./linkage-select";
import LoginControl from "./login-control";
import LoginPasswordUpdateStrategy from "./login-password-update-strategy";
import ManagementServerLogLastModified from "./management-server-log-last-modified";
import ManagementServerLogSize from "./management-server-log-size";
import PasswordStrategyCheckConfig from "./password-strategy-check-config";
import PasswordStrategyHistoricalNum from "./password-strategy-historical-num";
import PasswordStrategyLockLogin from "./password-strategy-lock-login";
import PasswordStrategyPeriod from "./password-strategy-period";
import Select from "./select";
import SelectWithInputSwitch from "./select-with-input-switch";
import SelectWithInputUnitTimeToSecoundSwitch from "./select-with-input-unit-time-to-sec-switch";
import SetCrashReboot from "./set-crash-reboot";
import SetVmCrashStrategy from "./set-crash-strategy";
import SwitchModal from "./switch-modal";
import SyncReclaimInterval from "./sync-reclaim-interval";
import Text from "./text";
import UILoginPortal from "./ui-login-portal";
import VMListViewDisplay from "./vm-list-view-display";
import VmPasswordCheckConfig from "./vm-password-check-config";
import VNCCheckConfig from "./vnc-check-config";

export const EditComponents = () => {
  return {
    Switch: Confirm,
    SelectWithInputSwitch,
    ManagementServerLogSize,
    ManagementServerLogLastModified,
    AuditRetentionDuration,
    SelectWithInputUnitTimeToSecoundSwitch,
    SyncReclaimInterval,
    HostAllocator,
    UILoginPortal,
    LoginControl,
    DeletionPolicy,
    ExpungeInterval,
    LoginPasswordUpdateStrategy,
    PasswordStrategyPeriod,
    PasswordStrategyHistoricalNum,
    PasswordStrategyLockLogin,
    PasswordStrategyCheckConfig,
    VmPasswordCheckConfig,
    VNCCheckConfig,
    IAM2Expunge,
    InputWithPassword,
    InputWithUnit,
    Select,
    CpuModeSelect,
    IAM2ProjectLoginPortal,
    Text,
    SetCrashReboot,
    SetVmCrashStrategy,
    InputWithNumber,
    InputWithNumberCompared,
    LinkageSelect,
    SwitchModal,
    VMListViewDisplay,
  };
};

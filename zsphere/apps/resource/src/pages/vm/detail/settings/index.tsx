import { Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import {
  verifyWithGqa,
  verifyModifyVmPassword,
} from "@zstack/virtualization-resource/src/pages/vm/action/validators";
import { DetailNavLayout, useAuth } from "@zstack/zsphere-components";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import ChangeVmPassword from "../../action/advanced-action/change-vm-password";
import EditBootConfig from "../../action/advanced-action/edit-boot-config";
import EditGuestToolsConfig from "../../action/advanced-action/edit-guesttools-config";
import EditNormalConfig from "../../action/advanced-action/edit-normal-config";
import EditOtherConfig from "../../action/advanced-action/edit-other-config";
import EditRemoteConfig from "../../action/advanced-action/edit-remote-config";
import SetSSHKey from "../../action/advanced-action/set-sshkey";
import BootSetting from "./boot";
import GuestToolsSetting from "./guesttools";
import LoginAuth from "./login-auth";
import NormalSetting from "./normal";
import OtherSetting from "./other";
import RemoteConsoleSetting from "./remote-console";

import style from "./style.module.less";

interface IProps {
  detail: IVM;
  resourceConfig: any;
}

const Settings: React.FC<IProps> = ({ detail, resourceConfig }) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();

  const [normalConfigVisible, setNormalConfigVisible] = useState(false);
  const [guestToolsConfigVisible, setGuestToolsConfigVisible] = useState(false);
  const [bootConfigVisible, setBootConfigVisible] = useState(false);
  const [otherConfigVisible, setOtherConfigVisible] = useState(false);
  const [remoteConfigVisible, setRemoteConfigVisible] = useState(false);
  const [changeVmPasswordVisible, setChangeVmPasswordVisible] = useState(false);
  const [setSSHKeyVisible, setSetSSHKeyVisible] = useState(false);

  const isRunningVm = detail.state === "Running";

  const tooltip = isRunningVm
    ? intl.formatMessage({
        id: "disable.vm.edit.action.with.running",
        defaultMessage: "Cannot modify this setting when the VM is running. Power off the VM and try again.",
      })
    : undefined;

  const loginAuthTooltip = () => {
    let changeVMPasswordTooltip = "";

    const isVerifyModifyVmPassword = verifyModifyVmPassword(detail);
    const isVerifyWithGqa = verifyWithGqa(detail);

    if (!isVerifyModifyVmPassword) {
      changeVMPasswordTooltip = intl.formatMessage({
        id: "vm.action.change.vm.password.disabled.with.error.state.tooltip",
        defaultMessage:
          "This feature does not support modifying virtual machine passwords while the VM is shut down. Please boot up the VM and ensure QGA is installed before making any changes.",
      });
    } else if (!isVerifyWithGqa) {
      changeVMPasswordTooltip = intl.formatMessage({
        id: "vm.action.change.vm.password.disabled.with.no.qga.tooltip",
        defaultMessage: "Please install QGA and modify afterwards.",
      });
    } else {
      changeVMPasswordTooltip = "";
    }

    return changeVMPasswordTooltip;
  };

  const actionList = (
    actions: {
      tooltip?: string;
      disabled?: boolean;
      label: string;
      onClick: () => void;
    }[],
  ) => (
    <>
      {actions.map((action) => (
        <Tooltip key={action.label} title={action.tooltip}>
          <span
            className={
              action.disabled
                ? style["action-disabled"]
                : style["action-normal"]
            }
            onClick={() => !action.disabled && action.onClick()}
          >
            <Icon type="edit" />
            <span className={style["action-name"]}>{action.label}</span>
          </span>
        </Tooltip>
      ))}
    </>
  );

  const pageList = useMemo(() => {
    const canNormal = hasAuth({
      type: "action",
      authKey: "virtualization.edit.vm.normal.config",
      resource: "vm",
    });
    const canRemote = hasAuth({
      type: "action",
      authKey: "virtualization.edit.vm.remote.console",
      resource: "vm",
    });
    const canSshKey = hasAuth({
      type: "action",
      authKey: "virtualization.set.sshkey",
      resource: "vm",
    });
    const canChangePwd = hasAuth({
      type: "action",
      authKey: "virtualization.change.vm.password",
      resource: "vm",
    });
    const canTools = hasAuth({
      type: "action",
      authKey: "virtualization.edit.vm.tools.config",
      resource: "vm",
    });
    const canBoot = hasAuth({
      type: "action",
      authKey: "virtualization.edit.boot.config",
      resource: "vm",
    });
    const canOther = hasAuth({
      type: "action",
      authKey: "virtualization.edit.other.config",
      resource: "vm",
    });

    return [
      {
        key: "virtualization.vm.setting.normal",
        name: intl.formatMessage({
          id: "virtualization.vm.setting.normal",
          defaultMessage: "General Options",
        }),
        showTitle: true,
        page: <NormalSetting detail={detail} />,
        actions: canNormal
          ? actionList([
              {
                label: intl.formatMessage({
                  id: "change",
                  defaultMessage: "Edit",
                }),
                onClick: () => setNormalConfigVisible(true),
              },
            ])
          : null,
      },
      {
        key: "virtualization.vm.setting.remote.console",
        name: intl.formatMessage({
          id: "virtualization.vm.setting.remote.console",
          defaultMessage: "Remote Access",
        }),
        showTitle: true,
        page: (
          <RemoteConsoleSetting
            detail={detail}
            resourceConfig={resourceConfig}
          />
        ),
        actions: canRemote
          ? actionList([
              {
                label: intl.formatMessage({
                  id: "change",
                  defaultMessage: "Edit",
                }),
                onClick: () => setRemoteConfigVisible(true),
                disabled: isRunningVm,
                tooltip,
              },
            ])
          : null,
      },
      {
        key: "virtualization.login.auth",
        name: intl.formatMessage({
          id: "virtualization.vm.setting.auth",
          defaultMessage: "Login Authentication",
        }),
        showTitle: true,
        page: <LoginAuth detail={detail} />,
        actions:
          canSshKey || canChangePwd
            ? actionList(
                [
                  canSshKey && {
                    label: intl.formatMessage({
                      id: "set.ssh.key",
                      defaultMessage: "Set SSH Key",
                    }),
                    onClick: () => setSetSSHKeyVisible(true),
                    disabled: isRunningVm,
                    tooltip,
                  },
                  canChangePwd && {
                    label: intl.formatMessage({
                      id: "change.vm.password",
                      defaultMessage: "Change VM Password",
                    }),
                    onClick: () => setChangeVmPasswordVisible(true),
                    disabled: !(
                      verifyModifyVmPassword(detail) && verifyWithGqa(detail)
                    ),
                    tooltip: loginAuthTooltip(),
                  },
                ].filter(Boolean) as {
                  tooltip?: string;
                  disabled?: boolean;
                  label: string;
                  onClick: () => void;
                }[],
              )
            : null,
      },
      {
        key: "virtualization.vm.setting.guesttools",
        name: intl.formatMessage({
          id: "virtualization.vm.setting.guesttools",
          defaultMessage: "VMTools",
        }),
        showTitle: true,
        page: <GuestToolsSetting detail={detail} />,
        actions: canTools
          ? actionList([
              {
                label: intl.formatMessage({
                  id: "change",
                  defaultMessage: "Edit",
                }),
                onClick: () => setGuestToolsConfigVisible(true),
              },
            ])
          : null,
      },
      {
        key: "virtualization.vm.setting.boot",
        name: intl.formatMessage({
          id: "virtualization.vm.setting.boot",
          defaultMessage: "Boot Options",
        }),
        showTitle: true,
        page: <BootSetting detail={detail} resourceConfig={resourceConfig} />,
        actions: canBoot
          ? actionList([
              {
                label: intl.formatMessage({
                  id: "change",
                  defaultMessage: "Edit",
                }),
                onClick: () => setBootConfigVisible(true),
                disabled: isRunningVm,
                tooltip,
              },
            ])
          : null,
      },
      {
        key: "virtualization.vm.setting.other",
        name: intl.formatMessage({
          id: "virtualization.vm.setting.other",
          defaultMessage: "Other Options",
        }),
        showTitle: true,
        page: <OtherSetting detail={detail} resourceConfig={resourceConfig} />,
        actions: canOther
          ? actionList([
              {
                label: intl.formatMessage({
                  id: "change",
                  defaultMessage: "Edit",
                }),
                onClick: () => setOtherConfigVisible(true),
              },
            ])
          : null,
      },
    ];
  }, [detail, resourceConfig, intl, hasAuth]);

  const memoizedSelectedList = useMemo(() => [detail], [detail]);

  return (
    <>
      <DetailNavLayout
        pageList={pageList}
        className={style["advanced-config-contanier"]}
        cacheConfig={{
          contentId: "settings",
        }}
      />
      <EditNormalConfig
        selectedList={memoizedSelectedList}
        visible={normalConfigVisible}
        setVisible={setNormalConfigVisible}
        position="row"
        view="virtualization.detail"
      />
      <EditGuestToolsConfig
        selectedList={memoizedSelectedList}
        visible={guestToolsConfigVisible}
        setVisible={setGuestToolsConfigVisible}
        position="row"
        view="virtualization.detail"
      />
      <EditBootConfig
        selectedList={memoizedSelectedList}
        visible={bootConfigVisible}
        setVisible={setBootConfigVisible}
        position="row"
        view="virtualization.detail"
      />
      <EditOtherConfig
        selectedList={memoizedSelectedList}
        visible={otherConfigVisible}
        setVisible={setOtherConfigVisible}
        position="row"
        view="virtualization.detail"
      />
      <EditRemoteConfig
        selectedList={memoizedSelectedList}
        resourceConfig={resourceConfig}
        visible={remoteConfigVisible}
        setVisible={setRemoteConfigVisible}
        position="row"
        view="virtualization.detail"
      />
      <ChangeVmPassword
        selectedList={memoizedSelectedList}
        visible={changeVmPasswordVisible}
        setVisible={setChangeVmPasswordVisible}
        position="row"
        view="virtualization.detail"
      />
      <SetSSHKey
        selectedList={memoizedSelectedList}
        visible={setSSHKeyVisible}
        setVisible={setSetSSHKeyVisible}
        position="row"
        view="virtualization.detail"
      />
    </>
  );
};

export default Settings;

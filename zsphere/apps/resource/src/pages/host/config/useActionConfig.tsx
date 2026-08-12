import { gql } from "@apollo/client";
import {
  enableHosts,
  hostList,
} from "@zstack/virtualization-resource/src/gql/host.gql";
import { WebTerminalConfirmModal } from "@zstack/zsphere-components";
import { useActionConfig } from "@zstack/zsphere-engine/src/host";
import type { IOption } from "@zstack/zsphere-engine/src/host/useActionConfig";
import { useAction } from "@zstack/zsphere-hooks";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import type { HostVO as IHost } from "@zstack/zsphere-types/graphql";
import { xor } from "lodash-es";
import { useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { SetResourceAttribute } from "../../../components/resource-attribute";
import TagAction from "../../vm/action/tag";
import EnterSelectModal from "../../vm/create/enter-select-modal";
import AddBond from "../action/add-bond";
import AttachAlarmModal from "../action/attach-alarm-modal";
import CreateAction from "../action/create";
import DeleteModal from "../action/delete-modal";
import DisabledModal from "../action/disabled-modal";
import EditConfig from "../action/edit-config";
import EnterMaintenanceModeModal from "../action/enter-maintenance-mode-modal";
import ModifyHostPassword from "../action/modify-host-password";
import {
  PowerOnAction,
  PowerOffAction,
  PowerRebootAction,
} from "../action/power-control";
import ReconnectionModal from "../action/reconnection-modal";
import UpdateHostIpmi from "../action/update-host-ipmi";
import UpdateModal from "../action/update-modal";
import UpdateSsh from "../action/update-ssh";
import {
  disabled,
  enabled,
  exitMaintenance,
  maintenance,
  many,
  one,
  reconnection,
  validCreateVm,
  validPowerOff,
  validPowerOn,
  validPowerReboot,
  validTerminal,
  validUpdateIPMIInfo,
} from "../action/validator";
import AttachVirtualizationTag from "../action/virtualization-tag/attach";
import DetachVirtualizationTag from "../action/virtualization-tag/detach";
import AddHostToHostGroup from "../action/vm-scheduling-rule/host-group/add-host-to-host-group";
import RemoveHostFromHostGroup from "../action/vm-scheduling-rule/host-group/remove-host-from-host-group";
import AttachToVswitch from "../action/vswitch/attach-to-vswitch";

const updateAlarmLabel = gql`
  mutation updateAlarmLabel($input: UpdateAlarmLabelInput!) {
    updateAlarmLabel(input: $input) {
      actionId
    }
  }
`;

const useEnableDisableBtnStyle = () => {
  return {
    enableBtnStyle: {
      icon: "play-circle-fill",
      iconStyle: {
        color: "#5ACA49",
      },
    },
    disableBtnStyle: {
      icon: "stop-circle-fill",
      iconStyle: {
        color: "#F4454C",
      },
    },
  };
};

export default () => {
  const intl = useIntl();
  const doAction = useAction();

  const { zopsSupportable } = usePlatformStore();
  const { enableBtnStyle, disableBtnStyle } = useEnableDisableBtnStyle();

  const options: IOption<IHost> = useMemo(
    () => [
      {
        key: "virtualization.add.host",
        autoInjectPreValidator: false,
        ActionWrapper: CreateAction,
      },
      {
        key: "edit",
        name: intl.formatMessage({
          id: "edit.name.and.description",
          defaultMessage: "Edit Name and Description",
        }),
        ActionWrapper: UpdateModal,
      },
      {
        preValidators: [exitMaintenance],
        key: "exit.maintenanceMode",
        onClick: ({ setSelectedList, selectedList = [], refetch }: any) => {
          const payload = selectedList.map((item: { uuid: string }) => {
            return { uuid: item.uuid };
          });
          doAction({
            mutation: enableHosts,
            payload,
            name: intl.formatMessage({
              id: "exit.maintenanceMode",
              defaultMessage: "Exit Maintenance Mode",
            }),
            total: selectedList.length,
            onFinish: () => {
              refetch?.();
              setSelectedList?.([]);
            },
            type: "HostVO",
          });
        },
      },
      {
        key: "create.instance",
        ActionWrapper: EnterSelectModal,
        autoInjectPreValidator: false,
        preValidators: [validCreateVm],
      },
      {
        key: "tag.management",
        ActionWrapper: TagAction,
      },
      {
        key: "host.group.add.host",
        autoInjectPreValidator: false,
        ActionWrapper: AddHostToHostGroup,
      },
      {
        key: "host.group.remove.host",
        preValidators: [many],
        ActionWrapper: RemoveHostFromHostGroup,
      },
      {
        key: "edit.config",
        ActionWrapper: EditConfig,
      },
      {
        key: "update.ssh.info",
        ActionWrapper: UpdateSsh,
      },
      {
        key: "attach.to.l2VSwitch",
        ActionWrapper: AttachToVswitch,
      },

      // 分界
      {
        key: "add.bond",
        ActionWrapper: AddBond,
      },
      {
        validators: [enabled],
        key: "enable",
        ...enableBtnStyle,
        onClick: ({ setSelectedList, selectedList = [], refetch }: any) => {
          const payload = selectedList.map((item: { uuid: string }) => {
            return { uuid: item?.uuid };
          });
          doAction({
            mutation: enableHosts,
            payload,
            name: intl.formatMessage({
              id: "enable.host",
              defaultMessage: "Enable Host",
            }),
            total: selectedList.length,
            onFinish: () => {
              refetch?.();
              setSelectedList?.([]);
            },
            type: "HostVO",
          });
        },
      },
      {
        validators: [disabled],
        key: "disable",
        ...disableBtnStyle,
        ActionWrapper: DisabledModal,
      },
      {
        preValidators: [many, reconnection],
        key: "reconnection",
        ActionWrapper: ReconnectionModal,
      },
      {
        preValidators: [many, maintenance],
        key: "maintenance",
        ActionWrapper: EnterMaintenanceModeModal,
      },

      {
        preValidators: [one],
        key: "modify.password",
        ActionWrapper: ModifyHostPassword,
      },
      {
        preValidators: [many],
        key: "delete",
        ActionWrapper: DeleteModal,
      },
      {
        key: "attach.alarm",
        autoInjectPreValidator: false,
        ActionWrapper: AttachAlarmModal,
      },
      {
        key: "detach.alarm",
        preValidators: [many],
        onClick: ({ source, selectedList, setSelectedList }: any) => {
          const labels = source?.labels;
          const key = labels?.[0]?.key;
          const labelUuid = labels[0].uuid;
          const oldValue = labels[0].value;
          const selectedUuids = selectedList?.map(
            (cv: { uuid: string }) => cv?.uuid,
          );

          const value = xor(oldValue.split("|"), selectedUuids).join("|");
          const payload = {
            uuid: labelUuid,
            key,
            value,
            operator: "Regex",
          };
          doAction({
            mutation: updateAlarmLabel,
            payload,
            name: intl.formatMessage({
              id: "remove.resource",
              defaultMessage: "Remove Resources",
            }),
            total: 1,
            onFinish: () => {
              setSelectedList?.([]);
            },
          });
        },
      },
      {
        key: "power.control.power.on",
        validators: [validPowerOn],
        ActionWrapper: PowerOnAction,
        notSupportedModal: {
          title: intl.formatMessage({
            id: "can.not.power.on.host",
            defaultMessage: "Cannot Power On Host",
          }),
          alertType: "warning",
          alertMessage: (
            <ReactMarkdown>
              {intl.formatMessage({
                id: "host.can.not.power.on.host.alert",
                defaultMessage: "Some selected hosts cannot be powered on due to the following reasons:\n\n1. Hosts that are already powered on.\n2. Hosts not managed by IPMI.",
              })}
            </ReactMarkdown>
          ),
        },
      },
      {
        key: "power.control.power.off",
        validators: [validPowerOff],
        ActionWrapper: PowerOffAction,
        notSupportedModal: {
          title: intl.formatMessage({
            id: "can.not.power.off.host",
            defaultMessage: "Cannot Power Off Host",
          }),
          alertType: "warning",
          alertMessage: (
            <ReactMarkdown>
              {intl.formatMessage({
                id: "host.can.not.power.off.host.alert",
                defaultMessage: `Some selected hosts cannot be powered off due to the following reasons:

1. Management node hosts.
2. Hosts that are already powered off.
3. Hosts not managed by IPMI or with abnormal connection status.`,
              })}
            </ReactMarkdown>
          ),
        },
      },
      {
        key: "power.control.reboot",
        validators: [validPowerReboot],
        ActionWrapper: PowerRebootAction,
        notSupportedModal: {
          title: intl.formatMessage({
            id: "can.not.power.reboot.host",
            defaultMessage: "Cannot Reboot Host",
          }),
          alertType: "warning",
          alertMessage: (
            <ReactMarkdown>
              {intl.formatMessage({
                id: "host.can.not.power.reboot.host.alert",
                defaultMessage: `Some selected hosts cannot be rebooted due to the following reasons:

1. Management node hosts.
2. Hosts that are currently powered off.
3. Hosts not managed by IPMI or with abnormal connection status.`,
              })}
            </ReactMarkdown>
          ),
        },
      },
      {
        key: "update.ipmi.info",
        preValidators: [one],
        validators: [validUpdateIPMIInfo],
        ActionWrapper: UpdateHostIpmi,
        description: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "update.ipmi.info.tooltip",
              defaultMessage: `### Update IPMI Info

1. After modifying the IPMI username and password through the command line in the host system, the host IPMI information needs to be updated on the UI interface.

2. You can only modify the IPMI info of a host that is in IPMI Unmanaged or Unknown power status.`,
            })}
          </ReactMarkdown>
        ),
      },
      {
        key: "virtualization.tag.attach.host",
        autoInjectPreValidator: false,
        ActionWrapper: AttachVirtualizationTag,
      },
      {
        key: "virtualization.tag.detach.tag",
        ActionWrapper: DetachVirtualizationTag,
      },
      {
        key: "enter.web.terminal",
        preValidators: [one, () => zopsSupportable],
        validators: [validTerminal],
        tooltip: {
          title: intl.formatMessage({
            id: "host.open.console.disabled.tooltip",
            defaultMessage:
              "The host is not connected or system service is abnormal, unable to enter Web terminal.",
          }),
        },
        tooltipPlacement: "top",
        ActionWrapper: ({ visible, setVisible, selectedList }: any) => {
          return (
            <>
              <WebTerminalConfirmModal
                visible={visible}
                setVisible={setVisible}
                host={selectedList[0]}
              />
            </>
          );
        },
      },
      {
        key: "virtualization.set.resource.attribute",
        ActionWrapper: SetResourceAttribute,
      },
    ],
    [disableBtnStyle, doAction, enableBtnStyle, intl, zopsSupportable],
  );

  const config = useActionConfig<IHost>(options);

  return { ...config, gql: hostList };
};

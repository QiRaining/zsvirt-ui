import { gql } from "@apollo/client";
import { useActionConfig } from "@zstack/zsphere-engine/src/baremetal-instance";
import { useAction } from "@zstack/zsphere-hooks";
import type { BaremetalInstance as IBaremetalInstance } from "@zstack/zsphere-types/graphql";
import { xor as _xor } from "lodash-es";
import { useIntl } from "react-intl";
import TagAction from "zsv_resource/vm/action/tag";

import { SetResourceAttribute } from "../../../components/resource-attribute";
import { baremetalInstanceList } from "../../../gql/baremetal-instance.gql";
import { useEnableDisableBtnStyle } from "../../baremetal-chassis/config/useActionConfig";
import AttachAlarmModal from "../action/attach-alarm-modal";
import DeleteModal from "../action/delete-modal";
import ExpungeModal from "../action/expunge-modal";
import OpenConsole from "../action/open-console";
import RebootModal from "../action/reboot-modal";
import Recover from "../action/recover";
import StartModal from "../action/start-modal";
import StopModal from "../action/stop-modal";
import UpdateModal from "../action/update-modal";
import {
  verifySelect,
  verifyReboot,
  verifyMultiSelect,
  verifySingle,
  verifyStart,
  verifyStop,
  verifyOpenConsole,
} from "../action/validator";
import CreateBaremetalInstance from "../create";

const updateAlarmLabel = gql`
  mutation updateAlarmLabel($input: UpdateAlarmLabelInput!) {
    updateAlarmLabel(input: $input) {
      actionId
    }
  }
`;

export default () => {
  const intl = useIntl();
  const doAction = useAction();
  const { enableBtnStyle, disableBtnStyle } = useEnableDisableBtnStyle();

  return {
    ...useActionConfig<IBaremetalInstance>([
      {
        key: "creat.baremetal.instance",
        autoInjectPreValidator: false,
        ActionWrapper: CreateBaremetalInstance,
      },
      {
        key: "start",
        ...enableBtnStyle,
        name: intl.formatMessage({
          id: "power.start",
          defaultMessage: "Power On",
        }),
        preValidators: [verifySelect],
        validators: [verifyStart],
        ActionWrapper: StartModal,
      },
      {
        key: "stop",
        ...disableBtnStyle,
        name: intl.formatMessage({
          id: "power.stop",
          defaultMessage: "Shut Down",
        }),
        preValidators: [verifySelect],
        validators: [verifyStop],
        ActionWrapper: StopModal,
      },
      {
        key: "delete",
        preValidators: [verifySelect],
        ActionWrapper: DeleteModal,
      },
      {
        key: "open.console",
        preValidators: [verifySingle],
        validators: [verifyOpenConsole],
        ActionWrapper: OpenConsole,
      },
      {
        key: "rebort",
        preValidators: [verifySelect],
        validators: [verifyReboot],
        ActionWrapper: RebootModal,
      },
      {
        key: "expunge",
        icon: "trash-fill",
        iconStyle: {
          color: "#F4454C",
          width: "14px",
        },
        preValidators: [verifySelect],
        ActionWrapper: ExpungeModal,
      },
      {
        key: "recover",
        icon: "redo-fill",
        iconStyle: {
          color: "#5ACA49",
          width: "14px",
        },
        preValidators: [verifySelect],
        ActionWrapper: Recover,
      },
      {
        key: "tag.management",
        ActionWrapper: TagAction,
      },
      {
        key: "attach.alarm",
        name: "加载",
        autoInjectPreValidator: false,
        ActionWrapper: AttachAlarmModal,
      },
      {
        key: "edit",
        ActionWrapper: UpdateModal,
      },
      {
        key: "detach.alarm",
        name: "卸载",
        preValidators: [verifyMultiSelect],
        onClick: ({ source, selectedList, setSelectedList }) => {
          const labels = source?.labels;
          const key = labels?.[0]?.key;
          const labelUuid = labels[0].uuid;
          const oldValue = labels[0].value;
          const selectedUuids = selectedList?.map((cv) => cv?.uuid);
          const value = _xor(oldValue.split("|"), selectedUuids).join("|");
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
        key: "virtualization.set.resource.attribute",
        ActionWrapper: SetResourceAttribute,
      },
    ]),
    gql: baremetalInstanceList,
  };
};

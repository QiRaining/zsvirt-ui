import { gql } from "@apollo/client";
import { useActionConfig } from "@zstack/zsphere-engine/src/vm-scheduling-rule";
import type { IOption } from "@zstack/zsphere-engine/src/vm-scheduling-rule/useActionConfig";
import { useAction } from "@zstack/zsphere-hooks";
import { VmSchedulingRuleState } from "@zstack/zsphere-types";
import type {
  ChangeVmSchedulingRuleStatePayload,
  VmSchedulingRule,
} from "@zstack/zsphere-types/graphql";
import { map as _map, filter as _filter } from "lodash-es";
import { useIntl } from "react-intl";

import {
  verifyDelete,
  verifySingleSelect,
  verifyStart,
  verifyStop,
} from "../action/validator";

const changeVmSchedulingRuleState = gql`
  mutation changeVmSchedulingRuleState(
    $input: ChangeVmSchedulingRuleStateInput!
  ) {
    changeVmSchedulingRuleState(input: $input) {
      actionId
    }
  }
`;

export default () => {
  const intl = useIntl();

  const doAction = useAction();

  const options: IOption<VmSchedulingRule> = [
    {
      key: "create.vmSchedulingRule",
      autoInjectPreValidator: false,
      primary: true,
      ActionWrapper: require("../create").default,
    },
    {
      key: "modify.config",
      preValidators: [verifySingleSelect],
      ActionWrapper: require("../action/modify-config").default,
    },
    {
      key: "edit",
      name: intl.formatMessage({
        id: "edit.nameAndDescription",
        defaultMessage: "Edit Name and Description",
      }),
      ActionWrapper: require("../action/edit").default,
    },
    {
      key: "enable",
      validators: [verifyStart],
      onClick: ({ setSelectedList, selectedList = [], refetch }) => {
        const uuids = _map(
          _filter(selectedList, ["state", VmSchedulingRuleState.Disabled]),
          "uuid",
        );
        const payload: ChangeVmSchedulingRuleStatePayload[] = uuids?.map(
          (uuid) => {
            return { uuid, state: "enable" };
          },
        );
        doAction({
          mutation: changeVmSchedulingRuleState,
          payload,
          name: intl.formatMessage({
            id: "enable.vmSchedulingRule",
            defaultMessage: "Enable VM Scheduling Policy",
          }),
          total: selectedList.length,
          onFinish: () => {
            refetch?.();
            setSelectedList?.([]);
          },
          type: "VmSchedulingRule",
        });
      },
      icon: "play-circle-fill",
      iconStyle: {
        color: "#5ACA49",
      },
    },
    {
      key: "disable",
      validators: [verifyStop],
      ActionWrapper: require("../action/stop").default,
      icon: "stop-circle-fill",
      iconStyle: {
        color: "#F4454C",
      },
    },
    {
      key: "delete",
      validators: [verifyDelete],
      ActionWrapper: require("../action/delete").default,
    },
  ];

  return useActionConfig(options);
};

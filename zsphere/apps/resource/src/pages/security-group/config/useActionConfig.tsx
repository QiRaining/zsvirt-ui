import { gql } from "@apollo/client";
import { useActionConfig } from "@zstack/zsphere-engine/src/security-group";
import type { IOption } from "@zstack/zsphere-engine/src/security-group/useActionConfig";
import { useAction } from "@zstack/zsphere-hooks";
import {
  SecurityGroupStateEvent,
  SecurityGroupRuleType,
} from "@zstack/zsphere-types";
import type {
  SecurityGroup as ISecurityGroup,
  SecurityGroupRule as ISecurityGroupRule,
} from "@zstack/zsphere-types/graphql";
import { downloadFile } from "@zstack/zsphere-utils";
import dayjs from "dayjs";
import { compact as _compact, orderBy as _orderBy } from "lodash-es";
import { useIntl } from "react-intl";

import CreateModal from "../action/create-modal";
import DeleteAction from "../action/delete";
import EditNameDesc from "../action/edit-name-desc";
import { useSecurityGroupRulesColumns } from "../action/import-sg-rules";
import ImportSgRules from "../action/import-sg-rules";
import { actionValidatorGroup } from "../action/validator";

const changeSecurityGroupState = gql`
  mutation ($input: ChangeSecurityGroupStateInput!) {
    changeSecurityGroupState(input: $input) {
      actionId
    }
  }
`;

export const handleDownloadSgRule = (
  rules: ISecurityGroupRule[],
  columns: any[],
  intl: any,
) => {
  const file = {
    nameList: [
      ...columns
        .slice(0, -1)
        .filter((it) => !["priority", "verify"].includes(it.key))
        .map((it) => it.title),
      intl.formatMessage({
        id: "securityGroup.uuid",
        defaultMessage: "Security Group UUID",
      }),
    ],
    valueList: rules.map((it) => {
      const portRange = it.srcPortRange || it.dstPortRange || "";
      const authorizedIp = (it.srcIpRange || it.dstIpRange || "")
        ?.replace(/,/g, ";")
        ?.replace(/-/g, "~");
      const authorizedSgName = it.remoteSecurityGroup?.name || "";

      return [
        it.type,
        it.action,
        it.protocol,
        portRange?.replace(/,/g, ";")?.replace(/-/g, "~"),
        authorizedIp,
        authorizedSgName,
        `IPv${it.ipVersion}`,
        it.remoteSecurityGroupUuid,
      ].join(",");
    }),
  };

  const str = `${file?.nameList.join(",")}\r\n${file?.valueList.join("\r\n")}`;

  const downLoadFileName = intl.formatMessage({
    id: "securityGroup.rule.export.rules",
    defaultMessage: "Security Group Rule",
  });

  downloadFile(
    `${downLoadFileName}-${dayjs().format("YYYY_MM_DD_hh_mm_ss")}.csv`,
    str,
  );
};

export default () => {
  const intl = useIntl();
  const doAction = useAction();

  const columns = useSecurityGroupRulesColumns();

  const handleChangeState = (
    selectedList: ISecurityGroup[],
    setSelectedList?: (selectedList: ISecurityGroup[]) => void,
    stateEvent?: SecurityGroupStateEvent,
  ) => {
    doAction({
      mutation: changeSecurityGroupState,
      payload: selectedList.map(({ uuid }) => ({
        uuid,
        stateEvent,
      })),
      name:
        stateEvent === SecurityGroupStateEvent.enable
          ? intl.formatMessage({
              id: "enable.securityGroupState",
              defaultMessage: "Enable Security Group",
            })
          : intl.formatMessage({
              id: "disable.securityGroupState",
              defaultMessage: "Disable Security Group",
            }),
      total: selectedList.length,
      type: "SecurityGroup",
      onFinish: () => {
        setSelectedList?.([]);
      },
    });
  };

  const options: IOption<ISecurityGroup> = [
    {
      key: "create.security.group",
      autoInjectPreValidator: false,
      ActionWrapper: CreateModal,
    },
    {
      key: "virtualization.edit.nameandDescription",
      autoInjectPreValidator: false,
      ActionWrapper: EditNameDesc,
      ...actionValidatorGroup.edit,
    },
    {
      key: "enable",
      icon: "play-circle-fill",
      iconStyle: {
        color: "#5ACA49",
      },
      onClick: ({ selectedList, setSelectedList }) =>
        handleChangeState(
          selectedList,
          setSelectedList,
          SecurityGroupStateEvent.enable,
        ),
      ...actionValidatorGroup.enable,
    },
    {
      key: "disable",
      icon: "stop-circle-fill",
      iconStyle: {
        color: "#F4454C",
      },
      onClick: ({ selectedList, setSelectedList }) =>
        handleChangeState(
          selectedList,
          setSelectedList,
          SecurityGroupStateEvent.disable,
        ),
      ...actionValidatorGroup.disable,
    },
    {
      key: "import.secrurityGroup.rules",
      ActionWrapper: ImportSgRules,
      ...actionValidatorGroup.importRules,
    },
    {
      key: "export.secrurityGroup.rules",
      onClick: ({ selectedList }) => {
        const ingressRules = _orderBy(
          _compact(selectedList?.[0]?.rules),
          "priority",
        ).filter(
          (it) =>
            it.type === SecurityGroupRuleType.Ingress && it.priority !== 0,
        );
        const egressRules = _orderBy(
          _compact(selectedList?.[0]?.rules),
          "priority",
        ).filter(
          (it) => it.type === SecurityGroupRuleType.Egress && it.priority !== 0,
        );

        const rules = [...ingressRules, ...egressRules];

        handleDownloadSgRule(rules, columns, intl);
      },
      ...actionValidatorGroup.exportRules,
    },
    {
      key: "delete",
      ActionWrapper: DeleteAction,
      ...actionValidatorGroup.delete,
    },
  ];

  return useActionConfig(options);
};

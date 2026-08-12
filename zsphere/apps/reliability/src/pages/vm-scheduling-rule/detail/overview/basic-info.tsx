import { useTime } from "@zstack/hooks";
import type { ListItem } from "@zstack/zsphere-components";
import { List, Constant, DraggableCard } from "@zstack/zsphere-components";
import type { ConstantEnum } from "@zstack/zsphere-constant";
import { ConstantType } from "@zstack/zsphere-constant";
import { CopyableText } from "@zstack/zsphere-design-biz";
import type { VmSchedulingRule } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import {
  renderVmSchedulingRuleType,
  renderVmSchedulingRuleMode,
} from "zsv_reliability_shared/vm-scheduling-rule/vm-group/utils";

import ModifyConfigModal from "../../action/modify-config";

interface IProps {
  detail: VmSchedulingRule;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const BasicInfo: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed = false,
}) => {
  const intl = useIntl();
  const { getServerTime } = useTime();
  const [modifyModalVisible, setModifyModalVisible] = useState(false);

  const { uuid, description, state, excuteState, mode, createDate } = detail;

  const list: ListItem[] = useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: "state",
          defaultMessage: "State",
        }),
        value: <Constant value={state! as unknown as ConstantEnum} />,
      },
      {
        label: intl.formatMessage({
          id: "excuteState",
          defaultMessage: "Execution Status",
        }),
        icon: "info",
        iconTooltip: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.vmSchedulingRule.field.excuteState.tooltip",
              defaultMessage: "",
            })}
          </ReactMarkdown>
        ),
        value: excuteState ? (
          <Constant
            value={excuteState as ConstantEnum}
            enumType={ConstantType.VmSchedulingExcuteState}
          />
        ) : (
          excuteState
        ),
      },
      {
        label: intl.formatMessage({
          id: "type",
          defaultMessage: "Type",
        }),
        value: renderVmSchedulingRuleType(intl, detail),
      },
      {
        label: intl.formatMessage({
          id: "excuteMode",
          defaultMessage: "Execution Mechanism",
        }),
        value: mode ? renderVmSchedulingRuleMode(intl, mode) : mode,
      },
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        value: description || undefined,
      },
      {
        label: "UUID",
        value: <CopyableText>{uuid}</CopyableText>,
      },
      {
        label: intl.formatMessage({
          id: "createDate",
          defaultMessage: "Creation Time",
        }),
        value: getServerTime(createDate).format("YYYY-MM-DD HH:mm:ss"),
      },
    ];
  }, [intl, getServerTime, detail]);

  return (
    <>
      <DraggableCard
        title={intl.formatMessage({
          id: "basic.info",
          defaultMessage: "Basic Info",
        })}
        isList
        onCollapseChange={onCollapseChange}
        collapsed={collapsed}
        titleActions={[
          {
            icon: "edit",
            tooltip: intl.formatMessage({
              id: "edit.config",
              defaultMessage: "Modify Configuration",
            }),
            onClick: () => setModifyModalVisible(true),
          },
        ]}
      >
        <List list={list} bordered={false} />
      </DraggableCard>
      <ModifyConfigModal
        visible={modifyModalVisible}
        setVisible={setModifyModalVisible}
        selectedList={[detail]}
      />
    </>
  );
};

export default BasicInfo;

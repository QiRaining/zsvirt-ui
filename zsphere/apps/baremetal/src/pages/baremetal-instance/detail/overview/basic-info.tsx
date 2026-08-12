import { Text } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { DraggableCard } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { List, Constant } from "@zstack/zsphere-components";
import type { ConstantEnum } from "@zstack/zsphere-constant";
import { CopyableText } from "@zstack/zsphere-design-biz";
import type { BaremetalInstance as IBaremetalInstance } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

export interface IProps {
  detail: IBaremetalInstance;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const BasicInfo: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed,
}) => {
  const intl = useIntl();
  const { uuid, state, status, description, platform, createDate } = detail;

  const { getServerTime } = useTime();

  const list = React.useMemo<Array<ListItem>>(
    () => [
      {
        label: intl.formatMessage({
          id: "baremetalInstance.state",
          defaultMessage: "State",
        }),
        value: <Constant value={state as unknown as ConstantEnum} />,
      },
      {
        label: intl.formatMessage({
          id: "provisionStatus",
          defaultMessage: "Deployment Status",
        }),
        value: <Constant value={status as unknown as ConstantEnum} />,
      },
      {
        label: intl.formatMessage({
          id: "platform",
          defaultMessage: "Platform",
        }),
        value: <Constant value={platform as any} />,
      },
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        value: description ? <Text>{description}</Text> : undefined,
      },
      {
        label: intl.formatMessage({
          id: "uuid",
          defaultMessage: "UUID",
        }),
        value: <CopyableText>{uuid}</CopyableText>,
      },
      {
        label: intl.formatMessage({
          id: "createDate",
          defaultMessage: "Creation Time",
        }),
        value: getServerTime(createDate).format("YYYY-MM-DD HH:mm:ss"),
      },
    ],
    [
      intl,
      state,
      status,
      platform,
      description,
      uuid,
      getServerTime,
      createDate,
    ],
  );

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "basic.info",
        defaultMessage: "Basic Info",
      })}
      isList
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default BasicInfo;

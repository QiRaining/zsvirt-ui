import type { ListItem, IDraggableCardProps } from "@zstack/zsphere-components";
import {
  List,
  Constant,
  ResourceName,
  DraggableCard,
} from "@zstack/zsphere-components";
import { ConstantEnum } from "@zstack/zsphere-constant";
import type { SnapshotStrategy } from "@zstack/zsphere-types/graphql";
import { useMemo } from "react";
import { useIntl } from "react-intl";

export interface IProps extends IDraggableCardProps {
  current?: SnapshotStrategy;
}

export default function BasicInfo({ current, ...props }: IProps) {
  const intl = useIntl();

  const list = useMemo<ListItem[]>(
    () => [
      {
        label: intl.formatMessage({
          id: "enableStatus",
          defaultMessage: "State",
        }),
        value: current?.state && (
          <Constant value={ConstantEnum[current.state]} />
        ),
      },
      {
        label: intl.formatMessage({
          id: "vmNum",
          defaultMessage: "VMs",
        }),
        value: current?.jobs?.length ?? 0,
      },
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        canModify: true,
        value: current?.description,
      },
      {
        label: intl.formatMessage({ id: "UUID", defaultMessage: "UUID" }),
        copyable: true,
        value: current?.uuid,
      },
      {
        label: intl.formatMessage({ id: "owner", defaultMessage: "Owner" }),
        value:
          current?.owner.uuid === "36c27e8ff05c4780bf6d2fa65700f22e" ? (
            current?.owner.name
          ) : (
            <ResourceName
              value={current?.owner.name}
              link={{
                to: "/account-information",
                microAppName: "virtualization-administration",
                uuid: current?.owner.uuid,
              }}
            />
          ),
      },
    ],
    [current, intl],
  );

  return (
    <DraggableCard
      {...props}
      title={intl.formatMessage({
        id: "basicInfo",
        defaultMessage: "Basic Info",
      })}
      isList
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
}

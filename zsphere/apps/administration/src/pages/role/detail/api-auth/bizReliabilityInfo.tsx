import type { ListItem } from "@zstack/zsphere-components";
import { List, DraggableCard } from "@zstack/zsphere-components";
import { ZsvRoleQueryType } from "@zstack/zsphere-types";
import type { ZsvRole as IZsvRole } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import EditResourceAuth from "./action/edit-resource-auth";
import ItemField from "./components/ItemField";
import {
  ITargetKey,
  useAPIAuthPrivilegeListByKey,
} from "./configures/use-privilege-list";

interface IBizReliabilityInfoProps {
  detail?: IZsvRole;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  refetch?: any;
  handleViewClick: ({
    title,
    apiList,
  }: {
    title: string;
    apiList: string[];
  }) => void;
}

const BizReliabilityInfo: FC<IBizReliabilityInfoProps> = ({
  detail,
  onCollapseChange,
  collapsed,
  handleViewClick,
}) => {
  const intl = useIntl();
  const [editConfigVisible, setEditConfigVisible] = useState<boolean>(false);
  const bizReliability = useAPIAuthPrivilegeListByKey({
    intl,
    targetKey: ITargetKey.bizReliability,
    detail,
  });
  const bizReliabilityMemo = useMemo(
    () => bizReliability?.children,
    [bizReliability],
  );

  const list: ListItem[] = useMemo(() => {
    return bizReliabilityMemo?.map((item: any) => {
      return {
        label: item.name,
        value: <ItemField item={item} handleViewClick={handleViewClick} />,
      };
    });
  }, [bizReliabilityMemo]);

  const title = useMemo(
    () =>
      intl.formatMessage({
        id: "biz.reliability.info.title",
        defaultMessage: "Business Reliability",
      }),
    [intl],
  );

  return (
    <>
      <DraggableCard
        title={title}
        isList
        key={ITargetKey.bizReliability}
        onCollapseChange={onCollapseChange}
        collapsed={collapsed}
        titleActions={
          detail?.type === ZsvRoleQueryType.Predefined
            ? []
            : [
                {
                  icon: "edit",
                  onClick: () => setEditConfigVisible(true),
                  authKey: "virtualization.edit.config",
                  resource: "zsv.role",
                },
              ]
        }
      >
        <List list={list} bordered={false} />
      </DraggableCard>
      {editConfigVisible && (
        <EditResourceAuth
          visible={editConfigVisible}
          setVisible={setEditConfigVisible}
          selectedList={bizReliabilityMemo}
          source={detail}
          title={title}
        />
      )}
    </>
  );
};

export default BizReliabilityInfo;

import { useTime } from "@zstack/hooks";
import type { ListItem } from "@zstack/zsphere-components";
import {
  DraggableCard,
  List,
  ShareType,
  useShare,
} from "@zstack/zsphere-components";
import { LongText } from "@zstack/zsphere-design-biz";
import type { L3Network as IL3Network } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import EditConfig from "../../action/edit-config";

interface IProps {
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  current: IL3Network;
}

const BasicInfo: React.FC<IProps> = ({
  onCollapseChange,
  collapsed = false,
  current,
}) => {
  const intl = useIntl();
  const { getServerTime } = useTime();
  const [visible, setVisible] = useState(false);
  const { isShareResource } = useShare();

  const list: ListItem[] = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "virtualization.port.num",
          defaultMessage: "Used Ports",
        }),
        value: current.usedIpCount ?? 0,
      },
      {
        label: intl.formatMessage({
          id: "shareType",
          defaultMessage: "Sharing Mode",
        }),
        value: <ShareType type={current.shareType!} />,
      },
      {
        label: intl.formatMessage({
          id: "owner",
          defaultMessage: "Owner",
        }),
        value: current.owner?.name,
      },
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        canModify: true,
        value: <LongText value={current.description || undefined} />,
      },
      {
        label: "UUID",
        value: current.uuid,
        copyable: true,
      },
      {
        label: intl.formatMessage({
          id: "createDate",
          defaultMessage: "Creation Time",
        }),
        value: getServerTime(current.createDate!).format("YYYY-MM-DD HH:mm:ss"),
        key: "createDate",
      },
    ],
    [intl, getServerTime, current],
  );

  const memoizedSelectedList = useMemo(() => [current], [current]);

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
        titleActions={
          isShareResource([current])
            ? undefined
            : [
                {
                  icon: "edit",
                  tooltip: intl.formatMessage({
                    id: "edit.config",
                    defaultMessage: "Modify Configuration",
                  }),
                  onClick: () => setVisible(true),
                  authKey: "virtualization.edit.config",
                  resource: "flat.network",
                },
              ]
        }
      >
        <List list={list} bordered={false} />
      </DraggableCard>
      <EditConfig
        selectedList={memoizedSelectedList}
        visible={visible}
        setVisible={setVisible}
        view="detial"
        position="header"
      />
    </>
  );
};

export default BasicInfo;

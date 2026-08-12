import { Text } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import type { ListItem } from "@zstack/zsphere-components";
import { List, Link, DraggableCard } from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import type { Tag as ITag } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import UpdateTagModal from "../../action/update";

export interface IProps {
  detail: ITag;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const BasicInfo: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed,
}) => {
  const intl = useIntl();

  const { getServerTime } = useTime();

  const [updateTagModalVisible, setUpdateTagModalVisible] =
    React.useState<boolean>(false);

  const list = React.useMemo<Array<ListItem>>(
    () => [
      {
        label: intl.formatMessage({
          id: "virtualization.tag.detail.field.color",
          defaultMessage: "Color",
        }),
        value: (
          <div
            className="cursor-pointer transition-opacity hover:opacity-70"
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: detail.color,
              borderRadius: "50%",
            }}
            onClick={() => {
              setUpdateTagModalVisible(true);
            }}
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "virtualization.cluster.detail.field.resourceCount",
          defaultMessage: "Attached Resources",
        }),
        value: detail?.resourceCount,
      },
      {
        label: intl.formatMessage({
          id: "owner",
          defaultMessage: "Owner",
        }),
        value: (
          <Link.Owner uuid={detail.owner?.uuid} type={detail.owner?.type}>
            {detail.owner?.name}
          </Link.Owner>
        ),
      },
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        value: detail.description ? (
          <Text>{detail.description}</Text>
        ) : (
          <Text>{intl.formatMessage({ id: "none" })}</Text>
        ),
      },
      {
        label: intl.formatMessage({
          id: "uuid",
          defaultMessage: "UUID",
        }),
        value: <CopyableText>{detail.uuid}</CopyableText>,
      },
      {
        label: intl.formatMessage({
          id: "createDate",
          defaultMessage: "Creation Time",
        }),
        value: getServerTime(detail.createDate).format("YYYY-MM-DD HH:mm:ss"),
      },
      //  去除所有最后操作时间
      // {
      //   label: intl.formatMessage({
      //     id: 'lastOpDate',
      //     defaultMessage: '最后操作日期'
      //   }),
      //   value: getServerTime(detail.lastOpDate).format('YYYY-MM-DD HH:mm:ss')
      // }
    ],
    [intl, detail],
  );

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
            onClick: () => {
              setUpdateTagModalVisible(true);
            },
          },
        ]}
      >
        <List list={list} bordered={false} />
      </DraggableCard>

      <UpdateTagModal
        view="main"
        position="header"
        visible={updateTagModalVisible}
        setVisible={setUpdateTagModalVisible}
        selectedList={[detail]}
      />
    </>
  );
};

export default BasicInfo;

import { useTime } from "@zstack/hooks";
import type { ListItem } from "@zstack/zsphere-components";
import { List, Constant, DraggableCard } from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import type { ZWatchAlarmVO as IZWatchAlarmVO } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import Modify from "../../modify";

interface IProps {
  detail: IZWatchAlarmVO;
  refetch?: () => void;
}

const BasicInfo: React.FC<IProps> = ({ detail }) => {
  const intl = useIntl();
  const [visible, setVisible] = useState(false);
  const { getServerTime } = useTime();

  const list: ListItem[] = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "enable.state",
          defaultMessage: "State",
        }),
        value: <Constant value={detail?.state as any} />,
      },
      // {
      //   label: intl.formatMessage({
      //     id: 'description',
      //     defaultMessage: '简介'
      //   }),
      //   value: <ResourceName value={detail?.description || undefined} canModify />
      // },
      {
        label: intl.formatMessage({
          id: "uuid",
          defaultMessage: "UUID",
        }),
        value: <CopyableText>{detail.uuid}</CopyableText>,
      },
      {
        label: intl.formatMessage({
          id: "createTime",
          defaultMessage: "Creation Time",
        }),
        value: getServerTime(detail.createDate!).format("YYYY-MM-DD HH:mm:ss"),
      },
      //  去除所有最后操作时间
      // {
      //   label: intl.formatMessage({ id: 'last.op.date', defaultMessage: '最后操作时间' }),
      //   value: getServerTime(detail.lastOpDate!).format('YYYY-MM-DD HH:mm:ss')
      // }
    ],
    [detail, intl, getServerTime],
  );

  return (
    <>
      <DraggableCard
        title={intl.formatMessage({
          id: "basic.info",
          defaultMessage: "Basic Info",
        })}
        isList
        collapsed={false}
      >
        <List list={list} bordered={false} />
      </DraggableCard>
      <Modify
        visible={visible}
        setVisible={setVisible}
        selectedList={[detail]}
        source={detail}
        position="header"
        view="main.virtualization"
      />
    </>
  );
};

export default BasicInfo;

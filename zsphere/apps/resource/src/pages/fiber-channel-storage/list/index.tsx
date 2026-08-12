import { Icon } from "@zstack/icon";
import { fiberChannelStorageList } from "@zstack/virtualization-resource/src/gql/fiber-channel-storage.gql";
import FiberChannelLunList from "@zstack/virtualization-resource/src/pages/fiber-channel-lun/list";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { FiberChannelStorage as IFiberChannelStorage } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { useActionConfig, useQueryConfig, useColumnConfig } from "../config";

import styles from "./style.module.less";

const FiberChannelStorageList: React.FC<IListProps<IFiberChannelStorage>> = ({
  defaultQuery = {},
  selectType = "checkbox",
  columnKeys = [],
  ...props
}) => {
  const queryConfig = useQueryConfig(defaultQuery);
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig();

  const intl = useIntl();

  const subViewToolbarHandleTooltip = props?.view === "main" && (
    <ReactMarkdown allowDangerousHtml>
      {intl.formatMessage({
        id: "fc.storage.tooltip",
        defaultMessage: `### FC Storage

1. You can add an FC server by using the UI. Then the dynamics of FC storage and all block devices are displayed in real time on the UI. You can also pass through the block devices to virtual machines.
2. You can check the status of the clusters where block devices reside. If all hosts are connected with block devices, the block devices can be added as shared block primary storage.`,
      })}
    </ReactMarkdown>
  );

  const expandedRowRender = (record: IFiberChannelStorage) => {
    return (
      <div className={styles.fiberChannelStorage}>
        <div className={styles.title}>
          <span className={styles.titletext}>
            {intl.formatMessage({
              id: "block.device",
              defaultMessage: "LUN",
            })}
          </span>
        </div>
        <FiberChannelLunList
          view="main"
          toolbar={[]}
          defaultQuery={{
            conditions: [
              {
                key: "fiberChannelStorageUuid",
                value: record?.uuid,
                op: Op.eq,
              },
            ],
            limit: 1000,
          }}
        />
      </div>
    );
  };

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={fiberChannelStorageList}
      type="FiberChannelStorage"
      resource="fiber.channel.storage"
      toolbarHandleTooltip={subViewToolbarHandleTooltip}
      rowSelection={false}
      expandable={{
        expandIcon: ({ expanded, onExpand, record }) =>
          expanded ? (
            <Icon type="arrow-ios-down" onClick={(e) => onExpand(record, e)} />
          ) : (
            <Icon type="arrow-ios-right" onClick={(e) => onExpand(record, e)} />
          ),
        expandedRowRender,
      }}
      defaultQuery={defaultQuery}
      selectType={selectType}
      columnKeys={columnKeys}
      {...props}
    />
  );
};

export default FiberChannelStorageList;

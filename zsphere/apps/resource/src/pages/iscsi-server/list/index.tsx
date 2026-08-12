import { Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Link, TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { IscsiServer as IIscsiServer } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { iscsiServerList } from "../../../gql/iscsi-server.gql";
import { useActionConfig, useQueryConfig, useColumnConfig } from "../config";

import styles from "./style.module.less";

const IscsiServerList: React.FC<IListProps<IIscsiServer>> = (props) => {
  const queryConfig = useQueryConfig(props.defaultQuery);
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig();

  const intl = useIntl();

  const subViewToolbarHandleTooltip = props?.view === "main" && (
    <ReactMarkdown allowDangerousHtml>
      {intl.formatMessage({
        id: "iscsiServerStorage.tooltip",
        defaultMessage: `### iSCSI Storage

1. You can add an iSCSI server by using the UI and log in to the server on the UI. You do not need to configure an iSCSI server on the console of a host.
2. After you add an iSCSI server, you can synchronize data to display all block devices on the UI. Then you can pass through the block devices to virtual machines.`,
      })}
    </ReactMarkdown>
  );

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={iscsiServerList}
      type="IscsiServer"
      resource="iscsi.server"
      toolbarHandleTooltip={subViewToolbarHandleTooltip}
      expandable={{
        expandIcon: ({ expanded, onExpand, record }) =>
          expanded ? (
            <Icon type="arrow-ios-down" onClick={(e) => onExpand(record, e)} />
          ) : (
            <Icon type="arrow-ios-right" onClick={(e) => onExpand(record, e)} />
          ),
        expandedRowRender(record: IIscsiServer) {
          return (
            <div className={styles.iscsiServer}>
              <div className="flex justify-between gap-[20px]">
                <div className={`w-full ${styles.title}`}>
                  <span className={styles.titletext}>
                    {intl.formatMessage({
                      id: "iSCSIQualified",
                      defaultMessage: "IQN",
                    })}
                  </span>
                </div>
                {record?.iscsiTargets?.map((it) => (
                  <div className="w-1/2" key={it.uuid}>
                    <Text>
                      <span>
                        <Link
                          to={{
                            pathname: "/iscsi-server/list/iqn-detail",
                            search: `?uuid=${it.uuid}`,
                            state: {
                              ...it,
                              port: record?.port,
                              ip: record?.ip,
                            },
                          }}
                        >
                          {it.iqn}
                        </Link>
                      </span>
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          );
        },
      }}
      {...props}
    />
  );
};

export default React.memo(IscsiServerList);

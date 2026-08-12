import { dnsList } from "@zstack/virtualization-resource/src/gql/l3-network.gql";
import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type {
  L3Network as IL3Network,
  Dns as IDns,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { useColumnConfig, useActionConfig } from "./config";

const List: React.FC<
  IListProps<IDns> & {
    current: IL3Network;
    iL3NetworkType?: string;
  }
> = (props) => {
  // const queryConfig = useQueryConfig(props.defaultQuery)
  const intl = useIntl();
  const toolbar: ITableListProps<IDns>["toolbar"] = ["refresh", "operation"];
  const columnConfig = useColumnConfig();
  const ipVersion = undefined;
  const actionConfig = useActionConfig(ipVersion);
  return (
    <TableList
      columnConfig={columnConfig}
      queryConfig={[]}
      toolbar={toolbar}
      actionConfig={actionConfig}
      gql={dnsList}
      toolbarHandleTooltip={
        props?.current?.networkType === "vpc" ? (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "vpcNetwork.detial.dns.tooltip",
              defaultMessage: `### DNS
1. The list displays only DNS you specify when creating the VPC network or add after the creation.
2. If you do not specify a DNS address when you create the VPC network, the network uses its gateway address as the DNS address by default. This DNS is not displayed here and cannot be deleted or modified.`,
            })}
          </ReactMarkdown>
        ) : (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "l3Network.detial.dns.tooltip",
              defaultMessage: `### DNS

If you add or delete a DNS, restart the virtual machine to make the modification take effect.

- If DHCP is enabled, the DNS is deployed through DHCP.
- If DHCP is disabled, the DNS is deployed through VMTools.
- If neither DHCP is enabled nor VMTools is installed, the DNS will not be deployed automatically.`,
            })}
          </ReactMarkdown>
        )
      }
      resource="dns"
      type="Dns"
      rowKey="dns"
      rowSelection={{
        getCheckboxProps: () => ({
          disabled: !!props.current.isDefault,
        }),
      }}
      {...props}
    />
  );
};

export default List;

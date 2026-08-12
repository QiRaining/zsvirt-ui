import type { FieldList } from "@zstack/virtualization-resource/src/pages/bond/list";
import {
  expandIcon,
  cidrToSubnet,
  NicCard,
} from "@zstack/virtualization-resource/src/pages/bond/list";
import { Field } from "@zstack/zsphere-components";
import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { UplinkGroup } from "@zstack/zsphere-types/graphql";
import { orderBy as _orderBy } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { uplinkGroupList } from "../../../gql/uplink-group.gql";
import { useActionConfig, useQueryConfig, useColumnConfig } from "../config";

type BaseProps = IListProps<UplinkGroup> &
  Partial<Pick<ITableListProps<UplinkGroup>, "toolbar" | "rowKey">>;

interface IProps extends BaseProps {}

const toolbar: ITableListProps<UplinkGroup>["toolbar"] = [
  "refresh",
  "operation",
];

const STYLE_SLAVE_WRAPPER = { marginTop: "-8px" } as const;
const STYLE_EXPAND_ROW = { margin: "20px 80px" } as const;

const List: React.FC<IProps> = ({ defaultQuery, ...props }) => {
  const intl = useIntl();

  const queryConfig = useQueryConfig({ defaultQuery });
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig();

  const expand = React.useMemo(() => {
    const fieldList: FieldList<UplinkGroup> = [
      {
        key: "mac",
        label: intl.formatMessage({
          id: "mac.address",
          defaultMessage: "MAC Address",
        }),
        render: (uplinkGroup) =>
          uplinkGroup?.bond?.mac ?? uplinkGroup?.physicalNic?.mac,
      },
      {
        key: "gateway",
        label: intl.formatMessage({
          id: "gateway",
          defaultMessage: "Gateway",
        }),
        render: (uplinkGroup) =>
          uplinkGroup?.bond?.gateway ?? uplinkGroup?.physicalNic?.gateway,
      },
      {
        key: "netmask",
        label: intl.formatMessage({
          id: "netmask",
          defaultMessage: "Netmask",
        }),
        render: (uplinkGroup) => {
          const cidr =
            uplinkGroup?.bond?.ipAddresses?.[0] ??
            uplinkGroup?.physicalNic?.ipAddresses?.[0];
          return cidr && cidrToSubnet(cidr);
        },
      },
      {
        key: "physical.nic",
        label: intl.formatMessage({
          id: "physical.port",
          defaultMessage: "Physical Port",
        }),
        render: (uplinkGroup) => {
          const slaves = uplinkGroup?.interfaceUuid
            ? [uplinkGroup.physicalNic]
            : (uplinkGroup?.bond?.slaves ?? []);

          return slaves?.length ? (
            <div style={STYLE_SLAVE_WRAPPER}>
              {_orderBy(slaves, ["interfaceName"], ["asc"])?.map((slave) => (
                <NicCard key={slave!.uuid} nic={slave!} />
              ))}
            </div>
          ) : null;
        },
      },
    ];

    return {
      expandIcon,
      expandedRowRender: (uplinkGroup: UplinkGroup) => {
        return (
          <div style={STYLE_EXPAND_ROW}>
            {fieldList
              .filter((field) => field.visible?.(uplinkGroup) ?? true)
              .map((field) => (
                <Field
                  label={field.label}
                  key={field.key}
                  icon={field.info && "info"}
                  iconTooltip={
                    field.info && (
                      <ReactMarkdown>
                        {intl.formatMessage({
                          id: "bond.field.HashPolicy.tooltip",
                          defaultMessage: `### Hash Policy
A bond of LACP mode determines its network export based on a hash computation. Three hash policies are supported: layer2+3, layer 3+4, and layer2.

1. layer2+3: Picks out a NIC port to send data packets based on the hash computation on the source MAC address, destination MAC address, and IP address.
2. layer3+4: Picks out a NIC port to send data packets based on the hash computation on the IP address and port. TCP/IP stacks are supported.
3. layer2: Picks out a NIC port to send data packets based on the hash computation on the source MAC address and destination MAC address.`,
                        })}
                      </ReactMarkdown>
                    )
                  }
                >
                  {field.render(uplinkGroup)}
                </Field>
              ))}
          </div>
        );
      },
    };
  }, [intl]);

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={uplinkGroupList}
      type="UplinkGroup"
      resource="uplink.group"
      toolbar={toolbar}
      defaultQuery={defaultQuery}
      expandable={expand}
      {...props}
    />
  );
};

export default List;

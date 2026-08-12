import { Icon } from "@zstack/icon";
import { bondList } from "@zstack/virtualization-resource/src/gql/bond.gql";
import {
  NicLightSwitch,
  formatSpeed,
} from "@zstack/virtualization-resource/src/pages/physical-nic/config/useColumnConfig";
import { Constant } from "@zstack/zsphere-components";
import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList, Field } from "@zstack/zsphere-components";
import type { ConstantEnum } from "@zstack/zsphere-constant";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";
import type { IListProps } from "@zstack/zsphere-types";
import type { Bond, PhysicalNic } from "@zstack/zsphere-types/graphql";
import { orderBy as _orderBy } from "lodash-es";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { useActionConfig, useColumnConfig, useQueryConfig } from "../config";
import BondDetail from "../detail";

import style from "./style.module.less";

const nicCardMarginStyle = { marginTop: "-8px" } as const;
const expandedRowStyle = { margin: "20px 80px" } as const;

type IProps = IListProps<Bond> &
  Pick<ITableListProps<Bond>, "expandable"> & {
    actionRefetch?: () => any;
    showExpandable?: boolean;
    queryProps?: IQueryProps;
    getDetailContainer?: any;
  };

export type FieldList<T> = {
  key: string;
  label: string;
  render: (row: T) => any;
  visible?: (row: T) => boolean;
  info?: any;
}[];

export const expandIcon = ({ expanded, onExpand, record }: any) =>
  expanded ? (
    <Icon type="arrow-ios-down" onClick={(e) => onExpand(record, e)} />
  ) : (
    <Icon type="arrow-ios-right" onClick={(e) => onExpand(record, e)} />
  );

export function cidrToSubnet(cidr: string): string {
  const [, subnetBits] = cidr.split("/");
  const subnetBitsNum = parseInt(subnetBits, 10);
  const subnetMask = ~((1 << (32 - subnetBitsNum)) - 1);
  return [
    (subnetMask >>> 24) & 255,
    (subnetMask >>> 16) & 255,
    (subnetMask >>> 8) & 255,
    subnetMask & 255,
  ].join(".");
}

export const NicCard = ({ nic }: { nic: PhysicalNic }) => {
  return (
    <div className={style["nic-card"]}>
      <div className={style["nic-name"]}>
        <span>{nic.interfaceName}</span>
        <NicLightSwitch
          interfaceName={nic?.interfaceName}
          hostUuid={nic.host?.uuid}
          speed={nic?.speed}
          state={nic?.state}
          hostStatus={nic.host?.status}
        />
      </div>
      <div className={style["nic-state"]}>
        <Constant value={nic.state as any as ConstantEnum.UP} />
        <span className={style.line}>|</span>
        <span>{formatSpeed(nic.speed)}</span>
      </div>
    </div>
  );
};

const BondList: React.FC<IProps> = (props) => {
  const { actionRefetch, showExpandable, ...resProps } = props;
  const queryConfig = useQueryConfig(props.queryProps);
  const actionConfig = useActionConfig({ actionRefetch });
  const columnConfig = useColumnConfig();
  const intl = useIntl();

  const expand = useMemo(() => {
    const fieldList: FieldList<Bond> = [
      {
        key: "mac",
        label: intl.formatMessage({
          id: "mac.address",
          defaultMessage: "MAC Address",
        }),
        render: (bond) => bond.mac,
      },
      {
        key: "gateway",
        label: intl.formatMessage({
          id: "gateway",
          defaultMessage: "Gateway",
        }),
        render: (bond) => bond.gateway,
      },
      {
        key: "netmask",
        label: intl.formatMessage({
          id: "netmask",
          defaultMessage: "Netmask",
        }),
        render: (bond) => {
          const cidr = bond.ipAddresses?.[0];
          return cidr && cidrToSubnet(cidr);
        },
      },
      {
        key: "physical.nic",
        label: intl.formatMessage({
          id: "physical.port",
          defaultMessage: "Physical Port",
        }),
        render: (bond) =>
          bond.slaves?.length ? (
            <div style={nicCardMarginStyle}>
              {_orderBy(bond.slaves, ["interfaceName"], ["asc"])?.map(
                (slave) => (
                  <NicCard key={slave.uuid} nic={slave} />
                ),
              )}
            </div>
          ) : null,
      },
    ];

    return {
      expandIcon,
      expandedRowRender: (bond: Bond) => {
        return (
          <div style={expandedRowStyle}>
            {fieldList
              .filter((field) => field.visible?.(bond) ?? true)
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
                  {field.render(bond)}
                </Field>
              ))}
          </div>
        );
      },
    };
  }, [intl]);

  return (
    <>
      <TableList
        columnConfig={columnConfig}
        actionConfig={actionConfig}
        queryConfig={queryConfig}
        gql={bondList}
        resource="bond"
        type="Bond"
        expandable={showExpandable ? expand : undefined}
        {...resProps}
        renderRowDetail={
          props?.view.indexOf("select") === -1
            ? (record, visible, onClose) => (
                <BondDetail
                  {...props}
                  current={record}
                  visible={visible}
                  onClose={onClose}
                  getContainer={props.getDetailContainer}
                />
              )
            : undefined
        }
      />
    </>
  );
};

export default React.memo(BondList);

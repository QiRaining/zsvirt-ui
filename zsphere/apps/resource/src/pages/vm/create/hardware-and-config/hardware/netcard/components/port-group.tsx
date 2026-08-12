import { Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { queryL3NetworkListForCreateInstance } from "@zstack/virtualization-resource/src/gql/port-group.gql";
import L3NetworkList from "@zstack/virtualization-resource/src/pages/l3-network/list";
import type { ModalSelectProps } from "@zstack/zsphere-components";
import { Form, ModalSelect } from "@zstack/zsphere-components";
import type { Condition, FormCreateType } from "@zstack/zsphere-types";
import { L3NetworkQueryType, Op } from "@zstack/zsphere-types";
import type { VmNic as IVmNic } from "@zstack/zsphere-types/graphql";
import { keys } from "lodash-es";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

import styles from "../style.module.less";

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  formCreateType?: FormCreateType;
  form: any;
  index: number;
  zoneUuid: string;
  source: any;
  isEdit?: boolean;
  origin?: IVmNic;
}

const { Item } = Form;

const updateExtraConditions = (
  source: any,
  runPath: any,
  extraConditions: Condition[],
): Condition[] => {
  if (runPath && ["Cluster", "HostVO"].indexOf(source?.__typename) === -1) {
    let clusterUuid = "";
    if (runPath?.[0]?.__typename === "Cluster") {
      clusterUuid = runPath?.[0]?.uuid;
    } else if (runPath?.[0]?.__typename === "HostVO") {
      clusterUuid = runPath?.[0]?.cluster?.uuid;
    }

    if (clusterUuid) {
      extraConditions.push({
        key: "clusterUuid",
        op: Op.eq,
        value: clusterUuid,
      });
    }
  }

  if (source) {
    switch (source.__typename) {
      case "Cluster":
        extraConditions.push({
          key: "clusterUuid",
          op: Op.eq,
          value: source.uuid,
        });
        break;
      case "HostVO":
        extraConditions.push({
          key: "clusterUuid",
          op: Op.eq,
          value: source.cluster.uuid,
        });
        extraConditions.push({
          key: "hostUuid",
          op: Op.eq,
          value: source.uuid,
        });
        break;
      case "VmInstance":
        extraConditions.push({
          key: "clusterUuid",
          op: Op.eq,
          value: source.clusterUuid,
        });
        if (source.hostUuid || source.lastHostUuid) {
          extraConditions.push({
            key: "hostUuid",
            op: Op.eq,
            value: source.hostUuid || source.lastHostUuid,
          });
        }
        break;
    }
  }

  return extraConditions;
};

const PortGroup: React.FC<IProps> = ({
  form,
  index,
  zoneUuid,
  source,
  origin,
}) => {
  const intl = useIntl();

  const defaultExtraConditions: Condition[] = useMemo(() => {
    return [
      {
        key: "zoneUuid",
        op: Op.eq,
        value: zoneUuid,
      },
    ];
  }, [zoneUuid]);

  // 计算 autoSelect 条件 - 使用 useMemo 来优化性能
  const shouldAutoSelect = useMemo(() => {
    const l3NetworkUuids = form.getFieldValue(`l3NetworkUuids-${index}`) ?? [];
    const isL3Touched = form.isFieldTouched(`l3NetworkUuids-${index}`);

    return (
      source?.__typename !== "VmInstance" &&
      index === 0 &&
      l3NetworkUuids?.length === 0 &&
      !isL3Touched
    );
  }, [form, index, source]);

  const clearNicAttriAfterL3Change = () => {
    form.setFields([
      {
        name: `appointIpv4-${index}`,
        value: false,
      },
      {
        name: `appointIpv6-${index}`,
        value: false,
      },
      {
        name: `ipv4-${index}`,
        value: undefined,
      },
      {
        name: `ipv6-${index}`,
        value: undefined,
      },
      {
        name: `netmask-${index}`,
        value: undefined,
      },
      {
        name: `prefixLen-${index}`,
        value: undefined,
      },
      {
        name: `gateway4-${index}`,
        value: undefined,
      },
      {
        name: `gateway6-${index}`,
        value: undefined,
      },
    ]);
  };

  // 处理runPath变化时清空端口组的逻辑
  useEffect(() => {
    const runPath = form.getFieldValue("runPath");
    const isRunPathTouched = form.isFieldTouched("runPath");
    const l3NetworkUuids = form.getFieldValue(`l3NetworkUuids-${index}`) ?? [];

    if (isRunPathTouched && l3NetworkUuids.length !== 0) {
      let clusterUuid = "";
      if (runPath?.[0]?.__typename === "Cluster") {
        clusterUuid = runPath?.[0]?.uuid;
      }
      if (runPath?.[0]?.__typename === "HostVO") {
        clusterUuid = runPath?.[0]?.cluster?.uuid;
      }

      if (
        l3NetworkUuids?.[0]?.l2Network?.attachedClusterUuids?.indexOf(
          clusterUuid,
        ) === -1
      ) {
        form.setFields([
          {
            name: `l3NetworkUuids-${index}`,
            value: [],
          },
        ]);
      }
    }
  }, [form, index]);

  return (
    <Item
      noStyle
      shouldUpdate={(prev, curr) => {
        const l3networkKeys = keys(prev).filter(
          (key) =>
            key.indexOf("l3NetworkUuids-") > -1 &&
            key !== `l3NetworkUuids-${index}`,
        );
        return (
          prev.runPath !== curr.runPath ||
          l3networkKeys.some((key) => prev[key] !== curr[key]) ||
          prev[`nicType-${index}`] !== curr[`nicType-${index}`]
        );
      }}
    >
      {() => {
        const runPath = form.getFieldValue("runPath");
        const l3NetworkUuidsDisabled: boolean = origin?.driverType === "SR-IOV";
        const values = form.getFieldsValue(true);

        const l3NetworkUuids = keys(values)
          .filter(
            (key) =>
              key.indexOf("l3NetworkUuids-") > -1 && values?.[key]?.length,
          )
          .map((key) => values?.[key]?.[0]?.uuid);

        const baseConditions = [
          { key: "l2Network.cluster.type", value: "zstack", op: Op.eq },
          { key: "defaultFilter", value: "NOT_DEFAULT" },
        ];

        //判断是否已存在网卡
        const isExitedNic = !!origin?.uuid;
        let defaultQuery = {};

        if (isExitedNic) {
          //编辑虚拟机且已经存在
          defaultQuery = {
            type: L3NetworkQueryType.SetIPAddress,
            conditions: baseConditions,
            extraConditions: [
              {
                key: "l3NetworkUuids",
                values: l3NetworkUuids,
                op: Op.in,
              },
              {
                key: "vmNicUuids",
                values: source.vmNics.map((it: any) => it.uuid),
                op: Op.in,
              },
            ],
          };
        } else {
          const extraConditions = updateExtraConditions(
            source,
            runPath,
            defaultExtraConditions,
          );
          defaultQuery = {
            type: L3NetworkQueryType.CreateInstance,
            conditions: [...baseConditions, ...extraConditions],
          };
        }

        return isExitedNic ? (
          <Item
            label={intl.formatMessage({
              id: "virtualization.create.instance.hardware.network.card.port.group",
              defaultMessage: "Port Group",
            })}
            name={`l3NetworkUuids-${index}`}
            tooltip={
              l3NetworkUuidsDisabled
                ? intl.formatMessage({
                    id: "driverType.is.sriov.port.group.tooltip",
                    defaultMessage: "You cannot change the SR-IOV NIC to another port group.",
                  })
                : undefined
            }
            initialValue={[]}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: "instance.field.l3NetworkUuids.validator.required",
                  defaultMessage: "Select Distributed Port Group",
                }),
              },
            ]}
          >
            {origin?.l3Network?.uuid ? (
              <PortGroupModalSelect
                index={index}
                title={intl.formatMessage({
                  id: "virtualization.create.instance.hardware.network.card.select.port.group",
                  defaultMessage: "Select Distributed Port Group",
                })}
                className={styles["width-200"]}
                autoSelect={shouldAutoSelect && !!runPath?.[0]}
                autoSelectGql={queryL3NetworkListForCreateInstance}
                modalWidth={800}
                disabledItem={l3NetworkUuidsDisabled}
                onChange={() => clearNicAttriAfterL3Change()}
              >
                <L3NetworkList
                  view="select.virtualization"
                  defaultQuery={defaultQuery}
                  className={styles.l3network}
                  gql={queryL3NetworkListForCreateInstance}
                />
              </PortGroupModalSelect>
            ) : (
              <div style={{ width: 200 }}>
                {origin?.l3NetworkUuid ?? "No Auth"}
              </div>
            )}
          </Item>
        ) : (
          <Item
            label={intl.formatMessage({
              id: "virtualization.create.instance.hardware.network.card.port.group",
              defaultMessage: "Port Group",
            })}
            name={`l3NetworkUuids-${index}`}
            initialValue={[]}
            tooltip={
              l3NetworkUuidsDisabled
                ? intl.formatMessage({
                    id: "driverType.is.sriov.port.group.tooltip",
                    defaultMessage: "You cannot change the SR-IOV NIC to another port group.",
                  })
                : undefined
            }
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: "instance.field.l3NetworkUuids.validator.required",
                  defaultMessage: "Select Distributed Port Group",
                }),
              },
            ]}
          >
            <PortGroupModalSelect
              index={index}
              title={intl.formatMessage({
                id: "virtualization.create.instance.hardware.network.card.select.port.group",
                defaultMessage: "Select Distributed Port Group",
              })}
              disabledItem={l3NetworkUuidsDisabled}
              className={styles["width-200"]}
              autoSelect={shouldAutoSelect && !!runPath?.[0]}
              autoSelectGql={queryL3NetworkListForCreateInstance}
              modalWidth={800}
              onChange={() => clearNicAttriAfterL3Change()}
            >
              <L3NetworkList
                view="select.virtualization"
                defaultQuery={defaultQuery}
                className={styles.l3network}
                gql={queryL3NetworkListForCreateInstance}
              />
            </PortGroupModalSelect>
          </Item>
        );
      }}
    </Item>
  );
};

export default React.memo(PortGroup);

export interface IPortGroupModalSelectProps extends ModalSelectProps {
  index: number;
}

export function PortGroupModalSelect({
  index,
  ...props
}: IPortGroupModalSelectProps) {
  const intl = useIntl();

  return (
    <div className={styles.portGroupModalSelectWrapper}>
      <ModalSelect {...props} />
      <Item
        noStyle
        shouldUpdate={(prev, curr) =>
          prev[`l3NetworkUuids-${index}`] !== curr[`l3NetworkUuids-${index}`]
        }
      >
        {({ getFieldValue }) => {
          const selectedPortGroup = getFieldValue(
            `l3NetworkUuids-${index}`,
          )?.[0];
          if (!selectedPortGroup) {
            return null;
          }
          const dhcpEnabled = !!selectedPortGroup.networkServices?.find(
            (item: any) => item.networkServiceType === "DHCP",
          );
          if (dhcpEnabled) {
            return null;
          }
          return (
            <Tooltip
              title={intl.formatMessage({
                id: "vm.field.port.group.alert.dhcp.not.enabled",
                defaultMessage:
                  "The distributed port group has DHCP disabled and cannot auto-assign IP addresses to NICs. Manual IP assignments will take effect after VMTools is installed.",
              })}
            >
              <span style={{ display: "inline-flex", marginLeft: 8 }}>
                <Icon style={{ color: "var(--alert-500)" }} type="alert-triangle-fill" />
              </span>
            </Tooltip>
          );
        }}
      </Item>
    </div>
  );
}

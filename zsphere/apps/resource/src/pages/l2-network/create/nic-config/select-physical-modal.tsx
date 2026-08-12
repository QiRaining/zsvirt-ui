import { useQuery } from "@apollo/client";
import { RadioGroup } from "@zstack/design";
import { bondList } from "@zstack/virtualization-resource/src/gql/bond.gql";
import { physicalNicList } from "@zstack/virtualization-resource/src/gql/host.gql";
import PhysicalNicList from "@zstack/virtualization-resource/src/pages/physical-nic/list";
import { Form, Tag, Select } from "@zstack/zsphere-components";
import {
  Constant,
  ModalTreeSelect,
  ModalSelect,
} from "@zstack/zsphere-components";
import { ConstantEnum } from "@zstack/zsphere-constant";
import type { Condition as ICondition, IQuery } from "@zstack/zsphere-types";
import { Op, PhysicalNicQueryType } from "@zstack/zsphere-types";
import type {
  PhysicalNic,
  Host as IHost,
  Bond as IBond,
} from "@zstack/zsphere-types/graphql";
import { groupBy, keys, uniqBy } from "lodash-es";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import styles from "../style.module.less";

const SPAN_MARGIN_STYLE = { margin: "0 5px" } as const;

interface IProps {
  form: any;
  clusterUuids?: string[];
  hostUuids?: string[];
  inCreate?: boolean;
  limit?: number;
  title?: string;
  conditions?: ICondition[];
  physicalNicTips?: string;
  hideConfig?: boolean;
  selectWidth?: number;
  labelWidth?: 120 | 160 | 148;
  mode?: "tags" | "multiple";
  checkable?: boolean;
  defaultQuery?: IQuery;
}

interface SeletedPhysicalNics {
  host: IHost;
  hostUuid?: string;
  physicalNics: PhysicalNic[];
}

const SelectPhysicalNicEvery: React.FC<IProps> = ({
  clusterUuids = [],
  hostUuids = [],
  title,
  limit = 8,
}) => {
  const intl = useIntl();

  const defaultQuery = useMemo(() => {
    return {
      sortBy: "interfaceName",
      type: PhysicalNicQueryType.getCandidatesPhysicalNicForCreateByInL2VSwitch,
      conditions: [
        {
          key: "clusterUuids",
          values: clusterUuids,
          op: Op.in,
        },
        {
          key: "hostUuids", // 传入host话 就查询host上的可用网卡
          values: hostUuids,
          op: Op.in,
        },
        {
          key: "intersecting",
          value: "false",
        },
      ],
    };
  }, [clusterUuids, hostUuids]);

  const { data, loading } = useQuery(physicalNicList, {
    variables: defaultQuery,
  });

  const treeData = useMemo(() => {
    if (loading || !data) {
      return [];
    }
    const list = data.physicalNicList.list ?? [];
    const hostToNicList = groupBy(list, "hostUuid");
    const result = keys(hostToNicList).map((hostUuid: string) => {
      const host = hostToNicList[hostUuid].find(
        (item) => item.host.uuid === hostUuid,
      )?.host;
      return {
        key: hostUuid,
        title: host?.name,
        icon: "disk-2",
        attr: host,
        children: hostToNicList[hostUuid].map((nic) => ({
          key: nic.uuid,
          title: (
            <div className={styles["nic-title"]}>
              <div className={styles["nic-name"]}>{nic.interfaceName}</div>
              <div className={styles["nic-description"]}>
                <span>{Number(nic.speed) / 1000} Gbps</span>
                <span
                  className={styles["neutral-300"]}
                  style={SPAN_MARGIN_STYLE}
                >
                  |
                </span>
                <Constant
                  value={
                    nic.state === "UP" ? ConstantEnum.UP : ConstantEnum.DOWN
                  }
                />
              </div>
            </div>
          ),
          icon: "network-port-unfill",
          attr: nic,
        })),
      };
    });
    return result;
  }, [data, loading]);

  const checkItemDisabled = (item: any, selectedNics: PhysicalNic[]) => {
    const hostToNicList = groupBy(selectedNics, "hostUuid");
    if (item.icon === "disk-2") {
      // host
      return {
        disabled: hostToNicList?.[item.attr?.uuid]?.length >= limit,
        tooltip: intl.formatMessage({
          id: "select.physical.nic.num.limit.for.bond",
          defaultMessage: "You can add a maximum of 8 physical ports to a single host.",
        }),
      };
    }
    const hostUuid = item?.attr?.hostUuid;
    if (
      hostToNicList?.[hostUuid]?.length >= limit &&
      selectedNics?.findIndex((nic) => nic.uuid === item?.attr?.uuid) === -1
    ) {
      return {
        disabled: true,
        tooltip: intl.formatMessage({
          id: "select.physical.nic.num.limit.for.bond",
          defaultMessage: "You can add a maximum of 8 physical ports to a single host.",
        }),
      };
    }
    if (
      !!hostToNicList?.[hostUuid]?.length &&
      item?.attr?.speed !== hostToNicList?.[hostUuid]?.[0]?.speed
    ) {
      return {
        disabled: true,
        tooltip: intl.formatMessage({
          id: "select.physical.nic.same.speed.for.bond",
          defaultMessage: "The selected physical ports must operate at the same speed.",
        }),
      };
    }
    return false;
  };

  return (
    <Form.Item
      noStyle
      shouldUpdate={(cur, prev) => cur.physicalNicList !== prev.physicalNicList}
    >
      {({ getFieldValue, setFieldsValue }) => {
        const onTagClose = (uuid: string, removeHostUuid?: string) => {
          const seletedPhysicalNics: PhysicalNic[] =
            getFieldValue("physicalNicList") ?? [];
          setFieldsValue({
            physicalNicList: seletedPhysicalNics.filter(
              (nic) => nic.uuid !== uuid && nic.uuid !== removeHostUuid,
            ),
          });
        };

        const nicColumnConfig = [
          {
            title: intl.formatMessage({ id: "host", defaultMessage: "Host" }),
            key: "name",
            width: 120,
            render: (value, current: SeletedPhysicalNics) =>
              current?.host?.name,
          },
          {
            title: intl.formatMessage({
              id: "physical.network.port",
              defaultMessage: "Physical Port",
            }),
            key: "physicalNics",
            width: 240,
            render: (value, current: SeletedPhysicalNics) =>
              current?.physicalNics?.map((nic) => (
                <Tag
                  key={nic?.uuid}
                  closable
                  onClose={() => onTagClose(nic.uuid!, current.hostUuid)}
                >
                  {nic.interfaceName}
                </Tag>
              )),
          },
          {
            title: intl.formatMessage({ id: "speed", defaultMessage: "Speed" }),
            key: "speed",
            width: 80,
            render: (value, current: SeletedPhysicalNics) =>
              `${Number(current?.physicalNics?.[0]?.speed) / 1000} Gbps`,
          },
        ];

        const columnDatasourceTransform = (datasource: PhysicalNic[]) => {
          const hostToNicList = groupBy(datasource, "hostUuid");
          return keys(hostToNicList)
            .filter((key) => key !== "undefined")
            .map((hostUuid) => {
              const host =
                datasource?.find((nic) => nic.hostUuid === hostUuid)?.host ??
                undefined;
              return {
                host,
                hostUuid: host?.uuid,
                physicalNics: datasource.filter(
                  (nic) => nic.hostUuid === hostUuid,
                ),
              };
            });
        };
        return (
          <Form.Item
            name="physicalNicList"
            label={intl.formatMessage({
              id: "host.physicalNic",
              defaultMessage: "Host NIC Ports",
            })}
            icon="info"
            iconTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "virtualization.create.vswitch.physicalnic.icon.tooltip",
                  defaultMessage: `### Host NIC Port

Select the physical ports on the host to be bonded. Both LACP mode and Active-Backup mode support bonding 1 to 8 ports.

1. When creating bonds for each individual host, the selected ports on that host must operate at the same speed.
2. When creating bonds for multiple hosts in bulk, you can only select ports that have the same speed.`,
                })}
              </ReactMarkdown>
            }
            required
            rules={[
              {
                validator(rule, value) {
                  return value?.length
                    ? Promise.resolve()
                    : Promise.reject(
                        intl.formatMessage({
                          id: "pleaseSelect.physicalNic",
                          defaultMessage: "Select a host NIC port.",
                        }),
                      );
                },
              },
            ]}
          >
            <ModalSelect
              wrapClassName={styles.modalSelect}
              disabledBtn={!clusterUuids?.length}
              selectType="checkbox"
              transformKey="interfaceName"
              title={
                title ??
                intl.formatMessage({
                  id: "add.host.and.physicalNic",
                  defaultMessage: "Add Host and Physical Port",
                })
              }
              columnConfig={nicColumnConfig}
              columnDatasourceTransform={columnDatasourceTransform}
              primaryKey="hostUuid"
              label={intl.formatMessage({
                id: "add.host.and.physicalNic",
                defaultMessage: "Add Host and Physical Port",
              })}
              tooltip={
                !clusterUuids?.length
                  ? intl.formatMessage({
                      id: "l2Network.physicalInterface.disabled.tooltip",
                      defaultMessage: "Select a cluster.",
                    })
                  : undefined
              }
              onTagClose={(originSelectedList: any[], hostUuid: string) =>
                originSelectedList?.filter(
                  (it) => it.hostUuid !== hostUuid && it.uuid !== hostUuid,
                )
              }
            >
              <ModalTreeSelect
                treeData={treeData}
                checkItemDisabled={checkItemDisabled}
                onCheck={(vals: any[], e, oldvals: any[] = []) => {
                  if (e.node.icon === "disk-2" && e.checked) {
                    const oldHostNics = oldvals?.filter(
                      (it) =>
                        it.__typename === "PhysicalNic" &&
                        it.hostUuid === e.node.key,
                    );
                    const newVals = vals.filter(
                      (val) =>
                        oldvals.findIndex((it) => it.uuid === val.uuid) === -1,
                    );
                    const selectedNicSpeed =
                      oldHostNics?.[0]?.speed ??
                      newVals?.find((it) => it.__typename === "PhysicalNic")
                        ?.speed;
                    const addVals = newVals.filter(
                      (val) => val.speed === selectedNicSpeed,
                    );
                    if (addVals.length < limit - oldHostNics?.length) {
                      return addVals.length === newVals.length - 1
                        ? vals
                        : addVals.concat(oldvals);
                    }
                    return addVals
                      .splice(0, limit - oldHostNics.length)
                      .concat(oldvals);
                  }
                  return vals;
                }}
              />
            </ModalSelect>
          </Form.Item>
        );
      }}
    </Form.Item>
  );
};

const SelectPhysicalNicForHost: React.FC<IProps> = ({
  hostUuids = [],
  limit = 8,
  physicalNicTips,
  defaultQuery: _defaultQuery,
}) => {
  const intl = useIntl();

  const defaultQuery = useMemo(() => {
    return (
      _defaultQuery || {
        sortBy: "interfaceName",
        type: PhysicalNicQueryType.getCandidatesPhysicalNicForCreateByInL2VSwitch,
        conditions: [
          {
            key: "hostUuids",
            values: hostUuids,
            op: Op.in,
          },
          {
            key: "intersecting",
            value: "false",
          },
        ],
      }
    );
  }, [hostUuids, _defaultQuery]);

  return (
    <Form.Item
      noStyle
      shouldUpdate={(cur, prev) => cur.physicalNicList !== prev.physicalNicList}
    >
      {({ getFieldValue }) => {
        const seletedPhysicalNics: PhysicalNic[] =
          getFieldValue("physicalNicList") ?? [];

        const nicColumnConfig = [
          {
            title: intl.formatMessage({
              id: "virtualization.physical.port",
              defaultMessage: "Physical Port",
            }),
            key: "physical",
            width: 120,
            render: (value, current: PhysicalNic) => current?.interfaceName,
          },
          {
            title: intl.formatMessage({ id: "speed", defaultMessage: "Speed" }),
            key: "speed",
            width: 80,
            render: (value, current: PhysicalNic) =>
              `${Number(current?.speed) / 1000} Gbps`,
          },
          {
            title: intl.formatMessage({
              id: "physical.status",
              defaultMessage: "Status",
            }),
            key: "status",
            width: 80,
            render: (value, current: PhysicalNic) => (
              <Constant
                value={
                  current.state === "UP" ? ConstantEnum.UP : ConstantEnum.DOWN
                }
              />
            ),
          },
        ];

        return (
          <Form.Item
            name="physicalNicList"
            label={intl.formatMessage({
              id: "host.physicalNic",
              defaultMessage: "Host NIC Ports",
            })}
            required
            icon="info"
            iconTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "virtualization.create.vswitch.physicalnic.icon.tooltip",
                  defaultMessage: `### Host NIC Port

Select the physical ports on the host to be bonded. Both LACP mode and Active-Backup mode support bonding 1 to 8 ports.

1. When creating bonds for each individual host, the selected ports on that host must operate at the same speed.
2. When creating bonds for multiple hosts in bulk, you can only select ports that have the same speed.`,
                })}
              </ReactMarkdown>
            }
            rules={[
              {
                validator(rule, value) {
                  return value?.length
                    ? Promise.resolve()
                    : Promise.reject(
                        intl.formatMessage({
                          id: "pleaseSelect.physicalNic",
                          defaultMessage: "Select a host NIC port.",
                        }),
                      );
                },
              },
            ]}
          >
            <ModalSelect
              selectType="checkbox"
              transformKey="interfaceName"
              title={
                physicalNicTips ||
                intl.formatMessage({
                  id: "add.host.and.physicalNic",
                  defaultMessage: "Add Host and Physical Port",
                })
              }
              columnConfig={nicColumnConfig}
              primaryKey="uuid"
              label={
                physicalNicTips ||
                intl.formatMessage({
                  id: "add.host.and.physicalNic",
                  defaultMessage: "Add Host and Physical Port",
                })
              }
              forceShowSelect
            >
              <PhysicalNicList
                rowSelection={{
                  getCheckboxProps: (record: PhysicalNic) => ({
                    disabled:
                      seletedPhysicalNics?.length >= limit &&
                      seletedPhysicalNics?.findIndex(
                        (nic) => nic.uuid === record?.uuid,
                      ) === -1,
                  }),
                }}
                view="select.bond"
                defaultQuery={defaultQuery}
              />
            </ModalSelect>
          </Form.Item>
        );
      }}
    </Form.Item>
  );
};

const SelectPhysicalNicMulti: React.FC<IProps> = ({
  clusterUuids = [],
  limit = 8,
  selectWidth,
  labelWidth,
  mode,
  checkable,
  form,
}) => {
  const intl = useIntl();
  const [selectValue, setSelectValue] = useState<string[]>([]);

  const defaultQuery = useMemo(() => {
    return {
      sortBy: "interfaceName",
      type: PhysicalNicQueryType.getCandidatesPhysicalNicForCreateByInL2VSwitch,
      conditions: [
        {
          key: "clusterUuids",
          values: clusterUuids,
          op: Op.in,
        },
        {
          key: "intersecting",
          value: "true",
        },
      ],
    };
  }, [clusterUuids]);

  const { data, loading } = useQuery(physicalNicList, {
    variables: defaultQuery,
  });

  const selectOptions = useMemo(() => {
    if (loading || !data) {
      return [];
    }
    const list = data.physicalNicList.list ?? [];
    const nameToNicList = groupBy(list, "interfaceName");

    return keys(nameToNicList).map((name: string) => {
      const nic = nameToNicList[name]?.[0];
      const isLastOne =
        selectValue.length === 1 && selectValue.includes(nic.interfaceName);
      return {
        key: nic.interfaceName,
        value: nic.interfaceName,
        label: nic.interfaceName,
        disabled: isLastOne,
        tooltip: isLastOne
          ? intl.formatMessage({
              id: "physical.nic.last.one.tooltip",
              defaultMessage: "Reserve at least one physical port.",
            })
          : undefined,
        extra:
          mode === "multiple"
            ? `${Number(nic?.speed) / 1000} Gbps`
            : [
                `${Number(nic?.speed) / 1000} Gbps`,
                <Constant
                  className={styles.stateSize}
                  value={
                    nic.state === "UP" ? ConstantEnum.UP : ConstantEnum.DOWN
                  }
                />,
              ],
      };
    });
  }, [data, loading, mode, selectValue, intl]);

  const onClear = () => {
    if (selectValue.length > 1) {
      setSelectValue([]);
      form.setFieldsValue({
        physicalNicnNameList: [],
      });
    }
  };

  return (
    <Form.Item
      name="physicalNicnNameList"
      label={intl.formatMessage({
        id: "host.physicalNic",
        defaultMessage: "Host NIC Ports",
      })}
      labelWidth={labelWidth}
      tooltip={
        !clusterUuids?.length
          ? intl.formatMessage({
              id: "l2Network.physicalInterface.disabled.tooltip",
              defaultMessage: "Select a cluster.",
            })
          : undefined
      }
      required
      rules={[
        {
          validator(rule, value) {
            return value?.length
              ? Promise.resolve()
              : Promise.reject(
                  intl.formatMessage({
                    id: "pleaseSelect.physicalNic",
                    defaultMessage: "Select a host NIC port.",
                  }),
                );
          },
        },
      ]}
    >
      <Select
        limit={limit}
        width={selectWidth ?? 400}
        checkable={checkable}
        mode={mode}
        value={selectValue}
        onChange={setSelectValue}
        options={selectOptions}
        disabled={!clusterUuids?.length}
        dropdownRender={
          mode === "multiple"
            ? (menu) => (
                <>
                  <div className={styles.selectDropdownRender}>
                    <div className={styles.selectHeader}>
                      <div className={styles.selectTotal}>
                        {intl.formatMessage(
                          {
                            id: "vm.select.pcpu.total",
                            defaultMessage: "Selected ({total})",
                          },
                          { total: selectValue.length },
                        )}
                      </div>
                      <div
                        className={styles.selectClear}
                        onClick={onClear}
                        style={{
                          cursor:
                            selectValue.length > 1 ? "pointer" : "not-allowed",
                          opacity: selectValue.length > 1 ? 1 : 0.5,
                        }}
                      >
                        {intl.formatMessage({
                          id: "vm.select.pcpu.clear",
                          defaultMessage: "Clear",
                        })}
                      </div>
                    </div>
                    <div className={styles.treeContainer}></div>
                  </div>
                  {menu}
                </>
              )
            : undefined
        }
      />
    </Form.Item>
  );
};

const SelectBond: React.FC<IProps> = ({
  clusterUuids = [],
  conditions = [],
  form,
  inCreate = true,
  selectWidth,
  labelWidth,
}) => {
  const intl = useIntl();

  const modeTransform: { [props: string]: string } = {
    "802.3ad": intl.formatMessage({
      id: "link.aggregation.mode",
      defaultMessage: "LACP (mode 4)",
    }),
    "active-backup": intl.formatMessage({
      id: "master.backup.mode",
      defaultMessage: "Active-Backup (mode1)",
    }),
  };

  const defaultQuery: IQuery = useMemo<IQuery>(() => {
    const basecondition: ICondition[] = [
      {
        key: "clusterUuids",
        values: clusterUuids,
        op: Op.in,
      },
    ];
    return {
      type: "GetCandidatesBondForL2VSwitch",
      conditions: basecondition.concat(conditions),
    };
  }, [clusterUuids, conditions]);

  const { data, loading } = useQuery(bondList, {
    variables: defaultQuery,
  });

  const selectOptions = useMemo(() => {
    if (loading || !data) {
      return [];
    }
    const list: IBond[] = data.bondList.list ?? [];
    return uniqBy(
      list,
      (bond: IBond) => `${bond.bondingName}${bond.mode}${bond.xmitHashPolicy}`,
    ).map((bond: IBond) => {
      return {
        key: bond.uuid,
        value: bond.uuid,
        label: bond.bondingName!,
        extra: [modeTransform?.[bond.mode!], bond.xmitHashPolicy! ?? "-"],
      };
    });
  }, [data, loading]);

  const selectBond = (value: string) => {
    form.setFieldsValue({
      bondUuid: value,
      bond: data?.bondList?.list?.find((it: IBond) => it.uuid === value),
    });
  };

  return (
    <>
      <Form.Item
        name="bondUuid"
        label={intl.formatMessage({ id: "bond", defaultMessage: "Bond" })}
        labelWidth={labelWidth}
        tooltip={
          !clusterUuids?.length
            ? intl.formatMessage({
                id: "l2Network.physicalInterface.disabled.tooltip",
                defaultMessage: "Select a cluster.",
              })
            : undefined
        }
        required
        rules={[
          {
            validator(rule, value) {
              return value
                ? Promise.resolve()
                : Promise.reject(
                    intl.formatMessage({
                      id: "pleaseSelect.bond",
                      defaultMessage: "Select a bond.",
                    }),
                  );
            },
          },
        ]}
      >
        <Select
          onChange={selectBond}
          width={selectWidth ?? 400}
          options={selectOptions}
          disabled={!clusterUuids?.length}
        />
      </Form.Item>
      {inCreate && (
        <Form.Item
          noStyle
          shouldUpdate={(cur, prev) => cur.bondUuid !== prev.bondUuid}
        >
          {({ getFieldValue }) => {
            const bondUuid = getFieldValue("bondUuid");
            const bond = data?.bondList?.list?.find(
              (it: IBond) => it.uuid === bondUuid,
            );
            return bond ? (
              <>
                <Form.Item
                  label={intl.formatMessage({
                    id: "bond.mode.in.host",
                    defaultMessage: "Bond Mode",
                  })}
                >
                  {modeTransform[bond.mode]}
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({
                    id: "HashPolicy",
                    defaultMessage: "Hash Policy",
                  })}
                >
                  {bond.xmitHashPolicy ?? "-"}
                </Form.Item>
              </>
            ) : undefined;
          }}
        </Form.Item>
      )}
    </>
  );
};

const SelectExist: React.FC<IProps> = (props) => {
  const intl = useIntl();

  return (
    <>
      <Form.Item
        name="networkPortType"
        label={intl.formatMessage({
          id: "network.port.type",
          defaultMessage: "Port Type",
        })}
        initialValue="bond"
      >
        <RadioGroup
          options={[
            {
              value: "bond",
              label: intl.formatMessage({
                id: "agg.nic",
                defaultMessage: "Bond",
              }),
            },
            {
              value: "physicalNic",
              label: intl.formatMessage({
                id: "not.agg.nic",
                defaultMessage: "Non-Bonded Port",
              }),
            },
          ]}
        />
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) =>
          prev.networkPortType !== curr.networkPortType
        }
      >
        {({ getFieldValue }) => {
          const networkPortType = getFieldValue("networkPortType");

          if (networkPortType === "bond") {
            return <SelectBond {...props} />;
          }

          if (networkPortType === "physicalNic") {
            return <SelectPhysicalNicMulti {...props} />;
          }

          return null;
        }}
      </Form.Item>
    </>
  );
};

export default {
  SelectPhysicalNicEvery: React.memo(SelectPhysicalNicEvery),
  SelectPhysicalNicMulti: React.memo(SelectPhysicalNicMulti),
  SelectPhysicalNicForHost: React.memo(SelectPhysicalNicForHost),
  SelectBond: React.memo(SelectBond),
  SelectExist: React.memo(SelectExist),
};

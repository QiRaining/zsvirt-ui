import { gql, useLazyQuery } from "@apollo/client";
import { clusterSummary } from "@zstack/virtualization-resource/src/gql/cluster.gql";
import { BondNameItem } from "@zstack/virtualization-resource/src/pages/bond/action/create";
import { ETabType } from "@zstack/virtualization-resource/src/pages/cluster/constant";
import ClusterList from "@zstack/virtualization-resource/src/pages/cluster/list";
import {
  BondConfigType,
  useBondConfigType,
} from "@zstack/virtualization-resource/src/pages/l2-network/create/nic-config";
import SelectPhysicalModal from "@zstack/virtualization-resource/src/pages/l2-network/create/nic-config/select-physical-modal";
import {
  ZSVForm,
  ModalSelect,
  Radio,
  Form,
  Modal,
  Select,
} from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import {
  useValidator,
  IIsRequiredType,
  useAction,
} from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op, ClusterQueryType } from "@zstack/zsphere-types";
import type { L2Network } from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import { groupBy, keys, reduce, isEmpty } from "lodash-es";
import React, { useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const MODAL_SELECT_STYLE = { width: 400 } as const;
const RADIO_GROUP_STYLE = { marginBottom: 12 } as const;

const attachL2NetworkToClusterWithBond = gql`
  mutation attachL2NetworkToClusterWithBond(
    $input: AttachL2NetworksToClusterWithBondInput!
  ) {
    attachL2NetworkToClusterWithBond(input: $input) {
      actionId
    }
  }
`;

const AttachCluster: React.FC<IActionWrapperProps<L2Network>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
  source,
}) => {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);
  const [clusterType, setClusterType] = useState("normal");
  const [modalVisible, setModalVisible] = useState(false);
  const [showBondConfig, setShowBondConfig] = useState(false);

  const doAction = useAction();
  const [form] = Form.useForm();

  const l2 = useMemo<L2Network>(() => {
    if (source?.type === ETabType.NORMAL) {
      return source?.current;
    }
    return selectedList?.[0];
  }, [selectedList, source]);

  const hasUpLink = !!l2?.physicalInterface;
  const showBaremetalOnly =
    l2?.isDefault || source?.type === ETabType.BAREMETAL;

  useEffect(() => {
    if (visible && l2) {
      setShowBondConfig(false);
      form.resetFields();
    }
  }, [visible, l2]);

  const [getClusterSummary, { data }] = useLazyQuery(clusterSummary, {
    fetchPolicy: "no-cache",
    variables: {
      type: ClusterQueryType.ClusterAttachableL2Network,
      extraConditions: [
        {
          key: "l2NetworkUuid",
          op: Op.eq,
          value: l2?.uuid ?? "",
        },
      ],
    },
  });

  useEffect(() => {
    if (modalVisible) {
      getClusterSummary();
    }
  }, [modalVisible, getClusterSummary]);

  const onOk = (params: any) => {
    const value = showBaremetalOnly
      ? { clusterUuids: params }
      : form.getFieldsValue(true);
    const bondConfigType = showBondConfig
      ? (value.bondConfigType as BondConfigType)
      : null;

    let mode = "";
    let xmitHashPolicy = "";
    let bondingName = "";

    if (hasUpLink) {
      mode = l2.systemTags?.bondingMode ?? -1;
      xmitHashPolicy = l2.systemTags?.xmitHashPolicy ?? -1;
      bondingName = l2.physicalInterface ?? -1;
    } else {
      mode = value.mode;
      xmitHashPolicy = value.xmitHashPolicy;
      bondingName = value.bondingName;
    }

    const hostUuids: string[] = [];
    let createBondPayloads: any[] = [];
    let attachL2NetworkToClusterHostParams: any;

    if (bondConfigType === BondConfigType.Every) {
      const tempAttachL2NetworkToClusterHostArr: any[] = [];
      const hostToNicList = groupBy(value?.physicalNicList, "hostUuid");
      createBondPayloads = keys(hostToNicList)
        .filter((hostUuid) => hostUuid !== "undefined") // 过滤掉全选时选中的物理机节点
        .map((hostUuid: string) => {
          const slaves = hostToNicList[hostUuid];
          if (slaves.length > 1) {
            return {
              bondingName,
              slaveUuids: hostToNicList[hostUuid]?.map((it) => it.uuid),
              hostUuids: [hostUuid],
              mode,
              xmitHashPolicy: mode === "802.3ad" ? xmitHashPolicy : undefined,
            };
          }
          tempAttachL2NetworkToClusterHostArr.push({
            clusterUuid: slaves[0]?.host?.cluster?.uuid,
            hostParams: {
              hostUuid: slaves[0]?.hostUuid,
              physicalInterface: slaves[0]?.interfaceName,
            },
          });
        })
        .filter(Boolean);

      attachL2NetworkToClusterHostParams = reduce(
        tempAttachL2NetworkToClusterHostArr,
        (obj, curr, index) => {
          if (!obj[curr.clusterUuid]) {
            obj[curr.clusterUuid] = [curr.hostParams];
          } else {
            obj[curr.clusterUuid].push(curr.hostParams);
          }

          if (index === tempAttachL2NetworkToClusterHostArr.length - 1) {
            return Object.entries(obj).map(([clusterUuid, hostParams]) => ({
              clusterUuid,
              hostParams: JSON.stringify(hostParams),
            }));
          }

          return obj;
        },
        {} as any,
      );
    }

    if (bondConfigType === BondConfigType.Group) {
      createBondPayloads = [
        {
          bondingName,
          slaveNames: value?.physicalNicnNameList,
          hostUuids: [],
          mode,
          xmitHashPolicy: mode === "802.3ad" ? xmitHashPolicy : undefined,
        },
      ];
    }

    const bond = value.bond;
    const physicalNicnNameList = value.physicalNicnNameList;
    if (bondConfigType === BondConfigType.Exited) {
      if (bond) {
        mode = bond.mode;
        bondingName = bond.bondingName;
        xmitHashPolicy = bond.xmitHashPolicy;
      }

      if (physicalNicnNameList) {
        createBondPayloads = [
          {
            bondingName: "",
            slaveNames: [physicalNicnNameList],
            hostUuids: [],
          },
        ];
      }
    }

    const payload: any = {
      clusterUuids: value.clusterUuids?.map((item: any) => item.uuid),
      l2NetworkUuid: l2?.uuid,
      createBondPayloads,
      hostUuids,
      updateVirtualSwitchUplinkBondingsActionPayload:
        !hasUpLink && bondingName && showBondConfig
          ? {
              uuid: l2?.uuid,
              bondingName,
              mode,
              xmitHashPolicy,
            }
          : undefined,
      attachL2NetworkToClusterHostParams: !isEmpty(
        attachL2NetworkToClusterHostParams,
      )
        ? attachL2NetworkToClusterHostParams
        : undefined,
    };

    doAction({
      mutation: attachL2NetworkToClusterWithBond,
      payload,
      name: intl.formatMessage({
        id: "attach.cluster",
        defaultMessage: "Attach Cluster",
      }),
      total: 1,
      type: "Cluster",
    });
    setVisible(false);
    setSelectedList?.([]);
  };

  const defaultQuery = useMemo(() => {
    return {
      type: ClusterQueryType.ClusterAttachableL2Network,
      conditions: [
        {
          key: "hypervisorType",
          op:
            (clusterType === "normal" || source?.type === ETabType.NORMAL) &&
            !showBaremetalOnly
              ? Op.notIn
              : Op.in,
          values: ["baremetal"],
        },
      ],
      extraConditions: [
        {
          key: "l2NetworkUuid",
          op: Op.eq,
          value: l2?.uuid ?? "",
        },
      ],
    };
  }, [l2, clusterType, showBaremetalOnly, source?.type]);

  const changeCluster = (values: string[]) => {
    form.setFields([
      {
        name: "physicalNicList",
        value: undefined,
      },
      {
        name: "physicalNicnNameList",
        value: undefined,
      },
      {
        name: "bond",
        value: undefined,
      },
      {
        name: "bondUuid",
        value: undefined,
      },
      {
        name: "clusterUuids",
        value: values,
      },
    ]);
    const hasNormalCluster = !!values?.find(
      (item: any) => item.hypervisorType !== "baremetal",
    );
    if (showBondConfig !== hasNormalCluster) {
      setShowBondConfig(hasNormalCluster);
    }
  };

  // modal挂载地方不对,getContainer不生效
  // jira:
  useEffect(() => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    return () => {
      document.body.removeChild(container);
    };
  }, []);

  const onChangeBondConfigType = (e: BondConfigType) => {
    form.resetFields([
      "physicalNicList",
      "physicalNicnNameList",
      "bond",
      "bondName",
      "mode",
      "xmitHashPolicy",
    ]);
    form.setFieldsValue({
      bondConfigType: e,
    });
  };

  const changeBondMode = (mode: string) => {
    const fieldsValue: { [props: string]: string | undefined } = {
      mode,
      xmitHashPolicy: undefined,
    };
    if (mode === "802.3ad") {
      fieldsValue.xmitHashPolicy = "layer2+3";
    }

    form.setFieldsValue(fieldsValue);
  };

  const uplinkConfigEle = React.useMemo(() => {
    if (hasUpLink) {
      return (
        <>
          <Form.Item
            name="bondName"
            label={intl.formatMessage({
              id: "up.bond.name",
              defaultMessage: "Uplink Name",
            })}
          >
            {l2?.physicalInterface}
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: "bond.mode.in.host",
              defaultMessage: "Bond Mode",
            })}
            icon="info"
            iconTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "bond.field.bond.mode.tooltip",
                  defaultMessage: `### Bond Mode
Supports 2 Bond modes: Active-backup (mode1) and LACP (mode4).
1. Active-backup: This mode allows you to bind 1-2 physical NIC ports and we recommend that you bind 2 ports, one acting as the primary port and the other as the secondary port. The primary port handle all network flows by default. When the primary port fails, the secondary port automatically replaces the primary port to handle flows and avoid business interruptions.
2. LACP:
   - Link aggregation control protocol (LACP) mode. This mode allows you to bind 1-8 physical NIC ports and we recommend that you bind at least 2 ports. Bound ports share the same speed and duplex setting. Network flows are evenly sent to the bound ports, thus realizing a load balance.
   - A bond of this mode determines its network export based on a hash computation. Three hash policies are supported: layer2+3, layer 3+4, and layer2.
     - layer2+3: Picks out a port to send data packets based on the hash computation on the source MAC address, destination MAC address, and IP address.
     - layer3+4: Picks out a port to send data packets based on the hash computation on the IP address and port. TCP/IP stacks are supported.
     - layer2: Picks out a port to send data packets based on the hash computation on the source MAC address and destination MAC address.`,
                })}
              </ReactMarkdown>
            }
          >
            {l2?.systemTags?.bondingMode === "802.3ad"
              ? intl.formatMessage({
                  id: "link.aggregation.mode",
                  defaultMessage: "LACP (mode 4)",
                })
              : intl.formatMessage({
                  id: "master.backup.mode",
                  defaultMessage: "Active-Backup (mode1)",
                })}
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: "HashPolicy",
              defaultMessage: "Hash Policy",
            })}
            icon="info"
            iconTooltip={
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
            }
            initialValue="layer2+3"
          >
            {l2?.systemTags?.xmitHashPolicy &&
            l2?.systemTags?.xmitHashPolicy !== "null"
              ? l2?.systemTags?.xmitHashPolicy
              : "-"}
          </Form.Item>
        </>
      );
    }

    return (
      <>
        <Form.Item
          required
          label={intl.formatMessage({
            id: "up.bond.name",
            defaultMessage: "Uplink Name",
          })}
          icon="info"
          iconTooltip={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "create.vswitch.bond.field.bond.name.tooltip",
                defaultMessage: `### Uplink Name

An uplink name represents the bonded physical ports on a host that connect to a physical switch.

1. By default, uplinks are named in the format "Uplink+suffix", where the suffix is an auto-incrementing number (1, 2, 3...) to distinguish resources. If the number of uplinks is 10 or more, the default naming format changes to "Up+suffix".
2. You can specify a custom name. The name must be 1 to 10 characters long and can contain letters, numbers, hyphens (-), or underscores (_). The name cannot start with a number.`,
              })}
            </ReactMarkdown>
          }
        >
          <BondNameItem required={true} width={320} />
        </Form.Item>
        <Form.Item
          label={intl.formatMessage({
            id: "bond.mode.in.host",
            defaultMessage: "Bond Mode",
          })}
          name="mode"
          initialValue="802.3ad"
          icon="info"
          iconTooltip={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "bond.field.bond.mode.tooltip",
                defaultMessage: `### Bond Mode
Supports 2 Bond modes: Active-backup (mode1) and LACP (mode4).
1. Active-backup: This mode allows you to bind 1-2 physical NIC ports and we recommend that you bind 2 ports, one acting as the primary port and the other as the secondary port. The primary port handle all network flows by default. When the primary port fails, the secondary port automatically replaces the primary port to handle flows and avoid business interruptions.
2. LACP:
   - Link aggregation control protocol (LACP) mode. This mode allows you to bind 1-8 physical NIC ports and we recommend that you bind at least 2 ports. Bound ports share the same speed and duplex setting. Network flows are evenly sent to the bound ports, thus realizing a load balance.
   - A bond of this mode determines its network export based on a hash computation. Three hash policies are supported: layer2+3, layer 3+4, and layer2.
     - layer2+3: Picks out a port to send data packets based on the hash computation on the source MAC address, destination MAC address, and IP address.
     - layer3+4: Picks out a port to send data packets based on the hash computation on the IP address and port. TCP/IP stacks are supported.
     - layer2: Picks out a port to send data packets based on the hash computation on the source MAC address and destination MAC address.`,
              })}
            </ReactMarkdown>
          }
        >
          <Select
            className="width-320"
            onChange={changeBondMode}
            options={[
              {
                label: intl.formatMessage({
                  id: "link.aggregation.mode",
                  defaultMessage: "LACP (mode 4)",
                }),
                value: "802.3ad",
              },
              {
                label: intl.formatMessage({
                  id: "master.backup.mode",
                  defaultMessage: "Active-Backup (mode1)",
                }),
                value: "active-backup",
              },
            ]}
          />
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(pre, cur) => pre.mode !== cur.mode}>
          {({ getFieldValue }: any) => {
            const mode = getFieldValue("mode");
            const isMode1 = mode === "active-backup";

            return (
              <>
                {!isMode1 && (
                  <Form.Item
                    name="xmitHashPolicy"
                    label={intl.formatMessage({
                      id: "HashPolicy",
                      defaultMessage: "Hash Policy",
                    })}
                    icon="info"
                    iconTooltip={
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
                    }
                    initialValue="layer2+3"
                  >
                    <Select
                      className="width-320"
                      options={["layer2+3", "layer3+4", "layer2"].map(
                        (value) => ({
                          value,
                          label: value,
                        }),
                      )}
                    />
                  </Form.Item>
                )}
              </>
            );
          }}
        </Form.Item>
      </>
    );
  }, [changeBondMode, hasUpLink, intl, l2]);

  if (showBaremetalOnly) {
    return (
      <ModalSelect
        showSelect={false}
        selectType="checkbox"
        visible={visible}
        setVisible={setVisible}
        title={intl.formatMessage({
          id: "attach.cluster",
          defaultMessage: "Attach Cluster",
        })}
        resourceName={formatResourceName(selectedList, intl)}
        onOk={onOk}
        alertType={source?.type !== ETabType.BAREMETAL ? "warning" : undefined}
        alertMessage={
          source?.type !== ETabType.BAREMETAL
            ? intl.formatMessage({
                id: "l2network.attach.cluster.modal.alert.default.vswitch",
                defaultMessage: "The default distributed switch only supports attaching bare metal clusters.",
              })
            : undefined
        }
      >
        <ClusterList
          view="select.l2.network.attach"
          defaultQuery={defaultQuery}
        />
      </ModalSelect>
    );
  }

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "attach.cluster",
        defaultMessage: "Attach Cluster",
      })}
      widthClassName="w-200"
      onCancel={() => setVisible(false)}
      onOk={onOk}
      visible={visible}
      form={form}
      setVisible={setVisible}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form form={form} initialValues={{ bond: undefined }}>
        <ZSVForm.Card
          title={intl.formatMessage({
            id: "cluster.info",
            defaultMessage: "Cluster Info",
          })}
        >
          <Form.Item
            name="clusterUuids"
            rules={[isRequired(IIsRequiredType.select)]}
            label={intl.formatMessage({
              id: "select.cluster",
              defaultMessage: "Select Cluster",
            })}
          >
            <ModalSelect
              style={MODAL_SELECT_STYLE}
              listClassName="list-height-240"
              selectType="checkbox"
              visible={modalVisible}
              setVisible={setModalVisible}
              onChange={changeCluster}
              modalHeader={
                source?.type !== ETabType.NORMAL &&
                source?.type !== ETabType.BAREMETAL ? (
                  <Radio.Group
                    value={clusterType}
                    onChange={(e) => setClusterType(e.target.value)}
                    style={RADIO_GROUP_STYLE}
                  >
                    <Radio.Button value="normal">
                      {intl.formatMessage(
                        {
                          id: "cluster.count",
                          defaultMessage: "Cluster ({clusterCount})",
                        },
                        {
                          clusterCount: data?.clusterSummary?.clusterCount ?? 0,
                        },
                      )}
                    </Radio.Button>
                    <Radio.Button value="baremetal">
                      {intl.formatMessage(
                        {
                          id: "baremetal.cluster.count",
                          defaultMessage: "Bare Metal Cluster ({clusterCount})",
                        },
                        {
                          clusterCount:
                            data?.clusterSummary?.baremetalCount ?? 0,
                        },
                      )}
                    </Radio.Button>
                  </Radio.Group>
                ) : undefined
              }
              title={intl.formatMessage({
                id: "l2network.field.add.cluster",
                defaultMessage: "Add Cluster",
              })}
              label={intl.formatMessage({
                id: "l2network.field.add.cluster",
                defaultMessage: "Add Cluster",
              })}
            >
              <ClusterList
                view="select.l2.network.attach"
                defaultQuery={defaultQuery}
              />
            </ModalSelect>
          </Form.Item>
        </ZSVForm.Card>

        <NetworkConfig
          l2={l2}
          onChangeBondConfigType={onChangeBondConfigType}
          uplinkConfigEle={uplinkConfigEle}
          hasUpLink={hasUpLink}
          showBondConfig={showBondConfig}
          source={source}
        />
      </Form>
    </DialogForm>
  );
};

interface INetworkConfigProps {
  l2: L2Network;
  onChangeBondConfigType: (type: BondConfigType) => void;
  uplinkConfigEle: React.ReactNode;
  hasUpLink: boolean;
  showBondConfig: boolean;
  source?: any;
}

function NetworkConfig({
  l2,
  onChangeBondConfigType,
  uplinkConfigEle,
  hasUpLink,
  showBondConfig,
  source,
}: INetworkConfigProps) {
  const intl = useIntl();
  const form = Form.useFormInstance();
  const bondConfigTypeList = useBondConfigType();
  return (
    <>
      {showBondConfig || source?.type === ETabType.NORMAL ? (
        <ZSVForm.Card
          title={intl.formatMessage({
            id: "network.config",
            defaultMessage: "Network Configuration",
          })}
        >
          <Form.Item
            name="bondConfigType"
            label={intl.formatMessage({
              id: "bond.config.info",
              defaultMessage: "Bond Configuration",
            })}
            initialValue={BondConfigType.Every}
            iconTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "create.vswitch.bond.field.bond.config.info.tooltip",
                  defaultMessage: `todo`,
                })}
              </ReactMarkdown>
            }
          >
            <Select onChange={onChangeBondConfigType} width={320}>
              {bondConfigTypeList.map((t) => (
                <Select.Option
                  value={t.value}
                  key={t.value}
                >{`${t.label}`}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, cur) =>
              prev.bondConfigType !== cur.bondConfigType
            }
          >
            {({ getFieldValue }) => {
              const bondConfigType = getFieldValue("bondConfigType");
              if (bondConfigType !== BondConfigType.Exited) {
                return uplinkConfigEle;
              }
              return null;
            }}
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, cur) =>
              prev.bondConfigType !== cur.bondConfigType ||
              prev.clusterUuids !== cur.clusterUuids
            }
          >
            {({ getFieldValue }) => {
              const bondConfigType = getFieldValue("bondConfigType");
              const clusterUuids = (getFieldValue("clusterUuids") ?? []).map(
                (item: any) => item.uuid,
              );
              switch (bondConfigType) {
                case BondConfigType.Every:
                  return (
                    <SelectPhysicalModal.SelectPhysicalNicEvery
                      title={intl.formatMessage({
                        id: "add.PhysicalNic",
                        defaultMessage: "Add Physical NIC Port",
                      })}
                      clusterUuids={clusterUuids}
                      form={form}
                      limit={8}
                    />
                  );
                case BondConfigType.Group:
                  return (
                    <SelectPhysicalModal.SelectPhysicalNicMulti
                      clusterUuids={clusterUuids}
                      form={form}
                      limit={8}
                      checkable
                      mode="multiple"
                    />
                  );
                case BondConfigType.Exited:
                  return (
                    <SelectPhysicalModal.SelectExist
                      clusterUuids={clusterUuids}
                      form={form}
                      inCreate={false}
                      conditions={
                        hasUpLink
                          ? [
                              {
                                key: "bondingName",
                                op: Op.eq,
                                value: l2?.physicalInterface,
                              },
                              {
                                key: "mode",
                                op: Op.eq,
                                value: l2?.systemTags?.bondingMode,
                              },
                              {
                                key: "xmitHashPolicy",
                                op: Op.eq,
                                value: l2?.systemTags?.xmitHashPolicy,
                              },
                            ]
                          : []
                      }
                    />
                  );
                default:
                  return null;
              }
            }}
          </Form.Item>
        </ZSVForm.Card>
      ) : null}
    </>
  );
}

export default AttachCluster;

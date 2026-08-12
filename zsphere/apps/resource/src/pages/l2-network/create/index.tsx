import { Icon } from "@zstack/icon";
import { CREATE_L2_NETWORK } from "@zstack/virtualization-resource/src/gql/l2-network.gql";
import { getPortGroupVlanMode } from "@zstack/virtualization-resource/src/pages/l3-network/hook";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import {
  Op,
  ResourceQueryType,
  l2NetworkType,
  PortGroupVlanMode,
} from "@zstack/zsphere-types";
import type {
  Zone as IZone,
  Cluster as ICluster,
} from "@zstack/zsphere-types/graphql";
import { usePersistFn } from "ahooks";
import { Tabs } from "antd";
import _ from "lodash-es";
import React, { useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";

import BasicCard from "./basic-config";
import { useDefaultName } from "./hooks";
import L3Network from "./l3-network";
import NicConfig, { BondConfigType } from "./nic-config";

import style from "./style.module.less";

const FLEX_SPACE_BETWEEN_STYLE = {
  display: "flex",
  justifyContent: "space-between",
} as const;

export const initialBasicValues = {
  name: "",
  description: "",
  ipVersion: 4,
  isByCidr: false,
  dhcpService: false,
  enableIPAM: false,
  createL3Network: true,
  clusterUuids: [],
  physicalNicList: [],
  vlanMode: PortGroupVlanMode.NONE,
};

const AlertIcon: React.FC<IAlertProps> = ({
  form,
  validateKeys,
  errorCallBack,
  _resetTrigger,
  triggerValidate,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const getData = async () => {
      await form
        .validateFields(validateKeys)
        .then(() => {
          setVisible(false);
        })
        .catch((errorInfo: any) => {
          if (errorInfo?.errorFields?.length) {
            setVisible(true);
            errorCallBack?.();
          } else {
            setVisible(false);
          }
        });
    };
    if (triggerValidate) {
      getData();
    }
  }, [triggerValidate]);

  return visible ? (
    <Icon
      color="danger"
      colorNumber={500}
      type="alert-triangle-fill"
      size={18}
    />
  ) : (
    <></>
  );
};

export default function Create({
  visible,
  setVisible,
  selectedList = [],
  source,
}: IActionWrapperProps<any>) {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();
  const [activeKey, setActiveKey] = useState<string>();
  const [triggerBondValidate, setTriggerBondValidate] = useState(0);
  const [triggerL3Validate, setTriggerL3Validate] = useState(0);
  const [showBondConfig, setShowBondConfig] = useState(false);

  const { query: setDefaultVswitch, count: maxBondingName } = useDefaultName([
    /Uplink(\d+)/,
    /Up(\d+)/,
  ]);

  useEffect(() => {
    if (!_.isUndefined(maxBondingName)) {
      form.setFieldsValue({
        bondingName: (maxBondingName > 9 ? "Up(d+)" : "Uplink(d+)").replace(
          "(d+)",
          `${maxBondingName}`,
        ),
      });
    }
  }, [maxBondingName]);

  useEffect(() => {
    if (visible) {
      setTriggerBondValidate(0);
      setTriggerL3Validate(0);
      setShowBondConfig(false);
      setActiveKey(undefined);
      form.resetFields();
      setDefaultVswitch({
        variables: {
          type: ResourceQueryType.L2Network,
          extraConditions: [
            {
              key: "nameKey",
              op: Op.eq,
              value: "physicalInterface",
            },
          ],
          conditions: [
            {
              key: "physicalInterface",
              op: Op.like,
              value: "Up",
            },
          ],
        },
      });
    }
  }, [visible]);

  const submitHandle = usePersistFn(
    // create l2
    async (params: any) => {
      const {
        isByCidr,
        l2Network,
        networkCidr,
        networkType,
        dhcpIp,
        dnsDomain,
        netmask,
        prefixLen,
        addressMode,
        startIp,
        endIp,
        dns,
        ipAllocateStrategy,
        dhcpService,
        enableIPAM,
        ipVersion = 4,
        ipRangeType,
        gateway,
        createL3Network,
        l3networkName,
        vlanMode,
        vlan: _vlan,
        physicalNicList,
        mode,
        bondingName,
        _bondDecription,
        xmitHashPolicy,
        bondConfigType: _bondConfigType,
        physicalNicnNameList,
        bondUuid: _bondUuid,
        networkPortType: _networkPortType,
        clusterUuids,
        ...l2networkPrams
      } = params;

      const vlan = _vlan ? parseInt(_vlan, 10) : 0;
      const bond = form.getFieldValue("bond");
      const systemTags: string[] = [];

      const shouldConfigBond = cluster?.uuid
        ? cluster.hypervisorType !== "baremetal"
        : showBondConfig;
      const bondConfigType = shouldConfigBond ? _bondConfigType : null;
      let createBondPayloads: any[] = [];
      let physicalInterface: string | undefined;
      let attachL2NetworkToClusterHostParams: any;
      if (bondConfigType === BondConfigType.Every) {
        const tempAttachL2NetworkToClusterHostArr: any[] = [];
        const hostToNicList = _.groupBy(physicalNicList, "hostUuid");
        createBondPayloads = _.keys(hostToNicList)
          .filter((hostUuid) => hostUuid !== "undefined")
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

        attachL2NetworkToClusterHostParams = _.reduce(
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
            slaveNames: physicalNicnNameList,
            hostUuids: [],
            mode,
            xmitHashPolicy: mode === "802.3ad" ? xmitHashPolicy : undefined,
          },
        ];
      }

      if (bondConfigType === BondConfigType.Exited) {
        if (bond) {
          physicalInterface = bond.bondingName;
          systemTags.push(
            `uplink::bonding::${bond.mode}::${bond.mode === "802.3ad" ? bond.xmitHashPolicy : null}`,
          );
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

      if (
        createBondPayloads[0]?.slaveUuids?.length > 1 || // Every 实际上要么没有，要么每一项都是大于1的
        createBondPayloads[0]?.slaveNames?.length > 1 // Group
      ) {
        physicalInterface = bondingName;
        systemTags.push(
          `uplink::bonding::${mode}::${mode === "802.3ad" ? xmitHashPolicy : null}`,
        );
      }

      const l3netowrkParam = createL3Network
        ? {
            networkCidr: isByCidr ? networkCidr?.[ipVersion] : undefined,
            type: "L3BasicNetwork",
            system: false,
            category: "Private",
            showNetworkServiceType: "Flat",
            dhcpIp: dhcpIp?.[ipVersion],
            dnsDomain,
            l2Network,
            enableIPAM,
            networkType,
            netmask,
            prefixLen,
            addressMode,
            startIp: startIp?.[ipVersion],
            endIp: endIp?.[ipVersion],
            dns: dns?.[ipVersion],
            ipAllocateStrategy,
            dhcpService,
            ipVersion,
            ipRangeType,
            gateway: gateway?.[ipVersion],
            name: l3networkName,
            vlan,
            vlanMode: getPortGroupVlanMode({ vlan, vlanMode }),
            l2NetworkUuid: "currentUuid",
          }
        : undefined;

      const data = {
        type: l2NetworkType.VirtualSwitch,
        zoneUuid: zone?.uuid,
        vSwitchType: "LinuxBridge",
        clusterUuids: clusterUuids?.map((item: any) => item.uuid),
        ...l2networkPrams,
        systemTags,
        physicalInterface,
        l3netowrkParam,
        createBondPayloads,
        attachL2NetworkToClusterHostParams: !_.isEmpty(
          attachL2NetworkToClusterHostParams,
        )
          ? attachL2NetworkToClusterHostParams
          : undefined,
      };

      try {
        doAction({
          mutation: CREATE_L2_NETWORK,
          payload: data,
          name: intl.formatMessage({
            id: "virtualization.create.l2network",
            defaultMessage: "New Distributed Switch",
          }),
          total: 1,
          type: "L2Network",
        });
      } catch {}
    },
  );

  const { zone, cluster } = useMemo(() => {
    const resource = selectedList?.[0] ?? source ?? {};

    let _zone: any = {};
    let _cluster: any = {};
    switch (resource.__typename) {
      case "Cluster":
        _zone = {
          uuid: (resource as ICluster).zone?.uuid,
          name: (resource as ICluster).zone?.name,
        };

        _cluster = {
          hypervisorType: (resource as ICluster).hypervisorType,
          uuid: (resource as ICluster).uuid,
          name: (resource as ICluster).name,
        };
        break;
      case "Zone":
        _zone = {
          uuid: (resource as IZone).uuid,
          name: (resource as IZone).name,
        };
        break;
    }
    return {
      zone: _zone,
      cluster: _cluster,
    };
  }, [selectedList]);

  const _initialBasicValues = useMemo(
    () => ({
      ...initialBasicValues,
      clusterUuids: cluster?.uuid ? [cluster] : [],
    }),
    [cluster],
  );

  const bondFileds = [
    "bondingName",
    "mode",
    "xmitHashPolicy",
    "physicalNicList",
    "physicalNicnNameList",
    "bond",
  ];

  const l3Fileds = [
    "l3networkName",
    "vlan",
    "dhcpService",
    "dhcpIp",
    "networkCidr",
    "startIp",
    "endIp",
    "netmask",
    "gateway",
    "createL3Network",
  ];

  const handleValidationError = (
    errorFields: { name: (string | number)[]; errors: string[] }[],
  ) => {
    if (!errorFields?.length) {
      return;
    }
    const errorKeys = errorFields.map((f) => String(f.name?.[0]));
    const hasBondError = errorKeys.some((k) => bondFileds.includes(k));
    const hasL3Error = errorKeys.some((k) => l3Fileds.includes(k));

    if (hasBondError) {
      setActiveKey("bondConfig");
      setTriggerBondValidate((v) => v + 1);
    } else if (hasL3Error) {
      setActiveKey("l3Config");
      setTriggerL3Validate((v) => v + 1);
    }
  };

  const onValuesChange = (changedValues: any) => {
    if (!cluster?.uuid && "clusterUuids" in changedValues) {
      const hasNormalCluster = !!changedValues.clusterUuids?.find(
        (item: any) => item.hypervisorType !== "baremetal",
      );
      if (showBondConfig !== hasNormalCluster) {
        setShowBondConfig(hasNormalCluster);
        setActiveKey(hasNormalCluster ? "bondConfig" : "l3Config");
      }
    }

    const changedKeys: string[] = _.keys(changedValues);
    if (!triggerBondValidate && !triggerL3Validate) {
      return;
    }
    let needFileds = changedKeys.filter((it) => l3Fileds.indexOf(it) > -1);
    if (needFileds?.length) {
      setTriggerL3Validate(triggerL3Validate + 1);
    }

    needFileds = changedKeys.filter((it) => bondFileds.indexOf(it) > -1);
    if (needFileds?.length) {
      setTriggerBondValidate(triggerBondValidate + 1);
    }
  };

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "virtualization.create.l2network",
        defaultMessage: "New Distributed Switch",
      })}
      form={form}
      widthClassName="w-200"
      visible={visible}
      setVisible={setVisible}
      onOk={submitHandle}
      onCancel={() => setVisible(false)}
      onValidationError={handleValidationError}
    >
      <Form
        onValuesChange={onValuesChange}
        form={form}
        initialValues={_initialBasicValues}
        className={style.form}
      >
        <BasicCard form={form} zone={zone} cluster={cluster} />
        <div style={FLEX_SPACE_BETWEEN_STYLE}>
          <div className={style.rect} />
          <Tabs
            className={style.tab}
            activeKey={activeKey}
            onChange={setActiveKey}
          >
            {(cluster?.uuid
              ? cluster.hypervisorType !== "baremetal"
              : showBondConfig) && (
              <Tabs.TabPane
                forceRender
                key="bondConfig"
                tab={
                  <div className={style.text}>
                    {intl.formatMessage({
                      id: "network.config",
                      defaultMessage: "Network Configuration",
                    })}
                    <AlertIcon
                      resetTrigger={setTriggerBondValidate}
                      triggerValidate={triggerBondValidate}
                      form={form}
                      validateKeys={[
                        "bondingName",
                        "mode",
                        "xmitHashPolicy",
                        "physicalNicList",
                        "physicalNicnNameList",
                        "bond",
                      ]}
                      errorCallBack={() => setActiveKey("bondConfig")}
                    />
                  </div>
                }
              >
                <NicConfig form={form} />
              </Tabs.TabPane>
            )}
            <Tabs.TabPane
              forceRender
              key="l3Config"
              tab={
                <div style={FLEX_SPACE_BETWEEN_STYLE}>
                  <div className={style.text}>
                    {intl.formatMessage({
                      id: "l2network.portGroup.config",
                      defaultMessage: "Distributed Port Group Configuration",
                    })}
                  </div>
                  <div className={style.icon}>
                    <AlertIcon
                      resetTrigger={setTriggerL3Validate}
                      triggerValidate={triggerL3Validate}
                      form={form}
                      validateKeys={[
                        "l3networkName",
                        "vlan",
                        "dhcpService",
                        "dhcpIp",
                        "networkCidr",
                        "startIp",
                        "endIp",
                        "netmask",
                        "gateway",
                      ]}
                      errorCallBack={() => setActiveKey("l3Config")}
                    />
                  </div>
                </div>
              }
            >
              <L3Network />
            </Tabs.TabPane>
          </Tabs>
        </div>
      </Form>
    </DialogForm>
  );
}

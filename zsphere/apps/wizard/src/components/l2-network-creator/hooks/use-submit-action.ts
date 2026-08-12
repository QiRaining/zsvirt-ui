import { gql } from "@apollo/client";
import type { IActionResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import { l2NetworkType } from "@zstack/zsphere-types";
import type { FormInstance } from "antd/es/form";
import _ from "lodash-es";
import { useIntl } from "react-intl";

import { BondConfigType } from "../type";
import { getPortGroupVlanMode } from "../utils";
import { useL2Network } from "./use-l2-network";

const CREATE_L2_NETWORK = gql`
  mutation CREATE_L2_NETWORK($input: CreateL2NetworkActionInput!) {
    createL2Network(input: $input) {
      actionId
    }
  }
`;

const CREATE_L3_NETWORK = gql`
  mutation CREATE_L3_NETWORK($input: CreateL3NetworkInput!) {
    createL3Network(input: $input) {
      actionId
    }
  }
`;

export const useSubmitAction = (
  clusterUuid: string,
  zoneUuid: string,
  handleTaskFinished: (actionResult: IActionResult) => void,
  form: FormInstance,
) => {
  const doAction = useAction();
  const intl = useIntl();
  const { data: l2NetworkData } = useL2Network(clusterUuid);

  const handleFinish = () => {
    const params = form.getFieldsValue();
    const {
      isByCidr,
      l2Network,
      virtualRouterOffering,
      networkType,
      _networkPortType,
      dnsDomain,
      netmask,
      prefixLen,
      addressMode,
      ipAllocateStrategy,
      dhcpService,
      enableIPAM,
      ipVersion = 4,
      ipRangeType,
      l3networkName,
      vlan: _vlan,
      vlanMode,
      physicalNicList,
      mode,
      _bondUuid,
      bondingName,
      xmitHashPolicy,
      bondConfigType,
      physicalNicnNameList,
      l2NetworkOption,
      networkCidr: _networkCidr,
      dhcpIp: _dhcpIp,
      startIp: _startIp,
      endIp: _endIp,
      dns: _dns,
      gateway: _gateway,
      ...l2networkPrams
    } = params;

    const vlan = _vlan ? parseInt(_vlan, 10) : 0;
    const networkCidr = isByCidr ? _networkCidr?.[ipVersion] : undefined;
    const dhcpIp = _dhcpIp?.[ipVersion];
    const startIp = _startIp?.[ipVersion];
    const endIp = _endIp?.[ipVersion];
    const dns = _dns?.[ipVersion];
    const gateway = _gateway?.[ipVersion];

    if (l2NetworkOption === "create") {
      const bond = form.getFieldValue("bond");
      const systemTags: string[] = [];
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
          .filter(boolean);

        attachL2NetworkToClusterHostParams = _.reduce(
          tempAttachL2NetworkToClusterHostArr,
          (obj, curr, index) => {
            if (!obj[curr.clusterUuid]) {
              obj[curr.clusterUuid] = [curr.hostParams];
            } else {
              obj[curr.clusterUuid].push(curr.hostParams);
            }

            if (index === tempAttachL2NetworkToClusterHostArr.length - 1) {
              return Object.entries(obj).map(([_clusterUuid, hostParams]) => ({
                clusterUuid: _clusterUuid,
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

      const l3netowrkParam = {
        networkCidr,
        type: "L3BasicNetwork",
        system: false,
        category: "Private",
        showNetworkServiceType: "Flat",
        dhcpIp,
        dnsDomain,
        l2Network,
        enableIPAM,
        virtualRouterOffering,
        networkType,
        netmask,
        prefixLen,
        addressMode,
        startIp,
        endIp,
        dns,
        ipAllocateStrategy,
        dhcpService,
        ipVersion,
        ipRangeType,
        gateway,
        name: l3networkName,
        vlan,
        vlanMode: getPortGroupVlanMode({ vlan, vlanMode }),
        l2NetworkUuid: "currentUuid",
      };

      const data = {
        type: l2NetworkType.VirtualSwitch,
        zoneUuid,
        vSwitchType: "LinuxBridge",
        ...l2networkPrams,
        systemTags,
        physicalInterface,
        l3netowrkParam,
        createBondPayloads,
        clusterUuids: [clusterUuid],
        attachL2NetworkToClusterHostParams: !_.isEmpty(
          attachL2NetworkToClusterHostParams,
        )
          ? attachL2NetworkToClusterHostParams
          : undefined,
      };

      doAction({
        mutation: CREATE_L2_NETWORK,
        payload: data,
        name: intl.formatMessage({
          id: "virtualization.create.l2network",
          defaultMessage: "New Distributed Switch",
        }),
        total: 1,
        type: "L2Network",
        onFinish: handleTaskFinished,
      });
    } else if (l2NetworkOption === "default") {
      doAction({
        mutation: CREATE_L3_NETWORK,
        payload: {
          networkCidr,
          type: "L3BasicNetwork",
          system: false,
          category: "Private",
          showNetworkServiceType: "Flat",
          dhcpIp,
          dnsDomain,
          enableIPAM,
          virtualRouterOffering,
          networkType,
          netmask,
          prefixLen,
          addressMode,
          startIp,
          endIp,
          dns,
          vlan,
          vlanMode: getPortGroupVlanMode({ vlan, vlanMode }),
          ipAllocateStrategy,
          dhcpService,
          ipVersion,
          ipRangeType,
          gateway,
          name: l3networkName,
          l2NetworkUuid: l2NetworkData?.l2NetworkList?.list?.[0]?.uuid,
        },
        name: intl.formatMessage({
          id: "virtualization.create.l3network",
          defaultMessage: "New Distributed Port Group",
        }),
        total: 1,
        type: "L3Network",
        onFinish: handleTaskFinished,
      });
    }
  };
  return handleFinish;
};

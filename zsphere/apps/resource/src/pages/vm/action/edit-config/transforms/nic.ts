import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import { parseNumber } from "@zstack/zsphere-utils";
import * as _ from "lodash-es";

import type { TransformContext } from "./types";

export const nicTransform = (
  ctx: TransformContext,
  generateArrayPayload: (payloadName: string, _payload: any) => void,
  nicValues: any,
  originValues: any,
  vm: IVM,
  guest?: string,
) => {
  const { payload, setPayload, setChangeKeys } = ctx;
  const vmInstanceUuid = vm.uuid;
  const isWindows = guest === "Windows";
  const isLinux = guest === "Linux";
  const nicList = _.groupBy(
    _.keys(nicValues),
    (key: string) => key.split("-")[1],
  );
  const originNicList = _.groupBy(
    _.keys(originValues),
    (key: string) => key.split("-")[1],
  );

  const addList = _.difference(_.keys(nicList), _.keys(originNicList)).filter(
    (key: string) => !Number.isNaN(Number(key)),
  );
  const removeList = _.keys(originNicList).filter(
    (key: string) =>
      originValues?.[`removenetcard-${key}`] &&
      originValues?.[`nicUuid-${key}`],
  );
  const updateList = _.keys(originNicList).filter(
    (key: string) =>
      !originValues?.[`removenetcard-${key}`] && !Number.isNaN(Number(key)),
  );

  addList.forEach((key: string) => {
    setChangeKeys((origin) => origin.concat(key));
    const value = _.pick(nicValues, nicList[key]);
    if (!value[`l3NetworkUuids-${key}`]?.[0]?.uuid) {
      return;
    }

    const systemTags = [];
    if (value[`securityGroup-${key}`]?.length) {
      systemTags.push(
        `l3::${value[`l3NetworkUuids-${key}`]?.[0]?.uuid}::SecurityGroupUuids::${value[
          `securityGroup-${key}`
        ]
          .map((it: any) => it.uuid)
          .join(",")}`,
      );
    }

    const appointIpv4 = value[`appointIpv4-${key}`];
    const appointIpv6 = value[`appointIpv6-${key}`];
    const enableIPAM = value[`l3NetworkUuids-${key}`]?.[0]?.enableIPAM;
    const ip = value[`ipv4-${key}`];
    const ip6 = value[`ipv6-${key}`];
    const netmask = value[`netmask-${key}`];
    const ipv6Prefix = value[`prefixLen-${key}`];
    const gateway = value[`gateway4-${key}`];
    const ipv6Gateway = value[`gateway6-${key}`];
    const dnsList4 =
      value[`dnsList4-${key}`]?.filter((dns: any) => !!dns) ?? [];
    const dns4Enabled =
      isWindows &&
      value[`dnsAllocationType4-${key}`] === "manual" &&
      !!dnsList4.length;
    const dnsList6 =
      value[`dnsList6-${key}`]?.filter((dns: any) => !!dns) ?? [];
    const dns6Enabled =
      isWindows &&
      value[`dnsAllocationType6-${key}`] === "manual" &&
      !!dnsList6.length;

    payload.attachL3NetworkToVmNicInEditVmPayload = (
      payload.attachL3NetworkToVmNicInEditVmPayload ?? []
    ).concat([
      {
        l3NetworkUuid: value[`l3NetworkUuids-${key}`]?.[0]?.uuid,
        vmInstanceUuid,
        vmNicParams: JSON.stringify({
          l3NetworkUuid: value[`l3NetworkUuids-${key}`]?.[0]?.uuid,
          state: value[`netCardState-${key}`] ? "enable" : "disable",
          driverType: value[`nicType-${key}`],
          mac: value[`customMac-${key}`] || undefined,
          ip: ip && (enableIPAM || appointIpv4) ? ip : undefined,
          ip6: ip6 && (enableIPAM || appointIpv6) ? ip6 : undefined,
          netmask: netmask && appointIpv4 ? netmask : undefined,
          ipv6Prefix: ipv6Prefix && appointIpv6 ? ipv6Prefix : undefined,
          gateway: gateway && appointIpv4 ? gateway : undefined,
          ipv6Gateway: ipv6Gateway && appointIpv6 ? ipv6Gateway : undefined,
          dnsList: dns4Enabled ? dnsList4 : undefined,
          dns6List: dns6Enabled ? dnsList6 : undefined,
          outboundBandwidth: value?.[`outboundBandwidth-${key}`]?.number
            ? parseNumber(
                Number(value?.[`outboundBandwidth-${key}`]?.number),
                value?.[`outboundBandwidth-${key}`]?.unit || "",
              )
            : undefined,
          inboundBandwidth: value?.[`inboundBandwidth-${key}`]?.number
            ? parseNumber(
                Number(value?.[`inboundBandwidth-${key}`]?.number),
                value?.[`inboundBandwidth-${key}`]?.unit || "",
              )
            : undefined,
          multiQueueNum: value[`nicMultiQueueNum-${key}`]
            ? Number(value[`nicMultiQueueNum-${key}`])
            : undefined,
          vfParentUuid: value[`nicDevice-${key}`]?.[0]?.uuid,
        }),
        driverType: value[`nicType-${key}`],
        systemTags,
      },
    ]);
  });

  removeList.forEach((key: string) => {
    setChangeKeys((origin) => origin.concat(key));
    const value = _.pick(originValues, originNicList[key]);
    payload.detachL3NetworkFromVmPayload = (
      payload.detachL3NetworkFromVmPayload ?? []
    ).concat([
      {
        vmNicUuid: value[`nicUuid-${key}`],
      },
    ]);
    // linux 删除默认网卡需要重新下发网络配置
    if (isLinux && key === "0" && updateList.length) {
      generateArrayPayload("updateVmNetworkConfigPayload", {
        vmInstanceUuid,
        l3NetworkUuid: "__default__",
      });
    }
  });

  updateList.forEach((key: string) => {
    const value = _.pick(nicValues, nicList[key]);
    const originValue = _.pick(originValues, originNicList[key]);
    const updateKeys: string[] = [];
    const nicUuid = originValue[`nicUuid-${key}`];
    _.keys(value).forEach((_key: string) => {
      if (
        !_.isEqual(value[_key], originValue[_key]) &&
        value[_key] !== originValue[_key]
      ) {
        updateKeys.push(_key);
      } // != 用于处理 null 和undefined的比较
    });

    // qos 设置
    const qoskeys = updateKeys.filter(
      (_key) =>
        [
          "outboundBandwidth",
          "inboundBandwidth",
          "netCardQosEnabled",
        ].findIndex((props) => _key.indexOf(props) > -1) > -1,
    );
    if (qoskeys?.length) {
      payload.setNicQosPayload = (payload.setNicQosPayload ?? []).concat([
        {
          uuid: nicUuid,
          outboundBandwidth:
            value?.[`netCardQosEnabled-${key}`] &&
            value?.[`outboundBandwidth-${key}`]?.number
              ? parseNumber(
                  Number(value?.[`outboundBandwidth-${key}`]?.number || 0),
                  value?.[`outboundBandwidth-${key}`]?.unit || "",
                )
              : undefined,
          inboundBandwidth:
            value?.[`netCardQosEnabled-${key}`] &&
            value?.[`inboundBandwidth-${key}`]?.number
              ? parseNumber(
                  Number(value?.[`inboundBandwidth-${key}`]?.number),
                  value?.[`inboundBandwidth-${key}`]?.unit || "",
                )
              : undefined,
        },
      ]);
    }

    // 修改网卡网络配置
    if (updateKeys.some((_key) => _key.indexOf("l3NetworkUuids-") === 0)) {
      const systemTags = [];
      if (value[`securityGroup-${key}`]?.length) {
        systemTags.push(
          `l3::${value[`l3NetworkUuids-${key}`]?.[0]?.uuid}::SecurityGroupUuids::${value[
            `securityGroup-${key}`
          ]
            .map((it: any) => it.uuid)
            .join(",")}`,
        );
      }

      const appointIpv4 = value[`appointIpv4-${key}`];
      const appointIpv6 = value[`appointIpv6-${key}`];
      const enableIPAM = value[`l3NetworkUuids-${key}`]?.[0]?.enableIPAM;
      const ip = value[`ipv4-${key}`];
      const ip6 = value[`ipv6-${key}`];
      const netmask = value[`netmask-${key}`];
      const ipv6Prefix = value[`prefixLen-${key}`];
      const gateway = value[`gateway4-${key}`];
      const ipv6Gateway = value[`gateway6-${key}`];

      generateArrayPayload("changeVmNicNetworkPayload", {
        vmNicUuid: nicUuid,
        destL3NetworkUuid: value[`l3NetworkUuids-${key}`]?.[0]?.uuid,
        systemTags,
        vmNicParams: JSON.stringify({
          l3NetworkUuid: value[`l3NetworkUuids-${key}`]?.[0]?.uuid,
          ip: ip && (enableIPAM || appointIpv4) ? ip : undefined,
          ip6: ip6 && (enableIPAM || appointIpv6) ? ip6 : undefined,
          netmask: netmask && appointIpv4 ? netmask : undefined,
          ipv6Prefix: ipv6Prefix && appointIpv6 ? ipv6Prefix : undefined,
          gateway: gateway && appointIpv4 ? gateway : undefined,
          ipv6Gateway: ipv6Gateway && appointIpv6 ? ipv6Gateway : undefined,
          vfParentUuid: value[`nicDevice-${key}`]?.[0]?.uuid,
          driverType: value[`nicType-${key}`],
        }),
      });
    } else if (value[`l3NetworkUuids-${key}`]?.[0]?.enableIPAM) {
      const ipv4Updated = updateKeys.find(
        (item) => item.indexOf("ipv4-") === 0,
      );
      const ipv6Updated = updateKeys.find(
        (item) => item.indexOf("ipv6-") === 0,
      );
      if (
        (ipv4Updated && value[`ipv4-${key}`]) ||
        (ipv6Updated && value[`ipv6-${key}`])
      ) {
        generateArrayPayload("setVmStaticIpPayload", {
          vmNicUuid: nicUuid,
          vmInstanceUuid,
          l3NetworkUuid: value[`l3NetworkUuids-${key}`]?.[0]?.uuid,
          ip: ipv4Updated ? value[`ipv4-${key}`] : undefined,
          ip6: ipv6Updated ? value[`ipv6-${key}`] : undefined,
        });
      }
    } else {
      const setVmStaticIpPayload: Record<string, string> = {};
      const appointIpv4 = value[`appointIpv4-${key}`];
      const appointIpv6 = value[`appointIpv6-${key}`];
      if (
        !appointIpv4 &&
        updateKeys.some((item) => item.indexOf("appointIpv4-") === 0)
      ) {
        setVmStaticIpPayload.ip = "";
      } else if (
        appointIpv4 &&
        updateKeys.some(
          (item) =>
            item.indexOf("ipv4-") === 0 ||
            item.indexOf("netmask-") === 0 ||
            item.indexOf("gateway4-") === 0,
        )
      ) {
        setVmStaticIpPayload.ip = value[`ipv4-${key}`] || "";
        setVmStaticIpPayload.netmask = value[`netmask-${key}`] || "";
        setVmStaticIpPayload.gateway = value[`gateway4-${key}`] || "";
      }
      if (
        !appointIpv6 &&
        updateKeys.some((item) => item.indexOf("appointIpv6-") === 0)
      ) {
        setVmStaticIpPayload.ip6 = "";
      } else if (
        appointIpv6 &&
        updateKeys.some(
          (item) =>
            item.indexOf("ipv6-") === 0 ||
            item.indexOf("prefixLen-") === 0 ||
            item.indexOf("gateway6-") === 0,
        )
      ) {
        setVmStaticIpPayload.ip6 = value[`ipv6-${key}`] || "";
        setVmStaticIpPayload.ipv6Prefix = !_.isNil(value[`prefixLen-${key}`])
          ? String(value[`prefixLen-${key}`])
          : "";
        setVmStaticIpPayload.ipv6Gateway = value[`gateway6-${key}`] || "";
      }
      if (!_.isEmpty(setVmStaticIpPayload)) {
        generateArrayPayload("setVmStaticIpPayload", {
          vmNicUuid: nicUuid,
          vmInstanceUuid,
          l3NetworkUuid: value[`l3NetworkUuids-${key}`]?.[0]?.uuid,
          ...setVmStaticIpPayload,
        });
      }
    }

    if (
      updateKeys.some((_key) =>
        ["securityGroup", "ingressPolicy", "egressPolicy"].includes(
          _key.split("-")[0],
        ),
      ) &&
      !updateKeys.some((_key) => _key.split("-")[0] === "l3NetworkUuids")
    ) {
      generateArrayPayload("setVmNicSecurityGroupInEditPayload", {
        vmNicUuid: nicUuid,
        l3NetworkUuid: value[`l3NetworkUuids-${key}`]?.[0]?.uuid,
        securityGroupRefs: value[`securityGroup-${key}`].map(
          (it: any, i: number) => ({
            securityGroupUuid: it.uuid,
            priority: i + 1,
            attachedL3NetworkUuids: it.attachedL3NetworkUuids,
          }),
        ),
        ingressPolicy: value[`securityGroup-${key}`]?.length
          ? value[`ingressPolicy-${key}`]
          : undefined,
        egressPolicy: value[`securityGroup-${key}`]?.length
          ? value[`egressPolicy-${key}`]
          : undefined,
      });
    }

    if (isWindows && nicUuid) {
      if (
        updateKeys.some((val) =>
          ["appointIpv4", "dnsAllocationType4", "dnsList4"].includes(
            val.split("-")[0],
          ),
        )
      ) {
        let dns4Enabled = value[`dnsAllocationType4-${key}`] === "manual";
        if (!value[`l3NetworkUuids-${key}`]?.[0]?.enableIPAM) {
          dns4Enabled = dns4Enabled && value[`appointIpv4-${key}`];
        }
        const dns4List = dns4Enabled
          ? (value[`dnsList4-${key}`]?.filter((dns: any) => !!dns) ?? [])
          : [];
        generateArrayPayload("setVmDnsPayload", {
          vmInstanceUuid,
          vmNicUuid: nicUuid,
          dnsList: dns4List,
          ipVersion: 4,
        });
      }

      if (
        updateKeys.some((val) =>
          ["appointIpv6", "dnsAllocationType6", "dnsList6"].includes(
            val.split("-")[0],
          ),
        )
      ) {
        let dns6Enabled = value[`dnsAllocationType6-${key}`] === "manual";
        if (!value[`l3NetworkUuids-${key}`]?.[0]?.enableIPAM) {
          dns6Enabled = dns6Enabled && value[`appointIpv6-${key}`];
        }
        const dns6List = dns6Enabled
          ? (value[`dnsList6-${key}`]?.filter((dns: any) => !!dns) ?? [])
          : [];
        generateArrayPayload("setVmDnsPayload", {
          vmInstanceUuid,
          vmNicUuid: nicUuid,
          dnsList: dns6List,
          ipVersion: 6,
        });
      }
    }

    updateKeys.forEach((_key: string) => {
      switch (_key.split("-")[0]) {
        case "customMac":
          generateArrayPayload("updateVmNicMacPayload", {
            vmNicUuid: nicUuid,
            mac: value[`customMac-${key}`],
          });
          break;
        case "nicType":
          generateArrayPayload("updateVmNicDriverPayload", {
            vmInstanceUuid,
            vmNicUuid: nicUuid,
            driverType: value[`nicType-${key}`],
          });
          break;
        case "netCardState":
          generateArrayPayload("changeVmNicStatePayload", {
            vmNicUuid: nicUuid,
            state: value[`netCardState-${key}`] ? "enable" : "disable",
          });
          break;
        case "nicMultiQueueNum":
          generateArrayPayload("updateResourceConfigActionParams", {
            name: "nicMultiQueueNum",
            category: "vm",
            resourceUuid: nicUuid,
            value: value[_key],
          });
          break;
        case "nicDevice":
          generateArrayPayload("changeVmNicNetworkPayload", {
            vmNicUuid: nicUuid,
            destL3NetworkUuid: value[`l3NetworkUuids-${key}`]?.[0]?.uuid,
            vmNicParams: JSON.stringify({
              l3NetworkUuid: value[`l3NetworkUuids-${key}`]?.[0]?.uuid,
              vfParentUuid: value[`nicDevice-${key}`]?.[0]?.uuid,
              driverType: value[`nicType-${key}`],
            }),
          });
          break;
      }
    });
  });
  // linux dns
  if (
    isLinux &&
    (updateList.length || addList.length) &&
    (!_.isEqual(
      nicValues.dnsAllocationType ?? "auto",
      originValues.dnsAllocationType ?? "auto",
    ) ||
      !_.isEqual(nicValues.dnsList ?? [], originValues.dnsList ?? []))
  ) {
    const dnsList =
      nicValues.dnsAllocationType === "manual"
        ? (nicValues.dnsList?.filter((dns: any) => !!dns) ?? [])
        : [];
    generateArrayPayload("setVmDnsPayload", {
      vmInstanceUuid,
      dnsList,
      l3NetworkUuid: updateList.length ? "__default__" : undefined,
    });
  }
  setPayload(payload);
};

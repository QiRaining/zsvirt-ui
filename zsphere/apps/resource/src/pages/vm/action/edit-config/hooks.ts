import type { ListItem } from "@zstack/zsphere-components";
import { SystemTagActionType } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import { parseNumber } from "@zstack/zsphere-utils";
import * as _ from "lodash-es";
import { useState, useEffect } from "react";
import { useIntl } from "react-intl";

import { cdromTransform as _cdromTransform } from "./transforms/cdrom";
import {
  createGenerateArrayPayload,
  createCommonTransform,
  createGroupTransform,
  createResourceConfigTransform,
  createCpuQuotaTransform,
  createSystemTagTransform,
  resourceLeveTransform,
  createCpuSocketsTransform,
  createCpuBindListByVCpuTransform,
} from "./transforms/common";
import { gpuTransform as _gpuTransform } from "./transforms/gpu";
import { nicTransform as _nicTransform } from "./transforms/nic";
import { pcieTransform as _pcieTransform } from "./transforms/pcie";
import type { TransformContext } from "./transforms/types";
import { usbTransform as _usbTransform } from "./transforms/usb";
import { volumeTransform as _volumeTransform } from "./transforms/volume";

export const useTransformPayload = (vm?: IVM, visible?: boolean) => {
  const intl = useIntl();
  const [changeKeys, setChangeKeys] = useState<string[]>([]);
  const [confirmList, setConfirmList] = useState<ListItem[]>([]);

  const [payload, setPayload] = useState<any>({
    resourceUuid: vm?.uuid,
  });

  useEffect(() => {
    if (visible && vm) {
      setPayload({ resourceUuid: vm.uuid });
    }
  }, [vm, visible]);

  const resourceUuid = vm?.uuid || "";

  const ctx: TransformContext = {
    payload,
    setPayload,
    setChangeKeys,
    resourceUuid,
  };

  // Create common transforms
  const generateArrayPayload = createGenerateArrayPayload(ctx);
  const commonTransform = createCommonTransform(ctx);
  const groupTransform = createGroupTransform(ctx, vm);
  const resourceConfigTransform = createResourceConfigTransform(ctx);
  const cpuQuotaTransform = createCpuQuotaTransform(ctx);
  const systemTagTransform = createSystemTagTransform(ctx);
  const cpuSocketsTransform = createCpuSocketsTransform(
    ctx,
    systemTagTransform,
  );
  const cpuBindListByVCpuTransform = createCpuBindListByVCpuTransform(
    ctx,
    systemTagTransform,
  );

  // Hardware transforms - bind ctx
  const volumeTransform = (volumeValues: any, originValues: any, vm: IVM) =>
    _volumeTransform(ctx, generateArrayPayload, volumeValues, originValues, vm);

  const nicTransform = (
    nicValues: any,
    originValues: any,
    vm: IVM,
    guest?: string,
  ) =>
    _nicTransform(
      ctx,
      generateArrayPayload,
      nicValues,
      originValues,
      vm,
      guest,
    );

  const cdromTransform = (
    newValues: any,
    originValues: any,
    vmInstanceUuid: string,
  ) =>
    _cdromTransform(
      ctx,
      generateArrayPayload,
      newValues,
      originValues,
      vmInstanceUuid,
    );

  const usbTransform = (
    newValues: any,
    originValues: any,
    vmInstanceUuid: string,
  ) => _usbTransform(ctx, newValues, originValues, vmInstanceUuid);

  const gpuTransform = (
    newValues: any,
    originValues: any,
    vmInstanceUuid: string,
  ) => _gpuTransform(ctx, newValues, originValues, vmInstanceUuid);

  const pcieTransform = (
    newValues: any,
    originValues: any,
    vmInstanceUuid: string,
  ) => _pcieTransform(ctx, newValues, originValues, vmInstanceUuid);

  const tpmTransform = (
    values: any,
    originValues: any,
    vmInstanceUuid: string = resourceUuid,
  ) => {
    const enabled = Boolean(values?.tpmEnabled);
    const originEnabled = Boolean(originValues?.tpmEnabled);

    const keyProviderUuid: null = null;

    // 新增 TPM
    if (enabled && !originEnabled) {
      payload.addTpmToVmPayload = {
        vmInstanceUuid,
        keyProviderUuid,
      };
      setPayload(payload);
      return;
    }

    // 删除 TPM
    if (!enabled && originEnabled) {
      payload.removeTpmFromVmPayload = {
        vmInstanceUuid,
      };
      setPayload(payload);
      return;
    }
  };

  const updateKey2Payload: { [key: string]: any } = {
    name: commonTransform("name", "updateVmInstancePayload"),
    guest: commonTransform("platform", "updateVmInstancePayload"),
    group: groupTransform("group", "addResourcesToDirectoryPayload"),
    ha: commonTransform(
      "level",
      "setVmHaLevelPayload",
      "uuid",
      (value: boolean) => (value ? "NeverStop" : "None"),
    ),
    os: commonTransform("guestOsType", "updateVmInstancePayload"),
    // cpu
    totalCoreNum: commonTransform("cpuNum", "updateVmInstancePayload"),
    sockedNum: cpuSocketsTransform,
    CPUMode: resourceConfigTransform("vm.cpuMode", "kvm"),
    cpuQuota: cpuQuotaTransform("vm.cpu.quota", "kvm"),
    vmPriority: (value: any, originVmPriority: string, uuid?: string) =>
      resourceLeveTransform(ctx, value, originVmPriority, uuid),
    hotPlug: resourceConfigTransform("numa", "vm"),
    cpuHideKVMMark: resourceConfigTransform("vm.cpu.hypervisor.feature", "kvm"),

    // memory
    memorySize: commonTransform(
      "memorySize",
      "updateVmInstancePayload",
      "uuid",
      (value: any) => parseNumber(value.number, value.unit),
    ),
    memHotPlug: resourceConfigTransform("hotPlugMemory", "vm"),
    cpuBindListByVCpu: cpuBindListByVCpuTransform,
    vnumaEnabled: systemTagTransform(
      "vmNumaEnable",
      (value: any) => `vmNumaEnable::${value}`,
      "VmInstanceVO",
      (value) =>
        !value ? SystemTagActionType.Delete : SystemTagActionType.Update,
    ),
    // other
    gpuType: resourceConfigTransform("videoType", "vm"),
    soundCard: resourceConfigTransform("soundType", "vm"),
    motherboardType: systemTagTransform(
      "vmMachineType",
      (value) => `vmMachineType::${value}`,
      "VmInstanceVO",
      (value) =>
        value === "i440fx"
          ? SystemTagActionType.Delete
          : SystemTagActionType.Update,
    ),
    totalGPUMemory: commonTransform(
      "vram",
      "setVmQxlMemoryPayload",
      "uuid",
      (value: any) => value * 1024,
    ),
  };

  const getNeedRebootKey = (origianValues: any, values: any) => {
    const _changeKeys = _.keys(origianValues)
      .filter(
        (key: string) =>
          !_.isUndefined(values[key]) &&
          !_.isEqual(origianValues[key], values[key]),
      )
      .concat(changeKeys);
    setChangeKeys(_changeKeys);
    let keys = [
      {
        key: "hotPlug",
        label: intl.formatMessage({
          id: "virtualization.create.instance.cpu.hot.plug",
          defaultMessage: "CPU Hot Plug",
        }),
        type: "cpu",
      },
      {
        key: "CPUMode",
        label: intl.formatMessage({
          id: "virtualization.create.instance.cpu.mode",
          defaultMessage: "CPU Mode",
        }),
        type: "cpu",
      },
      {
        key: "cpuBindListByVCpu",
        label: intl.formatMessage({
          id: "virtualization.create.instance.cpu.bind.physics.cpu",
          defaultMessage: "Bind Physical CPU",
        }),
        type: "cpu",
      },
      {
        key: "nicMultiQueueNum-",
        label: intl.formatMessage({
          id: "virtualization.create.instance.hardware.network.card.nicMultiQueueNum",
          defaultMessage: "NIC Queue Number",
        }),
        type: "netcard",
      },
      {
        key: "nicType-",
        label: intl.formatMessage({
          id: "virtualization.create.instance.hardware.network.card.netcard.type",
          defaultMessage: "NIC Model",
        }),
        type: "netcard",
      },
      {
        key: "busType-",
        label: intl.formatMessage({
          id: "virtualization.create.instance.hardware.disk.busType",
          defaultMessage: "Bus Type",
        }),
        type: "disk",
      },
      {
        key: "gpuType",
        label: intl.formatMessage({
          id: "virtualization.create.instance.other.gpu.type",
          defaultMessage: "Graphics Card Type",
        }),
        type: "other",
      },
      {
        key: "totalGPUMemory",
        label: intl.formatMessage({
          id: "virtualization.create.instance.other.total.gpuMemory",
          defaultMessage: "Total Graphics Memory",
        }),
        type: "other",
      },
    ];
    if (!values.hotPlug) {
      keys = keys.concat([
        {
          key: "totalCoreNum",
          label: intl.formatMessage({
            id: "virtualization.create.instance.cpu.core.num",
            defaultMessage: "Cores",
          }),
          type: "cpu",
        },
        {
          key: "sockedNum",
          label: intl.formatMessage({
            id: "virtualization.create.instance.cpu.socket.num",
            defaultMessage: "Cores per Socket",
          }),
          type: "cpu",
        },
      ]);
    }
    if (!values.memHotPlug) {
      keys.push({
        key: "memHotPlug",
        label: intl.formatMessage({
          id: "virtualization.create.instance.memory.hot.plug",
          defaultMessage: "Memory Hot Plug",
        }),
        type: "memory",
      });
    }

    const needRebootKeys: any[] = [];
    _changeKeys.forEach((key) => {
      const keyConfig = keys.find((item) => key.indexOf(item.key) === 0);
      if (keyConfig) {
        needRebootKeys.push({
          changeKey: key,
          ...keyConfig,
        });
      }
    });
    keys.filter(
      (item) =>
        _changeKeys.findIndex((_key) => _key.indexOf(item.key) === 0) > -1,
    );

    const typeList = [
      {
        key: "cpu",
        label: "CPU",
      },
      {
        key: "memory",
        label: intl.formatMessage({ id: "memory", defaultMessage: "Memory" }),
      },
      {
        key: "disk",
        label: intl.formatMessage({ id: "hard.disk", defaultMessage: "Disk" }),
      },
      {
        key: "netcard",
        label: intl.formatMessage({ id: "netcard", defaultMessage: "NIC" }),
      },
      {
        key: "other",
        label: intl.formatMessage({
          id: "virtualization.other.hardware",
          defaultMessage: "Other",
        }),
      },
    ];
    const needRebootKeysGroup = _.groupBy(needRebootKeys, "type");

    typeList.forEach((typeItem) => {
      if (needRebootKeysGroup?.[typeItem.key]?.length) {
        if (typeItem.key === "disk") {
          const goups = _.groupBy(
            needRebootKeysGroup?.[typeItem.key],
            (rebootItem) => rebootItem?.changeKey?.split("-")?.[1],
          );
          const listss = _.keys(goups).map((indexKey) => ({
            label: `${typeItem.label}-${indexKey}`,
            value: goups[indexKey].map((item) => item.label),
          }));
          setConfirmList((origin) => origin.concat(listss));
        } else {
          setConfirmList((origin) =>
            origin.concat([
              {
                label: typeItem.label,
                value: needRebootKeysGroup?.[typeItem.key].map(
                  (item) => item.label,
                ),
              },
            ]),
          );
        }
      }
    });

    return { needRebootKeys };
  };

  const resetConfig = () => {
    setChangeKeys([]);
    setConfirmList([]);
    setPayload({
      resourceUuid: vm?.uuid,
    });
  };

  const getDisabledConfig = (vm: IVM, resourceConfig: any) => {
    return {
      tooltip:
        vm?.state === "Running"
          ? intl.formatMessage({
              id: "disable.vm.edit.action.with.running",
              defaultMessage:
                "Cannot modify this setting when the VM is running. Power off the VM and try again.",
            })
          : undefined,
      disabled: vm?.state === "Running",
      cpuNumDisabled:
        vm?.state === "Running" && resourceConfig?.numa?.value !== "true",
      memoryDisabled:
        vm?.state === "Running" && resourceConfig?.numa?.value !== "true",
      pciDeviceDisabled:
        vm?.state === "Running" &&
        resourceConfig?.hotPlugEnabled?.value !== "true",
    };
  };

  return {
    changeKeys,
    resetConfig,
    confirmList,
    _getNeedRebootKey: getNeedRebootKey,
    updateKey2Payload,
    payload,
    volumeTransform,
    nicTransform,
    cdromTransform,
    usbTransform,
    gpuTransform,
    pcieTransform,
    tpmTransform,
    getDisabledConfig,
  };
};

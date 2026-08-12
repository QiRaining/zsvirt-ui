import { SystemTagActionType } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";

import type { TransformContext } from "./types";

export const createGenerateArrayPayload =
  (ctx: TransformContext) => (payloadName: string, _payload: any) => {
    if (!ctx.payload?.[payloadName]) {
      ctx.payload[payloadName] = [];
    }
    ctx.payload[payloadName].push(_payload);
    ctx.setPayload(ctx.payload);
  };

export const createCommonTransform =
  (ctx: TransformContext) =>
  (
    key: string,
    payloadKey: string,
    uuidKey: string = "uuid",
    formatFn: (value: any) => string | number = (value) => value,
  ) =>
  (value: any, uuid: string = ctx.resourceUuid) => {
    if (!ctx.payload[payloadKey]) {
      ctx.payload[payloadKey] = { [key]: formatFn(value), [uuidKey]: uuid };
    } else {
      ctx.payload[payloadKey][key] = formatFn(value);
    }
    ctx.setPayload(ctx.payload);
  };

export const createGroupTransform =
  (ctx: TransformContext, vm?: IVM) =>
  (_key: string, payloadKey: string) =>
  (value: any, uuid: string = ctx.resourceUuid) => {
    ctx.payload[payloadKey] = {
      directoryUuid: value?.value,
      originDirectoryUuid: vm?.group?.uuid || "-2",
      uuid,
    };
    ctx.setPayload(ctx.payload);
  };

export const createResourceConfigTransform =
  (ctx: TransformContext) =>
  (name: string, category: string) =>
  (value: any, uuid: string = ctx.resourceUuid) => {
    if (!ctx.payload.updateResourceConfigActionParams) {
      ctx.payload.updateResourceConfigActionParams = [
        {
          name,
          category,
          value: value.toString(),
          resourceUuid: uuid,
        },
      ];
    } else {
      ctx.payload.updateResourceConfigActionParams.push({
        name,
        category,
        value: value.toString(),
        resourceUuid: uuid,
      });
    }
    ctx.setPayload(ctx.payload);
  };

// CPU 频率限制不限制时使用的默认上限值（BFF 端约定）
const CPU_QUOTA_UNLIMITED = "1000000";

export const createCpuQuotaTransform =
  (ctx: TransformContext) =>
  (name: string, category: string) =>
  (value: any, uuid: string = ctx.resourceUuid) => {
    //
    //
    // 不限制 / 不填写 / 填写具体值 三种场景都需要传对应的 value 给 BFF，不能传空字符串
    // 空值或非法值（不限制 / 不填写）→ 默认上限 1000000
    const numValue = Number(value) * 10000;
    const isEmpty = value === "" || value === null || value === undefined;
    const finalValue =
      isEmpty || !Number.isFinite(numValue) || numValue <= 0
        ? CPU_QUOTA_UNLIMITED
        : numValue.toString();

    ctx.payload.updateResourceConfigActionParams = [
      {
        name,
        category,
        value: finalValue,
        resourceUuid: uuid,
      },
    ];
    ctx.setPayload(ctx.payload);
  };

export const createSystemTagTransform =
  (ctx: TransformContext) =>
  (
    tag: string,
    formatFn: (value: any, values?: any) => string = (value) => value,
    resourceType: string = "VmInstanceVO",
    actionType:
      | SystemTagActionType
      | ((value: any) => SystemTagActionType) = SystemTagActionType.Update,
  ) =>
  (value: any, uuid: string = ctx.resourceUuid) => {
    if (!ctx.payload.setSystemTagPayload) {
      ctx.payload.setSystemTagPayload = [];
    }
    ctx.payload.setSystemTagPayload.push({
      tag: formatFn(value),
      originTag: tag,
      resourceType,
      resourceUuid: uuid,
      actionType:
        typeof actionType === "function" ? actionType(value) : actionType,
    });
    ctx.setPayload(ctx.payload);
  };

export const resourceLeveTransform = (
  ctx: TransformContext,
  value: any,
  originVmPriority: string,
  uuid: string = ctx.resourceUuid,
) => {
  let vmPriority = "High";
  if (value.cpuResourceLevel === "CpuHigh") {
    vmPriority = value.memoryResourceLevel === "High" ? "High" : "CpuHigh";
  } else {
    vmPriority = value.memoryResourceLevel === "High" ? "MemoryHigh" : "Normal";
  }
  if (vmPriority !== originVmPriority) {
    ctx.payload.updateVmPriorityPayload = [
      {
        priority: vmPriority,
        uuid,
      },
    ];
  }

  ctx.setPayload(ctx.payload);
};

export const createCpuSocketsTransform =
  (
    _ctx: TransformContext,
    systemTagTransform: ReturnType<typeof createSystemTagTransform>,
  ) =>
  (value: any, _uuid: string, _values: any) => {
    const fn = systemTagTransform("cpuCores");
    fn(`cpuCores::${value}`);
  };

export const createCpuBindListByVCpuTransform =
  (
    _ctx: TransformContext,
    systemTagTransform: ReturnType<typeof createSystemTagTransform>,
  ) =>
  (value: any, uuid: string, values: any) => {
    if (!value.length) {
      systemTagTransform(
        "vmCpuPinning",
        () => "vmCpuPinning::",
        "VmInstanceVO",
        SystemTagActionType.Delete,
      )(value, uuid);
    } else {
      systemTagTransform("vmCpuPinning", () => {
        return `vmCpuPinning::${`${values?.cpuBindListByVCpu
          .map((item: any) => `${item.vCPU}:${item.pCPUList.join(",")}`)
          .join(";")};`}`;
      })(value, uuid);
    }
  };

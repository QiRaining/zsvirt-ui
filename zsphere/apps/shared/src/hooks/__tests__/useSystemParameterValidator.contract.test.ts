import { renderHook } from "@testing-library/react";
import React from "react";
import { IntlProvider } from "react-intl";
/**
 * MF 契约测试 — useSystemParameterValidator
 *
 * 该文件通过 rsbuild exposes 直接暴露为 MF 远程模块：
 *   "./hooks/useSystemParameterValidator" → "./src/hooks/useSystemParameterValidator.ts"
 *
 * 被 monitoring-om、administration、reliability 等多个 app 消费。
 * 拆分时必须保证 useValidator() 返回对象的所有 key 不变。
 *
 * 本测试作为拆分前的安全网，锁定导出契约。
 */
import { describe, it, expect, vi } from "vitest";

vi.mock("@zstack/zsphere-utils", () => ({
  compareBigNumbers: (left: number | string, right: number | string) =>
    Number(left) - Number(right),
  isPowerOfTwo: (value: number) => value > 0 && (value & (value - 1)) === 0,
}));

import { useValidator } from "../useSystemParameterValidator";

// 包裹 IntlProvider，useValidator 内部依赖 useIntl
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(IntlProvider, { locale: "zh", messages: {} }, children);

/**
 * 完整的 validator key 列表，从源文件 return 语句中提取。
 * 任何 key 的增删都应该被本测试捕获。
 */
const EXPECTED_VALIDATOR_KEYS = [
  "validPasswordStrategyPeriod",
  "validPasswordStrategyHistoricalNum",
  "validPasswordStrategyLockLoginTimes",
  "validPasswordStrategyLockLoginMinutes",
  "validSharedblockUtilizationPercent",
  "validaKVMTestSshPortOpenTimeout",
  "validReservedCapacity",
  "validateUIVmCreateLimitNum",
  "validHaHostCheckSuccessRatio",
  "validApiTimeout",
  "validTenToOneThousand",
  "validZeroSeconds",
  "validOneSeconds",
  "validDeletePolicySeconds",
  "validExpungeInterval",
  "validRangeMonth",
  "validLoadBalancerMaxConnection",
  "validZeroIndividual",
  "validOneIndividual",
  "validTwoIndividual",
  "validZeroTimes",
  "validOneTimes",
  "validThreeTimes",
  "validVpcHaKeepalivedInterval",
  "validCountZeroTiao",
  "validCountOneTiao",
  "validZeroThread",
  "validZeroCountTai",
  "validKvmVmCreateConcurrency",
  "validOneDay",
  "validOneHundredYears",
  "validOneByte",
  "validWithinZeroToMaxIntegerRange",
  "validWithinOneToMaxIntegerRange",
  "validWithinTwoToMaxIntegerRange",
  "validateIntegerInRangeZeroTo180",
  "validIsPowerOfTwo",
  "validZeroByte",
  "validSharedblockInitializeSize",
  "validDrsSchedulingInterval",
  "validHostAllocatorConcurrentLevel",
  "validHostCpuOverProvisioningRatio",
  "validMaximumNumberOfImportedUsers",
  "validIdentitySessionTimeout",
  "validKvmDataVolumeMaxNum",
  "validLessThanOrEqualToOneWithoutUnit",
  "validAuditRetentionDuration",
  "validOverProvisioning",
  "validPSCapacity",
  "validCollectHostDataDuration",
  "validV2VCacheRetention",
  "validThirtySeconds",
  "validvCenterSyncInterval",
  "validVolumeRefreshVolumeSizeInterval",
  "validVpcZsnpTimeout",
  "validMinusOneSeconds",
  "validZwatchCountCacheExpireSecTime",
  "validZwatchMinimumCountAmountAllowedAddedToCache",
  "validZwatchScrapeInterval",
  "validRequired",
  "validVirtualRouterVrouterPassword",
  "validVirtualRouterSSHPort",
  "validChassis2MaxNumber",
  "validCdpConcurrentInterval",
  "validPSCapacityPredict",
  "validL2networkDefaultDhcpMtu",
] as const;

describe("useSystemParameterValidator MF Contract", () => {
  it("should export useValidator as a named export", () => {
    expect(typeof useValidator).toBe("function");
  });

  it("should return an object with all expected validator keys", () => {
    const { result } = renderHook(() => useValidator(), { wrapper });
    const validators = result.current;

    for (const key of EXPECTED_VALIDATOR_KEYS) {
      expect(validators).toHaveProperty(key);
    }
  });

  it("should not have unexpected extra keys (detect untracked additions)", () => {
    const { result } = renderHook(() => useValidator(), { wrapper });
    const actualKeys = Object.keys(result.current).sort();
    const expectedKeys = [...EXPECTED_VALIDATOR_KEYS].sort();

    expect(actualKeys).toEqual(expectedKeys);
  });

  it("every validator should be a function", () => {
    const { result } = renderHook(() => useValidator(), { wrapper });
    const validators = result.current;

    for (const key of EXPECTED_VALIDATOR_KEYS) {
      expect(typeof validators[key]).toBe("function");
    }
  });

  describe("validator behavior smoke tests", () => {
    it("validSharedblockUtilizationPercent: should resolve for value in [1, 100]", async () => {
      const { result } = renderHook(() => useValidator(), { wrapper });
      await expect(
        result.current.validSharedblockUtilizationPercent(null, {
          number: 50,
        }),
      ).resolves.toBeUndefined();
    });

    it("validSharedblockUtilizationPercent: should reject for value outside [1, 100]", async () => {
      const { result } = renderHook(() => useValidator(), { wrapper });
      await expect(
        result.current.validSharedblockUtilizationPercent(null, {
          number: 0,
        }),
      ).rejects.toBeDefined();
      await expect(
        result.current.validSharedblockUtilizationPercent(null, {
          number: 101,
        }),
      ).rejects.toBeDefined();
    });

    it("validSharedblockUtilizationPercent: should reject for empty value", async () => {
      const { result } = renderHook(() => useValidator(), { wrapper });
      await expect(
        result.current.validSharedblockUtilizationPercent(null, {
          number: undefined,
        }),
      ).rejects.toBeDefined();
    });

    it("validaKVMTestSshPortOpenTimeout: should resolve for value in [0, 3600]", async () => {
      const { result } = renderHook(() => useValidator(), { wrapper });
      await expect(
        result.current.validaKVMTestSshPortOpenTimeout(null, { number: 0 }),
      ).resolves.toBeUndefined();
      await expect(
        result.current.validaKVMTestSshPortOpenTimeout(null, { number: 3600 }),
      ).resolves.toBeUndefined();
    });

    it("validaKVMTestSshPortOpenTimeout: should reject for value outside [0, 3600]", async () => {
      const { result } = renderHook(() => useValidator(), { wrapper });
      await expect(
        result.current.validaKVMTestSshPortOpenTimeout(null, { number: -1 }),
      ).rejects.toBeDefined();
      await expect(
        result.current.validaKVMTestSshPortOpenTimeout(null, { number: 3601 }),
      ).rejects.toBeDefined();
    });

    it("validRequired: should reject for empty string", async () => {
      const { result } = renderHook(() => useValidator(), { wrapper });
      await expect(
        result.current.validRequired(null, ""),
      ).rejects.toBeDefined();
    });

    it("validRequired: should resolve for non-empty string", async () => {
      const { result } = renderHook(() => useValidator(), { wrapper });
      await expect(
        result.current.validRequired(null, "test"),
      ).resolves.toBeUndefined();
    });

    it("validWithinZeroToMaxIntegerRange: should resolve for 0", async () => {
      const { result } = renderHook(() => useValidator(), { wrapper });
      await expect(
        result.current.validWithinZeroToMaxIntegerRange(null, { number: 0 }),
      ).resolves.toBeUndefined();
    });

    it("validWithinOneToMaxIntegerRange: should reject for 0", async () => {
      const { result } = renderHook(() => useValidator(), { wrapper });
      await expect(
        result.current.validWithinOneToMaxIntegerRange(null, { number: 0 }),
      ).rejects.toBeDefined();
    });

    it("validPSCapacity: should reject zero values even when decimal precision is valid", async () => {
      const { result } = renderHook(() => useValidator(), { wrapper });

      await expect(
        result.current.validPSCapacity(null, "0.0000"),
      ).rejects.toBeDefined();
      await expect(
        result.current.validPSCapacity(null, "0.00000"),
      ).rejects.toBeDefined();
    });

    it("validPSCapacity: should resolve for values in (0, 1] with up to four decimals", async () => {
      const { result } = renderHook(() => useValidator(), { wrapper });

      await expect(
        result.current.validPSCapacity(null, "0.0001"),
      ).resolves.toBeUndefined();
      await expect(
        result.current.validPSCapacity(null, "1.0000"),
      ).resolves.toBeUndefined();
    });
  });
});

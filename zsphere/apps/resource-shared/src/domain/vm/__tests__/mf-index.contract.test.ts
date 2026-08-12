/**
 * MF 契约测试 — resource-shared vm/mf-index
 *
 * 该文件通过 rsbuild exposes 暴露为 MF 远程模块：
 *   "./vm/mf-index" → "./src/domain/vm/mf-index"
 *
 * 被 resource、data-protection 等多个 app 消费。
 * 拆分 useColumnConfig.tsx 或 snapshot/disk/index.tsx 时，
 * 必须保证此文件的导出符号不变。
 *
 * 策略：mock 所有深层依赖，只验证 re-export 结构。
 */
import { describe, it, expect, vi } from "vitest";

// Mock 所有被 re-export 的模块，避免加载整个组件树
vi.mock("../vm-plain/vm-plain-list", () => ({
  default: () => null,
}));
vi.mock("../action/open-console", () => ({
  default: () => null,
}));
vi.mock("../action/force-stop-modal", () => ({
  default: () => null,
}));
vi.mock("../action/poweroff-modal", () => ({
  default: () => null,
}));
vi.mock("../action/stop-vm-instance", () => ({
  default: () => null,
}));
vi.mock("../action/create-vm-by-resource/snapshot", () => ({
  default: () => null,
}));
vi.mock("../action/create-vm-by-resource/bussiness-components/group", () => ({
  default: () => null,
}));
vi.mock(
  "../action/create-vm-by-resource/bussiness-components/ha-alert",
  () => ({
    default: () => null,
  }),
);
vi.mock("../action/create-vm-by-resource/bussiness-components/os", () => ({
  default: () => null,
}));
vi.mock(
  "../action/create-vm-by-resource/bussiness-components/run-position",
  () => ({
    default: () => null,
  }),
);
vi.mock("../action/validators", () => ({
  verifyOpenConsole: () => false,
  verifyStart: () => false,
  verifyStop: () => false,
  verifyForceStop: () => false,
  verifyPoweroff: () => false,
}));

/**
 * 完整的命名导出列表，从 mf-index.ts 源文件提取。
 */
const EXPECTED_NAMED_EXPORTS = [
  // 组件
  "VmPlainList",
  "useOpenConsoleAction",
  "ForceStopModal",
  "PoweroffModal",
  "StopVmInstanceAction",
  "CreateVmBySnapshot",
  // 业务组件
  "Group",
  "HaAlertItem",
  "Os",
  "RunInPosition",
  // 来自 ./action/validators 的 re-export
  "verifyOpenConsole",
  "verifyStart",
  "verifyStop",
  "verifyForceStop",
  "verifyPoweroff",
] as const;

describe("resource-shared vm/mf-index MF Contract", () => {
  it("should export all expected named symbols", async () => {
    const vmMfIndex = await import("../mf-index");
    for (const name of EXPECTED_NAMED_EXPORTS) {
      expect(vmMfIndex).toHaveProperty(name);
    }
  });

  it("should not have unexpected extra exports (detect untracked additions)", async () => {
    const vmMfIndex = await import("../mf-index");
    const actualExports = Object.keys(vmMfIndex).sort();
    const expectedExports = [...EXPECTED_NAMED_EXPORTS].sort();

    expect(actualExports).toEqual(expectedExports);
  });

  it("every export should be defined (not undefined)", async () => {
    const vmMfIndex = await import("../mf-index");
    for (const name of EXPECTED_NAMED_EXPORTS) {
      expect((vmMfIndex as Record<string, unknown>)[name]).not.toBeUndefined();
    }
  });
});

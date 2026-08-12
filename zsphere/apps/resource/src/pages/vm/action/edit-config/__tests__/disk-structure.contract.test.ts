import fs from "node:fs";
import path from "node:path";

/**
 * Disk 组件结构契约测试 — resource app 内的 3 个 disk/index.tsx
 *
 * 这些文件将按磁盘创建类型拆分子组件。
 * 本测试锁定每个文件的：
 *   1. 导出结构（default export + named exports）
 *   2. IProps 接口字段
 *   3. 内部关键定义（DiskCard 组件）
 *
 * 策略：读取源文件文本，用正则提取结构信息，不加载运行时依赖。
 */
import { describe, it, expect } from "vitest";

const RESOURCE_ROOT = path.resolve(__dirname, "../../../../..");

const DISK_FILES = {
  vmTemplate: path.join(
    RESOURCE_ROOT,
    "pages/vm/create-vm-by-resource/vm-template/advance-card/hardware/disk/index.tsx",
  ),
  editConfigFormVm: path.join(
    RESOURCE_ROOT,
    "pages/vm-template/action/edit-config-form-vm/hardware/disk/index.tsx",
  ),
  backupData: path.join(
    RESOURCE_ROOT,
    "pages/vm/create-vm-by-resource/backup-data/advance-card/hardware/disk/index.tsx",
  ),
} as const;

/** 从源文件提取结构信息 */
function extractStructure(filePath: string) {
  const source = fs.readFileSync(filePath, "utf-8");
  const lines = source.split("\n");

  // 提取 named exports
  const namedExports: string[] = [];
  for (const line of lines) {
    const match = line.match(/^export\s+\{([^}]+)\}/);
    if (match) {
      match[1].split(",").forEach((s) => {
        const name = s.trim().split(/\s+/)[0];
        if (name) {
          namedExports.push(name);
        }
      });
    }
  }

  // 检测 default export
  const hasDefaultExport = lines.some((l) => /^export default\s/.test(l));

  // 提取 IProps 接口字段
  const propsFields: string[] = [];
  let inProps = false;
  for (const line of lines) {
    if (/^interface IProps\s*\{/.test(line)) {
      inProps = true;
      continue;
    }
    if (inProps) {
      if (line.startsWith("}")) {
        inProps = false;
        continue;
      }
      const fieldMatch = line.match(/^\s+(\w+)\??:/);
      if (fieldMatch) {
        propsFields.push(fieldMatch[1]);
      }
    }
  }

  // 检测 DiskCard 组件定义
  const hasDiskCard = lines.some((l) => /^const DiskCard:\s*React\.FC/.test(l));

  // 检测 React.memo 包装
  const hasMemoExport = lines.some((l) =>
    /export default React\.memo\(DiskCard\)/.test(l),
  );

  return {
    namedExports: namedExports.sort(),
    hasDefaultExport,
    propsFields: propsFields.sort(),
    hasDiskCard,
    hasMemoExport,
  };
}

/** 所有 disk 组件共享的 named exports */
const EXPECTED_NAMED_EXPORTS = [
  "SetDiskQosType",
  "bandWidthUnitList",
  "diskSizeUnitList",
].sort();

/** 所有 disk 组件共享的基础 IProps 字段 */
const BASE_PROPS_FIELDS = [
  "hideTag",
  "hideDescription",
  "hideQuantity",
  "setFields",
  "formCreateType",
  "form",
  "add",
  "index",
  "isEdit",
  "source",
  "zoneUuid",
  "originValue",
].sort();

describe("Disk Component Structure Contract — resource app", () => {
  for (const [name, filePath] of Object.entries(DISK_FILES)) {
    describe(`${name} disk/index.tsx`, () => {
      it("file should exist", () => {
        expect(fs.existsSync(filePath)).toBe(true);
      });

      it("should have expected named exports", () => {
        const structure = extractStructure(filePath);
        expect(structure.namedExports).toEqual(EXPECTED_NAMED_EXPORTS);
      });

      it("should have default export via React.memo(DiskCard)", () => {
        const structure = extractStructure(filePath);
        expect(structure.hasDefaultExport).toBe(true);
        expect(structure.hasDiskCard).toBe(true);
        expect(structure.hasMemoExport).toBe(true);
      });

      it("should have all base IProps fields", () => {
        const structure = extractStructure(filePath);
        for (const field of BASE_PROPS_FIELDS) {
          expect(structure.propsFields).toContain(field);
        }
      });
    });
  }

  describe("vmTemplate disk — extra props", () => {
    it("should have newCreate and createdVolumeUuid props", () => {
      const structure = extractStructure(DISK_FILES.vmTemplate);
      expect(structure.propsFields).toContain("newCreate");
      expect(structure.propsFields).toContain("createdVolumeUuid");
    });
  });

  describe("editConfigFormVm disk — extra props", () => {
    it("should have newCreate prop", () => {
      const structure = extractStructure(DISK_FILES.editConfigFormVm);
      expect(structure.propsFields).toContain("newCreate");
    });
  });

  describe("cross-file consistency", () => {
    it("all 3 files should share the same named exports", () => {
      const structures = Object.values(DISK_FILES).map(extractStructure);
      const first = structures[0].namedExports;
      for (const s of structures.slice(1)) {
        expect(s.namedExports).toEqual(first);
      }
    });

    it("all 3 files should share the same base IProps fields", () => {
      const structures = Object.values(DISK_FILES).map(extractStructure);
      for (const s of structures) {
        for (const field of BASE_PROPS_FIELDS) {
          expect(s.propsFields).toContain(field);
        }
      }
    });
  });
});

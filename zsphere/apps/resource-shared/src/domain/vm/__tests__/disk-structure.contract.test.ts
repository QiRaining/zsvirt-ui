import fs from "node:fs";
import path from "node:path";

/**
 * Disk 组件结构契约测试 — resource-shared app 的 snapshot disk/index.tsx
 *
 * 该文件通过 MF 间接暴露（snapshot → CreateVmBySnapshot → mf-index）。
 * 本测试锁定其导出结构、IProps 接口字段、DiskCard 组件定义。
 */
import { describe, it, expect } from "vitest";

const DISK_FILE = path.resolve(
  __dirname,
  "../action/create-vm-by-resource/snapshot/advance-card/hardware/disk/index.tsx",
);

function extractStructure(filePath: string) {
  const source = fs.readFileSync(filePath, "utf-8");
  const lines = source.split("\n");

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

  const hasDefaultExport = lines.some((l) => /^export default\s/.test(l));

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

  const hasDiskCard = lines.some((l) => /^const DiskCard:\s*React\.FC/.test(l));
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

const EXPECTED_NAMED_EXPORTS = [
  "SetDiskQosType",
  "bandWidthUnitList",
  "diskSizeUnitList",
].sort();

const EXPECTED_PROPS_FIELDS = [
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

describe("Disk Component Structure Contract — resource-shared snapshot", () => {
  it("file should exist", () => {
    expect(fs.existsSync(DISK_FILE)).toBe(true);
  });

  it("should have expected named exports", () => {
    const structure = extractStructure(DISK_FILE);
    expect(structure.namedExports).toEqual(EXPECTED_NAMED_EXPORTS);
  });

  it("should have default export via React.memo(DiskCard)", () => {
    const structure = extractStructure(DISK_FILE);
    expect(structure.hasDefaultExport).toBe(true);
    expect(structure.hasDiskCard).toBe(true);
    expect(structure.hasMemoExport).toBe(true);
  });

  it("should have all expected IProps fields", () => {
    const structure = extractStructure(DISK_FILE);
    expect(structure.propsFields).toEqual(EXPECTED_PROPS_FIELDS);
  });
});

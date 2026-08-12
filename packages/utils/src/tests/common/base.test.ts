import { gql } from "@apollo/client/core";
import { print } from "graphql";
import { describe, it, expect } from "vitest";

import {
  delay,
  genUuid,
  getBaseLog,
  getApi,
  mergeObjectArrays,
  compareVersion,
  CompareResult,
  mergeCandidates,
  arrayMoveImmutable,
  arrayMoveMutable,
  compareBigFloat,
  modifyFieldsFromGraphqlDoc,
} from "../../common/base";

describe("Base Utils", () => {
  describe("delay", () => {
    it("should delay execution for specified milliseconds", async () => {
      const start = Date.now();
      await delay(100);
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(100);
    });
  });

  describe("genUuid", () => {
    it("should generate a 32-character string", () => {
      const uuid = genUuid();
      expect(uuid).toHaveLength(32);
    });

    it("should generate unique values", () => {
      const uuid1 = genUuid();
      const uuid2 = genUuid();
      expect(uuid1).not.toBe(uuid2);
    });

    it("should not contain hyphens", () => {
      const uuid = genUuid();
      expect(uuid).not.toContain("-");
    });
  });

  describe("getBaseLog", () => {
    it("should calculate logarithm with custom base", () => {
      expect(getBaseLog(8, 2)).toBe(3); // log2(8) = 3
      expect(getBaseLog(100, 10)).toBe(2); // log10(100) = 2
    });

    it("should handle decimal results", () => {
      expect(getBaseLog(10, 2)).toBeCloseTo(3.321928094887362);
    });
  });

  describe("getApi", () => {
    it("should format API string with default output", () => {
      expect(getApi("test-api")).toBe(
        "getapi(api='test-api', output='inventories.uuid')",
      );
    });

    it("should format API string with custom output", () => {
      expect(getApi("test-api", {}, "custom.output")).toBe(
        "getapi(api='test-api', output='custom.output')",
      );
    });

    it("should include additional arguments", () => {
      expect(getApi("test-api", { param1: "value1", param2: "value2" })).toBe(
        "getapi(api='test-api', output='inventories.uuid', param1='value1', param2='value2')",
      );
    });
  });

  describe("modifyFieldsFromGraphqlDoc", () => {
    it("should remove specified fields from list", () => {
      const query = gql`
        query TestQuery {
          items {
            list {
              id
              name
              description
            }
          }
        }
      `;

      const result = modifyFieldsFromGraphqlDoc(query, [], ["description"]);
      const printed = print(result);

      expect(printed).not.toContain("description");
      expect(printed).toContain("id");
      expect(printed).toContain("name");
    });

    it("should add new fields to list", () => {
      const query = gql`
        query TestQuery {
          items {
            list {
              id
              name
            }
          }
        }
      `;

      const result = modifyFieldsFromGraphqlDoc(query, ["email"], []);
      const printed = print(result);

      expect(printed).toContain("email");
      expect(printed).toContain("id");
      expect(printed).toContain("name");
    });

    it("should remove all fields when isRemoveAll is true", () => {
      const query = gql`
        query TestQuery {
          items {
            list {
              id
              name
              description
            }
          }
        }
      `;

      const result = modifyFieldsFromGraphqlDoc(query, [], [], true);
      const printed = print(result);

      expect(printed).not.toContain("id");
      expect(printed).not.toContain("name");
      expect(printed).not.toContain("description");
      expect(printed).toContain("list");
    });

    it("should handle fragments correctly", () => {
      const query = gql`
        query TestQuery {
          items {
            list {
              id
              ...UserFragment
            }
          }
        }
        fragment UserFragment on User {
          name
          email
        }
      `;

      const result = modifyFieldsFromGraphqlDoc(query, [], ["email"]);
      const printed = print(result);

      expect(printed).toContain("id");
      expect(printed).toContain("name");
      expect(printed).not.toContain("email");
    });

    it("should handle custom parent field name", () => {
      const query = gql`
        query TestQuery {
          items {
            results {
              id
              name
            }
          }
        }
      `;

      const result = modifyFieldsFromGraphqlDoc(
        query,
        ["email"],
        ["name"],
        false,
        "results",
      );
      const printed = print(result);

      expect(printed).toContain("id");
      expect(printed).not.toContain("name");
      expect(printed).toContain("email");
    });

    it("should handle both adding and removing fields simultaneously", () => {
      const query = gql`
        query TestQuery {
          items {
            list {
              id
              name
              description
            }
          }
        }
      `;

      const result = modifyFieldsFromGraphqlDoc(
        query,
        ["email", "phone"],
        ["description"],
      );
      const printed = print(result);

      expect(printed).toContain("id");
      expect(printed).toContain("name");
      expect(printed).not.toContain("description");
      expect(printed).toContain("email");
      expect(printed).toContain("phone");
    });
  });

  describe("mergeObjectArrays", () => {
    it("should merge arrays based on key", () => {
      const arr1 = [
        { key: "1", value: "a" },
        { key: "2", value: "b" },
      ];
      const arr2 = [
        { key: "2", value: "c" },
        { key: "3", value: "d" },
      ];
      const result = mergeObjectArrays(arr1, arr2);

      expect(result).toHaveLength(3);
      expect(result).toContainEqual({ key: "1", value: "a" });
      expect(result).toContainEqual({ key: "2", value: "c" });
      expect(result).toContainEqual({ key: "3", value: "d" });
    });

    it("should handle empty arrays", () => {
      expect(mergeObjectArrays([], [])).toEqual([]);
      expect(mergeObjectArrays([{ key: "1", value: "a" }], [])).toEqual([
        { key: "1", value: "a" },
      ]);
    });

    it("should use custom merge key", () => {
      const arr1 = [{ id: "1", value: "a" }];
      const arr2 = [{ id: "1", value: "b" }];
      const result = mergeObjectArrays(arr1, arr2, "id");
      expect(result).toEqual([{ id: "1", value: "b" }]);
    });
  });

  describe("compareVersion", () => {
    it("should compare version strings correctly", () => {
      expect(compareVersion("1.0.0", "1.0.1")).toBe(CompareResult.LESS_THAN);
      expect(compareVersion("1.0.1", "1.0.0")).toBe(CompareResult.GREATER_THAN);
      expect(compareVersion("1.0.0", "1.0.0")).toBe(CompareResult.EQUAL);
    });

    it("should handle versions with different lengths", () => {
      expect(compareVersion("1.0", "1.0.0")).toBe(CompareResult.EQUAL);
      expect(compareVersion("1.0.0.0", "1.0.0")).toBe(CompareResult.EQUAL);
    });

    it("should throw error for invalid version format", () => {
      expect(() => compareVersion("1.0.a", "1.0.0")).toThrow(
        "Invalid version format!",
      );
      expect(() => compareVersion("1.0", "invalid")).toThrow(
        "Invalid version format!",
      );
    });
  });

  describe("mergeCandidates", () => {
    it("should merge arrays and preserve all keys", () => {
      const source: { key: string; a: number }[] = [
        { key: "1", a: 1 },
        { key: "2", a: 2 },
      ];
      const target: { key: string; b: number }[] = [
        { key: "2", b: 3 },
        { key: "3", b: 4 },
      ];
      const result = mergeCandidates(source, target);

      expect(result).toHaveLength(3);
      expect(result).toContainEqual({ key: "1", a: 1 });
      expect(result).toContainEqual({ key: "2", a: 2, b: 3 });
      expect(result).toContainEqual({ key: "3", b: 4 });
    });

    it("should handle empty arrays", () => {
      expect(mergeCandidates([], [])).toEqual([]);
      expect(mergeCandidates([{ key: "1", value: "a" }], [])).toEqual([
        { key: "1", value: "a" },
      ]);
    });

    it("should use custom merge key", () => {
      const source = [{ id: "1", a: 1 }];
      const target = [{ id: "1", b: 2 }];
      const result = mergeCandidates(source, target, "id");
      expect(result).toEqual([{ id: "1", a: 1, b: 2 }]);
    });
  });

  describe("Array Movement", () => {
    describe("arrayMoveMutable", () => {
      it("should move array element in place", () => {
        const arr = [1, 2, 3, 4];
        arrayMoveMutable(arr, 1, 2);
        expect(arr).toEqual([1, 3, 2, 4]);
      });

      it("should handle negative indices", () => {
        const arr = [1, 2, 3, 4];
        arrayMoveMutable(arr, -2, -1);
        expect(arr).toEqual([1, 2, 4, 3]);
      });

      it("should handle out of bounds indices", () => {
        const arr = [1, 2, 3];
        arrayMoveMutable(arr, 5, 0);
        expect(arr).toEqual([1, 2, 3]);
      });
    });

    describe("arrayMoveImmutable", () => {
      it("should return new array with moved element", () => {
        const original = [1, 2, 3, 4];
        const result = arrayMoveImmutable(original, 1, 2);
        expect(result).toEqual([1, 3, 2, 4]);
        expect(original).toEqual([1, 2, 3, 4]); // Original unchanged
      });

      it("should handle negative indices", () => {
        const arr = [1, 2, 3, 4];
        expect(arrayMoveImmutable(arr, -2, -1)).toEqual([1, 2, 4, 3]);
      });

      it("should handle out of bounds indices", () => {
        const arr = [1, 2, 3];
        expect(arrayMoveImmutable(arr, 5, 0)).toEqual([1, 2, 3]);
      });
    });

    describe("compareBigFloat", () => {
      it("should compare integer parts correctly", () => {
        expect(compareBigFloat("123", "45")).toBe(true); // 123 > 45
        expect(compareBigFloat("45", "123")).toBe(false); // 45 < 123
        expect(compareBigFloat("123", "123")).toBe(undefined); // 123 = 123
      });

      it("should compare decimal parts correctly", () => {
        expect(compareBigFloat("1.23", "1.45")).toBe(false); // 1.23 < 1.45
        expect(compareBigFloat("1.45", "1.23")).toBe(true); // 1.45 > 1.23
        expect(compareBigFloat("1.23", "1.23")).toBe(undefined); // 1.23 = 1.23
      });

      it("should handle leading zeros", () => {
        expect(compareBigFloat("001.23", "1.23")).toBe(undefined); // 001.23 = 1.23
        expect(compareBigFloat("01.45", "1.23")).toBe(true); // 01.45 > 1.23
      });

      it("should handle different decimal lengths", () => {
        expect(compareBigFloat("1.23", "1.23")).toBe(undefined); // 1.23= 1.23
        expect(compareBigFloat("1.2301", "1.23")).toBe(true); // 1.2301 > 1.23
      });

      it("should handle invalid inputs", () => {
        expect(compareBigFloat("abc", "1.23")).toBe(false);
        expect(compareBigFloat("1.23", "def")).toBe(false);
        expect(compareBigFloat("abc", "def")).toBe(false);
      });

      it("should handle edge cases", () => {
        expect(compareBigFloat("0", "0")).toBe(undefined); // 0 = 0

        expect(compareBigFloat("0.1", "0")).toBe(true); // 0.1 > 0
        expect(compareBigFloat("0", "0.1")).toBe(false); // 0 < 0.1
      });

      it("should handle very large numbers", () => {
        expect(compareBigFloat("999999.999999", "999999.999998")).toBe(true);
        expect(compareBigFloat("999999.999998", "999999.999999")).toBe(false);
      });

      it("should handle numbers with different integer lengths", () => {
        expect(compareBigFloat("123.45", "1234.56")).toBe(false); // 123.45 < 1234.56
        expect(compareBigFloat("1234.56", "123.45")).toBe(true); // 1234.56 > 123.45
      });
    });
  });
});

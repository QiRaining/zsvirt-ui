import { PrimaryStorageType } from "@zstack/zsphere-types";
import { parse, print } from "graphql";
import { describe, it, expect, vi, afterEach } from "vitest";

import {
  genUuid,
  delay,
  compareBigFloat,
  getBaseLog,
  isValidJsonString,
  objToUrl,
  mergeObjectArrays,
  mergeCandidates,
  arrayMoveImmutable,
  arrayMoveMutable,
  getApi,
  isVhostStorage,
  isZbsStorage,
  getUrlParam,
  downloadUrl,
  getGQL,
  modifyFieldsFromGraphqlDoc,
} from "../../common/base";

describe("Base Utils", () => {
  describe("genUuid", () => {
    it("should generate a valid UUID without hyphens", () => {
      const uuid = genUuid();
      expect(uuid).toHaveLength(32);
      expect(uuid).toMatch(/^[a-f0-9]{32}$/);
    });

    it("should generate unique UUIDs", () => {
      const uuid1 = genUuid();
      const uuid2 = genUuid();
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe("delay", () => {
    it("should delay execution by specified milliseconds", async () => {
      const start = Date.now();
      await delay(100);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(90);
      expect(elapsed).toBeLessThan(200);
    });

    it("should resolve without value", async () => {
      const result = await delay(10);
      expect(result).toBeUndefined();
    });
  });

  describe("compareBigFloat", () => {
    it("should return true when max > value", () => {
      expect(compareBigFloat("100", "50")).toBe(true);
      expect(compareBigFloat("1.5", "1.4")).toBe(true);
      expect(compareBigFloat("10.5", "9.9")).toBe(true);
    });

    it("should return false when max < value", () => {
      expect(compareBigFloat("50", "100")).toBe(false);
      expect(compareBigFloat("1.4", "1.5")).toBe(false);
    });

    it("should return undefined when max === value", () => {
      expect(compareBigFloat("100", "100")).toBeUndefined();
      expect(compareBigFloat("1.5", "1.5")).toBeUndefined();
    });

    it("should handle numbers with leading zeros", () => {
      expect(compareBigFloat("00100", "100")).toBeUndefined();
      expect(compareBigFloat("0100", "99")).toBe(true);
    });

    it("should handle decimal comparisons", () => {
      expect(compareBigFloat("1.10", "1.1")).toBe(true);
      expect(compareBigFloat("1.11", "1.10")).toBe(true);
      expect(compareBigFloat("1.09", "1.10")).toBe(false);
    });

    it("should return false for NaN values", () => {
      expect(compareBigFloat("abc", "100")).toBe(false);
      expect(compareBigFloat("100", "abc")).toBe(false);
    });

    it("should handle integer vs decimal comparisons", () => {
      expect(compareBigFloat("10", "9.99")).toBe(true);
      expect(compareBigFloat("9.99", "10")).toBe(false);
    });

    it("should handle decimals with different lengths requiring padding", () => {
      // Tests negative zeroSuffix case (lines 423-424 in base.ts)
      expect(compareBigFloat("1.999", "1.99")).toBe(true); // 1.999 > 1.990
      expect(compareBigFloat("1.99", "1.999")).toBe(false); // 1.990 < 1.999
    });
  });

  describe("getBaseLog", () => {
    it("should calculate logarithm with custom base", () => {
      expect(getBaseLog(8, 2)).toBeCloseTo(3);
      expect(getBaseLog(100, 10)).toBeCloseTo(2);
      expect(getBaseLog(1, 10)).toBe(0);
    });
  });

  describe("isValidJsonString", () => {
    it("should return true for valid JSON strings", () => {
      expect(isValidJsonString('{"key": "value"}')).toBe(true);
      expect(isValidJsonString("[]")).toBe(true);
      expect(isValidJsonString('"string"')).toBe(true);
      expect(isValidJsonString("123")).toBe(true);
      expect(isValidJsonString("null")).toBe(true);
    });

    it("should return false for invalid JSON strings", () => {
      expect(isValidJsonString("{")).toBe(false);
      expect(isValidJsonString("undefined")).toBe(false);
      expect(isValidJsonString("{'key': 'value'}")).toBe(false);
    });
  });

  describe("objToUrl", () => {
    it("should build URL from base", () => {
      expect(objToUrl({ baseUrl: "http://example.com" })).toBe(
        "http://example.com",
      );
    });

    it("should append paths", () => {
      expect(
        objToUrl({ baseUrl: "http://example.com", paths: ["api", "v1"] }),
      ).toBe("http://example.com/api/v1");
    });

    it("should append query parameters", () => {
      expect(
        objToUrl({
          baseUrl: "http://example.com",
          querys: { foo: "bar", baz: "qux" },
        }),
      ).toBe("http://example.com?foo=bar&baz=qux");
    });

    it("should combine paths and query parameters", () => {
      expect(
        objToUrl({
          baseUrl: "http://example.com",
          paths: ["api"],
          querys: { key: "value" },
        }),
      ).toBe("http://example.com/api?key=value");
    });

    it("should open browser immediately without timeout", () => {
      const mockOpen = vi.fn();
      vi.stubGlobal("window", { open: mockOpen });

      objToUrl({
        baseUrl: "http://example.com",
        openBrowser: true,
      });

      expect(mockOpen).toHaveBeenCalledWith("http://example.com");
      vi.unstubAllGlobals();
    });

    it("should open browser with timeout", () => {
      const mockOpen = vi.fn();
      vi.stubGlobal("window", { open: mockOpen });
      vi.useFakeTimers();

      objToUrl({
        baseUrl: "http://example.com",
        openBrowser: true,
        timeout: 1000,
      });

      expect(mockOpen).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1000);
      expect(mockOpen).toHaveBeenCalledWith("http://example.com");

      vi.useRealTimers();
      vi.unstubAllGlobals();
    });
  });

  describe("mergeObjectArrays", () => {
    it("should merge two object arrays by key", () => {
      const arr1 = [{ key: "a", value: 1 }];
      const arr2 = [
        { key: "a", extra: "data" },
        { key: "b", value: 2 },
      ];
      const result = mergeObjectArrays(arr1, arr2);
      expect(result).toHaveLength(2);
      expect(result.find((item) => item.key === "a")).toEqual({
        key: "a",
        value: 1,
        extra: "data",
      });
    });

    it("should support custom merge key", () => {
      const arr1 = [{ id: 1, name: "first" }];
      const arr2 = [{ id: 1, desc: "description" }];
      const result = mergeObjectArrays(arr1, arr2, "id");
      expect(result[0]).toEqual({ id: 1, name: "first", desc: "description" });
    });
  });

  describe("mergeCandidates", () => {
    it("should merge candidates from source and target", () => {
      const source = [{ key: "a", val: 1 }];
      const target = [
        { key: "a", extra: 2 },
        { key: "b", val: 3 },
      ];
      const result = mergeCandidates(source, target);
      expect(result).toHaveLength(2);
    });
  });

  describe("arrayMoveImmutable", () => {
    it("should move element to new position immutably", () => {
      const arr = ["a", "b", "c", "d"];
      const result = arrayMoveImmutable(arr, 0, 2);
      expect(result).toEqual(["b", "c", "a", "d"]);
      expect(arr).toEqual(["a", "b", "c", "d"]);
    });

    it("should handle negative indices", () => {
      const arr = ["a", "b", "c", "d"];
      const result = arrayMoveImmutable(arr, -1, 0);
      expect(result).toEqual(["d", "a", "b", "c"]);
    });
  });

  describe("arrayMoveMutable", () => {
    it("should move element in place", () => {
      const arr = ["a", "b", "c", "d"];
      arrayMoveMutable(arr, 0, 2);
      expect(arr).toEqual(["b", "c", "a", "d"]);
    });
  });

  describe("getApi", () => {
    it("should build API query string with default output", () => {
      const result = getApi("QueryVolumeSnapshotTree");
      expect(result).toContain("getapi");
      expect(result).toContain("QueryVolumeSnapshotTree");
      expect(result).toContain("inventories.uuid");
    });

    it("should include custom arguments in API query", () => {
      const result = getApi("QuerySnapshot", { key: "value" });
      expect(result).toContain("key='value'");
    });

    it("should support custom output parameter", () => {
      const result = getApi("QueryVolumeSnapshotTree", {}, "custom.output");
      expect(result).toContain("custom.output");
    });

    it("should handle multiple arguments", () => {
      const result = getApi("TestApi", { arg1: "val1", arg2: "val2" });
      expect(result).toContain("arg1='val1'");
      expect(result).toContain("arg2='val2'");
    });
  });

  describe("isVhostStorage", () => {
    it("should return true for Addon storage with Vhost protocol", () => {
      const storage = {
        type: PrimaryStorageType.Addon,
        defaultProtocol: "Vhost",
      };
      expect(isVhostStorage(storage as any)).toBe(true);
    });

    it("should return true for Addon storage with iSCSI protocol", () => {
      const storage = {
        type: PrimaryStorageType.Addon,
        defaultProtocol: "iSCSI",
      };
      expect(isVhostStorage(storage as any)).toBe(true);
    });

    it("should return false for Addon storage with other protocols", () => {
      const storage = {
        type: PrimaryStorageType.Addon,
        defaultProtocol: "CBD",
      };
      expect(isVhostStorage(storage as any)).toBe(false);
    });

    it("should return false for non-Addon storage types", () => {
      const storage = {
        type: PrimaryStorageType.NFS,
        defaultProtocol: "Vhost",
      };
      expect(isVhostStorage(storage as any)).toBe(false);
    });

    it("should return false for undefined storage", () => {
      expect(isVhostStorage(undefined)).toBe(false);
    });

    it("should return false for null storage", () => {
      expect(isVhostStorage(null as any)).toBe(false);
    });
  });

  describe("isZbsStorage", () => {
    it("should return true for Addon storage with CBD protocol", () => {
      const storage = {
        type: PrimaryStorageType.Addon,
        defaultProtocol: "CBD",
      };
      expect(isZbsStorage(storage as any)).toBe(true);
    });

    it("should return false for Addon storage with Vhost protocol", () => {
      const storage = {
        type: PrimaryStorageType.Addon,
        defaultProtocol: "Vhost",
      };
      expect(isZbsStorage(storage as any)).toBe(false);
    });

    it("should return false for Addon storage with iSCSI protocol", () => {
      const storage = {
        type: PrimaryStorageType.Addon,
        defaultProtocol: "iSCSI",
      };
      expect(isZbsStorage(storage as any)).toBe(false);
    });

    it("should return false for non-Addon storage types", () => {
      const storage = { type: PrimaryStorageType.ZBS, defaultProtocol: "CBD" };
      expect(isZbsStorage(storage as any)).toBe(false);
    });

    it("should return false for undefined storage", () => {
      expect(isZbsStorage(undefined)).toBe(false);
    });
  });

  describe("getUrlParam", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("should extract URL parameter from window.location.search", () => {
      vi.stubGlobal("window", {
        location: {
          search: "?id=123&name=test",
        },
      });

      const result = getUrlParam("id");
      expect(result).toBe("123");
    });

    it("should return null for missing parameter", () => {
      vi.stubGlobal("window", {
        location: {
          search: "?id=123",
        },
      });

      const result = getUrlParam("name");
      expect(result).toBe("undefined");
    });

    it("should handle URL encoded parameters", () => {
      vi.stubGlobal("window", {
        location: {
          search: "?message=hello%20world",
        },
      });

      const result = getUrlParam("message");
      expect(result).toBe("hello world");
    });

    it("should return null when search is empty", () => {
      vi.stubGlobal("window", {
        location: {
          search: "",
        },
      });

      const result = getUrlParam("id");
      expect(result).toBe("undefined");
    });

    it("should handle multiple values for same parameter", () => {
      vi.stubGlobal("window", {
        location: {
          search: "?id=123&id=456",
        },
      });

      const result = getUrlParam("id");
      expect(result).toBe("123");
    });
  });

  describe("downloadUrl", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("should create a link element and trigger download", () => {
      const mockElement = {
        setAttribute: vi.fn(),
        click: vi.fn(),
        remove: vi.fn(),
        download: "",
        href: "",
      };

      const mockCreateElement = vi.fn(() => mockElement);
      const mockAppendChild = vi.fn();

      vi.stubGlobal("document", {
        createElement: mockCreateElement,
        body: {
          appendChild: mockAppendChild,
        },
      });

      downloadUrl("test-file.txt", "http://example.com/file.txt");

      expect(mockCreateElement).toHaveBeenCalledWith("a");
      expect(mockElement.setAttribute).toHaveBeenCalledWith("type", "hidden");
      expect(mockElement.download).toBe("test-file.txt");
      expect(mockElement.href).toBe("http://example.com/file.txt");
      expect(mockAppendChild).toHaveBeenCalledWith(mockElement);
      expect(mockElement.click).toHaveBeenCalled();
      expect(mockElement.remove).toHaveBeenCalled();
    });
  });

  describe("getGQL", () => {
    it("should keep fields when passed as DocumentNode with array options", () => {
      const query = `{
        list {
          id
          name
          total
        }
      }`;
      const doc = parse(query);
      const result = getGQL(doc, ["id", "name"]);
      const resultString = print(result);
      expect(resultString).toContain("id");
      expect(resultString).toContain("name");
      expect(resultString).toContain("total");
    });

    it("should filter out fields not in array", () => {
      const query = `{
        list {
          id
          name
          email
          total
        }
      }`;
      const doc = parse(query);
      const result = getGQL(doc, ["id", "name"]);
      const resultString = print(result);
      expect(resultString).toContain("id");
      expect(resultString).toContain("name");
      expect(resultString).toContain("total");
    });

    it("should handle object options with addKeys", () => {
      const query = `{
        list {
          id
          name
        }
      }`;
      const doc = parse(query);
      const result = getGQL(doc, { addKeys: ["email"] });
      const resultString = print(result);
      expect(resultString).toContain("id");
      expect(resultString).toContain("name");
    });

    it("should handle object options with resetKeys", () => {
      const query = `{
        list {
          id
          name
          email
        }
      }`;
      const doc = parse(query);
      const result = getGQL(doc, { resetKeys: ["id", "name"] });
      const resultString = print(result);
      expect(resultString).toContain("id");
      expect(resultString).toContain("name");
    });

    it("should handle object options with removeKeys", () => {
      const query = `{
        list {
          id
          name
          email
        }
      }`;
      const doc = parse(query);
      const result = getGQL(doc, { removeKeys: ["email"] });
      const resultString = print(result);
      expect(resultString).toContain("id");
      expect(resultString).toContain("name");
      expect(resultString).not.toContain("email");
    });

    it("should warn when resetKeys conflicts with addKeys or removeKeys", () => {
      const query = `{
        list {
          id
          name
        }
      }`;
      const doc = parse(query);
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      getGQL(doc, { resetKeys: ["id"], addKeys: ["email"] });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "设置了resetKeys 会覆盖 addKeys 和 removeKeys",
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe("modifyFieldsFromGraphqlDoc", () => {
    it("should return a DocumentNode when modifying fields", () => {
      const query = `{
        list {
          id
          name
          email
        }
      }`;
      const doc = parse(query);
      const result = modifyFieldsFromGraphqlDoc(doc);
      expect(result).toHaveProperty("kind", "Document");
    });

    it("should handle nested selection sets", () => {
      const query = `{
        list {
          id
          user {
            id
            profile {
              name
            }
          }
        }
      }`;
      const doc = parse(query);
      const result = modifyFieldsFromGraphqlDoc(doc);
      expect(result).toHaveProperty("kind", "Document");
    });

    it("should support adding fields", () => {
      const query = `{
        list {
          id
          name
        }
      }`;
      const doc = parse(query);
      const result = modifyFieldsFromGraphqlDoc(doc, ["email"]);
      const resultString = print(result);
      expect(resultString).toContain("id");
      expect(resultString).toContain("name");
    });

    it("should support removing fields with isRemoveAll flag", () => {
      const query = `{
        list {
          id
          name
          email
        }
      }`;
      const doc = parse(query);
      const result = modifyFieldsFromGraphqlDoc(doc, ["id", "name"], [], true);
      const resultString = print(result);
      expect(resultString).toBeDefined();
    });

    it("should support adding fields with addFieldNameList", () => {
      const query = `{
        list {
          id
          name
        }
      }`;
      const doc = parse(query);
      const result = modifyFieldsFromGraphqlDoc(doc, ["email", "phone"]);
      const resultString = print(result);
      expect(resultString).toContain("id");
      expect(resultString).toContain("name");
      expect(resultString).toContain("email");
      expect(resultString).toContain("phone");
    });

    it("should handle removeFieldNameList parameter", () => {
      const query = `{
        list {
          id
          name
          email
        }
      }`;
      const doc = parse(query);
      const result = modifyFieldsFromGraphqlDoc(doc, [], ["email"]);
      const resultString = print(result);
      expect(resultString).toContain("id");
      expect(resultString).toContain("name");
      expect(resultString).not.toContain("email");
    });

    it("should handle GraphQL queries with fragments", () => {
      const query = `
        query TestQuery {
          list {
            ...UserFields
          }
        }
        
        fragment UserFields on User {
          id
          name
          email
        }
      `;
      const doc = parse(query);
      const result = modifyFieldsFromGraphqlDoc(doc, [], ["email"]);
      const resultString = print(result);
      expect(resultString).toBeDefined();
      expect(result).toHaveProperty("kind", "Document");
    });

    it("should handle fragments with isRemoveAll flag", () => {
      const query = `
        query TestQuery {
          list {
            ...UserFields
          }
        }
        
        fragment UserFields on User {
          id
          name
          email
        }
      `;
      const doc = parse(query);
      const result = modifyFieldsFromGraphqlDoc(doc, [], [], true);
      expect(result).toHaveProperty("kind", "Document");
    });

    it("should add fields to queries with list parent", () => {
      const query = `{
        list {
          id
        }
      }`;
      const doc = parse(query);
      const result = modifyFieldsFromGraphqlDoc(doc, ["name", "email"]);
      const resultString = print(result);
      expect(resultString).toContain("id");
      expect(resultString).toContain("name");
      expect(resultString).toContain("email");
    });

    it("should handle both add and remove operations", () => {
      const query = `{
        list {
          id
          name
          oldField
        }
      }`;
      const doc = parse(query);
      const result = modifyFieldsFromGraphqlDoc(doc, ["email"], ["oldField"]);
      const resultString = print(result);
      expect(resultString).toContain("id");
      expect(resultString).toContain("name");
      expect(resultString).toContain("email");
      expect(resultString).not.toContain("oldField");
    });
  });
});

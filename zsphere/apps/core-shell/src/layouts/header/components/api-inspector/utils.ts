import { ApiInspectorMethod } from "@zstack/zsphere-types";
import type { ApiInspectorDetail } from "@zstack/zsphere-types/graphql";
import dayjs from "dayjs";

// 替代 lodash-es keys 的原生方法 (bundle-barrel-imports)
const getKeys = (obj: object): string[] => {
  return Object.keys(obj);
};

// 替代 lodash-es isArray 的原生方法
const isArray = (value: unknown): value is unknown[] => {
  return Array.isArray(value);
};

// 替代 lodash-es isObject 的原生方法
const isObject = (value: unknown): value is object => {
  return value !== null && typeof value === "object" && !Array.isArray(value);
};

export type StatusType = "Pending" | "WaitingWebHook" | "Done";

export interface ApiInspectorDetailExtend extends Partial<ApiInspectorDetail> {
  webHookResponse?: string;
  responseTime?: number;
  children?: ApiInspectorDetailExtend[];
  status?: StatusType;
  height?: number;
}

export interface MnLogInfo {
  ip: string;
  log: string;
  ownsVip: boolean;
}

export const colorMap = {
  [ApiInspectorMethod.GQL]: "orange",
  [ApiInspectorMethod.ZQL]: "green",
  [ApiInspectorMethod.GET]: "geekblue",
  [ApiInspectorMethod.POST]: "blue",
  [ApiInspectorMethod.PUT]: "cyan",
  [ApiInspectorMethod.DELETE]: "red",
};

export const formatReqPath = (reqPath: string = "") => {
  if (reqPath && !reqPath.includes("http")) {
    return `${window.location.origin}/graphql${reqPath}`;
  }
  return reqPath?.replace(
    /^(https*:\/\/)([^:/]+)(:*\d*)\//,
    `$1${window.location.hostname}$3/`,
  );
};

export const formatRequestMethod = (
  method: ApiInspectorMethod = ApiInspectorMethod.GET,
) => {
  if (method === ApiInspectorMethod.ZQL) {
    return "GET";
  }
  if (method === ApiInspectorMethod.GQL) {
    return "POST";
  }
  return method;
};

export const formatCurl = (reqPath: string = "", isZql: boolean = false) => {
  if (isZql) {
    return reqPath
      ?.replace(/'/g, "\\'")
      ?.replace(/\(/g, "\\(")
      ?.replace(/\)/g, "\\)")
      ?.replace(/%3D/g, "=");
  }
  return reqPath;
};

export const getGqlPayloadVariables = (body: string = ""): string => {
  try {
    const payload = JSON.parse(body);
    return JSON.stringify({
      variables: payload?.variables ?? {},
    });
  } catch {
    return "";
  }
};

// 检查对象中是否包含 uuid 字段（递归检查嵌套对象）
const hasUuidInBody = (obj: any): boolean => {
  if (!obj || typeof obj !== "object") {
    return false;
  }
  if (Array.isArray(obj)) {
    return obj.some((item) => hasUuidInBody(item));
  }
  if ("uuid" in obj) {
    return true;
  }
  return Object.values(obj).some((value) => hasUuidInBody(value));
};

export const formatCliByReqPath = (
  cliName: string,
  method: ApiInspectorMethod = ApiInspectorMethod.GET,
  reqPath: string = "",
  reqBody?: { [key: string]: any },
) => {
  let result = cliName;

  // 检查 body 中是否已经包含 uuid，如果包含则不从路径中提取
  const bodyHasUuid = reqBody ? hasUuidInBody(reqBody) : false;

  // 从路径中提取 UUID（32位十六进制字符，可能包含连字符）
  // 例如：/vm-instances/797a141f78254cb7b32340f518b45b8b/emulator-pinning
  // 只有当 body 中没有 uuid 时才从路径提取
  if (!bodyHasUuid) {
    const pathWithoutQuery = reqPath.split("?")[0];
    // UUID 正则：匹配 32 位十六进制字符（可能带连字符，也可能不带）
    // 格式：xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx 或 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    const uuidRegex =
      /([0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}|[0-9a-f]{32})/i;
    const uuidMatch = pathWithoutQuery.match(uuidRegex);
    if (uuidMatch && uuidMatch[1]) {
      // 提取 UUID 并去掉连字符（统一格式）
      const uuid = uuidMatch[1].replace(/-/g, "");
      result += ` uuid=${uuid}`;
    }
  }

  // format query string
  const args = reqPath.split("?")?.[1]?.split("&");
  args?.forEach((item) => {
    const [__, key, value] = /^(.*?)=(.*)$/.exec(item) ?? [];
    if (key === "sort") {
      result += ` sortDirection=${value[0] === "+" ? "asc" : "desc"} sortBy=${value.slice(1)}`;
    } else if (key === "q") {
      result += ` ${value}`;
    } else {
      result += ` ${key}=${value}`;
    }
  });

  // format query body - 支持 param 和 params 两种键名
  const paramsData = reqBody?.params || reqBody?.param;
  if (paramsData) {
    getKeys(paramsData).forEach((key: string) => {
      const value = paramsData?.[key];
      // 跳过 params 内部的 systemTags，因为会在外层统一处理
      if (key === "systemTags") {
        return;
      }
      result += ` ${key}=${isArray(value) ? value.join(",") : value}`;
    });
  }
  if (reqBody?.systemTags?.length) {
    result += ` systemTags=${reqBody?.systemTags.join(",")}`;
  }

  // format put/post method body
  if (method === ApiInspectorMethod.PUT || method === ApiInspectorMethod.POST) {
    if (!reqBody) {
      return result;
    }
    getKeys(reqBody)
      .filter((it) => ["systemTags", "params", "param"].indexOf(it) === -1)
      .forEach((it) => {
        const value = reqBody?.[it];
        if (isObject(value) && !isArray(value)) {
          getKeys(value).forEach((prop) => {
            const _value = (value as { [key: string]: any })[prop];
            result += ` ${prop}=${isArray(_value) ? _value.join(",") : _value}`;
          });
        } else {
          result += ` ${it}=${isArray(value) ? value.join(",") : value}`;
        }
      });
  }

  return result;
};

export const combineAndSortMnLogs = (logs: MnLogInfo[]) => {
  const timeStampRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}/;
  const lines: { time: number; content: string }[] = [];
  logs?.forEach((log: MnLogInfo) => {
    if (timeStampRegex.test(log?.log)) {
      log?.log?.split("\n").forEach((line: string) => {
        if (timeStampRegex.test(line)) {
          const time = dayjs(line.match(timeStampRegex)?.[0] ?? "").valueOf();
          lines.push({
            content: line,
            time,
          });
        }
      });
    }
  });
  return lines
    .sort((a, b) => a.time - b.time)
    .map((it) => it.content)
    .join("\n");
};

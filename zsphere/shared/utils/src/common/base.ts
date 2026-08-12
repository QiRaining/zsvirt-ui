import { removeFragmentSpreadFromDocument } from "@apollo/client/utilities";
import { PrimaryStorageType } from "@zstack/zsphere-types";
import { PrimaryStorage } from "@zstack/zsphere-types/graphql";
import GBK from "gbk.js";
import {
  DocumentNode,
  FieldNode,
  FragmentDefinitionNode,
  visit,
} from "graphql";
import { unionBy, find, merge, uniq } from "lodash-es";
import { v4 as uuidv4 } from "uuid";

/**
 * 延时
 * @param milliseconds 毫秒数
 */
const delay = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const getApi = (
  api: string,
  agrs: {
    [key: string]: any;
  } = {},
  output: string = "inventories.uuid",
) => {
  let argStr = "";
  Object.entries(agrs).forEach(([key, value]) => {
    argStr += `, ${key}='${value}'`;
  });

  return `getapi(api='${api}', output='${output}'${argStr})`;
};

/**
 * 生成 uuid (无连字符格式)
 * @returns 32位字符的 UUID 字符串
 * @example
 * genUuid() // "550e8400e29b41d4a716446655440000"
 */
const genUuid = (): string => {
  return uuidv4().replace(/-/g, "");
};

/**
 * 获取以 y 为底，x 的对数
 * @param x
 * @param y
 */
const getBaseLog = (x: number, y: number): number => {
  return Math.log(x) / Math.log(y);
};

/**
 *  修改 graphql
 * @param gql
 * @param addFieldNameList 添加到 parentFieldName 下的Field (remove 之后才会执行添加)
 * @param removeFieldNameList 从 parentFieldName 下删除的Field
 * @param isRemoveAll 删除所有的 parentFieldName 下Fields
 * @param parentFieldName
 * @returns
 */
const modifyFieldsFromGraphqlDoc = (
  gql: DocumentNode,
  addFieldNameList?: string[],
  removeFieldNameList?: string[],
  isRemoveAll?: boolean,
  // 默认从list 获取 Fields
  parentFieldName = "list",
) => {
  const fragmentSpreadsInUse: Record<
    string,
    {
      name: string;
      deleteFieldCount: number;
      allDelete: boolean;
    }
  > = Object.create(null);

  let modifiedDoc = visit(gql, {
    Field: {
      enter(node, _key, parent, path, ancestors) {
        const currentFieldName = node?.name?.value;

        const currentParent =
          ancestors?.length - 2 >= 0
            ? ancestors?.[ancestors?.length - 2]
            : null;

        const isParentChildFields =
          (currentParent as FieldNode)?.name?.value === parentFieldName;
        if (
          isParentChildFields &&
          (removeFieldNameList?.includes(currentFieldName) || isRemoveAll)
        ) {
          // 删除 graphql field

          return null;
        }

        const fragmentName = (currentParent as FragmentDefinitionNode)?.name
          ?.value;
        // fragment
        if (
          fragmentName &&
          fragmentSpreadsInUse[fragmentName] &&
          (removeFieldNameList?.includes(currentFieldName) || isRemoveAll)
        ) {
          // 删除 graphql field
          fragmentSpreadsInUse[fragmentName].deleteFieldCount += 1;
          fragmentSpreadsInUse[fragmentName].allDelete =
            (currentParent as FragmentDefinitionNode)?.selectionSet?.selections
              ?.length === fragmentSpreadsInUse[fragmentName].deleteFieldCount;

          return null;
        }
      },
    },

    FragmentSpread: {
      enter(node) {
        fragmentSpreadsInUse[node.name.value] = {
          name: node.name.value,
          deleteFieldCount: 0,
          allDelete: false,
        };
      },
    },
  });

  const fragmentSpreadsToRemove = Object.keys(fragmentSpreadsInUse)
    .map((key) => {
      if (fragmentSpreadsInUse[key].allDelete) {
        return { name: fragmentSpreadsInUse[key].name };
      }

      return null;
    })
    .filter(Boolean) as { name: string }[];

  // 删除不使用的 Fragment
  if (fragmentSpreadsToRemove.length) {
    const result = removeFragmentSpreadFromDocument(
      fragmentSpreadsToRemove,
      modifiedDoc,
    );
    if (result) {
      modifiedDoc = result;
    }
  }

  if (addFieldNameList?.length) {
    modifiedDoc = visit(modifiedDoc, {
      Field: {
        enter(node) {
          const currentFieldName = node?.name?.value;
          const isParentFields = currentFieldName === parentFieldName;

          if (isParentFields && node?.selectionSet?.selections) {
            const addFields = addFieldNameList?.map(
              (fieldName) => gqlFieldNameToField(fieldName) ?? [],
            );

            node.selectionSet.selections = [
              ...node.selectionSet.selections,
              ...addFields,
            ];
          }
          return node;
        },
      },
    });
  }

  return modifiedDoc;
};

const gqlFieldNameToField = (fieldName: string) => {
  return {
    kind: "Field",
    name: {
      kind: "Name",
      value: fieldName,
    },
  } as FieldNode;
};

/**
 * 动态修改gql
 * 这个方法只能修改 gql 带有 list 的: gql ast 第一层是 list field
 * 所以操作的gql 都是 list 的 field
 * @param  {DocumentNode} document
 * @param  {string[]} keys
 * @returns DocumentNode
 * graphql.org/graphql-js/language/#visit
 */
function getGQL(
  document: DocumentNode,
  options:
    | string[]
    | {
        //需要添加的Field
        addKeys?: string[];
        //需要删除的Field
        removeKeys?: string[];
        //删除所有的Field 然后设置Field
        resetKeys?: string[];
      },
): DocumentNode {
  let newGql = document;
  if (Array.isArray(options)) {
    newGql = visit(newGql, {
      Field: {
        leave(node) {
          const {
            name: { value },
          } = node;
          // filed中只检验第一层级, 跳过含有arguments的Filed node
          if (
            !node?.arguments?.length &&
            ["total", "list", ...options].indexOf(value) < 0
          )
            return null;
          return false;
        },
      },
    });
  } else if (options !== null) {
    const { addKeys, removeKeys, resetKeys } = options;
    if (resetKeys?.length) {
      if (addKeys?.length || removeKeys?.length) {
        console.error("设置了resetKeys 会覆盖 addKeys 和 removeKeys");
      }
      newGql = modifyFieldsFromGraphqlDoc(newGql, resetKeys, [], true);
    } else {
      newGql = modifyFieldsFromGraphqlDoc(newGql, addKeys, removeKeys);
    }
  }

  return newGql;
}

/**
 * @param name 文件名
 * @param contents 文件内容
 * @param type
 */
/* istanbul ignore next*/
const downloadFile = (
  name: string,
  contents: string,
  type = "text/plain;charset=utf-8;",
) => {
  const getFileFormat = (filename: string) => {
    return filename?.substring(filename?.lastIndexOf("."), filename?.length);
  };
  const fileFormat = getFileFormat(name);
  let blob: Blob;
  switch (fileFormat) {
    case ".csv":
      blob = new window.Blob([new Uint8Array(GBK?.encode(contents))], { type });
      break;

    default:
      blob = new window.Blob([contents], { type });
      break;
  }
  const dlink = document.createElement("a");
  dlink.setAttribute("type", "hidden");
  dlink.download = name;
  dlink.href = window.URL.createObjectURL(blob);
  document.body.appendChild(dlink);
  dlink.onclick = function (e) {
    setTimeout(() => {
      window.URL.revokeObjectURL((this as any).href);
    }, 1500);
    e.stopPropagation();
  };
  dlink.click();
  dlink.remove();
};

/**
 * 下载链接文件
 * @param name 文件名
 * @param href url
 */
const downloadUrl = (name: string, href: string) => {
  const dlink = document.createElement("a");
  dlink.setAttribute("type", "hidden");
  dlink.download = name;
  dlink.href = href;
  document.body.appendChild(dlink);
  dlink.click();
  dlink.remove();
};

// 获取url参数
const getUrlParam = (name: string) => {
  const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`);
  const r = window.location?.search?.substr(1)?.match(reg) ?? "";
  if (r != null) {
    return decodeURIComponent(r[2]);
  }
  return null;
};

const isValidJsonString = (str: string) => {
  try {
    JSON.parse(str);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 *
 * @param baseUrl : http://localhost
 * @param paths : url path , /path1/path2
 * @param querys : {key:value , key1:value1} => ?key=value&key1=value1
 * @param openBrowser : 是否打开url ， window.open
 * @param timeout ： 是否timeout 打开url ， setTimeout
 */
const objToUrl = (options: {
  baseUrl: string;
  paths?: string[];
  querys?: { [key: string]: string };
  openBrowser?: boolean;
  timeout?: number;
}) => {
  const { baseUrl, paths, querys, openBrowser, timeout } = options;
  let url = baseUrl;

  if (paths?.length && paths?.length > 0) {
    url = [url, ...paths].join("/");
  }

  if (querys) {
    url += "?";
    url += Object.keys(querys)
      .map((key) => {
        const value = querys[key];
        return `${key}=${value ?? ""}`;
      })
      .join("&");
  }

  if (openBrowser) {
    if (timeout) {
      setTimeout(() => {
        window.open(url);
      }, timeout);
    } else {
      window.open(url);
    }
  }

  return url;
};

/**
 * 只比较正的浮点数
 * @param max
 * @param value
 * @returns  max === value : undefined  , max > value : true , max < value : false
 */
function compareBigFloat(max: string, value: string) {
  const prefixZeroReg = /^(0(?!\.))+/;

  /**
   *
   * @param int1
   * @param int2
   * @returns  int1 === int2 : undefined  , int1 > int2 : true , int1 < int2 : false
   */
  const compareIntString = (int1: string, int2: string) => {
    //int1 < int2
    if (!int1 && int2) return false;
    //int1 > int2
    if (int1 && !int2) return true;
    //int1 === int2
    if (!int1 && !int2) return undefined;
    const _int1 = int1.replace(prefixZeroReg, "");
    const _int2 = int2.replace(prefixZeroReg, "");
    if (_int1.length === _int2.length) {
      for (let i = 0; i < _int1.length; i++) {
        if (_int1[i] === _int2[i]) {
          continue;
        }
        return _int1[i] > _int2[i];
      }

      return undefined;
    }

    return _int1.length > _int2.length;
  };
  if (isNaN(Number(max)) || isNaN(Number(value))) return false;
  const reg = /(\d+)(?:\.?(\d+))?/;

  const match1 = max.match(reg);
  const match2 = value.match(reg);

  const intCompare = compareIntString(match1?.[1]!, match2?.[1]!);

  // 整数相等
  if (intCompare === undefined) {
    let digit1 = match1?.[2]!;
    let digit2 = match2?.[2]!;
    if (digit1 && digit2) {
      //小数补0
      const zeroSuffix = digit1.length - digit2.length;
      if (zeroSuffix > 0) {
        //digit1 更长
        digit2 += new Array(zeroSuffix).join("0");
      } else if (zeroSuffix < 0) {
        digit1 += new Array(Math.abs(zeroSuffix)).join("0");
      }
    }
    const digitCompare = compareIntString(match1?.[2]!, match2?.[2]!);

    return digitCompare;
  }
  return intCompare;
}

/**
 * 合并两个对象数组，数组去重，并合并对象
 * @param arr1
 * @param arr2
 * @param mergeKey，默认是'key'
 * @returns 新的数组
 */
interface IObject {
  [key: string]: any;
}

function mergeObjectArrays<T extends IObject[] = IObject[]>(
  arr1: T,
  arr2: T,
  mergeKey: string = "key",
): T {
  let newArr = unionBy(arr1, arr2, mergeKey) as T;
  newArr = newArr.map((item) => {
    const item1 = find(arr1, [mergeKey, item[mergeKey]]);
    const item2 = find(arr2, [mergeKey, item[mergeKey]]);
    return merge({}, item1, item2);
  }) as T;

  return newArr;
}

function arrayToObject(array: any[], key: string) {
  const obj: { [prop: string]: any } = {};
  array.forEach((item) => {
    obj[item[key]] = item;
  });
  return obj;
}

function mergeCandidates<T extends any[] = any[]>(
  source: T,
  target: T,
  mergeKey: string = "key",
) {
  const sourceObj = arrayToObject(source, mergeKey);
  const targetObj = arrayToObject(target, mergeKey);

  const keys = uniq(
    source.map((it) => it[mergeKey]).concat(target.map((it) => it[mergeKey])),
  );
  const candidatesMap = new Map<string, IObject>();
  keys.forEach((key) => {
    const sourceValue = sourceObj?.[key] ?? {};
    const targetValue = targetObj?.[key] ?? {};
    candidatesMap.set(key, { ...sourceValue, ...targetValue });
  });
  const result = Array.from(candidatesMap.values());
  return result;
}

function arrayMoveMutable(array: any[], fromIndex: number, toIndex: number) {
  const startIndex = fromIndex < 0 ? array.length + fromIndex : fromIndex;
  if (startIndex >= 0 && startIndex < array.length) {
    const endIndex = toIndex < 0 ? array.length + toIndex : toIndex;
    const [item] = array.splice(fromIndex, 1);
    array.splice(endIndex, 0, item);
  }
}

/**
 * @param array - The array with the item to move.
 * @param from Index - The index of item to move. If negative, it will begin that many elements from the end.
 * @param toIndex - The index of where to move the item. If negative, it will begin that many elements from the end.
 * @returns A new array with the item moved to the new position.
 */
function arrayMoveImmutable(array: any[], fromIndex: number, toIndex: number) {
  const newArray = [...array];
  arrayMoveMutable(newArray, fromIndex, toIndex);
  return newArray;
}

const isVhostStorage = (
  ps?: Pick<PrimaryStorage, "type" | "defaultProtocol">,
) => {
  if (ps?.type === PrimaryStorageType.Addon) {
    if (["iSCSI", "Vhost"].includes(ps?.defaultProtocol!)) {
      return true;
    }
  }
  return false;
};

const isZbsStorage = (
  ps?: Pick<PrimaryStorage, "type" | "defaultProtocol">,
) => {
  if (ps?.type === PrimaryStorageType.Addon) {
    if (["CBD"].includes(ps?.defaultProtocol!)) {
      return true;
    }
  }
  return false;
};

export {
  delay,
  genUuid,
  getBaseLog,
  getGQL,
  downloadUrl,
  downloadFile,
  getUrlParam,
  getApi,
  isValidJsonString,
  objToUrl,
  compareBigFloat,
  modifyFieldsFromGraphqlDoc,
  mergeObjectArrays,
  mergeCandidates,
  arrayMoveMutable,
  arrayMoveImmutable,
  isVhostStorage,
  isZbsStorage,
};

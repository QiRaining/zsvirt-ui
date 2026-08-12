import { gql, useMutation, useQuery } from "@apollo/client";
import { checkIpAvailability } from "@zstack/virtualization-resource/src/gql/l3-network.gql";
import type { Condition } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  CheckIpAvailabilityParam as ICheckIpAvailabilityParam,
  CheckIpAvailabilityResult as ICheckIpAvailabilityResult,
  L3Network,
  VmCpuPinning,
  VmNic,
} from "@zstack/zsphere-types/graphql";
import { isIP, isIPV6IP } from "@zstack/zsphere-utils";
import * as _ from "lodash-es";
import { replace as _replace } from "lodash-es";
import { sortBy, remove } from "lodash-es";
import { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";

import {
  cpuStrToArr,
  getSelectValueFromCheckedKeys,
} from "./components/pcpu-select";

export function reject(msg: string = "") {
  return Promise.reject(msg && new Error(msg));
}

export const useValidatorIp = () => {
  const intl = useIntl();
  const [remoteValidateIp] = useMutation<
    { checkIpAvailability: ICheckIpAvailabilityResult },
    {
      input: ICheckIpAvailabilityParam;
    }
  >(checkIpAvailability);
  async function validatorIp({
    network: { uuid: l3NetworkUuid, ipRanges },
    arpCheck,
    ipRangeCheck,
    ip,
  }: {
    network: Pick<L3Network, "uuid" | "ipRanges" | "ipVersion">;
    arpCheck?: boolean;
    ipRangeCheck?: boolean;
    ip?: string;
  }) {
    if (!ip) {
      return;
    }
    const isIpv4 = ip.includes(".");

    if (!isIP(ip, isIpv4 ? 4 : 6)) {
      return reject(
        intl.formatMessage({
          id: "vpc.field.requiredIp.validator.format.case.invalidIp",
          defaultMessage: "Invalid IP address.",
        }),
      );
    }

    if (
      ipRanges
        ?.filter(({ ipVersion }) => ipVersion === (isIpv4 ? 4 : 6))
        ?.every(({ startIp, endIp }) => !isIpInRange({ ip, startIp, endIp }))
    ) {
      throw intl.formatMessage({
        id: "vpc.field.requiredIp.validator.ipRange.case.notInIpRange",
        defaultMessage: "Enter an IP address that is in the specified IP range.",
      });
    }

    try {
      const res = await remoteValidateIp({
        variables: { input: { l3NetworkUuid, ip, arpCheck, ipRangeCheck } },
      });

      return res?.data?.checkIpAvailability?.available
        ? Promise.resolve()
        : reject(
            intl.formatMessage({
              id: "vpc.field.requiredIp.validator.used.case.used",
              defaultMessage: "The IP address is already in use.",
            }),
          );
    } catch {
      return reject(
        intl.formatMessage({
          id: "vpc.field.requiredIp.validator.format.case.invalidIp",
          defaultMessage: "Invalid IP address.",
        }),
      );
    }
  }
  return validatorIp;
};

export const vmConsoleModeMap = (
  type: "vnc" | "spice" | "vncAndSpice" | string,
  consoleAddress: string[] = [],
) => {
  if (!type && consoleAddress.length) {
    return consoleAddress.length > 1
      ? "vnc + spice"
      : consoleAddress[0].split("://")[0];
  }
  switch (type) {
    case "vncAndSpice":
      return "vnc + spice";
    default:
      return type;
  }
};

export function formatConditions(data: object): Array<Condition> {
  return Object.entries(data).reduce<Array<Condition>>(
    (params, [key, value]) => {
      if (value === undefined || value === null) {
        return params;
      }

      if (Array.isArray(value) && value.length === 0) {
        return params;
      }

      const newValue = Array.isArray(value)
        ? value.reduce((prev, v) => {
            if (v === undefined || v === null) {
              return prev;
            }

            return [...prev, `${v}`];
          }, [])
        : `${value}`;

      return [
        ...params,
        {
          key,
          op: Array.isArray(value) ? Op.in : Op.eq,
          [Array.isArray(value) ? "values" : "value"]: newValue,
        },
      ];
    },
    [],
  );
}

export function isIPV6(v: string = ""): boolean {
  if (!isValidStr(v)) {
    return false;
  }

  return isIPV6IP(v);
}

const isValidStr = (v: string = ""): boolean => !!(v && typeof v === "string");

export function isIPV4(v: string = ""): boolean {
  if (!isValidStr(v)) {
    return false;
  }

  const reg =
    /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/;

  if (!reg.test(v)) {
    return false;
  }

  const parts = v.split(".").sort((a, b) => +a - +b);

  return +parts[3] <= 255;
}

export function isIpInRange({
  startIp,
  endIp,
  ip = "",
}: {
  startIp?: string;
  endIp?: string;
  ip?: string;
}): boolean {
  if (!isValidStr(ip) || !isValidStr(startIp) || !isValidStr(endIp)) {
    return false;
  }

  if (isIPV4(ip)) {
    // for ip v4
    const ipToNumber = (str: string) =>
      str
        .split(".")
        .reduce(
          (to, cur, idx) => to + Number.parseInt(cur, 10) * 256 ** (3 - idx),
          0,
        );

    const curIpNumber = ipToNumber(ip);

    return (
      curIpNumber <= ipToNumber(endIp!) && curIpNumber >= ipToNumber(startIp!)
    );
  }
  if (isIPV6(ip)) {
    const startNum = parseInt(startIp?.replace(/:/g, "") ?? "0", 16);
    const endNum = parseInt(endIp?.replace(/:/g, "") ?? "0", 16);
    const ipNum = parseInt(ip.replace(/:/g, ""), 16);
    return ipNum >= startNum && ipNum <= endNum;
  }
  return true;
}

export const getSystemTagsFromNoIPAMInput = (
  l3NetworkUuid: string,
  formData: any = {},
) => {
  const systemTags: string[] = [];
  const keys = ["ipv4Netmask", "ipv4Gateway", "ipv6Prefix", "ipv6Gateway"];
  keys.forEach((key) => {
    const value = formData[key];
    if (value) {
      systemTags.push(
        `${key}::${l3NetworkUuid}::${_replace(value, "::", "--")}`,
      );
    }
  });
  // 去掉systemTags相关的字段
  keys.forEach((key) => Reflect.deleteProperty(formData, key));
  return systemTags.length ? systemTags : undefined;
};

export interface IRandomWordParams {
  randomFlag: boolean;
  min: number;
  max: number;
  isWindow: boolean;
}

export function randomWord({
  randomFlag,
  min,
  max,
  isWindow,
}: IRandomWordParams) {
  const length = randomFlag
    ? Math.round(Math.random() * (max - min)) + min
    : Number(min);

  const passwordArray = [
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "abcdefghijklmnopqrstuvwxyz",
    "1234567890",
    isWindow ? "!@#" : "-.~!@#$%^&*()_:<>?",
  ];

  const password: string[] = [];

  let n = 0;

  for (let i = 0; i < length; i += 1) {
    if (password.length < length - 4) {
      const arrayRandom = Math.floor(Math.random() * 4);
      const passwordItem = passwordArray[arrayRandom];

      const item =
        passwordItem[Math.floor(Math.random() * passwordItem.length)];

      password.push(item);
    } else {
      const newItem = passwordArray[n];
      const lastItem = newItem[Math.floor(Math.random() * newItem.length)];
      const spliceIndex = Math.floor(Math.random() * password.length);

      password.splice(spliceIndex, 0, lastItem);

      n += 1;
    }
  }

  return password.join("");
}

export interface CpuBindListByVCpuItem {
  vCPU: string;
  pCPUList: string[];
}

const getCPUBindMap = (vmCpuPinningList: VmCpuPinning[] = []) => {
  const cpuBindMap: { [key: string]: string[] } = {};
  vmCpuPinningList.forEach((item) => {
    const { vCPU, pCPU } = item;
    const vCPUArr = cpuStrToArr(vCPU);
    const pCPUArr = cpuStrToArr(pCPU);
    vCPUArr.forEach((vcpuNum) => {
      if (!cpuBindMap[vcpuNum]) {
        cpuBindMap[vcpuNum] = [];
      }
      cpuBindMap[vcpuNum] = [...new Set([...cpuBindMap[vcpuNum], ...pCPUArr])];
    });
  });
  return cpuBindMap;
};

export const formatCpuBindListToStructure = (
  vcpuNum: number = 0,
  vmCpuPinningList: VmCpuPinning[] = [],
) => {
  const cpuBindMap = getCPUBindMap(vmCpuPinningList);
  const cpuBindListByVCpu = Array.from({ length: vcpuNum }).map(
    (_item, index) => {
      return {
        vCPU: String(index),
        pCPUList: cpuBindMap[index.toString()] || [],
      };
    },
  );
  sortBy(cpuBindListByVCpu, (item) => item.vCPU);
  return cpuBindListByVCpu ?? [];
};

export const formatStructureCpuBindToSubmit = (
  cpuBindListByVCpu: CpuBindListByVCpuItem[] = [],
) => {
  const result =
    cpuBindListByVCpu.map((item: CpuBindListByVCpuItem) => {
      return {
        vCPU: item.vCPU,
        pCPU: getSelectValueFromCheckedKeys(item.pCPUList).join(",") ?? "",
      };
    }) ?? [];
  return result.filter((item) => item.vCPU !== "" && item.pCPU !== "");
};

export function useCommonPaswordValidator() {
  const intl = useIntl();

  const validator = (value: string, min?: number, max?: number) => {
    const { length } = value ?? "";
    if (
      typeof min === "number" &&
      typeof max === "number" &&
      (length < min || length > max)
    ) {
      return reject(
        intl.formatMessage(
          {
            id: "vm.field.password.validator.length",
            defaultMessage: "This field must be {min}–{max} characters in length.",
          },
          {
            min,
            max,
          },
        ),
      );
    }

    if (
      !/^[\da-zA-Z-`=[\];',.\\/~!@#\\$%\\^&*()_+\\|{}:"<>?]{0,}$/.test(value)
    ) {
      return reject(
        intl.formatMessage({
          id: "vm.field.password.validator.format.common",
          defaultMessage: "Invalid password.",
        }),
      );
    }

    return Promise.resolve();
  };

  return {
    validator,
  };
}

export function useGlobalConfigPaswordValidator({
  passwordGlobalConfig,
  isWindow,
}: {
  passwordGlobalConfig: IParseGlobalConfigPasswordReturn;
  isWindow: boolean;
}) {
  const intl = useIntl();

  const randomConfig: IRandomWordParams = useMemo(() => {
    if (!passwordGlobalConfig?.enabled) {
      return {
        randomFlag: true,
        min: 6,
        max: 8,
        isWindow,
      };
    }

    return {
      randomFlag: true,
      min: passwordGlobalConfig?.minimum,
      max: passwordGlobalConfig?.maximum,
      isWindow,
    };
  }, [passwordGlobalConfig, isWindow]);

  const validator = useCallback(
    (value: string) => {
      const {
        minimum,
        maximum,
        checkLowercase,
        checkNumber,
        checkSpecialWords,
        checkUppercase,
      } = passwordGlobalConfig ?? {};

      const { length } = value;

      if (length < minimum! || length > maximum!) {
        return reject(
          intl.formatMessage(
            {
              id: "global.field.validator.lengthRange",
              defaultMessage: "This field must be {min}–{max} characters in length.",
            },
            {
              min: minimum,
              max: maximum,
            },
          ),
        );
      }

      if (
        checkLowercase &&
        checkNumber &&
        checkSpecialWords &&
        checkUppercase &&
        !(isWindow
          ? /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/.test(
              value,
            )
          : /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[-`=[\];',./~!@#$%^&*()_+|{}:"<>?]).{6,}$/.test(
              value,
            ))
      ) {
        return reject(
          intl.formatMessage(
            {
              id: "vm.field.password.validator.format",
              defaultMessage: "Specify a combination of digits, letters, and special characters",
            },
            {
              min: minimum,
              max: maximum,
            },
          ),
        );
      }
    },
    [intl, isWindow, passwordGlobalConfig],
  );

  return {
    randomConfig,
    validator,
  };
}

export interface IParseGlobalConfigPasswordReturn {
  enabled: boolean;
  checkLowercase: boolean;
  checkUppercase: boolean;
  checkNumber: boolean;
  checkSpecialWords: boolean;
  minimum: number;
  maximum: number;
}

export const parseGlobalConfigPassword = (
  globalConfigPassword: string,
): IParseGlobalConfigPasswordReturn => {
  const [first, second] = (globalConfigPassword ?? "").split(",") as [
    string,
    string,
  ];
  const check = first.split("");
  const range = second.split("-");

  return {
    enabled: Boolean(parseInt(check[0], 10)),
    checkLowercase: Boolean(parseInt(check[1], 10)),
    checkUppercase: Boolean(parseInt(check[2], 10)),
    checkNumber: Boolean(parseInt(check[3], 10)),
    checkSpecialWords: Boolean(parseInt(check[4], 10)),
    minimum: parseInt(range[0], 10),
    maximum: parseInt(range[1], 10),
  };
};

const GLOBAL_CONFIG = gql`
  query globalConfig($category: String!, $name: String!) {
    globalConfig(category: $category, name: $name) {
      category
      defaultValue
      description
      name
      value
      uuid
      isValid
    }
  }
`;

export function useQueryGlobalConfigPasword() {
  const { data: consolePasswordData } = useQuery(GLOBAL_CONFIG, {
    variables: {
      category: "mevoco",
      name: "vm.console.password.strength.check.config",
    },
  });

  const { data: sshPasswordData } = useQuery(GLOBAL_CONFIG, {
    variables: {
      category: "mevoco",
      name: "vm.password.strength.check.config",
    },
  });

  const { consolePassword, sshPassword } = useMemo<{
    consolePassword?: IParseGlobalConfigPasswordReturn;
    sshPassword?: IParseGlobalConfigPasswordReturn;
  }>(() => {
    const consoleConfig = consolePasswordData?.globalConfig;
    const sshConfig = sshPasswordData?.globalConfig;

    return {
      consolePassword: consoleConfig?.value
        ? parseGlobalConfigPassword(consoleConfig.value)
        : undefined,
      sshPassword: sshConfig?.value
        ? parseGlobalConfigPassword(sshConfig.value)
        : undefined,
    };
  }, [consolePasswordData, sshPasswordData]);

  return {
    consolePassword,
    sshPassword,
  };
}

export const getDiskBusTypeDisplay = (
  intl: {
    formatMessage: (descriptor: {
      id: string;
      defaultMessage: string;
    }) => string;
  },
  disk: { systemTag?: { capability?: string } } | null | undefined,
  index: number,
  vm:
    | { systemTag?: { vmDriver?: string }; guestOsType?: string }
    | null
    | undefined,
): string => {
  const capability = disk?.systemTag?.capability;

  // 特殊值映射
  const busTypeMap: Record<string, string> = {
    scsi: intl.formatMessage({ id: "busType.scsi", defaultMessage: "SCSI" }),
    "virtio-scsi": intl.formatMessage({
      id: "busType.virtio-scsi",
      defaultMessage: "Virtio SCSI",
    }),
    virtio: intl.formatMessage({
      id: "busType.virtio",
      defaultMessage: "Virtio",
    }),
    ide: intl.formatMessage({ id: "busType.ide", defaultMessage: "IDE" }),
  };

  // 如果capability有值，尝试从映射表获取国际化文本
  if (capability) {
    // 如果映射表中有对应的值，返回映射值；否则返回capability原值
    return busTypeMap[capability] || capability;
  }

  // 确定capability无值时的默认逻辑
  if (index === 0) {
    if (vm?.systemTag?.vmDriver) {
      return intl.formatMessage({
        id: "busType.virtio",
        defaultMessage: "Virtio",
      });
    }
    return intl.formatMessage({ id: "busType.ide", defaultMessage: "IDE" });
  }

  return vm?.guestOsType === "Other"
    ? intl.formatMessage({ id: "busType.ide", defaultMessage: "IDE" })
    : intl.formatMessage({ id: "busType.virtio", defaultMessage: "Virtio" });
};

export function sortVmNics(vmNics: VmNic[], defaultL3NetworkUuid?: string) {
  const list = sortBy(vmNics, "deviceId");
  if (defaultL3NetworkUuid) {
    const defaultNics = remove(
      list,
      (nic) => nic.l3NetworkUuid === defaultL3NetworkUuid,
    );
    return defaultNics.concat(list);
  }
  return list;
}

import { Address6 } from "ip-address";
import {
  isArray,
  isNull,
  isPlainObject,
  isString,
  isUndefined,
  trim,
} from "lodash-es";

import { ipToInt } from "./format";

const isDNSDomainName = (str: string): boolean => {
  const reg = /(?:http(?:s)?:\/\/)?(?:www\.)?(.*?)\./;
  return reg.test(str);
};

const systemPath = [
  "/",
  "/root",
  "/dev",
  "/dev/",
  "/proc",
  "/proc/",
  "/sys",
  "/sys/",
  "/usr/bin",
  "/bin",
];

const isSystemPath = (str: string): boolean => {
  const normalized = str.endsWith("/") ? str.slice(0, -1) : str;
  return systemPath.some((sp) => {
    const base = sp.endsWith("/") ? sp.slice(0, -1) : sp;
    if (base === "") return normalized === "";
    return normalized === base || normalized.startsWith(base + "/");
  });
};

function isPath(str: string, name?: string) {
  let reg = /^(\/[.-\w]*)+$/;
  // change regexp if the resource is a nfs PS
  if (name && name === "nfs") {
    // (?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?):(\/[-\w]*)+\/?   匹配用户输入的url是否符合NAS服务ip地址格式，例如：192.168.1.0/24:/nfs
    // (?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+:(\/[-\w]*)+   匹配用户输入的url是否符合NAS服务域名地址格式，例如：www.bai.com://123
    reg =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?):(\/[-\w]*)+\/?|(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+:(\/[-\w]*)+$/;
  }
  if (!reg.test(str)) {
    return false;
  }

  if (isSystemPath(str)) {
    return false;
  }
  if (str.indexOf("/.") === 0 || str.endsWith(".")) {
    return false;
  }
  return true;
}

function isMAC(v: string = ""): boolean {
  const reg = /^([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2}$/;
  return reg.test(v);
}

function isPoolName(str: string) {
  const reg = /^[-#A-Za-z0-9_]+$/;
  return reg.test(str);
}

function isPhoneNumber(str: string) {
  const reg =
    /^((13[0-9])|(14[5-9])|(15([0-3]|[5-9]))|(16[6-7])|(17[1-8])|(18[0-9])|(19[1|3])|(19[5|6])|(19[8|9]))\d{8}$/;
  if (!reg.test(str)) {
    return false;
  }
  return true;
}

function isEmail(str: string) {
  const reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
  if (!reg.test(str)) return false;
  return true;
}

/**
 * 验证端口号是否有效 (0-65535)
 * @param port 端口号字符串
 * @returns 是否为有效端口号
 * @example
 * isPort("80") // true
 * isPort("443") // true
 * isPort("65535") // true
 * isPort("65536") // false
 * isPort("-1") // false
 */
function isPort(port: string) {
  const reg =
    /^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
  return reg.test(port);
}

const isIPV4IP = (str: string): boolean => {
  // let reg = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
  const reg =
    /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/;
  if (!reg.test(str)) {
    return false;
  }
  const parts = str.split(".").sort((a, b) => {
    return Number(a) - Number(b);
  });
  return Number(parts[3]) <= 255;
};

/**
 * 判断IpV6
 * @param {string}
 * @returns boolean
 */
const isIPV6IP = (str: string): boolean => {
  if (str.charAt(str.length - 1) === ":") return false;
  return /:/.test(str) && str.match(/:/g)!.length < 8 && /::/.test(str)
    ? str.match(/::/g)!.length === 1 &&
        /^::$|^(::)?([\da-f]{1,4}(:|::))*[\da-f]{1,4}(:|::)?$/i.test(str)
    : /^([\da-f]{1,4}:){7}[\da-f]{1,4}$/i.test(str);
};

/**
 * 验证 IP 地址是否有效
 * @param str IP 地址字符串
 * @param ipVersion IP 版本，4 或 6，默认为 4
 * @returns 是否为有效 IP 地址
 * @example
 * isIP("192.168.1.1") // true
 * isIP("256.1.1.1") // false
 * isIP("::1", 6) // true
 * isIP("2001:db8::1", 6) // true
 */
const isIP = (str: string, ipVersion: 4 | 6 = 4): boolean =>
  ipVersion === 4 ? isIPV4IP(str) : isIPV6IP(str);

function findAll(array: any[], value: any) {
  const list: any[] = [];
  array.forEach((item, index) => {
    if (item === value) list.push(index);
  });
  return list;
}

function initIPv6IP(ip: string) {
  const ipParts = ip.split(":");
  if (ipParts.length < 8) {
    const emptyIndex = findAll(ipParts, "");
    while (ipParts.length < 8) {
      emptyIndex.forEach((index) => {
        ipParts.splice(index, 0, "0000");
      });
    }
  }
  ipParts.forEach((item, index) => {
    if (item === "") ipParts[index] = "0000";
  });
  return ipParts;
}

function validateIPv6IPRange(startIP: string, endIP: string) {
  const startIPParts = initIPv6IP(startIP);
  const endIPParts = initIPv6IP(endIP);
  let isValid = true;
  for (let i = 0; i < endIPParts.length; i += 1) {
    if (parseInt(endIPParts[i], 16) > parseInt(startIPParts[i], 16)) break;
    if (parseInt(startIPParts[i], 16) > parseInt(endIPParts[i], 16)) {
      isValid = false;
      break;
    }
  }
  return isValid;
}

function validatorIPv4Range(startIp: string, endIp: string) {
  if (!isIPV4IP(startIp) || !isIPV4IP(endIp)) {
    return false;
  }
  if (ipToInt(startIp) > ipToInt(endIp)) {
    return false;
  }
  return true;
}

const isValidatorIpRange = (
  startIp: string,
  endIp: string,
  ipVersion: 4 | 6 = 4,
) =>
  ipVersion === 4
    ? validatorIPv4Range(startIp, endIp)
    : validateIPv6IPRange(startIp, endIp);

/**
 * 验证子网掩码是否有效
 * @param ip 子网掩码字符串
 * @returns 是否为有效子网掩码
 * @example
 * isValidNetMask("255.255.255.0") // true
 * isValidNetMask("255.255.0.0") // true
 * isValidNetMask("255.255.255.1") // false
 * isValidNetMask("192.168.1.1") // false
 */
function isValidNetMask(ip: string) {
  const validNetMaskList = [
    "255.255.255.255",
    "255.255.255.254",
    "255.255.255.252",
    "255.255.255.248",
    "255.255.255.240",
    "255.255.255.224",
    "255.255.255.192",
    "255.255.255.128",
    "255.255.255.0",
    "255.255.254.0",
    "255.255.252.0",
    "255.255.248.0",
    "255.255.240.0",
    "255.255.224.0",
    "255.255.192.0",
    "255.255.128.0",
    "255.255.0.0",
    "255.254.0.0",
    "255.252.0.0",
    "255.248.0.0",
    "255.240.0.0",
    "255.224.0.0",
    "255.192.0.0",
    "255.128.0.0",
    "255.0.0.0",
    "254.0.0.0",
    "252.0.0.0",
    "248.0.0.0",
    "240.0.0.0",
    "224.0.0.0",
    "192.0.0.0",
    "128.0.0.0",
    "0.0.0.0",
  ];
  return validNetMaskList.includes(ip);
}

function isPortExclude0(port: string) {
  const reg =
    /^([1-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
  return reg.test(port);
}

function isPortRange(portRange: string, connector: string = "-") {
  const port = portRange.split(connector);
  return (
    port.length === 2 &&
    isPortExclude0(port[0]) &&
    isPortExclude0(port[1]) &&
    Number(port[1]) >= Number(port[0])
  );
}

function IpToLong(strIP: string) {
  const ip = strIP.split(".") as any[];
  const value =
    Number(ip[0] << 24) +
    Number(ip[1] << 16) +
    Number(ip[2] << 8) +
    Number(ip[3]);
  return value;
}

function isLegalIPRange(ipRange: string) {
  const _ip = ipRange.split("-");
  const ipRangeValidate = (ip: string[]) => {
    return ip.length === 2;
  };
  const isIPValidate = (ip: string[]) => {
    return isIP(ip[0]) && isIP(ip[1]);
  };
  const ipLegalRangeValidate = (ip: string[]) => {
    return IpToLong(ip[0]) < IpToLong(ip[1]);
  };
  const result =
    ipRangeValidate(_ip) && isIPValidate(_ip) && ipLegalRangeValidate(_ip);
  return result;
}

function isUint(str: number | string, unit?: any) {
  if (Number.isNaN(Number(str))) {
    return false;
  }
  const reg = /^\+?[1-9][0-9]*$/;
  if (!reg.test(String(str))) {
    return false;
  }
  return isOverInt(unit ? str + unit : str);
}

/**
 * 规格大小是否有效, 最大1PB
 * @param str 规格大小
 * @returns boolean
 */
function isOfferingSize(sizeStr: string): boolean {
  const K = 1024;
  const M = K * K;
  const G = M * K;
  const T = G * K;
  const P = T * K;
  const quantity = sizeStr.substr(sizeStr.length - 1, 1);

  const size = parseFloat(sizeStr);

  if (quantity === "K" || quantity === "k") {
    return size * K <= 1125899906842624;
  }

  if (quantity === "M" || quantity === "m") {
    return size * M <= 1125899906842624;
  }

  if (quantity === "G" || quantity === "g") {
    return size * G <= 1125899906842624;
  }

  if (quantity === "T" || quantity === "t") {
    return size * T <= 1125899906842624;
  }

  if (quantity === "P" || quantity === "p") {
    return size * P <= 1125899906842624;
  }

  return parseInt(sizeStr, 10) <= 1125899906842624;
}

/**
 * 带宽数值是否超过最大值
 * @param {string} 要校验的value
 * @returns boolean
 */
const isOverInt = (sizeStr: string): boolean => {
  const K = 1024;
  const M = K * K;
  const G = M * K;
  const T = G * K;
  const P = T * K;
  const quantity = String(sizeStr).substr(sizeStr.length - 1, 1);
  const size = parseFloat(sizeStr);
  if (quantity === "K" || quantity === "k") {
    return size * K < 9007199254740992;
  }
  if (quantity === "M" || quantity === "m") {
    return size * M < 9007199254740992;
  }
  if (quantity === "G" || quantity === "g") {
    return size * G < 9007199254740992;
  }
  if (quantity === "T" || quantity === "t") {
    return size * T < 9007199254740992;
  }
  if (quantity === "P" || quantity === "p") {
    return size * P < 9007199254740992;
  }
  return Number.parseInt(sizeStr, 10) < 9007199254740992;
};

/**
 * 是否是CIDR
 * @param {string} str 输入的CIDR
 * @param {4 | 6} ipVersion IP 版本，默认为 4
 * @returns 是否为有效 CIDR
 * @example
 * isCidr("192.168.1.0/24") // true
 * isCidr("10.0.0.0/8") // true
 * isCidr("192.168.1.0/33") // false
 * isCidr("2001:db8::/32", 6) // true
 */
const isCidr = (str: string, ipVersion: 4 | 6 = 4): boolean => {
  const ipv6Reg =
    /^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*(\/(12[0-8]|1[0-1][0-9]|[1-9][0-9]|[0-9]))$/;
  const ipv4Reg =
    /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))$/;
  return ipVersion === 4 ? ipv4Reg.test(str) : ipv6Reg.test(str);
};

/**
 * 是否是URL
 * @param str 输入的URL
 * @param name image的url特殊处理
 * @returns boolean
 */
function isUrl(str: string, name?: string): boolean {
  let reg =
    /^((https|http|ftp)(:\/\/))|(file:\/\/\/)[^\s\u4e00-\u9fa5\u3000-\u303f]*$/;
  // change regexp if the resource is a image
  if (name && name === "image") {
    if (str.indexOf(" ") > -1) return false;
    reg =
      /^((https|http|ftp|sftp)(:\/\/))|(file:\/\/\/)[^\s\u3000-\u9fa5\u3000-\u303f]+\w*$/;
  }
  if (!reg.test(str)) {
    return false;
  }
  return true;
}

/**
 * 用户名或简介是否有效
 * @param str 输入的用户名或者简介
 * @param num 用户名或者简介的长度限制
 * @returns boolean
 */
function isValidString(str: string, num: number): boolean {
  const reg = new RegExp(`^([\u4e00-\u9fa5a-zA-Z0-9_-]|.){1,${num}}$`);
  return str.length <= num && reg.test(str);
}

/**
 * 输入值是否在区间内
 * @param {string} 要校验的value
 * @param {string} 最小值
 * @param {string} 最大值
 * @returns boolean
 */
const isIn = (
  value: string | number,
  min: string | number,
  max: string | number,
) => {
  const isValid = Number(value) <= Number(max) && Number(value) >= Number(min);
  return isValid;
};

/**
 * 是否有输入值
 * @param value 输入值
 */
const isInput = (value?: any) => {
  if (isArray(value)) {
    return value.length === 0;
  }
  if (isString(value)) {
    return value === "";
  }
  if (isPlainObject(value)) {
    return false;
  }
  if (isUndefined(value) || isNull(value)) {
    return true;
  }
  return false;
};

/**
 * 校验Ip是否在给定的Ip范围内
 * @param startIp 开始Ip
 * @param endIp 结束Ip
 * @param ip 要校验的Ip
 */
const isIpInRange = (startIp: string, endIp: string, ip: string) => {
  if (isInput(ip)) return false;

  // for ip v4
  const ipToNumber = (_ip: string) => {
    return _ip.split(".").reduce((to, cur, idx) => {
      // let power = Math.pow(256, (3 - idx))
      const power = 256 ** (3 - idx);
      return to + parseInt(cur, 10) * power;
    }, 0);
  };
  const curIpNumber = ipToNumber(ip);
  const startIpNumber = ipToNumber(startIp);
  const endIpNumber = ipToNumber(endIp);
  const isValid = curIpNumber <= endIpNumber && curIpNumber >= startIpNumber;

  return isValid;
};

/**
 * 校验Ip是否在给定的Ip范围内
 * @param startIp 开始Ip
 * @param endIp 结束Ip
 * @param ip 要校验的Ip
 */
const isIpv6InRange = (startIp: string, endIp: string, ip: string) => {
  if (!isIPV6IP(startIp) || !isIPV6IP(endIp) || !isIPV6IP(ip)) return false;
  const _startIp = new Address6(startIp);
  const _endIp = new Address6(endIp);
  const _ip = new Address6(ip);

  const curIpNumber = _ip.bigInt();
  const startIpNumber = _startIp.bigInt();
  const endIpNumber = _endIp.bigInt();
  const isValid = curIpNumber <= endIpNumber && curIpNumber >= startIpNumber;

  return isValid;
};

const validateNameRegexp =
  /^[a-zA-Z0-9\u4e00-\u9fa5。，！——、·\-_|/.!@#$%^&*]+$/;

/**
 * 校验是否是合法域名，如www.google.com
 * @param  {string} hostname
 */
const isHostname = (hostname: string) => {
  const regex = /^(?:(?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,6}$/;
  return regex.test(hostname);
};

const isValidStr = (v: string = ""): boolean => !!(v && typeof v === "string");

const isIPV4 = (v: string = ""): boolean => {
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
};

const reject = (msg: string = "") => Promise.reject(msg && new Error(msg));

const validCidr = async (_rule: any, value: string, intl: any) => {
  if (value && !isCidr(value))
    return Promise.reject(
      intl.formatMessage({
        id: "cluster.field.cidr.validator.format",
        defaultMessage: "Invalid CIDR.",
      }),
    );

  return Promise.resolve();
};

const useValidatorHostname = (intl: any) => {
  return function validatorHostname(hostname: string, platform: string) {
    const isWindows = ["Windows", "WindowsVirtio"].includes(platform);
    if (!hostname) {
      return Promise.resolve();
    }

    if (trim(hostname, "-") !== hostname) {
      // 开头和结尾不能使用连字符
      return reject(
        intl.formatMessage({
          id: "vm.field.hostName.validator.startEndFormat",
          defaultMessage: `A hostname cannot start and end with hyphens (-).`,
        }),
      );
    }

    if (hostname.replace("--", "") !== hostname) {
      // 不能使用连续的连字符‘-’
      return reject(
        `${intl.formatMessage({
          id: "duplicated",
          defaultMessage: "Duplicate",
        })}"-"`,
      );
    }

    // Windows: 长度为2-15个字符，允许使用大小写字母、数字或连字符"-"，不能以连字符"-"开头或结尾，不能连续使用连字符"-"，也不能仅使用数字。
    if (hostname && isWindows) {
      if (hostname.length < 2 || hostname.length > 15) {
        return reject(
          intl.formatMessage({
            id: "resource.field.windowHostName.validator.valueRange",
            defaultMessage: "The hostname must be 2 to 15 characters in length.",
          }),
        );
      }

      if (Number.isFinite(Number(hostname))) {
        return reject(
          intl.formatMessage({
            id: "resource.field.windowHostName.validator.allNumber",
            defaultMessage: "The hostname cannot be all numbers.",
          }),
        );
      }
    }

    // 长度为 2-60 个字符，允许使用大小写字母、数字、连字符 "-" ，不能连续使用 "-" ，"-" 不能用于开头或结尾
    if (
      (hostname && platform === "Linux" && hostname.length < 2) ||
      hostname.length > 60
    ) {
      return reject(
        intl.formatMessage({
          id: "resource.field.linuxHostName.validator.valueRange",
          defaultMessage: "The hostname must be 2 to 60 characters in length.",
        }),
      );
    }

    if (!/^[a-zA-Z0-9-]+$/.test(hostname)) {
      return reject(
        intl.formatMessage({
          id: "resource.field.hostName.validator.format",
          defaultMessage: "Invalid hostname.",
        }),
      );
    }

    return Promise.resolve();
  };
};

export {
  isCidr,
  isDNSDomainName,
  isEmail,
  isHostname,
  isIn,
  isInput,
  isIP,
  isIpInRange,
  isIPV4,
  isIpv6InRange,
  isIPV6IP,
  isLegalIPRange,
  isMAC,
  isOfferingSize,
  isPath,
  isPhoneNumber,
  isPoolName,
  isPort,
  isPortExclude0,
  isPortRange,
  isSystemPath,
  isUint,
  isUrl,
  isValidatorIpRange,
  isValidNetMask,
  isValidStr,
  isValidString,
  reject,
  validateNameRegexp,
  validCidr,
  useValidatorHostname,
};

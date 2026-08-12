import { Address6 } from "ip-address";
import * as _ from "lodash-es";

import { ipToInt } from "./format";

const isDNSDomainName = (str: string): boolean => {
  const reg = /(?:http(?:s)?:\/\/)?(?:www\.)?(.*?)\./;
  return reg.test(str);
};

const systemPath: string[] = [
  "/",
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
  return systemPath.indexOf(str) > -1;
};

function isPath(str: string, name?: string): boolean {
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

  if (systemPath.indexOf(str) > -1) {
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

function isPoolName(str: string): boolean {
  const reg = /^[-#A-Za-z0-9_]+$/;
  return reg.test(str);
}

function isPhoneNumber(str: string): boolean {
  const reg =
    /^((13[0-9])|(14[5-9])|(15([0-3]|[5-9]))|(16[6-7])|(17[1-8])|(18[0-9])|(19[1-3])|(19[5|6])|(19[8|9]))\d{8}$/;
  if (!reg.test(str)) {
    return false;
  }
  return true;
}

// 通用手机号码，只需要加号、减号、空格、数字
function isCommonPhoneNumber(str: string): boolean {
  const reg = /^[+\-\d\s]+$/;
  if (!reg.test(str)) {
    return false;
  }
  return true;
}

function isEmail(str: string): boolean {
  const reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
  if (!reg.test(str)) return false;
  return true;
}

function isPort(port: string): boolean {
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

const isIP = (str: string, ipVersion: 4 | 6 = 4): boolean =>
  ipVersion === 4 ? isIPV4IP(str) : isIPV6IP(str);

function findAll<T>(array: T[], value: T) {
  const list: number[] = [];
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
  const ip = strIP.split(".") as string[];
  const value =
    Number(Number(ip[0]) << 24) +
    Number(Number(ip[1]) << 16) +
    Number(Number(ip[2]) << 8) +
    Number(Number(ip[3]));
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

function isUint(str: number | string, unit?: string): boolean {
  if (Number.isNaN(Number(str))) {
    return false;
  }
  const reg = /^\+?[1-9][0-9]*$/;
  if (!reg.test(String(str))) {
    return false;
  }
  return isOverInt(unit ? `${str}${unit}` : String(str));
}

/**
 * 规格大小是否有效, 最大1PB
 * @param str 规格大小
 * @returns boolean
 */
function isOfferingSize(sizeStr: string): boolean {
  const MAX_SAFE_INTEGER = 1125899906842624;
  const K = 1024;
  const M = K * K;
  const G = M * K;
  const T = G * K;
  const P = T * K;
  const quantity = sizeStr.substr(sizeStr.length - 1, 1);

  const size = parseFloat(sizeStr);

  if (quantity === "K" || quantity === "k") {
    return size * K <= MAX_SAFE_INTEGER;
  }

  if (quantity === "M" || quantity === "m") {
    return size * M <= MAX_SAFE_INTEGER;
  }

  if (quantity === "G" || quantity === "g") {
    return size * G <= MAX_SAFE_INTEGER;
  }

  if (quantity === "T" || quantity === "t") {
    return size * T <= MAX_SAFE_INTEGER;
  }

  if (quantity === "P" || quantity === "p") {
    return size * P <= MAX_SAFE_INTEGER;
  }

  return parseInt(sizeStr, 10) <= MAX_SAFE_INTEGER;
}

/**
 * 带宽数值是否超过最大值
 * @param {string} 要校验的value
 * @returns boolean
 */
const isOverInt = (sizeStr: string): boolean => {
  const MAX_SAFE_INTEGER = 9007199254740992;

  const K = 1024;
  const M = K * K;
  const G = M * K;
  const T = G * K;
  const P = T * K;
  const quantity = String(sizeStr).substr(sizeStr.length - 1, 1);

  const size = parseFloat(sizeStr);

  if (quantity === "K" || quantity === "k") {
    return size * K < MAX_SAFE_INTEGER;
  }
  if (quantity === "M" || quantity === "m") {
    return size * M < MAX_SAFE_INTEGER;
  }
  if (quantity === "G" || quantity === "g") {
    return size * G < MAX_SAFE_INTEGER;
  }
  if (quantity === "T" || quantity === "t") {
    return size * T < MAX_SAFE_INTEGER;
  }
  if (quantity === "P" || quantity === "p") {
    return size * P < MAX_SAFE_INTEGER;
  }
  return Number.parseInt(sizeStr, 10) < MAX_SAFE_INTEGER;
};

/**
 * 是否是CIDR
 * @param {string} 输入的CIDR
 * @returns boolean
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
): boolean => {
  const isValid = Number(value) <= Number(max) && Number(value) >= Number(min);
  return isValid;
};

/**
 * 是否有输入值
 * @param value 输入值
 */
const isInput = <T>(value?: T): boolean => {
  if (_.isUndefined(value) || _.isNull(value)) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (_.isString(value)) {
    return value === "";
  }
  return false;
};

/**
 * 校验Ip是否在给定的Ip范围内
 * @param startIp 开始Ip
 * @param endIp 结束Ip
 * @param ip 要校验的Ip
 */
const isIpInRange = (startIp: string, endIp: string, ip: string): boolean => {
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
const isIpv6InRange = (startIp: string, endIp: string, ip: string): boolean => {
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
const isHostname = (hostname: string): boolean => {
  const regex = /^(?:(?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,6}$/;
  return regex.test(hostname);
};

export {
  isCidr,
  isDNSDomainName,
  isEmail,
  isIn,
  isInput,
  isMAC,
  isIP,
  isIpInRange,
  isIPV4IP,
  validateIPv6IPRange,
  validatorIPv4Range,
  isOverInt,
  isIpv6InRange,
  isIPV6IP,
  isValidatorIpRange,
  isValidNetMask,
  isPath,
  isSystemPath,
  isPhoneNumber,
  isCommonPhoneNumber,
  isPoolName,
  isPort,
  isPortExclude0,
  isPortRange,
  isLegalIPRange,
  isUint,
  isUrl,
  isValidString,
  isOfferingSize,
  isHostname,
  validateNameRegexp,
};

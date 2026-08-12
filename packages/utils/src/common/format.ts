import dayjs from "dayjs";
import * as _ from "lodash-es";
import type { IntlShape } from "react-intl";

/**
 * 格式化存储
 * @param {*} value 如果value为负值 统一返回0B
 * @param {*} decimal 精度，默认为0
 */
const formatStorage = (
  value?: number | string,
  decimal: number = 0,
): string => {
  // 类型检查: 如果 value 不是数字，也不能转换成数字，返回 '-'
  if (typeof value !== "number" && _.isNaN(Number(value))) {
    return "-";
  }
  const { number, unit } = formatStorageToObj(value, decimal);
  return `${number} ${unit}`;
};

const formatStorageToObj = (
  value?: number | string,
  decimal: number = 0,
  suffixUnit: string = "B",
): { number: number | string; unit: string } => {
  // 类型检查: 如果 value 不是数字，也不能转换成数字，返回 '-'
  if (typeof value !== "number" && _.isNaN(Number(value))) {
    return {
      number: "-",
      unit: "",
    };
  }
  const unitArr = ["", "K", "M", "G", "T", "P", "E", "Z", "Y"] as const;
  const numberValue = Number(value);
  if (numberValue <= 0) {
    return {
      number: 0,
      unit: `${unitArr[0]}${suffixUnit}`,
    };
  }
  let unitIndex = 0;
  let sizeNumber = numberValue;
  while (sizeNumber >= 1024 && unitIndex < unitArr.length - 1) {
    sizeNumber /= 1024;
    unitIndex++;
  }
  return {
    number: Number(sizeNumber.toFixed(decimal)),
    unit: `${unitArr[unitIndex]}${suffixUnit}`,
  };
};

const ipToInt = (ip: string): number => {
  const arr: string[] = ip.split(".");
  return (
    (Number(arr[0]) * 256 * 256 * 256 +
      Number(arr[1]) * 256 * 256 +
      Number(arr[2]) * 256 +
      Number(arr[3])) >>>
    0
  );
};

const intToIp = (num: number): string => {
  const arr = [
    String((num >>> 24) >>> 0),
    String(((num << 8) >>> 24) >>> 0),
    String((num << 16) >>> 24),
    String((num << 24) >>> 24),
  ];
  return arr.join(".");
};

/**
 * 格式化时间
 * @param  {string | number} value 时间戳
 * @param  {IFormatType='YYYY-MM-DDHH:mm:ss'} format
 * @returns string
 */
type IFormatType = "YYYY-MM-DD HH:mm:ss" | "YYYY-MM" | "MM-DD" | "HH:mm";
const formatTime = (
  value: string | number,
  format: IFormatType = "YYYY-MM-DD HH:mm:ss",
): string => {
  const v = dayjs(new Date(value));
  if (v.isValid()) {
    return v.format(format);
  }
  return "";
};

/**
 * 格式化时间
 * @param  {number} time 时间
 * @param  {IHMSUnit='seconds'} unit // 秒，毫秒
 * @returns string // 00:00:00
 */
type IHMSUnit = "seconds" | "milliseconds";
const formatTimeToHMS = (time: number, unit: IHMSUnit = "seconds"): string => {
  // 如果指定的单位是毫秒，那么将时间转换为秒
  if (unit === "milliseconds") {
    time /= 1000;
  }

  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);

  const paddedHours = hours.toString().padStart(2, "0");
  const paddedMinutes = minutes.toString().padStart(2, "0");
  const paddedSeconds = seconds.toString().padStart(2, "0");

  return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
};

/**
 * 检查一个数是否为2的幂次。
 *
 * @param {number} number - 要检查的数字。必须是非负整数。
 * @return {boolean} 如果数字是2的幂次，则返回true。
 *
 */
function isPowerOfTwo(number: number): boolean {
  // 如果数字是正数并且数字与比数字小1的数的位与运算结果为0
  return number > 0 && (number & (number - 1)) === 0;
}

/**
 * 格式化时间，RFC 3339
 * @param Date
 * @returns string // "2021-08-10T09:50:00+08:00"
 */
function formatRFC3339(d: Date): string {
  function pad(n: number) {
    return n < 10 ? `0${n}` : n;
  }

  function timezoneOffset(offset: number) {
    let sign: string = "+";
    if (offset === 0) {
      return "Z";
    }
    sign = offset > 0 ? "-" : "+";
    offset = Math.abs(offset);
    return `${sign + pad(Math.floor(offset / 60))}:${pad(offset % 60)}`;
  }

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${timezoneOffset(
    d.getTimezoneOffset(),
  )}`; // 浏览器timezone
}

/**
 * 格式化次数
 * @param {number} value 格式化值 ， 小于1000 ，返回原来的值，大于返回 {value/1000 K}
 * @returns string | number
 */
const formatCount = (value: number): string | number => {
  const str = value.toString();
  if (str.indexOf(".") > -1 && str.split(".")[1].length > 2)
    value = Number(value.toFixed(2));
  if (value >= 1000) {
    let _value = value / 1000;
    const _valueStr = `${_value}`;
    _value = Number(
      _valueStr.indexOf(".") > -1 && _valueStr.split(".")[1].length > 2
        ? _value.toFixed(2)
        : _value,
    );
    return `${_value}K`;
  }
  return value;
};

/**
 * 单位 Bytes : 'K', 'M', 'G', 'T', 'P'
 * @param {number | string} bytes
 * @param {string} unit 单位
 * @param {number} width 进制
 * @returns string
 */
const formatBytesToSize = (
  bytes?: number | string,
  unit?: string,
  width?: number,
): string => {
  if (!bytes || Number.isNaN(bytes)) bytes = 0;
  bytes = Number(bytes);
  if (bytes < 0) bytes = 0;
  if (typeof width === "undefined") width = 2;
  if (typeof unit === "undefined") unit = "B";
  // let num = Math.pow(10, width)
  let num = 10 ** width;
  const sizes = ["K", "M", "G", "T", "P"];
  if (unit) {
    sizes.unshift("");
  } else {
    sizes.unshift("Byte");
  }
  if (bytes === 0) return `0 ${sizes[0]}${unit}`;
  let i = Math.floor(Math.log(bytes) / Math.log(1024));
  // for 0.xxxx number
  if (i < 0) i = 0;
  /* istanbul ignore if */
  if (sizes[i] === "B") num = 1;
  if (i >= 5) i = 5;
  return `${Math.round((bytes / 1024 ** i) * num) / num} ${sizes[i]}${unit}`;
};

/**
 * 单位 Bytes : 'K', 'M', 'G', 'T', 'P'
 * @param {number} number 数值
 * @param {string} unit 单位
 * @returns number
 */

const parseNumber = (number: number, unit: string) => {
  if (number === 0) return 0;
  const K = 1024;
  const M = K * K;
  const G = M * K;
  const T = G * K;
  const P = T * K;

  let result: number = number;
  const obj: Record<number, string[]> = {
    [K]: ["K", "KB", "k", "KB/s", "Kbps"],
    [M]: ["M", "MB", "m", "MB/s", "Mbps"],
    [G]: ["G", "GB", "g", "GB/s", "Gbps"],
    [T]: ["T", "TB", "t", "TB/s", "Tbps"],
    [P]: ["P", "PB", "p", "PB/s", "Pbps"],
  };

  for (const [key, item] of Object.entries(obj)) {
    if (item.some((u) => u.toLowerCase() === unit.toLowerCase())) {
      result = number * +key;
      break;
    }
  }

  return parseInt(result.toString(), 10);
};

function secToTime(s: number): {
  day: number;
  hour: number;
  minute: number;
  second: number;
} {
  let time = {
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
  };
  if (s > 0) {
    const day = Math.floor(s / 3600 / 24);
    const hour = Math.floor((s % 86400) / 3600);
    const minute = Math.floor(s / 60) % 60;
    const second = s % 60;
    time = {
      day,
      hour,
      minute,
      second,
    };
  }
  return time;
}

/**
 * 格式化百分数
 * @param {number|string} value 格式化值
 * @returns string
 */
function formatPercent(value?: number | string, decimal: number = 2): string {
  // 类型检查: 如果 value 不是数字，也不能转换成数字，返回 '-'
  if (typeof value !== "number" && _.isNaN(Number(value))) {
    return "-";
  }

  // 如果 value 是数值或可以转换成数值，则转换成数字并保留两位小数
  const numberValue = Number(value);
  const rounded = parseFloat(numberValue.toFixed(decimal));

  // 返回处理后的字符串
  return `${rounded}%`;
}

/**
 * 格式化 Bytes
 * @param {number} value 格式化值
 * @returns string
 */
const formatBytes = (value: number): string => {
  if (value < 1.0) value = 0;
  return `${formatBytesToSize(value)}/s`;
};
/**
 * 格式化 Ops
 * @param {number} value  格式化值
 * @returns string
 */
const formatOps = (value: number): string => {
  const str = value.toString();
  if (str.indexOf(".") > -1 && str.split(".")[1].length > 2)
    value = Number(value.toFixed(2));
  if (value > 1000) {
    let _value = value / 1000;
    const _valueStr = `${_value}`;
    _value = Number(
      _valueStr.indexOf(".") > -1 && _valueStr.split(".")[1].length > 2
        ? _value.toFixed(2)
        : _value,
    );
    return `${_value}K ops/s`;
  }
  return `${value} ops/s`;
};
/**
 * 格式化 Pps
 * @param {number} value  格式化值
 * @returns string
 */
const formatPps = (value: number): string => {
  const numValue = Number(value);
  if (!_.isNaN(numValue)) {
    //十亿或更大
    if (numValue >= 1e9) {
      return `${_.round(numValue / 1e9, 2)} Gpps`;
    }
    //百万或更大
    if (numValue >= 1e6) {
      return `${_.round(numValue / 1e6, 2)} Mpps`;
    }
    //千或更大
    if (numValue >= 1e3) {
      return `${_.round(numValue / 1e3, 2)} Kpps`;
    }
    //小于千
    return `${_.round(numValue, 2)} pps`;
  }
  return "Invalid value. Must be a number.";
};
/**
 * 获取格式化监控数据单位函数
 * @param {'count' | 'percent' | 'bytes' | 'ops' | 'pps'} unit 格式化监控数据单位
 * @returns (v: number) => string | number
 */
const formatMonitorValue = (
  unit: "count" | "percent" | "bytes" | "ops" | "pps",
): ((v: number) => string | number) => {
  const obj = {
    count: formatCount,
    percent: formatPercent,
    bytes: formatBytes,
    ops: formatOps,
    pps: formatPps,
  };
  return obj[unit];
};

/**
 * 格式化 监控X轴 时间
 * @param {boolean} showDay 是否显示天数
 * @param {number} t 时间戳
 * @returns string
 */
function formatMonitorTime(showDay: boolean, t: number): string {
  if (showDay) {
    const d = new Date(t);
    let month = `${d.getMonth() + 1}`;
    if (month.length === 1) month = `0${month}`;
    let day = `${d.getDate()}`;
    if (day.length === 1) day = `0${day}`;
    return `${month}-${day}`;
  }
  const d = new Date(t);
  let hour = `${d.getHours()}`;
  if (hour.length === 1) hour = `0${hour}`;
  let minute = `${d.getMinutes()}`;
  if (minute.length === 1) minute = `0${minute}`;
  return `${hour}:${minute}`;
}

/**
 * 分割时间段
 * @param {number} step 分割步长
 * @param {any[][]} value 时间二维数组，默认要分割的时间放到[x][时间]
 * @param {length} length 分割长度
 * @returns any[] | any[][]
 */
function formatMetricData(
  step: number,
  value: any[][],
  length = 300,
): any[] | any[][] {
  let valueLenth = value.length;
  if (valueLenth >= length) return value;
  const currentTime = Date.now() / 1000;
  if (valueLenth === 0) {
    const valueList = [];
    for (let i = 0; i < length; i += 1) {
      valueList.unshift([currentTime - i * step, 0]);
    }
    return valueList;
  }
  const startTime = valueLenth > 0 ? value[0][0] : currentTime;
  const endTime = valueLenth > 0 ? value[valueLenth - 1][0] : currentTime;
  const _value = [];
  if (currentTime - endTime > step + 10) {
    for (
      let i = 1;
      i <=
      Math.round(
        (Number.parseInt(String(currentTime), 10) -
          Number.parseInt(endTime, 10)) /
          step,
      );
      i += 1
    ) {
      value.push([Number.parseInt(endTime, 10) + i * step, 0]);
    }
  }
  valueLenth = value.length;
  for (let i = 0; i < valueLenth; i += 1) {
    _value.push(value[i]);
    if (i + 1 < value.length && value[i + 1][0] - value[i][0] > step) {
      const num = Math.round((value[i + 1][0] - value[i][0]) / step);
      for (let n = 1; n < num; n += 1) {
        _value.push([Number.parseInt(value[i][0], 10) + step * n, 0]);
      }
    }
  }
  const _length = _value.length;
  for (let i = 1; i <= length - _length; i += 1) {
    _value.unshift([startTime - i * step, 0]);
  }
  return _value;
}

/**
 * trim 字符串
 * @param {any} value
 * @returns string
 */
const formatProp = <T>(value: T): string => {
  if (value === undefined || value == null) return "";

  // 使用类型断言确保转换为字符串后返回的是字符串类型
  return String(value).trim();
};

/** 字符超长用省略号处理
 * @param  {string} str
 * @param  {number} len
 * @returns string
 */
const beautyStr = (str: string, len: number): string => {
  const reg = /[\u4e00-\u9fa5]/g; //匹配中文
  const slice = str.substring(0, len);
  const chineseCharNum = slice.match(reg)?.length ?? 0;
  const realen = slice.length * 2 - chineseCharNum;
  return str.substr(0, realen) + (realen < str.length ? "..." : "");
};

const cidr2ipRange = (cidr: string): { start: string; end: string } => {
  const parts = cidr.split("/");
  const start = intToIp(ipToInt(parts[0]) & (-1 << (32 - +parts[1])));
  const end = intToIp(ipToInt(start) + 2 ** (32 - +parts[1]) - 1);

  return {
    start: start.replace(/0$/, "2"),
    end: end.replace(/255$/, "254"),
  };
};

const cidrPrefix2Netmask = (prefix: number): string => {
  const netmask: number[] = [];
  [1, 2, 3, 4].forEach(() => {
    const n = Math.min(prefix, 8);
    netmask.push(256 - 2 ** (8 - n));
    prefix -= n;
  });
  return netmask.join(".");
};

/**
 * 根据 CIDR 块计算 IP 地址范围、子网掩码和可用 IP 数量。
 *
 * @param cidr - CIDR 块。
 * @return 一个对象，包含以下信息：
 *      networkAddress - CIDR 块中的第一个 IP 地址，通常用于网络识别。
 *      broadcastAddress - CIDR 块中的最后一个 IP 地址，通常用于广播消息。
 *      startIP - CIDR 块中的第一个可用 IP 地址（networkAddress + 1）。
 *      endIP - CIDR 块中的最后一个可用 IP 地址（broadcastAddress - 1）。
 *      subnetMask - 与 CIDR 块关联的子网掩码。
 *      usableIPs - CIDR 块中可用 IP 地址的数量（endIP - startIP + 1）。
 */
const calculateCIDRRange = (
  cidr: string,
): {
  networkAddress: string;
  broadcastAddress: string;
  startIP: string;
  endIP: string;
  subnetMask: string;
  usableIPs: number;
} => {
  // 将 CIDR 块分割为 IP 地址和 CIDR 表示法（斜线后的数字）
  const [ip, cidrStr] = cidr.split("/");
  // 将 CIDR 表示法转换为整数以进行进一步的计算
  const cidrInt = parseInt(cidrStr, 10);

  // 将 IP 地址转换为整数，这样更容易进行计算
  const ipInt = ipToInt(ip);

  // 计算掩码
  const mask = 2 ** (32 - cidrInt) - 1;

  // 计算网络地址和广播地址
  const networkAddress = ipInt & ~mask;
  const broadcastAddress = networkAddress | mask;

  // 计算第一个和最后一个可用的 IP 地址
  const startIP = networkAddress + 1; // 将网络地址加 1 得到第一个可用的 IP
  const endIP = broadcastAddress - 1; // 将广播地址减 1 得到最后一个可用的 IP

  // 计算子网掩码和可用 IP 的数量
  const subnetMask = intToIp(~mask);
  const usableIPs = endIP - startIP + 1;

  return {
    networkAddress: intToIp(networkAddress),
    broadcastAddress: intToIp(broadcastAddress),
    startIP: intToIp(startIP),
    endIP: intToIp(endIP),
    subnetMask,
    usableIPs,
  };
};

/** 秒转换成时间段
 * @param  {number} s
 * @param  {any} intl
 * @returns string
 */

const formatSecToPeriod = (s: number, intl: IntlShape): string => {
  const time = secToTime(s);

  const timeUnits = [
    {
      value: time.day,
      message: intl.formatMessage(
        { id: "common.time.day.format", defaultMessage: "{n} 天" },
        { n: time.day },
      ),
    },
    {
      value: time.hour,
      message: intl.formatMessage(
        { id: "common.time.hour.format", defaultMessage: "{n} 小时" },
        { n: time.hour },
      ),
    },
    {
      value: time.minute,
      message: intl.formatMessage(
        { id: "common.time.minute.format", defaultMessage: "{n} 分钟" },
        { n: time.minute },
      ),
    },
    {
      value: time.second,
      message: intl.formatMessage(
        { id: "common.time.second.format", defaultMessage: "{n} 秒" },
        { n: time.second },
      ),
    },
  ];

  const str = timeUnits
    .filter((unit) => unit.value > 0)
    .map((unit) => unit.message)
    .join(" ");

  return (
    str ||
    intl.formatMessage(
      { id: "common.time.second.format", defaultMessage: "{n} 秒" },
      { n: 0 },
    )
  );
};

/** 秒转换成时间段,最大单位是小时,单位用英文表示。
 * @param  {number} s
 * @param  {any} intl
 * @returns string
 */
const formatSecToPeriodMaxUnitHour = (s: number, intl: IntlShape): string => {
  if (s === 0)
    return intl.formatMessage({
      id: "less.than.one.second",
      defaultMessage: "小于1s",
    });

  const time: { day?: number; hour: number; minute: number; second: number } =
    secToTime(s);
  time.hour += time.day! * 24;
  delete time.day;

  const timeUnits = [
    {
      value: time.hour,
      message: `${time.hour}h`,
    },
    {
      value: time.minute,
      message: `${time.minute}min`,
    },
    {
      value: time.second,
      message: `${time.second}s`,
    },
  ];

  const str = timeUnits
    .filter((unit) => unit.value > 0)
    .map((unit) => unit.message)
    .join(" ");

  return str || `${s}s`;
};

/**
 * 字符串正字特殊符号转换
 * @param str string
 * @returns string
 */
const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Convert IP address to binary.
 *
 * @param {string} ip - The IP address.
 * @param {boolean} isIPv6 - Whether the IP address is IPv6.
 * @return {string} The binary representation of the IP address.
 */
function ipToBin(ip: string, isIPv6: boolean): string {
  let bin = "";
  if (isIPv6) {
    // If the IP is IPv6, split it into hextets and convert each to binary.
    bin = ip
      .split(":")
      .map((hextet) => {
        let binHextet = parseInt(hextet, 16).toString(2);
        // Pad each binary hextet to 16 bits.
        while (binHextet.length < 16) {
          binHextet = `0${binHextet}`;
        }
        return binHextet;
      })
      .join("");
  } else {
    // If the IP is IPv4, split it into octets and convert each to binary.
    bin = ip
      .split(".")
      .map((octet) => {
        let binOctet = parseInt(octet, 10).toString(2);
        // Pad each binary octet to 8 bits.
        while (binOctet.length < 8) {
          binOctet = `0${binOctet}`;
        }
        return binOctet;
      })
      .join("");
  }
  return bin;
}

/**
 * Convert CIDR mask to binary.
 *
 * @param {number} mask - The CIDR mask.
 * @param {boolean} isIPv6 - Whether the mask is for IPv6.
 * @return {string} The binary representation of the mask.
 */
function maskToBin(mask: number, isIPv6: boolean): string {
  let bin = "";
  const length = isIPv6 ? 128 : 32;
  // Fill the mask with 1s up to the mask length.
  for (let i = 0; i < mask; i++) {
    bin += "1";
  }
  // Pad the mask with 0s to the appropriate length.
  while (bin.length < length) {
    bin += "0";
  }
  return bin;
}

/**
 * Check whether an IP address is in a CIDR block.
 *
 * @param {string} ip - The IP address to check.
 * @param {string} cidr - The CIDR block.
 * @param {boolean} isIPv6 - Whether the IP address is IPv6.
 * @return {boolean} Whether the IP address is in the CIDR block.
 */
function isIpInCidr(ip: string, cidr: string, isIPv6: boolean): boolean {
  const [cidrIp, mask] = cidr.split("/");
  const ipBin = ipToBin(ip, isIPv6);
  const cidrIpBin = ipToBin(cidrIp, isIPv6);
  const maskBin = maskToBin(parseInt(mask, 10), isIPv6);
  const length = isIPv6 ? 128 : 32;
  // Perform a bitwise AND on each bit of the IP and the CIDR IP, using the mask.
  for (let i = 0; i < length; i++) {
    if (
      (parseInt(ipBin.charAt(i), 10) & parseInt(maskBin.charAt(i), 10)) !==
      (parseInt(cidrIpBin.charAt(i), 10) & parseInt(maskBin.charAt(i), 10))
    ) {
      // If any bit doesn't match, the IP is not in the CIDR block.
      return false;
    }
  }
  // If all bits match, the IP is in the CIDR block.
  return true;
}

/**
 * Convert subnet mask to CIDR format.
 *
 * @param {string} subnetMask - The subnet mask.
 * @return {number} The CIDR representation of the subnet mask.
 */
function subnetToCidr(subnetMask: string): number {
  return subnetMask
    .split(".")
    .map((octet) => {
      // Convert each octet to binary and count the number of 1s
      return (parseInt(octet, 10).toString(2).match(/1/g) || []).length;
    })
    .reduce((a, b) => a + b); // Sum the counts
}

/**
 * 比较两个大数的大小。
 *
 * 注意：由于JavaScript中数字的精度限制，直接作为数字类型传入的值可能会在超过
 * Number.MAX_SAFE_INTEGER（9007199254740991）时丢失精度。因此，对于非常大的数字，
 * 建议以字符串形式传入以保持精确度。这里不使用BigInt，也不适用一些库。
 *
 * @param {number|string} num1 - 第一个数，可以是数字或字符串。对于非常大的数字，建议使用字符串。
 * @param {number|string} num2 - 第二个数，可以是数字或字符串。对于非常大的数字，同样建议使用字符串。
 * @returns {number} - 返回 1 表示 num1 > num2，返回 -1 表示 num1 < num2，返回 0 表示两数相等。
 */
function compareBigNumbers(
  num1: number | string,
  num2: number | string,
): number {
  // 将输入转换为字符串，以便处理数字和字符串类型的输入
  let strNum1 = String(num1);
  let strNum2 = String(num2);

  // 去除数字字符串前面的所有前导零
  strNum1 = strNum1.replace(/^0+/, "");
  strNum2 = strNum2.replace(/^0+/, "");

  // 比较字符串长度
  if (strNum1.length > strNum2.length) return 1; // 第一个数更大
  if (strNum1.length < strNum2.length) return -1; // 第二个数更大

  // 如果长度相同，逐个字符比较
  for (let i = 0; i < strNum1.length; i++) {
    if (strNum1[i] > strNum2[i]) return 1; // 第一个数更大
    if (strNum1[i] < strNum2[i]) return -1; // 第二个数更小
  }

  // 如果所有字符都相同，则两个数相等
  return 0;
}

/**
 * 用 selectedList 获取应该渲染的 ResourceName 内容
 * @param selectedList selected列表
 * @param intl intl
 * @param nameKey name属性对应的key
 * @returns {string|undefined} 返回对应的内容或者undefined
 */
function formatResourceName<T extends Record<string, unknown>>(
  selectedList: T[],
  intl: IntlShape,
  nameKey: keyof T = "name" as keyof T,
): string {
  if (selectedList.length === 1) {
    return (selectedList[0]?.[nameKey] ?? "") as string;
  }
  if (selectedList.length > 1) {
    return intl.formatMessage(
      {
        id: "object.number",
        defaultMessage: "{num}个对象",
      },
      { num: selectedList.length },
    );
  }
  return "";
}

/**
 * 网络带宽单位转换工具
 * 使用1000作为进位标准（bps、Kbps、Mbps、Gbps、Tbps、Pbps）
 */
// 带宽单位枚举
enum BandwidthUnit {
  Bps = "bps",
  Kbps = "Kbps",
  Mbps = "Mbps",
  Gbps = "Gbps",
  Tbps = "Tbps",
  Pbps = "Pbps",
}

// 单位转换因子（基于1000进位）
const Bandwidth_UNIT_FACTORS: Record<BandwidthUnit, number> = {
  [BandwidthUnit.Bps]: 1,
  [BandwidthUnit.Kbps]: 1000,
  [BandwidthUnit.Mbps]: 1000 * 1000,
  [BandwidthUnit.Gbps]: 1000 * 1000 * 1000,
  [BandwidthUnit.Tbps]: 1000 * 1000 * 1000 * 1000,
  [BandwidthUnit.Pbps]: 1000 * 1000 * 1000 * 1000 * 1000,
};

// 格式化数字：整数不显示小数位，小数则保留指定位数
const formatNumberWithOptionalDecimals = (
  num: number,
  decimals: number = 2,
): string => {
  // 检查是否为整数
  return _.isInteger(num) ? _.toString(num) : num.toFixed(decimals);
};

/**
 * 将bps值自动转换为最合适的单位表示
 * @param bpsValue bps值
 * @param decimals 保留小数位数，默认2位
 * @returns 带最合适单位的带宽值，如 "1.5 Gbps"
 */
const formatBandwidth = (bpsValue: number, decimals: number = 2): string => {
  if (bpsValue < 0) {
    throw new Error("Bandwidth value cannot be negative");
  }

  if (bpsValue < 1000) {
    return `${formatNumberWithOptionalDecimals(bpsValue, decimals)} ${BandwidthUnit.Bps}`;
  } else if (bpsValue < 1000 * 1000) {
    return `${formatNumberWithOptionalDecimals(bpsValue / Bandwidth_UNIT_FACTORS[BandwidthUnit.Kbps], decimals)} ${BandwidthUnit.Kbps}`;
  } else if (bpsValue < 1000 * 1000 * 1000) {
    return `${formatNumberWithOptionalDecimals(bpsValue / Bandwidth_UNIT_FACTORS[BandwidthUnit.Mbps], decimals)} ${BandwidthUnit.Mbps}`;
  } else if (bpsValue < 1000 * 1000 * 1000 * 1000) {
    return `${formatNumberWithOptionalDecimals(bpsValue / Bandwidth_UNIT_FACTORS[BandwidthUnit.Gbps], decimals)} ${BandwidthUnit.Gbps}`;
  } else if (bpsValue < 1000 * 1000 * 1000 * 1000 * 1000) {
    return `${formatNumberWithOptionalDecimals(bpsValue / Bandwidth_UNIT_FACTORS[BandwidthUnit.Tbps], decimals)} ${BandwidthUnit.Tbps}`;
  } else {
    return `${formatNumberWithOptionalDecimals(bpsValue / Bandwidth_UNIT_FACTORS[BandwidthUnit.Pbps], decimals)} ${BandwidthUnit.Pbps}`;
  }
};

/**
 * 将bps值转换为指定单位的带宽表示
 * @param bpsValue bps值
 * @param targetUnit 目标单位
 * @param decimals 保留小数位数，默认2位
 * @returns 带单位的带宽值，如 "0.1 Gbps"
 */
const formatValueToBandwidth = (
  bpsValue: number,
  targetUnit: BandwidthUnit,
  decimals: number = 2,
): string => {
  if (bpsValue < 0) {
    throw new Error("Bandwidth value cannot be negative");
  }

  const convertedValue = bpsValue / Bandwidth_UNIT_FACTORS[targetUnit];
  return `${formatNumberWithOptionalDecimals(convertedValue, decimals)} ${targetUnit}`;
};

/**
 * 将带有单位的带宽值转换为bps数值
 * @param bandwidthWithUnit 带单位的带宽值，如 "100 Mbps"
 * @returns 转换后的bps值，如 100000000
 * @throws 当输入格式不正确或单位无效时抛出错误
 */
const formatBandwidthToValue = (bandwidthWithUnit: string): number => {
  if (!bandwidthWithUnit || typeof bandwidthWithUnit !== "string") {
    throw new Error(
      "Invalid bandwidth input: input must be a non-empty string",
    );
  }

  const parts = _.compact(_.split(bandwidthWithUnit, " "));
  if (parts.length !== 2) {
    throw new Error(
      'Invalid bandwidth format: expected "value unit" format (e.g. "100 Mbps")',
    );
  }

  const [value, unit] = parts;
  const bpsValue = _.toNumber(value);

  if (_.isNaN(bpsValue) || bpsValue < 0) {
    throw new Error(
      `Invalid bandwidth value: ${value} is not a valid positive number`,
    );
  }

  const unitFactor = Bandwidth_UNIT_FACTORS[unit as BandwidthUnit];
  if (!unitFactor) {
    throw new Error(
      `Invalid bandwidth unit: ${unit}. Valid units are: ${Object.keys(Bandwidth_UNIT_FACTORS).join(", ")}`,
    );
  }

  return bpsValue * unitFactor;
};

/**
 * 获取货币符号
 * @param intl react-intl 的 intl 对象
 * @param currencySymbol 货币代码 (CNY, USD, EUR 等)
 * @returns 格式化后的货币符号
 */
const getCurrencySymbols = (
  intl: IntlShape,
  currencySymbol?: string,
): string => {
  if (currencySymbol === undefined) {
    return "";
  }
  const currencySymbols: Record<string, string> = {
    unit: intl.formatMessage({
      id: "rmb",
      defaultMessage: "¥ ",
    }),
    CNY: intl.formatMessage({
      id: "rmb",
      defaultMessage: "¥ ",
    }),
    USD: intl.formatMessage({
      id: "usd",
      defaultMessage: "$ ",
    }),
    EUR: intl.formatMessage({
      id: "eur",
      defaultMessage: "€ ",
    }),
    GBP: intl.formatMessage({
      id: "gbp",
      defaultMessage: "£ ",
    }),
    AUD: intl.formatMessage({
      id: "aud",
      defaultMessage: "A$ ",
    }),
    HKD: intl.formatMessage({
      id: "hkd",
      defaultMessage: "HK$ ",
    }),
    JPY: intl.formatMessage({
      id: "jpy",
      defaultMessage: "JPY¥ ",
    }),
    CHF: intl.formatMessage({
      id: "chf",
      defaultMessage: "CHF ",
    }),
    CAD: intl.formatMessage({
      id: "cad",
      defaultMessage: "C$ ",
    }),
    // 印尼货币
    IDR: intl.formatMessage({
      id: "idr",
      defaultMessage: "Rp ",
    }),
    MYR: intl.formatMessage({
      id: "myr",
      defaultMessage: "RM ",
    }),
    THB: intl.formatMessage({
      id: "thb",
      defaultMessage: "฿ ",
    }),
    SGD: intl.formatMessage({
      id: "sgd",
      defaultMessage: "S$ ",
    }),
    AED: intl.formatMessage({
      id: "aed",
      defaultMessage: "د.إ ",
    }),
    PKR: intl.formatMessage({
      id: "pkr",
      defaultMessage: "₨ ",
    }),
    SAR: intl.formatMessage({
      id: "sar",
      defaultMessage: "SR ",
    }),
    // 越南盾
    VND: intl.formatMessage({
      id: "vnd",
      defaultMessage: "₫ ",
    }),
    // 缅甸缅元
    MMK: intl.formatMessage({
      id: "mmk",
      defaultMessage: "K ",
    }),
    // 柬埔寨瑞尔
    KHR: intl.formatMessage({
      id: "khr",
      defaultMessage: "៛ ",
    }),
    // 菲律宾比索
    PHP: intl.formatMessage({
      id: "php",
      defaultMessage: "₱ ",
    }),
    // 哈萨克斯坦坚戈
    KZT: intl.formatMessage({
      id: "kzt",
      defaultMessage: "₸ ",
    }),
    // 韩国韩元
    KRW: intl.formatMessage({
      id: "krw",
      defaultMessage: "₩ ",
    }),
  };

  return currencySymbols[currencySymbol] || currencySymbols.unit;
};

export {
  formatBytes,
  formatBytesToSize,
  formatCount,
  formatMonitorTime,
  formatMonitorValue,
  formatMetricData,
  formatTime,
  formatTimeToHMS,
  formatBandwidth,
  formatBandwidthToValue,
  formatValueToBandwidth,
  isPowerOfTwo,
  formatOps,
  formatPercent,
  formatPps,
  formatProp,
  formatStorage,
  formatStorageToObj,
  parseNumber,
  secToTime,
  ipToInt,
  intToIp,
  beautyStr,
  cidr2ipRange,
  cidrPrefix2Netmask,
  calculateCIDRRange,
  ipToBin,
  maskToBin,
  isIpInCidr,
  subnetToCidr,
  formatSecToPeriod,
  formatRFC3339,
  escapeRegExp,
  compareBigNumbers,
  formatResourceName,
  formatSecToPeriodMaxUnitHour,
  getCurrencySymbols,
};

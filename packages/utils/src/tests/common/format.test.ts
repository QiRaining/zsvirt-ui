import { IntlShape } from "react-intl";
import { describe, it, expect } from "vitest";

import {
  formatBytes,
  formatBytesToSize,
  formatCount,
  formatMonitorValue,
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
} from "../../common/format";

describe("Format Utils", () => {
  describe("Byte Formatting", () => {
    describe("formatBytes", () => {
      it("should format bytes to human readable format", () => {
        expect(formatBytes(1024)).toBe("1 KB/s");
        expect(formatBytes(1024 * 1024)).toBe("1 MB/s");
        expect(formatBytes(1024 * 1024 * 1024)).toBe("1 GB/s");
        expect(formatBytes(0)).toBe("0 B/s");
      });

      it("should handle decimal places correctly", () => {
        expect(formatBytes(1536)).toBe("1.5 KB/s");
      });
    });

    describe("formatBytesToSize", () => {
      it("should format bytes to size with unit", () => {
        expect(formatBytesToSize(1024)).toBe("1 KB");
        expect(formatBytesToSize(1024 * 1024)).toBe("1 MB");
        expect(formatBytesToSize(1024 * 1024 * 1024)).toBe("1 GB");
      });
    });
  });

  describe("Number Formatting", () => {
    describe("formatCount", () => {
      it("should format numbers with appropriate units", () => {
        expect(formatCount(10)).toBe(10);
        expect(formatCount(1000)).toBe("1K");
        expect(formatCount(1000000)).toBe("1000K");
        expect(formatCount(1000000000)).toBe("1000000K");
      });
    });

    describe("formatPercent", () => {
      it("should format numbers as percentages", () => {
        expect(formatPercent(50)).toBe("50%");
        expect(formatPercent(100)).toBe("100%");
        expect(formatPercent(12.32, 1)).toBe("12.3%");
        expect(formatPercent(12.3222, 3)).toBe("12.322%");
      });

      it("should return '-' when the value is not a number", () => {
        expect(formatPercent("abc")).toBe("-");
        expect(formatPercent(undefined)).toBe("-");
      });
    });

    describe("parseNumber", () => {
      it("should parse string numbers with units", () => {
        expect(parseNumber(1, "K")).toBe(1024);
        expect(parseNumber(1, "M")).toBe(1048576);
        expect(parseNumber(1, "G")).toBe(1073741824);
      });

      it("should parse number with lower case unit", () => {
        expect(parseNumber(1, "k")).toBe(1024);
        expect(parseNumber(1, "m")).toBe(1048576);
        expect(parseNumber(1, "g")).toBe(1073741824);
      });

      it("should parse number with error unit", () => {
        expect(parseNumber(1, "A")).toBe(1);
      });
    });
  });

  describe("Time Formatting", () => {
    describe("formatTime", () => {
      it("should format timestamps", () => {
        const timestamp = new Date("2024-01-01T00:00:00Z").getTime();
        expect(formatTime(timestamp)).toMatch(
          /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/,
        );
      });
    });

    describe("formatTimeToHMS", () => {
      it("should format seconds to HH:MM:SS", () => {
        expect(formatTimeToHMS(3661)).toBe("01:01:01");
        expect(formatTimeToHMS(61)).toBe("00:01:01");
      });
    });

    describe("secToTime", () => {
      it("should convert seconds to time object", () => {
        const result = secToTime(3661);
        expect(result).toEqual({
          day: 0,
          hour: 1,
          minute: 1,
          second: 1,
        });
      });
    });

    describe("formatSecToPeriod", () => {
      const mockIntl = {
        formatMessage: ({ defaultMessage }: any, values: any) =>
          defaultMessage.replace("{n}", values.n),
      };

      it("should format seconds to period string", () => {
        expect(formatSecToPeriod(3661, mockIntl)).toBe("1 小时 1 分钟 1 秒");
        expect(formatSecToPeriod(86400, mockIntl)).toBe("1 天");
      });
    });

    describe("formatSecToPeriodMaxUnitHour", () => {
      const mockIntl = {
        formatMessage: ({ defaultMessage }: any) => defaultMessage,
      };

      it("should format seconds with hour as max unit", () => {
        expect(formatSecToPeriodMaxUnitHour(3661, mockIntl)).toBe("1h 1min 1s");
        expect(formatSecToPeriodMaxUnitHour(86400, mockIntl)).toBe("24h");
      });
    });
  });

  describe("IP Address Handling", () => {
    describe("ipToInt & intToIp", () => {
      it("should convert between IP and integer", () => {
        const ip = "192.168.1.1";
        const int = ipToInt(ip);
        expect(intToIp(int)).toBe(ip);
      });
    });

    describe("cidr2ipRange", () => {
      it("should convert CIDR to IP range", () => {
        const range = cidr2ipRange("192.168.1.0/24");
        expect(range).toEqual({
          start: "192.168.1.2",
          end: "192.168.1.254",
        });
      });
    });

    describe("calculateCIDRRange", () => {
      it("should calculate CIDR range details", () => {
        const result = calculateCIDRRange("192.168.1.0/24");
        expect(result).toHaveProperty("networkAddress");
        expect(result).toHaveProperty("broadcastAddress");
        expect(result).toHaveProperty("startIP");
        expect(result).toHaveProperty("endIP");
        expect(result).toHaveProperty("subnetMask");
        expect(result).toHaveProperty("usableIPs");
      });
    });

    describe("ipToBin & maskToBin", () => {
      it("should convert IP to binary", () => {
        expect(ipToBin("192.168.1.1", false)).toHaveLength(32);
      });

      it("should convert mask to binary", () => {
        expect(maskToBin(24, false)).toHaveLength(32);
      });
    });

    describe("isIpInCidr", () => {
      it("should check if IP is in CIDR range", () => {
        expect(isIpInCidr("192.168.1.1", "192.168.1.0/24", false)).toBe(true);
        expect(isIpInCidr("192.168.2.1", "192.168.1.0/24", false)).toBe(false);
      });
    });
  });

  describe("String Formatting", () => {
    describe("beautyStr", () => {
      it("should beautify string representation", () => {
        expect(beautyStr("test", 4)).toBe("test");
        expect(beautyStr("test_string", 4)).toBe("test_str...");
        expect(beautyStr("testString", 4)).toBe("testStri...");
      });
    });

    describe("escapeRegExp", () => {
      it("should escape special regex characters", () => {
        expect(escapeRegExp(".*+?^${}()|[]\\")).toBe(
          "\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\",
        );
      });
    });
  });

  describe("Resource Formatting", () => {
    describe("formatResourceName", () => {
      const mockIntl = {
        formatMessage: ({ defaultMessage }: any, values: any) =>
          defaultMessage.replace("{num}", values.num),
      } as IntlShape;

      it("should format resource names", () => {
        expect(formatResourceName([{ name: "test" }], mockIntl)).toBe("test");
        expect(
          formatResourceName([{ name: "test1" }, { name: "test2" }], mockIntl),
        ).toBe("2个对象");
      });
    });
  });

  describe("Number Comparison", () => {
    describe("compareBigNumbers", () => {
      it("should compare large numbers", () => {
        expect(compareBigNumbers("1000", "100")).toBe(1);
        expect(compareBigNumbers("100", "1000")).toBe(-1);
        expect(compareBigNumbers("1000", "1000")).toBe(0);
      });

      it("should handle numbers with leading zeros", () => {
        expect(compareBigNumbers("0100", "100")).toBe(0);
      });
    });
  });

  describe("Miscellaneous", () => {
    describe("isPowerOfTwo", () => {
      it("should check if number is power of two", () => {
        expect(isPowerOfTwo(1)).toBe(true);
        expect(isPowerOfTwo(2)).toBe(true);
        expect(isPowerOfTwo(4)).toBe(true);
        expect(isPowerOfTwo(3)).toBe(false);
      });
    });

    describe("formatOps", () => {
      it("should format operations per second", () => {
        expect(formatOps(1000)).toBe("1000 ops/s");
        expect(formatOps(1000000)).toBe("1000K ops/s");
      });
    });

    describe("formatPps", () => {
      it("should format packets per second", () => {
        expect(formatPps(1000)).toBe("1 Kpps");
        expect(formatPps(1000000)).toBe("1 Mpps");
        expect(formatPps(Infinity)).toBe("Infinity Gpps");
        expect(formatPps(NaN)).toBe("Invalid value. Must be a number.");
      });
    });
  });

  describe("Monitor Value Formatting", () => {
    describe("formatMonitorValue", () => {
      it("should format monitor values with units", () => {
        expect(formatMonitorValue("bytes")(1024)).toBe("1 KB/s");
        expect(formatMonitorValue("count")(1000)).toBe("1K");
        expect(formatMonitorValue("percent")(95)).toBe("95%");
        expect(formatMonitorValue("ops")(1000)).toBe("1000 ops/s");
        expect(formatMonitorValue("pps")(1000)).toBe("1 Kpps");
      });
    });
  });

  describe("Property Formatting", () => {
    describe("formatProp", () => {
      it("should format undefined", () => {
        expect(formatProp(undefined)).toBe("");
      });

      it("should format null", () => {
        expect(formatProp(null)).toBe("");
      });

      it("should format properties based on type", () => {
        expect(formatProp("true ")).toBe("true");
        expect(formatProp(" 123")).toBe("123");
        expect(formatProp(" test ")).toBe("test");
      });
    });
  });

  describe("Storage Formatting", () => {
    describe("formatStorage", () => {
      it("should format storage values with units", () => {
        expect(formatStorage(1024)).toBe("1 KB");
        expect(formatStorage(1024 * 1024)).toBe("1 MB");
        expect(formatStorage(1024 * 1024 * 1024)).toBe("1 GB");
      });

      it("should handle decimal places", () => {
        expect(formatStorage(15410, 2)).toBe("15.05 KB");
        expect(formatStorage(1536, 1)).toBe("1.5 KB");
      });

      it("should handle invalid values", () => {
        expect(formatStorage("invalid")).toBe("-");
        expect(formatStorage(undefined)).toBe("-");
        expect(formatStorage(-1024)).toBe("0 B");
      });
    });

    describe("formatStorageToObj", () => {
      it("should return object with number and unit", () => {
        expect(formatStorageToObj(1024)).toEqual({ number: 1, unit: "KB" });
        expect(formatStorageToObj(1024 * 1024)).toEqual({
          number: 1,
          unit: "MB",
        });
        expect(formatStorageToObj(1024 * 1024 * 1024)).toEqual({
          number: 1,
          unit: "GB",
        });
      });

      it("should handle custom suffix unit", () => {
        expect(formatStorageToObj(1024, 0, "iB")).toEqual({
          number: 1,
          unit: "KiB",
        });
      });

      it("should handle decimal places", () => {
        expect(formatStorageToObj(1536, 2)).toEqual({
          number: 1.5,
          unit: "KB",
        });
      });

      it("should handle invalid values", () => {
        expect(formatStorageToObj("invalid")).toEqual({
          number: "-",
          unit: "",
        });
        expect(formatStorageToObj(undefined)).toEqual({
          number: "-",
          unit: "",
        });
        expect(formatStorageToObj(-1024)).toEqual({ number: 0, unit: "B" });
      });
    });
  });

  describe("CIDR and Subnet Operations", () => {
    describe("cidrPrefix2Netmask", () => {
      it("should convert CIDR prefix to netmask", () => {
        expect(cidrPrefix2Netmask(24)).toBe("255.255.255.0");
        expect(cidrPrefix2Netmask(16)).toBe("255.255.0.0");
        expect(cidrPrefix2Netmask(8)).toBe("255.0.0.0");
        expect(cidrPrefix2Netmask(32)).toBe("255.255.255.255");
      });

      it("should handle invalid prefix values", () => {
        expect(cidrPrefix2Netmask(0)).toBe("0.0.0.0");
        expect(cidrPrefix2Netmask(-1)).toBe("-256.0.0.0");
      });
    });

    describe("subnetToCidr", () => {
      it("should convert subnet mask to CIDR notation", () => {
        expect(subnetToCidr("255.255.255.0")).toBe(24);
        expect(subnetToCidr("255.255.0.0")).toBe(16);
        expect(subnetToCidr("255.0.0.0")).toBe(8);
        expect(subnetToCidr("255.255.255.255")).toBe(32);
      });

      it("should handle non-standard subnet masks", () => {
        expect(subnetToCidr("255.255.254.0")).toBe(23);
        expect(subnetToCidr("255.255.252.0")).toBe(22);
      });
    });
  });

  describe("Time Format RFC3339", () => {
    describe("formatRFC3339", () => {
      it("should format date to RFC3339 format", () => {
        const date = new Date("2024-01-01T12:00:00Z");
        expect(formatRFC3339(date)).toBe("2024-01-01T20:00:00+08:00");
      });

      it("should handle timestamp input", () => {
        const timestamp = new Date("2024-01-01T12:00:00Z").getTime();
        expect(formatRFC3339(new Date(timestamp))).toBe(
          "2024-01-01T20:00:00+08:00",
        );
      });

      it("should format with milliseconds when specified", () => {
        const date = new Date("2024-01-01T12:00:00.123Z");
        expect(formatRFC3339(date)).toBe("2024-01-01T20:00:00+08:00");
      });
    });
  });

  describe("Bandwidth Formatting", () => {
    describe("formatBandwidth", () => {
      it("should format bandwidth values with units", () => {
        expect(formatBandwidth(999)).toBe("999 bps");
        expect(formatBandwidth(1000)).toBe("1 Kbps");
        expect(formatBandwidth(1024)).toBe("1.02 Kbps");
        expect(formatBandwidth(1024 * 1000)).toBe("1.02 Mbps");
        expect(formatBandwidth(1024 * 1000 * 1000)).toBe("1.02 Gbps");
        expect(formatBandwidth(1024 * 1000 * 1000 * 1000)).toBe("1.02 Tbps");
        expect(formatBandwidth(1024 * 1000 * 1000 * 1000 * 1000)).toBe(
          "1.02 Pbps",
        );
      });
    });

    describe("formatBandwidthToValue", () => {
      it("should format bandwidth values with units", () => {
        expect(formatBandwidthToValue("999 bps")).toBe(999);
        expect(formatBandwidthToValue("1000 bps")).toBe(1000);
        expect(formatBandwidthToValue("102 Kbps")).toBe(102 * 1000);
        expect(formatBandwidthToValue("102 Mbps")).toBe(102 * 1000 * 1000);
        expect(formatBandwidthToValue("102 Gbps")).toBe(
          102 * 1000 * 1000 * 1000,
        );
        expect(formatBandwidthToValue("102 Tbps")).toBe(
          102 * 1000 * 1000 * 1000 * 1000,
        );
        expect(formatBandwidthToValue("102 Pbps")).toBe(
          102 * 1000 * 1000 * 1000 * 1000 * 1000,
        );
      });
    });

    describe("formatValueToBandwidth", () => {
      it("should format bandwidth values with units", () => {
        expect(formatValueToBandwidth(999, "bps")).toBe("999 bps");
        expect(formatValueToBandwidth(1000, "bps")).toBe("1000 bps");
        expect(formatValueToBandwidth(1024, "Kbps")).toBe("1.02 Kbps");
        expect(formatValueToBandwidth(1024 * 1000, "Mbps")).toBe("1.02 Mbps");
        expect(formatValueToBandwidth(1024 * 1000 * 1000, "Gbps")).toBe(
          "1.02 Gbps",
        );
        expect(formatValueToBandwidth(1024 * 1000 * 1000 * 1000, "Tbps")).toBe(
          "1.02 Tbps",
        );
        expect(
          formatValueToBandwidth(1024 * 1000 * 1000 * 1000 * 1000, "Pbps"),
        ).toBe("1.02 Pbps");
      });
    });
  });
});

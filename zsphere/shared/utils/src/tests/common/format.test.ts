import { describe, it, expect } from "vitest";

import {
  formatStorage,
  formatStorageToObj,
  formatBytesToSize,
  formatTime,
  formatTimeToHMS,
  formatPercent,
  formatCount,
  formatPps,
  ipToInt,
  intToIp,
  isIpInCidr,
  ipToBin,
  maskToBin,
  secToTime,
  formatSecToPeriod,
  formatSecToPeriodMaxUnitHour,
  cidr2ipRange,
  cidrPrefix2Netmask,
  calculateCIDRRange,
  subnetToCidr,
  compareBigNumbers,
  isPowerOfTwo,
  formatRFC3339,
  parseNumber,
  escapeRegExp,
  beautyStr,
  formatProp,
} from "../../common/format";

describe("Format Utils", () => {
  describe("formatStorage", () => {
    it('should return "-" for non-numeric values', () => {
      expect(formatStorage(undefined)).toBe("-");
      expect(formatStorage("abc")).toBe("-");
    });

    it("should format 0 bytes correctly", () => {
      expect(formatStorage(0)).toBe("0 B");
    });

    it("should format negative values as 0 B", () => {
      expect(formatStorage(-100)).toBe("0 B");
    });

    it("should format bytes to KB", () => {
      expect(formatStorage(1024)).toBe("1 KB");
      expect(formatStorage(2048)).toBe("2 KB");
    });

    it("should format bytes to MB", () => {
      expect(formatStorage(1024 * 1024)).toBe("1 MB");
    });

    it("should format bytes to GB", () => {
      expect(formatStorage(1024 * 1024 * 1024)).toBe("1 GB");
    });

    it("should format bytes to TB", () => {
      expect(formatStorage(1024 * 1024 * 1024 * 1024)).toBe("1 TB");
    });

    it("should respect decimal precision", () => {
      expect(formatStorage(1536, 1)).toBe("1.5 KB");
      expect(formatStorage(1536, 2)).toBe("1.5 KB");
    });

    it("should handle string number input", () => {
      expect(formatStorage("1024")).toBe("1 KB");
    });
  });

  describe("formatStorageToObj", () => {
    it("should return object with number and unit", () => {
      const result = formatStorageToObj(1024);
      expect(result.number).toBe(1);
      expect(result.unit).toBe("KB");
    });

    it('should return "-" for invalid input', () => {
      const result = formatStorageToObj(undefined);
      expect(result.number).toBe("-");
      expect(result.unit).toBe("");
    });

    it("should support custom suffix unit", () => {
      const result = formatStorageToObj(1024, 0, "bps");
      expect(result.unit).toBe("Kbps");
    });
  });

  describe("formatBytesToSize", () => {
    it("should handle undefined/NaN input", () => {
      expect(formatBytesToSize(undefined)).toBe("0 B");
      expect(formatBytesToSize(NaN)).toBe("0 B");
    });

    it("should handle 0 bytes", () => {
      expect(formatBytesToSize(0)).toBe("0 B");
    });

    it("should format bytes correctly", () => {
      expect(formatBytesToSize(1024)).toBe("1 KB");
      expect(formatBytesToSize(1024 * 1024)).toBe("1 MB");
      expect(formatBytesToSize(1024 * 1024 * 1024)).toBe("1 GB");
    });

    it("should respect width parameter", () => {
      expect(formatBytesToSize(1536, "B", 1)).toBe("1.5 KB");
    });

    it("should handle negative values", () => {
      expect(formatBytesToSize(-100)).toBe("0 B");
    });
  });

  describe("formatTime", () => {
    it("should format timestamp to default format", () => {
      const timestamp = new Date("2024-01-15 10:30:45").getTime();
      expect(formatTime(timestamp)).toBe("2024-01-15 10:30:45");
    });

    it("should format timestamp to custom format", () => {
      const timestamp = new Date("2024-01-15 10:30:45").getTime();
      expect(formatTime(timestamp, "YYYY-MM")).toBe("2024-01");
    });

    it("should return empty string for invalid timestamp", () => {
      expect(formatTime("invalid")).toBe("");
    });
  });

  describe("formatTimeToHMS", () => {
    it("should format seconds to HH:MM:SS", () => {
      expect(formatTimeToHMS(3661)).toBe("01:01:01");
      expect(formatTimeToHMS(0)).toBe("00:00:00");
      expect(formatTimeToHMS(3600)).toBe("01:00:00");
    });

    it("should handle milliseconds unit", () => {
      expect(formatTimeToHMS(3661000, "milliseconds")).toBe("01:01:01");
    });
  });

  describe("formatPercent", () => {
    it("should format number to percentage", () => {
      expect(formatPercent(50)).toBe("50%");
      expect(formatPercent(33.333)).toBe("33.33%");
    });

    it('should return "-" for non-numeric values', () => {
      expect(formatPercent(undefined)).toBe("-");
      expect(formatPercent("abc")).toBe("-");
    });

    it("should respect decimal precision", () => {
      expect(formatPercent(33.3333, 1)).toBe("33.3%");
    });
  });

  describe("formatCount", () => {
    it("should return value as-is for values < 1000", () => {
      expect(formatCount(500)).toBe(500);
      expect(formatCount(999)).toBe(999);
    });

    it("should format values >= 1000 with K suffix", () => {
      expect(formatCount(1000)).toBe("1K");
      expect(formatCount(2500)).toBe("2.5K");
    });
  });

  describe("formatPps", () => {
    it("should format packets per second", () => {
      expect(formatPps(500)).toBe("500 pps");
      expect(formatPps(1500)).toBe("1.5 Kpps");
      expect(formatPps(1500000)).toBe("1.5 Mpps");
      expect(formatPps(1500000000)).toBe("1.5 Gpps");
    });

    it("should handle invalid values", () => {
      expect(formatPps(NaN)).toBe("Invalid value. Must be a number.");
    });
  });

  describe("ipToInt and intToIp", () => {
    it("should convert IP to integer", () => {
      expect(ipToInt("192.168.1.1")).toBe(3232235777);
      expect(ipToInt("0.0.0.0")).toBe(0);
      expect(ipToInt("255.255.255.255")).toBe(4294967295);
    });

    it("should convert integer to IP", () => {
      expect(intToIp(3232235777)).toBe("192.168.1.1");
      expect(intToIp(0)).toBe("0.0.0.0");
    });
  });

  describe("isIpInCidr", () => {
    it("should check if IPv4 is in CIDR block", () => {
      expect(isIpInCidr("192.168.1.100", "192.168.1.0/24", false)).toBe(true);
      expect(isIpInCidr("192.168.2.1", "192.168.1.0/24", false)).toBe(false);
    });

    it("should check if IPv6 is in CIDR block", () => {
      expect(
        isIpInCidr(
          "2001:db8:0000:0000:0000:0000:0000:0001",
          "2001:db8::/32",
          true,
        ),
      ).toBe(true);
    });
  });

  describe("ipToBin", () => {
    it("should convert IPv4 to binary", () => {
      expect(ipToBin("192.168.1.1", false)).toBe(
        "11000000101010000000000100000001",
      );
    });

    it("should convert IPv6 to binary", () => {
      const result = ipToBin("2001:0db8:0000:0000:0000:0000:0000:0001", true);
      expect(result.length).toBe(128);
    });
  });

  describe("maskToBin", () => {
    it("should convert IPv4 mask to binary", () => {
      expect(maskToBin(24, false)).toBe("11111111111111111111111100000000");
      expect(maskToBin(32, false)).toBe("11111111111111111111111111111111");
    });

    it("should convert IPv6 mask to binary", () => {
      const result = maskToBin(64, true);
      expect(result.length).toBe(128);
      expect(result.substring(0, 64)).toBe("1".repeat(64));
    });
  });

  describe("secToTime", () => {
    it("should convert seconds to time object", () => {
      expect(secToTime(90061)).toEqual({
        day: 1,
        hour: 1,
        minute: 1,
        second: 1,
      });
      expect(secToTime(0)).toEqual({ day: 0, hour: 0, minute: 0, second: 0 });
    });
  });

  describe("formatSecToPeriod", () => {
    it("should format seconds to period string", () => {
      const mockIntl = {
        formatMessage: (
          { id, defaultMessage }: { id: string; defaultMessage: string },
          values?: any,
        ) => {
          if (id === "{n}.day") return `${values.n} 天`;
          if (id === "{n}.hour") return `${values.n} 小时`;
          if (id === "{n}.minute") return `${values.n} 分钟`;
          if (id === "{n}.second") return `${values.n} 秒`;
          return defaultMessage;
        },
      };
      expect(formatSecToPeriod(3661, mockIntl)).toBe("1 小时 1 分钟 1 秒");
      expect(formatSecToPeriod(0, mockIntl)).toBe("0 秒");
    });
  });

  describe("formatSecToPeriodMaxUnitHour", () => {
    it("should format seconds with max unit as hour", () => {
      const mockIntl = {
        formatMessage: ({
          id,
          defaultMessage,
        }: {
          id: string;
          defaultMessage: string;
        }) => {
          if (id === "less.than.one.second") return "小于1s";
          return defaultMessage;
        },
      };
      expect(formatSecToPeriodMaxUnitHour(3661, mockIntl)).toBe("1h 1min 1s");
      expect(formatSecToPeriodMaxUnitHour(0, mockIntl)).toBe("小于1s");
    });
  });

  describe("cidr2ipRange", () => {
    it("should convert CIDR to IP range", () => {
      const result = cidr2ipRange("192.168.1.0/24");
      expect(result.start).toBe("192.168.1.2");
      expect(result.end).toBe("192.168.1.254");
    });
  });

  describe("cidrPrefix2Netmask", () => {
    it("should convert CIDR prefix to netmask", () => {
      expect(cidrPrefix2Netmask(24)).toBe("255.255.255.0");
      expect(cidrPrefix2Netmask(16)).toBe("255.255.0.0");
      expect(cidrPrefix2Netmask(8)).toBe("255.0.0.0");
    });
  });

  describe("calculateCIDRRange", () => {
    it("should calculate CIDR range details", () => {
      const result = calculateCIDRRange("192.168.1.0/24");
      expect(result.networkAddress).toBe("192.168.1.0");
      expect(result.broadcastAddress).toBe("192.168.1.255");
      expect(result.startIP).toBe("192.168.1.1");
      expect(result.endIP).toBe("192.168.1.254");
      expect(result.subnetMask).toBe("255.255.255.0");
      expect(result.usableIPs).toBe(254);
    });
  });

  describe("subnetToCidr", () => {
    it("should convert subnet mask to CIDR", () => {
      expect(subnetToCidr("255.255.255.0")).toBe(24);
      expect(subnetToCidr("255.255.0.0")).toBe(16);
      expect(subnetToCidr("255.0.0.0")).toBe(8);
    });
  });

  describe("compareBigNumbers", () => {
    it("should compare big numbers correctly", () => {
      expect(compareBigNumbers(100, 50)).toBe(1);
      expect(compareBigNumbers(50, 100)).toBe(-1);
      expect(compareBigNumbers(100, 100)).toBe(0);
    });

    it("should handle string numbers", () => {
      expect(
        compareBigNumbers("12345678901234567890", "12345678901234567891"),
      ).toBe(-1);
      expect(
        compareBigNumbers("12345678901234567891", "12345678901234567890"),
      ).toBe(1);
    });

    it("should handle leading zeros", () => {
      expect(compareBigNumbers("00100", "100")).toBe(0);
    });
  });

  describe("isPowerOfTwo", () => {
    it("should return true for powers of two", () => {
      expect(isPowerOfTwo(1)).toBe(true);
      expect(isPowerOfTwo(2)).toBe(true);
      expect(isPowerOfTwo(4)).toBe(true);
      expect(isPowerOfTwo(1024)).toBe(true);
    });

    it("should return false for non-powers of two", () => {
      expect(isPowerOfTwo(0)).toBe(false);
      expect(isPowerOfTwo(3)).toBe(false);
      expect(isPowerOfTwo(100)).toBe(false);
    });
  });

  describe("formatRFC3339", () => {
    it("should format date to RFC3339", () => {
      const date = new Date("2024-01-15T10:30:45");
      const result = formatRFC3339(date);
      expect(result).toMatch(/2024-01-15T10:30:45/);
    });
  });

  describe("parseNumber", () => {
    it("should parse number with unit", () => {
      expect(parseNumber(1, "K")).toBe(1024);
      expect(parseNumber(1, "M")).toBe(1024 * 1024);
      expect(parseNumber(1, "G")).toBe(1024 * 1024 * 1024);
    });

    it("should return 0 for 0 input", () => {
      expect(parseNumber(0, "K")).toBe(0);
    });
  });

  describe("escapeRegExp", () => {
    it("should escape special regex characters", () => {
      expect(escapeRegExp("test.*")).toBe("test\\.\\*");
      expect(escapeRegExp("a+b")).toBe("a\\+b");
    });
  });

  describe("beautyStr", () => {
    it("should truncate strings based on calculated length", () => {
      expect(beautyStr("abcdefghij", 5)).toBe("abcdefghij");
      expect(beautyStr("abcdefghijklmno", 5)).toBe("abcdefghij...");
    });

    it("should not truncate short strings", () => {
      expect(beautyStr("abc", 10)).toBe("abc");
    });

    it("should handle strings with Chinese characters", () => {
      expect(beautyStr("测试abc", 3)).toBe("测试ab...");
    });
  });

  describe("formatProp", () => {
    it("should trim and convert to string", () => {
      expect(formatProp("  test  ")).toBe("test");
      expect(formatProp(123)).toBe("123");
    });

    it("should return empty string for undefined/null", () => {
      expect(formatProp(undefined)).toBe("");
      expect(formatProp(null)).toBe("");
    });
  });
});

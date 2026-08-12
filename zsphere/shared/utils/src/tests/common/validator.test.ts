import { describe, it, expect } from "vitest";

import {
  isIP,
  isCidr,
  isPort,
  isPortExclude0,
  isPortRange,
  isValidNetMask,
  isMAC,
  isEmail,
  isPhoneNumber,
  isUrl,
  isPath,
  isSystemPath,
  isDNSDomainName,
  isPoolName,
  isValidString,
  isIn,
  isInput,
  isIpInRange,
  isValidatorIpRange,
  isHostname,
  isLegalIPRange,
  isOfferingSize,
  isUint,
  isValidStr,
  isIPV6IP,
  isIPV4,
  isIpv6InRange,
} from "../../common/validator";

describe("Validator Utils", () => {
  describe("isIP", () => {
    describe("IPv4", () => {
      it("should validate correct IPv4 addresses", () => {
        expect(isIP("192.168.1.1")).toBe(true);
        expect(isIP("0.0.0.0")).toBe(true);
        expect(isIP("255.255.255.255")).toBe(true);
        expect(isIP("10.0.0.1")).toBe(true);
      });

      it("should reject invalid IPv4 addresses", () => {
        expect(isIP("256.1.1.1")).toBe(false);
        expect(isIP("192.168.1")).toBe(false);
        expect(isIP("192.168.1.1.1")).toBe(false);
        expect(isIP("abc.def.ghi.jkl")).toBe(false);
        expect(isIP("")).toBe(false);
      });
    });

    describe("IPv6", () => {
      it("should validate correct IPv6 addresses", () => {
        expect(isIP("2001:0db8:85a3:0000:0000:8a2e:0370:7334", 6)).toBe(true);
        expect(isIP("::1", 6)).toBe(true);
        expect(isIP("fe80::1", 6)).toBe(true);
      });

      it("should reject invalid IPv6 addresses", () => {
        expect(isIP("192.168.1.1", 6)).toBe(false);
        expect(isIP("2001:0db8:85a3:0000:0000:8a2e:0370:7334:", 6)).toBe(false);
      });
    });
  });

  describe("isCidr", () => {
    describe("IPv4 CIDR", () => {
      it("should validate correct IPv4 CIDR", () => {
        expect(isCidr("192.168.1.0/24")).toBe(true);
        expect(isCidr("10.0.0.0/8")).toBe(true);
        expect(isCidr("172.16.0.0/16")).toBe(true);
        expect(isCidr("0.0.0.0/0")).toBe(true);
      });

      it("should reject invalid IPv4 CIDR", () => {
        expect(isCidr("192.168.1.0")).toBe(false);
        expect(isCidr("192.168.1.0/33")).toBe(false);
        expect(isCidr("256.1.1.0/24")).toBe(false);
      });
    });

    describe("IPv6 CIDR", () => {
      it("should validate correct IPv6 CIDR", () => {
        expect(isCidr("2001:db8::/32", 6)).toBe(true);
      });
    });
  });

  describe("isPort", () => {
    it("should validate correct port numbers", () => {
      expect(isPort("0")).toBe(true);
      expect(isPort("80")).toBe(true);
      expect(isPort("443")).toBe(true);
      expect(isPort("8080")).toBe(true);
      expect(isPort("65535")).toBe(true);
    });

    it("should reject invalid port numbers", () => {
      expect(isPort("-1")).toBe(false);
      expect(isPort("65536")).toBe(false);
      expect(isPort("abc")).toBe(false);
      expect(isPort("")).toBe(false);
    });
  });

  describe("isPortExclude0", () => {
    it("should validate ports excluding 0", () => {
      expect(isPortExclude0("1")).toBe(true);
      expect(isPortExclude0("80")).toBe(true);
      expect(isPortExclude0("65535")).toBe(true);
    });

    it("should reject 0 and invalid ports", () => {
      expect(isPortExclude0("0")).toBe(false);
      expect(isPortExclude0("65536")).toBe(false);
    });
  });

  describe("isPortRange", () => {
    it("should validate correct port ranges", () => {
      expect(isPortRange("80-443")).toBe(true);
      expect(isPortRange("1-65535")).toBe(true);
    });

    it("should reject invalid port ranges", () => {
      expect(isPortRange("443-80")).toBe(false);
      expect(isPortRange("80")).toBe(false);
      expect(isPortRange("0-80")).toBe(false);
    });

    it("should support custom connector", () => {
      expect(isPortRange("80:443", ":")).toBe(true);
    });
  });

  describe("isValidNetMask", () => {
    it("should validate correct netmasks", () => {
      expect(isValidNetMask("255.255.255.0")).toBe(true);
      expect(isValidNetMask("255.255.0.0")).toBe(true);
      expect(isValidNetMask("255.0.0.0")).toBe(true);
      expect(isValidNetMask("255.255.255.255")).toBe(true);
      expect(isValidNetMask("0.0.0.0")).toBe(true);
    });

    it("should reject invalid netmasks", () => {
      expect(isValidNetMask("255.255.255.1")).toBe(false);
      expect(isValidNetMask("192.168.1.1")).toBe(false);
      expect(isValidNetMask("abc")).toBe(false);
    });
  });

  describe("isMAC", () => {
    it("should validate correct MAC addresses", () => {
      expect(isMAC("00:11:22:33:44:55")).toBe(true);
      expect(isMAC("AA:BB:CC:DD:EE:FF")).toBe(true);
      expect(isMAC("aa:bb:cc:dd:ee:ff")).toBe(true);
    });

    it("should reject invalid MAC addresses", () => {
      expect(isMAC("00:11:22:33:44")).toBe(false);
      expect(isMAC("00-11-22-33-44-55")).toBe(false);
      expect(isMAC("")).toBe(false);
    });
  });

  describe("isEmail", () => {
    it("should validate correct email addresses", () => {
      expect(isEmail("test@example.com")).toBe(true);
      expect(isEmail("user.name@domain.co.uk")).toBe(true);
      expect(isEmail("user+tag@example.org")).toBe(true);
    });

    it("should reject invalid email addresses", () => {
      expect(isEmail("invalid")).toBe(false);
      expect(isEmail("invalid@")).toBe(false);
      expect(isEmail("@domain.com")).toBe(false);
    });
  });

  describe("isPhoneNumber", () => {
    it("should validate correct phone numbers", () => {
      expect(isPhoneNumber("13812345678")).toBe(true);
      expect(isPhoneNumber("15912345678")).toBe(true);
    });

    it("should reject invalid phone numbers", () => {
      expect(isPhoneNumber("12345678901")).toBe(false);
      expect(isPhoneNumber("1381234567")).toBe(false);
    });
  });

  describe("isUrl", () => {
    it("should validate correct URLs", () => {
      expect(isUrl("http://example.com")).toBe(true);
      expect(isUrl("https://example.com/path")).toBe(true);
      expect(isUrl("ftp://files.example.com")).toBe(true);
    });

    it("should reject invalid URLs", () => {
      expect(isUrl("example.com")).toBe(false);
      expect(isUrl("not a url")).toBe(false);
    });
  });

  describe("isPath", () => {
    it("should validate correct paths", () => {
      expect(isPath("/home/user")).toBe(true);
      expect(isPath("/var/log/app.log")).toBe(true);
    });

    it("should reject system paths", () => {
      expect(isPath("/")).toBe(false);
      expect(isPath("/dev")).toBe(false);
      expect(isPath("/proc")).toBe(false);
    });

    it("should reject invalid paths", () => {
      expect(isPath("relative/path")).toBe(false);
      expect(isPath("/.")).toBe(false);
    });
  });

  describe("isSystemPath", () => {
    it("should identify system paths", () => {
      expect(isSystemPath("/")).toBe(true);
      expect(isSystemPath("/dev")).toBe(true);
      expect(isSystemPath("/proc")).toBe(true);
      expect(isSystemPath("/sys")).toBe(true);
    });

    it("should reject non-system paths", () => {
      expect(isSystemPath("/home")).toBe(false);
      expect(isSystemPath("/var")).toBe(false);
    });
  });

  describe("isDNSDomainName", () => {
    it("should validate DNS domain names", () => {
      expect(isDNSDomainName("www.example.com")).toBe(true);
      expect(isDNSDomainName("http://www.example.com")).toBe(true);
    });

    it("should reject invalid domain names", () => {
      expect(isDNSDomainName("localhost")).toBe(false);
    });
  });

  describe("isPoolName", () => {
    it("should validate correct pool names", () => {
      expect(isPoolName("pool-1")).toBe(true);
      expect(isPoolName("my_pool")).toBe(true);
      expect(isPoolName("Pool123")).toBe(true);
    });

    it("should reject invalid pool names", () => {
      expect(isPoolName("pool name")).toBe(false);
      expect(isPoolName("pool@name")).toBe(false);
    });
  });

  describe("isValidString", () => {
    it("should validate strings within length limit", () => {
      expect(isValidString("test", 10)).toBe(true);
      expect(isValidString("中文测试", 10)).toBe(true);
    });

    it("should reject strings exceeding length limit", () => {
      expect(isValidString("this is a very long string", 10)).toBe(false);
    });
  });

  describe("isIn", () => {
    it("should check if value is in range", () => {
      expect(isIn(5, 1, 10)).toBe(true);
      expect(isIn(1, 1, 10)).toBe(true);
      expect(isIn(10, 1, 10)).toBe(true);
    });

    it("should reject values outside range", () => {
      expect(isIn(0, 1, 10)).toBe(false);
      expect(isIn(11, 1, 10)).toBe(false);
    });
  });

  describe("isInput", () => {
    it("should detect empty inputs", () => {
      expect(isInput([])).toBe(true);
      expect(isInput("")).toBe(true);
      expect(isInput(undefined)).toBe(true);
      expect(isInput(null)).toBe(true);
    });

    it("should detect non-empty inputs", () => {
      expect(isInput([1])).toBe(false);
      expect(isInput("text")).toBe(false);
      expect(isInput({})).toBe(false);
    });
  });

  describe("isIpInRange", () => {
    it("should check if IP is in range", () => {
      expect(isIpInRange("192.168.1.1", "192.168.1.254", "192.168.1.100")).toBe(
        true,
      );
      expect(isIpInRange("192.168.1.1", "192.168.1.254", "192.168.1.1")).toBe(
        true,
      );
      expect(isIpInRange("192.168.1.1", "192.168.1.254", "192.168.1.254")).toBe(
        true,
      );
    });

    it("should reject IP outside range", () => {
      expect(isIpInRange("192.168.1.1", "192.168.1.254", "192.168.2.1")).toBe(
        false,
      );
      expect(isIpInRange("192.168.1.1", "192.168.1.254", "192.168.1.0")).toBe(
        false,
      );
    });
  });

  describe("isValidatorIpRange", () => {
    it("should validate correct IP ranges", () => {
      expect(isValidatorIpRange("192.168.1.1", "192.168.1.254")).toBe(true);
      expect(isValidatorIpRange("10.0.0.1", "10.0.0.255")).toBe(true);
    });

    it("should reject invalid IP ranges", () => {
      expect(isValidatorIpRange("192.168.1.254", "192.168.1.1")).toBe(false);
      expect(isValidatorIpRange("invalid", "192.168.1.1")).toBe(false);
    });
  });

  describe("isHostname", () => {
    it("should validate correct hostnames", () => {
      expect(isHostname("www.google.com")).toBe(true);
      expect(isHostname("api.example.org")).toBe(true);
    });

    it("should reject invalid hostnames", () => {
      expect(isHostname("localhost")).toBe(false);
      expect(isHostname("-invalid.com")).toBe(false);
    });
  });

  describe("isLegalIPRange", () => {
    it("should validate legal IP ranges", () => {
      expect(isLegalIPRange("192.168.1.1-192.168.1.254")).toBe(true);
    });

    it("should reject illegal IP ranges", () => {
      expect(isLegalIPRange("192.168.1.254-192.168.1.1")).toBe(false);
      expect(isLegalIPRange("192.168.1.1")).toBe(false);
    });
  });

  describe("isOfferingSize", () => {
    it("should validate offering sizes within limit", () => {
      expect(isOfferingSize("100G")).toBe(true);
      expect(isOfferingSize("1T")).toBe(true);
      expect(isOfferingSize("1P")).toBe(true);
    });

    it("should reject sizes exceeding limit", () => {
      expect(isOfferingSize("2P")).toBe(false);
    });

    it("should handle lowercase suffixes", () => {
      expect(isOfferingSize("100k")).toBe(true);
      expect(isOfferingSize("100m")).toBe(true);
      expect(isOfferingSize("100g")).toBe(true);
      expect(isOfferingSize("100t")).toBe(true);
      expect(isOfferingSize("1p")).toBe(true);
    });

    it("should validate edge cases", () => {
      expect(isOfferingSize("1K")).toBe(true);
      expect(isOfferingSize("1M")).toBe(true);
    });
  });

  describe("isUint", () => {
    it("should validate plain unsigned integers starting from 1", () => {
      expect(isUint("1")).toBe(true);
      expect(isUint("1024")).toBe(true);
      expect(isUint("999999")).toBe(true);
    });

    it("should reject 0 and leading zeros", () => {
      expect(isUint("0")).toBe(false);
      expect(isUint("01")).toBe(false);
    });

    it("should validate integers with unit suffixes", () => {
      expect(isUint("1", "K")).toBe(true);
      expect(isUint("1", "M")).toBe(true);
      expect(isUint("1", "G")).toBe(true);
      expect(isUint("1", "T")).toBe(true);
      expect(isUint("1", "P")).toBe(true);
    });

    it("should reject negative numbers and decimals", () => {
      expect(isUint("-1")).toBe(false);
      expect(isUint("1.5")).toBe(false);
    });

    it("should reject invalid inputs", () => {
      expect(isUint("")).toBe(false);
      expect(isUint("abc")).toBe(false);
    });
  });

  describe("isValidStr", () => {
    it("should validate non-empty strings", () => {
      expect(isValidStr("test")).toBe(true);
      expect(isValidStr("a")).toBe(true);
      expect(isValidStr(" ")).toBe(true);
    });

    it("should reject empty and non-string values", () => {
      expect(isValidStr("")).toBe(false);
      expect(isValidStr()).toBe(false);
    });
  });

  describe("isIPV4", () => {
    it("should validate correct IPv4 addresses", () => {
      expect(isIPV4("192.168.1.1")).toBe(true);
      expect(isIPV4("0.0.0.0")).toBe(true);
      expect(isIPV4("255.255.255.255")).toBe(true);
      expect(isIPV4("127.0.0.1")).toBe(true);
    });

    it("should reject invalid IPv4 addresses", () => {
      expect(isIPV4("256.1.1.1")).toBe(false);
      expect(isIPV4("192.168.1")).toBe(false);
      expect(isIPV4("192.168.1.1.1")).toBe(false);
      expect(isIPV4("")).toBe(false);
    });
  });

  describe("isIPV6IP", () => {
    it("should validate correct full IPv6 addresses", () => {
      expect(isIPV6IP("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toBe(true);
      expect(isIPV6IP("2001:db8:85a3:0000:0000:8a2e:0370:7334")).toBe(true);
    });

    it("should validate IPv6 with :: compression", () => {
      expect(isIPV6IP("::1")).toBe(true);
      expect(isIPV6IP("fe80::1")).toBe(true);
      expect(isIPV6IP("2001:db8::1")).toBe(true);
      expect(isIPV6IP("2001:db8:85a3::8a2e:370:7334")).toBe(true);
    });

    it("should reject invalid IPv6 addresses", () => {
      expect(isIPV6IP("192.168.1.1")).toBe(false);
      expect(isIPV6IP("2001:0db8:85a3:0000:0000:8a2e:0370:7334:")).toBe(false);
      expect(isIPV6IP("2001:0db8:85a3::8a2e::7334")).toBe(false);
      expect(isIPV6IP("gggg::1")).toBe(false);
    });

    it("should reject empty and invalid inputs", () => {
      expect(isIPV6IP("")).toBe(false);
      expect(isIPV6IP(" ")).toBe(false);
    });
  });

  describe("isIpv6InRange", () => {
    it("should check if IPv6 is in range", () => {
      expect(isIpv6InRange("2001:db8::1", "2001:db8::10", "2001:db8::5")).toBe(
        true,
      );
      expect(isIpv6InRange("2001:db8::1", "2001:db8::10", "2001:db8::1")).toBe(
        true,
      );
      expect(isIpv6InRange("2001:db8::1", "2001:db8::10", "2001:db8::10")).toBe(
        true,
      );
    });

    it("should reject IPv6 outside range", () => {
      expect(isIpv6InRange("2001:db8::1", "2001:db8::10", "2001:db8::11")).toBe(
        false,
      );
      expect(isIpv6InRange("2001:db8::1", "2001:db8::10", "2001:db8::0")).toBe(
        false,
      );
    });
  });

  describe("Additional Edge Cases and Branch Coverage", () => {
    it("isCidr should handle boundary ranges", () => {
      expect(isCidr("0.0.0.0/0")).toBe(true);
      expect(isCidr("255.255.255.255/32")).toBe(true);
    });

    it("isPortRange should validate with various connectors", () => {
      expect(isPortRange("80:443", ":")).toBe(true);
      expect(isPortRange("1-1")).toBe(true);
      expect(isPortRange("65535-65535")).toBe(true);
    });

    it("isLegalIPRange should reject invalid IP ranges", () => {
      expect(isLegalIPRange("256.1.1.1-192.168.1.1")).toBe(false);
      expect(isLegalIPRange("192.168.1.1-256.1.1.1")).toBe(false);
    });

    it("isHostname should reject invalid formats", () => {
      expect(isHostname("example..com")).toBe(false);
      expect(isHostname(".example.com")).toBe(false);
      expect(isHostname("example.com.")).toBe(false);
    });

    it("isValidString should validate exact length boundaries", () => {
      expect(isValidString("a", 1)).toBe(true);
      expect(isValidString("ab", 1)).toBe(false);
    });

    it("isEmail should handle various invalid formats", () => {
      expect(isEmail("user@")).toBe(false);
      expect(isEmail("user @example.com")).toBe(false);
    });

    it("isPort should handle leading zeros", () => {
      expect(isPort("00")).toBe(false);
      expect(isPort("0080")).toBe(false);
    });

    it("isPhoneNumber should validate correct format", () => {
      expect(isPhoneNumber("17612345678")).toBe(true);
      expect(isPhoneNumber("18812345678")).toBe(true);
    });

    it("isUrl should validate complex URLs", () => {
      expect(isUrl("https://example.com/path?query=1")).toBe(true);
      expect(isUrl("https://example.com:8080/path")).toBe(true);
    });

    it("isPath should handle NFS paths", () => {
      expect(isPath("192.168.1.1:/export", "nfs")).toBe(true);
      expect(isPath("nfs-server.local:/data", "nfs")).toBe(true);
    });

    it("isPoolName should reject special characters", () => {
      expect(isPoolName("pool@name")).toBe(false);
      expect(isPoolName("pool.name")).toBe(false);
    });

    it("isDNSDomainName should handle URLs with protocol", () => {
      expect(isDNSDomainName("http://example.com")).toBe(true);
      expect(isDNSDomainName("https://sub.example.com")).toBe(true);
    });

    it("isValidatorIpRange should validate IPv6 ranges", () => {
      expect(isValidatorIpRange("2001:db8::1", "2001:db8::10", 6)).toBe(true);
    });

    it("isPortExclude0 should reject negative ports", () => {
      expect(isPortExclude0("-1")).toBe(false);
    });

    it("isIn should handle negative ranges", () => {
      expect(isIn(-5, -10, 0)).toBe(true);
      expect(isIn(1, -10, 0)).toBe(false);
    });

    it("isMAC should reject invalid separators", () => {
      expect(isMAC("00-11-22-33-44-55")).toBe(false);
      expect(isMAC("GG:HH:II:JJ:KK:LL")).toBe(false);
    });

    it("isValidNetMask should reject invalid masks", () => {
      expect(isValidNetMask("255.255.255.1")).toBe(false);
      expect(isValidNetMask("255.255.256.0")).toBe(false);
    });
  });
});

import { describe, it, expect } from "vitest";

import {
  isDNSDomainName,
  isSystemPath,
  isPath,
  isMAC,
  isPoolName,
  isPhoneNumber,
  isCommonPhoneNumber,
  isEmail,
  isPort,
  isIPV4IP,
  isIPV6IP,
  isIP,
  validateIPv6IPRange,
  validatorIPv4Range,
  isValidatorIpRange,
  isValidNetMask,
  isPortExclude0,
  isPortRange,
  isLegalIPRange,
  isUint,
  isOfferingSize,
  isOverInt,
  isCidr,
  isUrl,
  isValidString,
  isIn,
  isInput,
  isIpInRange,
  isIpv6InRange,
  isHostname,
} from "../../common/validator";

describe("Validator Functions", () => {
  describe("isDNSDomainName", () => {
    it("should validate DNS domain names", () => {
      expect(isDNSDomainName("example.com")).toBe(true);
      expect(isDNSDomainName("sub.example.com")).toBe(true);
      expect(isDNSDomainName("invalid")).toBe(false);
    });
  });

  describe("isSystemPath", () => {
    it("should validate system paths", () => {
      expect(isSystemPath("/dev")).toBe(true);
      expect(isSystemPath("/usr/bin")).toBe(true);
      expect(isSystemPath("/custom/path")).toBe(false);
    });
  });

  describe("isPath", () => {
    it("should validate regular paths", () => {
      expect(isPath("/valid/path")).toBe(true);
      expect(isPath("/dev")).toBe(false); // system path
      expect(isPath("/.hidden")).toBe(false);
    });

    it("should validate NFS paths", () => {
      expect(isPath("192.168.1.1:/share", "nfs")).toBe(true);
      expect(isPath("example.com:/share", "nfs")).toBe(true);
      expect(isPath("/invalid/path", "nfs")).toBe(false);
    });
  });

  describe("isMAC", () => {
    it("should validate MAC addresses", () => {
      expect(isMAC("00:11:22:33:44:55")).toBe(true);
      expect(isMAC("00:11:22:33:44")).toBe(false);
      expect(isMAC("00:11:22:33:44:GG")).toBe(false);
    });
  });

  describe("isPoolName", () => {
    it("should validate pool names", () => {
      expect(isPoolName("valid-pool")).toBe(true);
      expect(isPoolName("valid_pool123")).toBe(true);
      expect(isPoolName("invalid@pool")).toBe(false);
    });
  });

  describe("isPhoneNumber", () => {
    it("should validate Chinese phone numbers", () => {
      expect(isPhoneNumber("13812345678")).toBe(true);
      expect(isPhoneNumber("12345678")).toBe(false);
      expect(isPhoneNumber("1381234567a")).toBe(false);
    });
  });

  describe("isCommonPhoneNumber", () => {
    it("should validate common phone numbers", () => {
      expect(isCommonPhoneNumber("13812345678")).toBe(true);
      expect(isCommonPhoneNumber("+8613812345678")).toBe(true);
      expect(isCommonPhoneNumber("+86 13812345678")).toBe(true);
      expect(isCommonPhoneNumber("+1 123-445 6655")).toBe(true);
      expect(isCommonPhoneNumber("+86-13812345678")).toBe(true);
      expect(isCommonPhoneNumber("1381234567a")).toBe(false);
    });
  });

  describe("isEmail", () => {
    it("should validate email addresses", () => {
      expect(isEmail("test@example.com")).toBe(true);
      expect(isEmail("test.name@sub.example.com")).toBe(true);
      expect(isEmail("invalid-email")).toBe(false);
    });
  });

  describe("isPort", () => {
    it("should validate port numbers", () => {
      expect(isPort("80")).toBe(true);
      expect(isPort("8080")).toBe(true);
      expect(isPort("65535")).toBe(true);
      expect(isPort("65536")).toBe(false);
      expect(isPort("-1")).toBe(false);
    });
  });

  describe("IP Validation", () => {
    describe("isIPV4IP", () => {
      it("should validate IPv4 addresses", () => {
        expect(isIPV4IP("192.168.1.1")).toBe(true);
        expect(isIPV4IP("256.1.2.3")).toBe(false);
        expect(isIPV4IP("1.2.3")).toBe(false);
      });
    });

    describe("isIPV6IP", () => {
      it("should validate IPv6 addresses", () => {
        expect(isIPV6IP("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toBe(true);
        expect(isIPV6IP("2001:db8::1")).toBe(true);
        expect(isIPV6IP("256.1.2.3")).toBe(false);
      });
    });

    describe("isIP", () => {
      it("should validate IP addresses based on version", () => {
        expect(isIP("192.168.1.1", 4)).toBe(true);
        expect(isIP("2001:db8::1", 6)).toBe(true);
        expect(isIP("invalid-ip", 4)).toBe(false);
      });
    });
  });

  describe("IP Range Validation", () => {
    describe("validateIPv6IPRange", () => {
      it("should validate IPv6 ranges", () => {
        expect(validateIPv6IPRange("2001:db8::1", "2001:db8::2")).toBe(true);
        expect(validateIPv6IPRange("2001:db8::2", "2001:db8::1")).toBe(false);
      });
    });

    describe("validatorIPv4Range", () => {
      it("should validate IPv4 ranges", () => {
        expect(validatorIPv4Range("192.168.1.1", "192.168.1.2")).toBe(true);
        expect(validatorIPv4Range("192.168.1.2", "192.168.1.1")).toBe(false);
      });
    });

    describe("isValidatorIpRange", () => {
      it("should validate IP ranges based on version", () => {
        expect(isValidatorIpRange("192.168.1.1", "192.168.1.2", 4)).toBe(true);
        expect(isValidatorIpRange("2001:db8::1", "2001:db8::2", 6)).toBe(true);
      });
    });
  });

  describe("isValidNetMask", () => {
    it("should validate netmasks", () => {
      expect(isValidNetMask("255.255.255.0")).toBe(true);
      expect(isValidNetMask("255.255.255.1")).toBe(false);
    });
  });

  describe("Port Range Validation", () => {
    describe("isPortExclude0", () => {
      it("should validate ports excluding 0", () => {
        expect(isPortExclude0("80")).toBe(true);
        expect(isPortExclude0("0")).toBe(false);
      });
    });

    describe("isPortRange", () => {
      it("should validate port ranges", () => {
        expect(isPortRange("80-443")).toBe(true);
        expect(isPortRange("443-80")).toBe(false);
        expect(isPortRange("80:443", ":")).toBe(true);
      });
    });
  });

  describe("isLegalIPRange", () => {
    it("should validate IP ranges in string format", () => {
      expect(isLegalIPRange("192.168.1.1-192.168.1.10")).toBe(true);
      expect(isLegalIPRange("192.168.1.10-192.168.1.1")).toBe(false);
    });
  });

  describe("Number Validation", () => {
    describe("isUint", () => {
      it("should validate unsigned integers", () => {
        expect(isUint(123)).toBe(true);
        expect(isUint(-123)).toBe(false);
        expect(isUint("123")).toBe(true);
      });
    });

    describe("isOfferingSize", () => {
      it("should validate offering sizes", () => {
        expect(isOfferingSize("1G")).toBe(true);
        expect(isOfferingSize("1024M")).toBe(true);
        expect(isOfferingSize("2P")).toBe(false); // Exceeds max size
      });
    });

    describe("isOverInt", () => {
      it("should validate if number exceeds max safe integer", () => {
        expect(isOverInt("1G")).toBe(true);
        expect(isOverInt("9007199254740993")).toBe(false); // Exceeds max safe integer
      });
    });
  });

  describe("CIDR Validation", () => {
    it("should validate CIDR notation", () => {
      expect(isCidr("192.168.1.0/24", 4)).toBe(true);
      expect(isCidr("2001:db8::/32", 6)).toBe(true);
      expect(isCidr("192.168.1.0", 4)).toBe(false);
    });
  });

  describe("URL Validation", () => {
    it("should validate URLs", () => {
      expect(isUrl("http://example.com")).toBe(true);
      expect(isUrl("https://example.com")).toBe(true);
      expect(isUrl("invalid-url")).toBe(false);
    });

    it("should validate image URLs", () => {
      expect(isUrl("http://example.com/image.jpg", "image")).toBe(true);
      expect(isUrl("http://example.com/image with space.jpg", "image")).toBe(
        false,
      );
    });
  });

  describe("String Validation", () => {
    it("should validate strings with length limit", () => {
      expect(isValidString("test", 10)).toBe(true);
      expect(isValidString("test", 3)).toBe(false);
    });
  });

  describe("Range Validation", () => {
    it("should validate if value is in range", () => {
      expect(isIn(5, 1, 10)).toBe(true);
      expect(isIn(0, 1, 10)).toBe(false);
    });
  });

  describe("Input Validation", () => {
    it("should validate input values", () => {
      expect(isInput("")).toBe(true);
      expect(isInput([])).toBe(true);
      expect(isInput(undefined)).toBe(true);
      expect(isInput("test")).toBe(false);
    });
  });

  describe("IP Range Check", () => {
    describe("isIpInRange", () => {
      it("should check if IPv4 is in range", () => {
        expect(isIpInRange("192.168.1.1", "192.168.1.10", "192.168.1.5")).toBe(
          true,
        );
        expect(isIpInRange("192.168.1.1", "192.168.1.10", "192.168.1.11")).toBe(
          false,
        );
      });
    });

    describe("isIpv6InRange", () => {
      it("should check if IPv6 is in range", () => {
        expect(
          isIpv6InRange("2001:db8::1", "2001:db8::10", "2001:db8::5"),
        ).toBe(true);
        expect(
          isIpv6InRange("2001:db8::1", "2001:db8::10", "2001:db8::11"),
        ).toBe(false);
      });
    });
  });

  describe("Hostname Validation", () => {
    it("should validate hostnames", () => {
      expect(isHostname("example.com")).toBe(true);
      expect(isHostname("sub.example.com")).toBe(true);
      expect(isHostname("invalid@hostname")).toBe(false);
    });
  });
});

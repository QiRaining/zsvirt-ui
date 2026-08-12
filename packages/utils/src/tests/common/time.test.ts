import { describe, expect, it } from "vitest";

import { generateHourlyArray } from "../../common/time";

describe("Time Utils", () => {
  describe("generateHourlyArray", () => {
    it("should generate 24 hourly ranges with default options", () => {
      expect(generateHourlyArray()).toEqual([
        "00:00~01:00",
        "01:00~02:00",
        "02:00~03:00",
        "03:00~04:00",
        "04:00~05:00",
        "05:00~06:00",
        "06:00~07:00",
        "07:00~08:00",
        "08:00~09:00",
        "09:00~10:00",
        "10:00~11:00",
        "11:00~12:00",
        "12:00~13:00",
        "13:00~14:00",
        "14:00~15:00",
        "15:00~16:00",
        "16:00~17:00",
        "17:00~18:00",
        "18:00~19:00",
        "19:00~20:00",
        "20:00~21:00",
        "21:00~22:00",
        "22:00~23:00",
        "23:00~00:00",
      ]);
    });

    it("should keep custom interval and split symbol output shape", () => {
      const result = generateHourlyArray(2, "-");

      expect(result).toHaveLength(24);
      expect(result[0]).toBe("00:00-02:00");
      expect(result[22]).toBe("22:00-00:00");
      expect(result[23]).toBe("23:00-01:00");
    });
  });
});

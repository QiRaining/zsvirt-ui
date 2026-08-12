import { describe, it, expect } from "vitest";

import { getPeriod } from "../../common/metric";

describe("Metric Utils", () => {
  it("should return correct period for different time ranges", () => {
    expect(
      getPeriod(
        new Date("2020-07-05").getTime(),
        new Date("2021-07-06").getTime(),
      ),
    ).toBe(52704);

    expect(
      getPeriod(
        new Date("2021-05-05").getTime(),
        new Date("2021-07-05").getTime(),
      ),
    ).toBe(8064);

    expect(
      getPeriod(
        new Date("2021-06-20").getTime(),
        new Date("2021-07-05").getTime(),
      ),
    ).toBe(4464);

    expect(
      getPeriod(
        new Date("2021-06-28").getTime(),
        new Date("2021-07-05").getTime(),
      ),
    ).toBe(2016);

    expect(
      getPeriod(
        new Date("2021-07-04").getTime(),
        new Date("2021-07-05").getTime(),
      ),
    ).toBe(288);

    expect(
      getPeriod(
        new Date("2021-07-05 00:00").getTime(),
        new Date("2021-07-05 12:00").getTime(),
      ),
    ).toBe(72);

    expect(
      getPeriod(
        new Date("2021-07-05 08:00").getTime(),
        new Date("2021-07-05 09:00").getTime(),
      ),
    ).toBe(12);

    expect(
      getPeriod(
        new Date("2021-07-05").getTime(),
        new Date("2021-07-05").getTime(),
      ),
    ).toBe(3);
  });
});

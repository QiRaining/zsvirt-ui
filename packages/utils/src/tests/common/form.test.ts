import { describe, it, expect } from "vitest";

import { getModifedValues } from "../../common/form";

describe("Form Utils", () => {
  it("should detect modified values", () => {
    const initialValues = {
      name: "John",
      age: 30,
      address: "123 Street",
    };

    const currentValues = {
      name: "John",
      age: 31,
      address: "456 Avenue",
    };

    const modifiedValues = getModifedValues(initialValues, currentValues);

    expect(modifiedValues).toEqual({
      age: 31,
      address: "456 Avenue",
    });
  });

  it("should return empty object when no changes", () => {
    const values = {
      name: "John",
      age: 30,
    };

    const modifiedValues = getModifedValues(values, values);
    expect(modifiedValues).toEqual({});
  });
});

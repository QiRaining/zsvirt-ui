import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Form } from "@zstack/design";
import { useForm } from "react-hook-form";
import { afterEach, describe, expect, it } from "vitest";

import {
  InputField,
  InputNumberField,
  InputPasswordField,
  InputUnitField,
  RadioGroupField,
  SelectField,
  SwitchField,
  TextareaField,
} from "../src";

interface TestFormValues {
  ipVersion: 4 | 6;
  enabled: boolean;
  name: string;
  alias: string;
  shortCode: string;
  password: string;
  protocol: string;
  description: string;
  threshold: string;
  count: number;
  disabledCount: number;
  interval: { number?: string | number; unit?: string };
}

const renderFields = () => {
  const TestForm = () => {
    const form = useForm<TestFormValues>({
      defaultValues: {
        ipVersion: 4,
        enabled: true,
        name: "",
        alias: "",
        shortCode: "",
        password: "",
        protocol: "UDP",
        description: "",
        threshold: "",
        count: 1,
        disabledCount: 2,
        interval: { number: 1, unit: "h" },
      },
    });

    return (
      <Form {...form}>
        <RadioGroupField
          form={form}
          name="ipVersion"
          label="IP地址类型"
          options={[
            { label: "IPv4", value: 4 },
            { label: "IPv6", value: 6 },
          ]}
        />
        <SwitchField form={form} name="enabled" label="启用" />
        <InputField form={form} name="name" label="名称" />
        <InputField
          form={form}
          name="alias"
          label="别名"
          size="m"
          className="extra-class"
        />
        <InputField
          form={form}
          name="shortCode"
          label="短字段"
          className="w-20"
        />
        <InputPasswordField form={form} name="password" label="密码" />
        <SelectField
          form={form}
          name="protocol"
          label="协议"
          size="m"
          options={[
            { label: "UDP", value: "UDP" },
            { label: "TCP", value: "TCP" },
          ]}
        />
        <TextareaField
          form={form}
          name="description"
          label="简介"
          maxLength={256}
        />
        <InputNumberField
          form={form}
          name="threshold"
          label="阈值"
          step={0.0001}
          precision={4}
          valueMode="string"
        />
        <InputNumberField
          form={form}
          name="count"
          label="数量"
          min={1}
          max={3}
          variant="legacy"
        />
        <InputNumberField
          form={form}
          name="disabledCount"
          label="禁用数量"
          min={1}
          max={3}
          variant="legacy"
          disabled
        />
        <InputUnitField
          form={form}
          name="interval"
          label="间隔"
          unitList={[
            { displayName: "小时", value: "h" },
            { displayName: "天", value: "d" },
          ]}
        />
        <output data-testid="interval-value">
          {JSON.stringify(form.watch("interval"))}
        </output>
      </Form>
    );
  };

  return render(<TestForm />);
};

describe("@zstack/form fields", () => {
  afterEach(() => {
    cleanup();
  });

  it("keeps radio and switch rows aligned to the old 32px form row", () => {
    renderFields();

    const radioLabel = screen.getByText("IP地址类型").closest("label");
    const radioRow = radioLabel?.parentElement;
    const switchLabel = screen.getByText("启用").closest("label");
    const switchRow = switchLabel?.parentElement;

    expect(radioRow?.className).toContain("min-h-8");
    expect(radioLabel?.className).toContain("h-8");
    expect(screen.getByRole("radiogroup").className).toContain("min-h-8");
    expect(switchRow?.className).toContain("min-h-8");
    expect(switchLabel?.className).toContain("h-8");
    expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe(
      "true",
    );
  });

  it("maps input field sizes to old ZStack widths", () => {
    renderFields();

    expect(screen.getByTestId("field-input-name").className).toContain(
      "w-[320px]",
    );
    expect(screen.getByTestId("field-input-alias").className).toContain(
      "w-[320px]",
    );
    expect(screen.getByTestId("field-input-alias").className).toContain(
      "extra-class",
    );
    expect(screen.getByTestId("field-input-alias").className).not.toContain(
      "w-80",
    );
    expect(screen.getByTestId("field-input-shortCode").className).toContain(
      "w-20",
    );
    expect(screen.getByTestId("field-input-shortCode").className).not.toContain(
      "w-[320px]",
    );
    expect(screen.getByTestId("field-password-password").className).toContain(
      "w-[320px]",
    );
    expect(screen.getByTestId("field-select-protocol")).toHaveStyle({
      width: "320px",
    });
  });

  it("shows textarea count on a separate line without blocking over-limit input", () => {
    renderFields();

    const textarea = screen.getByTestId(
      "field-textarea-description",
    ) as HTMLTextAreaElement;
    const overLimitValue = "a".repeat(300);

    expect(screen.getByText("0/256").className).toContain("justify-start");

    fireEvent.change(textarea, { target: { value: overLimitValue } });

    expect(textarea.value).toHaveLength(300);
    expect(screen.getByText("300/256")).toBeInTheDocument();
  });

  it("keeps text-preserving number input step and raw text behavior", () => {
    renderFields();

    const input = screen.getByTestId(
      "field-input-number-threshold",
    ) as HTMLInputElement;

    fireEvent.click(screen.getAllByLabelText("decrease")[0]);
    expect(input.value).toBe("-0.0001");

    fireEvent.change(input, { target: { value: "0.0" } });
    expect(input.value).toBe("0.0");
  });

  it("renders legacy input number with horizontal decrease and increase buttons", () => {
    renderFields();

    const input = screen.getByTestId(
      "field-input-number-count",
    ) as HTMLInputElement;
    const decreaseButtons = screen.getAllByLabelText("decrease");
    const increaseButtons = screen.getAllByLabelText("increase");
    const legacyDecrease = decreaseButtons[1];
    const legacyIncrease = increaseButtons[1];

    expect(input.value).toBe("1");
    expect(input.className).toContain("text-center");
    expect(legacyDecrease).toBeDisabled();

    fireEvent.click(legacyIncrease);
    expect(input.value).toBe("2");

    fireEvent.click(legacyIncrease);
    expect(input.value).toBe("3");
    expect(legacyIncrease).toBeDisabled();

    fireEvent.click(legacyDecrease);
    expect(input.value).toBe("2");

    fireEvent.change(input, { target: { value: "" } });
    expect(input.value).toBe("");

    fireEvent.click(legacyIncrease);
    expect(input.value).toBe("1");

    fireEvent.change(input, { target: { value: "abc" } });
    expect(input.value).toBe("1");
  });

  it("keeps disabled legacy input number read-only including step buttons", () => {
    renderFields();

    const input = screen.getByTestId(
      "field-input-number-disabledCount",
    ) as HTMLInputElement;
    const decreaseButtons = screen.getAllByLabelText("decrease");
    const increaseButtons = screen.getAllByLabelText("increase");
    const disabledDecrease = decreaseButtons[2];
    const disabledIncrease = increaseButtons[2];

    expect(input.value).toBe("2");
    expect(input).toBeDisabled();
    expect(disabledDecrease).toBeDisabled();
    expect(disabledIncrease).toBeDisabled();

    fireEvent.click(disabledIncrease);
    expect(input.value).toBe("2");
  });

  it("keeps input unit text and unit selector behavior", () => {
    renderFields();

    const input = screen.getByTestId(
      "field-input-unit-interval",
    ) as HTMLInputElement;

    expect(input.value).toBe("1");

    fireEvent.click(screen.getAllByLabelText("increase")[3]);
    expect(input.value).toBe("2");
    expect(screen.getByTestId("interval-value").textContent).toBe(
      JSON.stringify({ number: "2", unit: "h" }),
    );

    fireEvent.change(input, { target: { value: "0.0" } });
    expect(input.value).toBe("0.0");
    expect(screen.getByTestId("interval-value").textContent).toBe(
      JSON.stringify({ number: "0.0", unit: "h" }),
    );
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

interface EmptyMockProps {
  children?: React.ReactNode;
  className?: string;
  description?: React.ReactNode;
  image?: React.ReactNode;
}

const emptyMocks = vi.hoisted(() => ({
  latestProps: null as EmptyMockProps | null,
}));

vi.mock("@zstack/icon", () => ({
  IconCloudUpload: () => null,
}));

vi.mock("@zstack/zsphere-design-biz", () => ({
  Empty: (props: EmptyMockProps) => {
    emptyMocks.latestProps = props;
    return (
      <div>
        {props.image}
        <div>{props.description}</div>
        {props.children}
      </div>
    );
  },
}));

import VddkRequired from "./vddk-required";

describe("VddkRequired", () => {
  it("uses the ZSV Empty component and a dedicated image for the missing state", () => {
    render(
      <IntlProvider locale="zh-CN" onError={vi.fn()}>
        <VddkRequired state="missing" onRetry={vi.fn()} onUpload={vi.fn()} />
      </IntlProvider>,
    );

    expect(emptyMocks.latestProps?.className).toContain("h-full");
    expect(emptyMocks.latestProps?.description).toBeTruthy();
    expect(screen.getByRole("img", { name: "VDDK" })).toBeTruthy();
    expect(screen.getByText("Go to Upload")).toBeTruthy();
  });

  it("keeps the query error state distinct from the missing-package image", () => {
    render(
      <IntlProvider locale="zh-CN" onError={vi.fn()}>
        <VddkRequired state="error" onRetry={vi.fn()} onUpload={vi.fn()} />
      </IntlProvider>,
    );

    expect(emptyMocks.latestProps?.description).toBeTruthy();
    expect(screen.queryByRole("img", { name: "VDDK" })).toBeNull();
    expect(screen.getByText("Retry")).toBeTruthy();
  });

  it("guides users to the migration service upload dialog", () => {
    const onUpload = vi.fn();
    render(
      <IntlProvider locale="zh-CN" onError={vi.fn()}>
        <VddkRequired state="missing" onRetry={vi.fn()} onUpload={onUpload} />
      </IntlProvider>,
    );

    expect(screen.getByText(/VDDK is missing or unavailable/)).toBeTruthy();
    fireEvent.click(screen.getByText("Go to Upload"));
    expect(onUpload).toHaveBeenCalledTimes(1);
  });

  it("offers retry when the status query fails", () => {
    const onRetry = vi.fn();
    render(
      <IntlProvider locale="zh-CN" onError={vi.fn()}>
        <VddkRequired state="error" onRetry={onRetry} onUpload={vi.fn()} />
      </IntlProvider>,
    );

    fireEvent.click(screen.getByText("Retry"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

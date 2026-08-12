import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

interface GuideAction {
  text: React.ReactNode;
  onClick?: () => void;
}

interface AlertMockProps {
  children: React.ReactNode;
  className?: string;
  closable?: boolean;
  guideAction?: GuideAction;
  variant?: string;
}

const alertMocks = vi.hoisted(() => ({
  latestProps: null as AlertMockProps | null,
}));

vi.mock("@zstack/zsphere-design-biz", () => ({
  Alert: (props: AlertMockProps) => {
    alertMocks.latestProps = props;
    return (
      <div>
        {props.children}
        {props.guideAction && (
          <button type="button" onClick={props.guideAction.onClick}>
            {props.guideAction.text}
          </button>
        )}
      </div>
    );
  },
}));

import VddkWarningBanner from "./warning-banner";

const renderBanner = (props: {
  onUpload?: () => void;
  uploadDisabled?: boolean;
}) =>
  render(
    <IntlProvider locale="zh-CN" onError={vi.fn()}>
      <VddkWarningBanner {...props} />
    </IntlProvider>,
  );

describe("VddkWarningBanner", () => {
  beforeEach(() => {
    alertMocks.latestProps = null;
  });

  it("keeps the upload action in the banner title row", () => {
    const onUpload = vi.fn();

    renderBanner({ onUpload });

    expect(alertMocks.latestProps).toMatchObject({
      className: "mb-3",
      closable: true,
      variant: "warning",
    });
    expect(alertMocks.latestProps?.guideAction).toBeUndefined();

    const titleRow = screen.getByTestId("vddk-banner-title-row");
    const uploadButton = screen.getByRole("button", { name: "Go to Upload" });

    expect(titleRow.contains(uploadButton)).toBe(true);
    expect(titleRow.textContent).not.toContain("Recommended version");
    expect(screen.getByText(/VMware licensing requires/)).toBeTruthy();
    expect(
      screen.getByText(
        "Recommended version: VMware Virtual Disk Development Kit (VDDK) 8.0.3 for Linux.",
      ),
    ).toBeTruthy();
    expect(screen.getByText("Go to Download")).toBeTruthy();

    fireEvent.click(uploadButton);
    expect(onUpload).toHaveBeenCalledTimes(1);
  });

  it("removes the clickable upload guide while upload is busy", () => {
    renderBanner({ onUpload: vi.fn(), uploadDisabled: true });

    expect(alertMocks.latestProps?.guideAction).toBeUndefined();
    expect(screen.queryByText("Go to Upload")).toBeNull();
  });
});

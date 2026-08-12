import { render, screen } from "@testing-library/react";
import React from "react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import type { MigrationServiceInfo } from "../types";

vi.mock("@zstack/hooks", () => ({
  useTime: () => ({
    getServerTime: () => ({ format: () => "-" }),
  }),
}));

vi.mock("@zstack/zsphere-components", () => ({
  DraggableCard: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  List: ({
    list,
  }: {
    list: Array<{ label: React.ReactNode; value: React.ReactNode }>;
  }) => (
    <div>
      {list.map((item, index) => (
        <div key={index}>
          <span>{item.label}</span>
          <span>{item.value}</span>
        </div>
      ))}
    </div>
  ),
  Spin: () => null,
  State: ({ name }: { name: React.ReactNode }) => <span>{name}</span>,
}));

import BasicInfoCard from "./basic-info-card";

const createServiceInfo = (
  vddkUploaded: boolean | undefined,
): MigrationServiceInfo =>
  ({
    gatewayCount: 2,
    platformCount: 0,
    startTime: "",
    status: "Running",
    taskCount: 0,
    uuid: "migration-service",
    vddkUploaded,
    version: "10.1.124.10",
  }) satisfies MigrationServiceInfo;

const renderCard = (vddkUploaded?: boolean) =>
  render(
    <IntlProvider locale="zh-CN" onError={vi.fn()}>
      <BasicInfoCard
        serviceInfo={createServiceInfo(vddkUploaded)}
        onUploadVddk={vi.fn()}
      />
    </IntlProvider>,
  );

describe("BasicInfoCard", () => {
  it("separates the missing status from its inline upload action", () => {
    renderCard(false);

    const uploadButton = screen.getByRole("button", { name: "Go to Upload" });

    expect(screen.getByText("Not Uploaded")).toBeTruthy();
    const divider = screen.getByTestId("vddk-action-divider");
    expect(divider.style.width).toBe("1px");
    expect(divider.style.height).toBe("14px");
    expect(uploadButton.className).toContain("h-min");
    expect(uploadButton.className).not.toContain("h-8");
    expect(uploadButton.className).not.toContain("px-3");
  });

  it("renders the uploaded status without another upload action", () => {
    renderCard(true);

    expect(screen.getByText("Uploaded")).toBeTruthy();
    expect(screen.queryByTestId("vddk-action-divider")).toBeNull();
    expect(screen.queryByRole("button", { name: "Reupload" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Go to Upload" })).toBeNull();
  });

  it("does not render an action separator for an unknown VDDK status", () => {
    renderCard();

    expect(screen.getByText("Unknown")).toBeTruthy();
    expect(screen.queryByTestId("vddk-action-divider")).toBeNull();
    expect(screen.queryByRole("button", { name: "Go to Upload" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Reupload" })).toBeNull();
  });
});

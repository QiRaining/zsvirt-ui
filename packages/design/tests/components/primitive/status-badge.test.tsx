import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { StatusBadge } from "../../../src/components/primitive/status-badge";

describe("StatusBadge", () => {
  it("renders with default neutral status", () => {
    render(<StatusBadge>测试徽标</StatusBadge>);
    const badge = screen.getByText("测试徽标");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-neutral-1000");
  });

  it("renders with pending status", () => {
    render(<StatusBadge status="pending">队列中</StatusBadge>);
    const badge = screen.getByText("队列中");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-purple-500");
  });

  it("renders with inprogress status", () => {
    render(<StatusBadge status="inprogress">进行中</StatusBadge>);
    const badge = screen.getByText("进行中");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-blue-500");
  });

  it("renders with positive status", () => {
    render(<StatusBadge status="positive">成功</StatusBadge>);
    const badge = screen.getByText("成功");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-positive-500");
  });

  it("renders with danger status", () => {
    render(<StatusBadge status="danger">失败</StatusBadge>);
    const badge = screen.getByText("失败");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-danger-500");
  });

  it("renders with alert status", () => {
    render(<StatusBadge status="alert">警告</StatusBadge>);
    const badge = screen.getByText("警告");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-alert-500");
  });

  it("renders with neutral status", () => {
    render(<StatusBadge status="neutral">停止</StatusBadge>);
    const badge = screen.getByText("停止");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-neutral-1000");
  });

  it("applies custom className", () => {
    render(
      <StatusBadge className="custom-class" status="positive">
        自定义
      </StatusBadge>,
    );
    const badge = screen.getByText("自定义");
    expect(badge).toHaveClass("custom-class");
    expect(badge).toHaveClass("bg-positive-500");
  });

  it("renders with children content", () => {
    render(
      <StatusBadge status="positive">
        <span>复杂内容</span>
      </StatusBadge>,
    );
    expect(screen.getByText("复杂内容")).toBeInTheDocument();
  });

  it("has correct base styles", () => {
    render(<StatusBadge status="positive">测试</StatusBadge>);
    const badge = screen.getByText("测试");
    expect(badge).toHaveClass("text-xs");
    expect(badge).toHaveClass("font-medium");
    expect(badge).toHaveClass("text-neutral-0");
    expect(badge).toHaveClass("px-2");
    expect(badge).toHaveClass("rounded-[2px]");
  });
});

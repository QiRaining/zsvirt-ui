import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { Spin } from "../../../src/components/primitive/spin";

describe("Spin Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders correctly when spinning", () => {
    const { container } = render(<Spin spinning={true} />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("does not render when spinning is false", () => {
    const { container } = render(<Spin spinning={false} />);
    expect(container.querySelector(".animate-spin")).not.toBeInTheDocument();
  });

  it("renders with custom indicator", () => {
    const customIndicator = <div data-testid="custom-indicator">Custom</div>;
    render(<Spin spinning={true} indicator={customIndicator} />);
    expect(screen.getByTestId("custom-indicator")).toBeInTheDocument();
  });

  it("renders with tip text", () => {
    render(<Spin spinning={true} tip="Loading..." />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders with different sizes", () => {
    const { container: smallContainer } = render(
      <Spin spinning={true} size="small" />,
    );
    expect(smallContainer.querySelector(".w-4")).toBeInTheDocument();

    const { container: mediumContainer } = render(
      <Spin spinning={true} size="medium" />,
    );
    expect(mediumContainer.querySelector(".w-6")).toBeInTheDocument();

    const { container: largeContainer } = render(
      <Spin spinning={true} size="large" />,
    );
    expect(largeContainer.querySelector(".w-8")).toBeInTheDocument();
  });

  it("wraps children content", () => {
    render(
      <Spin spinning={true}>
        <div data-testid="child-content">Content</div>
      </Spin>,
    );
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  it("respects delay prop", async () => {
    const { container } = render(<Spin spinning={true} delay={500} />);

    // Initially should not render
    expect(container.querySelector(".animate-spin")).not.toBeInTheDocument();

    // Fast-forward time
    vi.advanceTimersByTime(500);

    // Should render after delay
    await waitFor(() => {
      expect(container.querySelector(".animate-spin")).toBeInTheDocument();
    });
  });

  it("renders fullscreen mode", () => {
    const { container } = render(<Spin spinning={true} fullscreen={true} />);
    expect(container.querySelector(".fixed.inset-0")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <Spin spinning={true} className="custom-class" />,
    );
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("applies blur effect to children when spinning", () => {
    const { container } = render(
      <Spin spinning={true}>
        <div data-testid="child">Content</div>
      </Spin>,
    );
    const childWrapper = container.querySelector(".opacity-40");
    expect(childWrapper).toBeInTheDocument();
  });

  it("does not apply blur effect when not spinning", () => {
    const { container } = render(
      <Spin spinning={false}>
        <div data-testid="child">Content</div>
      </Spin>,
    );
    const childWrapper = container.querySelector(".opacity-100");
    expect(childWrapper).toBeInTheDocument();
  });
});

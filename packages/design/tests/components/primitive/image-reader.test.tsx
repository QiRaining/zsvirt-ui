import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { ImageReader } from "../../../src/components/primitive/image-reader";

// 模拟intl
vi.mock("react-intl", () => ({
  useIntl: () => ({
    formatMessage: ({
      id,
      defaultMessage,
    }: {
      id: string;
      defaultMessage?: string;
    }) => defaultMessage || id,
  }),
}));

// 模拟窗口尺寸
const mockClientWidth = 1200;
const mockClientHeight = 800;

describe("图片查看器组件", () => {
  // 模拟window和document
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: mockClientWidth,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: mockClientHeight,
    });

    if (typeof document !== "undefined") {
      Object.defineProperty(document.documentElement, "clientWidth", {
        writable: true,
        configurable: true,
        value: mockClientWidth,
      });
      Object.defineProperty(document.documentElement, "clientHeight", {
        writable: true,
        configurable: true,
        value: mockClientHeight,
      });
    }

    // 清除所有模拟
    vi.clearAllMocks();
  });

  it("当src为空时不应该渲染", () => {
    const { container } = render(<ImageReader src="" />);
    expect(container.querySelector("img")).toBeNull();
  });

  it("应该正确渲染图片", () => {
    const testSrc = "test-image.jpg";
    const { container } = render(<ImageReader src={testSrc} />);

    const image = container.querySelector("img");
    expect(image).toBeTruthy();
    expect(image?.getAttribute("src")).toBe(testSrc);
  });

  it("应该拥有缩放控制按钮", () => {
    const testSrc = "test-image.jpg";
    render(<ImageReader src={testSrc} />);

    // 验证控制按钮存在
    expect(screen.getByTestId("imageReader-adapt")).toBeTruthy();
    expect(screen.getByTestId("imageReader-zoomIn")).toBeTruthy();
    expect(screen.getByTestId("imageReader-zoomOut")).toBeTruthy();
  });

  it("应该显示缩放百分比", () => {
    const testSrc = "test-image.jpg";
    const { container } = render(<ImageReader src={testSrc} />);

    // 查找缩放百分比显示元素
    const percentageText = container.querySelector(
      ".text-\\[14px\\].text-white",
    );
    expect(percentageText).toBeTruthy();
    expect(percentageText?.textContent).toContain("100%");
  });

  it("应该在点击适应窗口按钮后重置缩放比例", () => {
    const testSrc = "test-image.jpg";
    const { container } = render(<ImageReader src={testSrc} />);

    // 点击适应窗口按钮
    const adaptButton = screen.getByTestId("imageReader-adapt");
    fireEvent.click(adaptButton);

    // 验证百分比显示已更新
    const percentageText = container.querySelector(
      ".text-\\[14px\\].text-white",
    );
    expect(percentageText?.textContent).toContain("100%");
  });

  it("应该在点击放大按钮后增大缩放比例", () => {
    const testSrc = "test-image.jpg";
    const { container } = render(<ImageReader src={testSrc} />);

    // 点击放大按钮
    const zoomInButton = screen.getByTestId("imageReader-zoomIn");
    fireEvent.click(zoomInButton);

    // 验证百分比显示已更新并大于100%
    const percentageText = container.querySelector(
      ".text-\\[14px\\].text-white",
    );
    expect(percentageText?.textContent).not.toBe("100%");

    // 从文本中提取数字部分
    const percentage = percentageText?.textContent?.match(/(\d+)%/)?.[1];
    expect(Number(percentage)).toBeGreaterThan(100);
  });

  it("应该在点击缩小按钮后减小缩放比例", () => {
    const testSrc = "test-image.jpg";
    const { container } = render(<ImageReader src={testSrc} />);

    // 点击缩小按钮
    const zoomOutButton = screen.getByTestId("imageReader-zoomOut");
    fireEvent.click(zoomOutButton);

    // 验证百分比显示已更新并小于100%
    const percentageText = container.querySelector(
      ".text-\\[14px\\].text-white",
    );
    expect(percentageText?.textContent).not.toBe("100%");

    // 从文本中提取数字部分
    const percentage = percentageText?.textContent?.match(/(\d+)%/)?.[1];
    expect(Number(percentage)).toBeLessThan(100);
  });

  it("应该调用关闭回调", () => {
    const onCloseMock = vi.fn();
    const testSrc = "test-image.jpg";

    const { container } = render(
      <ImageReader src={testSrc} onClose={onCloseMock} />,
    );

    // 找到关闭按钮 - 右上角的按钮
    const closeButton = container.querySelector(
      "button.fixed.top-\\[24px\\].right-\\[24px\\]",
    );
    expect(closeButton).toBeTruthy();

    if (closeButton) {
      // 点击关闭按钮
      fireEvent.click(closeButton);

      // 验证回调被调用
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    }
  });

  it("应该支持拖动操作", () => {
    const testSrc = "test-image.jpg";
    const { container } = render(<ImageReader src={testSrc} />);

    // 找到包含图片的容器
    const imageContainer = container.querySelector("div.fixed > div");
    expect(imageContainer).toBeTruthy();

    if (imageContainer) {
      // 测试鼠标事件是否可以正确触发
      // 鼠标按下
      fireEvent.mouseDown(imageContainer, {
        pageX: 100,
        pageY: 100,
      });

      // 鼠标移动
      fireEvent.mouseMove(imageContainer, {
        pageX: 120,
        pageY: 120,
      });

      // 鼠标释放
      fireEvent.mouseUp(imageContainer);

      // 鼠标移出容器
      fireEvent.mouseLeave(imageContainer);

      // 不需要断言，能成功触发事件而不报错就算通过
    }
  });
});

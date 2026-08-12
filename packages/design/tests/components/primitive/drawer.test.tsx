import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// 模拟依赖
vi.mock("@radix-ui/react-dialog", () => ({
  Root: ({ children, open, modal }) => (
    <div data-testid="mock-dialog-root" data-open={open} data-modal={modal}>
      {children}
    </div>
  ),
  Trigger: ({ children }) => (
    <div data-testid="mock-dialog-trigger">{children}</div>
  ),
  Portal: ({ children }) => (
    <div data-testid="mock-dialog-portal">{children}</div>
  ),
  Content: ({ children, className, onClick }) => (
    <div
      data-testid="mock-dialog-content"
      className={className}
      onClick={onClick}
    >
      {children}
    </div>
  ),
  Overlay: ({ className }) => (
    <div data-testid="mock-dialog-overlay" className={className}></div>
  ),
}));

// 模拟 @zstack/utils
vi.mock("@zstack/utils", () => ({
  cn: (...inputs) => inputs.filter(Boolean).join(" "),
}));

// 模拟图标
vi.mock("@zstack/icon", () => ({
  Icon: ({ className, onClick }) => (
    <button
      data-testid="mock-icon-close"
      className={className}
      onClick={onClick}
    >
      关闭
    </button>
  ),
  IconClose: ({ className, onClick }) => (
    <button
      data-testid="mock-icon-close"
      className={className}
      onClick={onClick}
    >
      关闭
    </button>
  ),
}));

// 导入被测试的组件
import {
  Drawer,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from "../../../src/components/primitive/drawer";

describe("Drawer 组件", () => {
  const setOpenMock = vi.fn();

  beforeEach(() => {
    setOpenMock.mockClear();
  });

  it("应正确渲染 Drawer 组件", () => {
    render(
      <Drawer open={true} setOpen={setOpenMock}>
        测试内容
      </Drawer>,
    );

    expect(screen.getByTestId("mock-dialog-root")).toBeDefined();
    expect(screen.getByTestId("mock-dialog-portal")).toBeDefined();
    expect(screen.getByTestId("mock-dialog-content")).toBeDefined();
    expect(screen.getByText("测试内容")).toBeDefined();
  });

  it("应根据 open 属性控制显示状态", () => {
    const { rerender } = render(
      <Drawer open={true} setOpen={setOpenMock}>
        测试内容
      </Drawer>,
    );

    expect(
      screen.getByTestId("mock-dialog-root").getAttribute("data-open"),
    ).toBe("true");

    rerender(
      <Drawer open={false} setOpen={setOpenMock}>
        测试内容
      </Drawer>,
    );

    expect(
      screen.getByTestId("mock-dialog-root").getAttribute("data-open"),
    ).toBe("false");
  });

  it("点击背景遮罩应调用 setOpen", () => {
    render(
      <Drawer open={true} setOpen={setOpenMock}>
        测试内容
      </Drawer>,
    );

    const overlay = screen.getByText("测试内容").parentElement?.previousSibling;
    if (overlay) {
      fireEvent.click(overlay);
      expect(setOpenMock).toHaveBeenCalledWith(false);
    }
  });

  it("应根据 placement 属性正确应用样式", () => {
    const { rerender } = render(
      <Drawer open={true} setOpen={setOpenMock} placement="right">
        测试内容
      </Drawer>,
    );

    let content = screen.getByTestId("mock-dialog-content");
    expect(content.className).toContain("right-0");

    rerender(
      <Drawer open={true} setOpen={setOpenMock} placement="left">
        测试内容
      </Drawer>,
    );

    content = screen.getByTestId("mock-dialog-content");
    expect(content.className).toContain("left-0");

    rerender(
      <Drawer open={true} setOpen={setOpenMock} placement="top">
        测试内容
      </Drawer>,
    );

    content = screen.getByTestId("mock-dialog-content");
    expect(content.className).toContain("top-0");
  });

  it("应根据 zIndex 属性设置正确的层级", () => {
    render(
      <Drawer open={true} setOpen={setOpenMock} zIndex={100}>
        测试内容
      </Drawer>,
    );

    const overlay = screen.getByText("测试内容").parentElement?.previousSibling;
    if (overlay) {
      const overlayElement = overlay as HTMLElement;
      expect(overlayElement.style.zIndex).toBe("100");
    }
  });

  it("点击 Drawer 内容不应冒泡关闭", () => {
    render(
      <Drawer open={true} setOpen={setOpenMock}>
        测试内容
      </Drawer>,
    );

    fireEvent.click(screen.getByTestId("mock-dialog-content"));
    expect(setOpenMock).not.toHaveBeenCalled();
  });

  it("应正确渲染 DrawerHeader 组件", () => {
    render(
      <Drawer open={true} setOpen={setOpenMock}>
        <DrawerHeader>标题内容</DrawerHeader>
      </Drawer>,
    );

    expect(screen.getByText("标题内容")).toBeDefined();
    expect(screen.getByTestId("mock-icon-close")).toBeDefined();
  });

  it("点击 DrawerHeader 中的关闭按钮应调用 setOpen", () => {
    render(
      <Drawer open={true} setOpen={setOpenMock}>
        <DrawerHeader>标题内容</DrawerHeader>
      </Drawer>,
    );

    fireEvent.click(screen.getByTestId("mock-icon-close"));
    expect(setOpenMock).toHaveBeenCalledWith(false);
  });

  it("应正确渲染 DrawerBody 组件", () => {
    render(
      <Drawer open={true} setOpen={setOpenMock}>
        <DrawerBody>内容区域</DrawerBody>
      </Drawer>,
    );

    const body = screen.getByText("内容区域");
    expect(body).toBeDefined();
    expect(body.className).toContain("flex overflow-auto");
  });

  it("应正确渲染 DrawerFooter 组件", () => {
    render(
      <Drawer open={true} setOpen={setOpenMock}>
        <DrawerFooter>底部内容</DrawerFooter>
      </Drawer>,
    );

    const footer = screen.getByText("底部内容");
    expect(footer).toBeDefined();
    expect(footer.className).toContain("border-t-1");
  });

  it("应支持自定义类名", () => {
    render(
      <Drawer open={true} setOpen={setOpenMock} className="custom-drawer">
        <DrawerHeader className="custom-header">标题</DrawerHeader>
        <DrawerBody className="custom-body">内容</DrawerBody>
        <DrawerFooter className="custom-footer">底部</DrawerFooter>
      </Drawer>,
    );

    expect(screen.getByTestId("mock-dialog-content").className).toContain(
      "custom-drawer",
    );
    expect(screen.getByText("标题").className).toContain("custom-header");
    expect(screen.getByText("内容").className).toContain("custom-body");
    expect(screen.getByText("底部").className).toContain("custom-footer");
  });
});

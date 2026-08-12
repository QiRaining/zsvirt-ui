import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi } from "vitest";

interface MockDialogContentProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onInteractOutside?: (event: { preventDefault: () => void }) => void;
  style?: React.CSSProperties;
}

const dialogMockState = vi.hoisted(
  (): { contentProps?: MockDialogContentProps } => ({
    contentProps: undefined,
  }),
);

// 模拟依赖
vi.mock("@radix-ui/react-dialog", () => ({
  Root: ({ children, modal, ...props }) => (
    <div data-testid="mock-dialog-root" data-modal={modal} {...props}>
      {children}
    </div>
  ),
  Trigger: ({ children }) => (
    <div data-testid="mock-dialog-trigger">{children}</div>
  ),
  Portal: ({ children }) => (
    <div data-testid="mock-dialog-portal">{children}</div>
  ),
  Content: (props: MockDialogContentProps) => {
    const { children, className, onClick, style } = props;
    dialogMockState.contentProps = props;
    return (
      <div
        role="presentation"
        data-testid="mock-dialog-content"
        className={className}
        onClick={onClick}
        onKeyDown={(event) => event.stopPropagation()}
        style={style}
      >
        {children}
      </div>
    );
  },
  Overlay: ({ className, style }) => (
    <div
      data-testid="mock-dialog-overlay"
      className={className}
      style={style}
    />
  ),
  Title: ({ children, className }) => (
    <div data-testid="mock-dialog-title" className={className}>
      {children}
    </div>
  ),
  Description: ({ children, className }) => (
    <div data-testid="mock-dialog-description" className={className}>
      {children}
    </div>
  ),
  Close: ({ children }) => (
    <button type="button" data-testid="mock-dialog-close">
      {children}
    </button>
  ),
}));

// 模拟 @zstack/utils
vi.mock("@zstack/utils", () => ({
  cn: (...inputs) => inputs.filter(Boolean).join(" "),
}));

// 模拟图标
vi.mock("@zstack/icon", () => ({
  Icon: ({ type, className }) => {
    if (type === "alert-triangle-fill") {
      return (
        <div
          data-testid="mock-icon-alert-triangle"
          className={className}
          data-type={type}
        >
          警告图标
        </div>
      );
    }
    if (type === "info-fill") {
      return (
        <div data-testid="mock-icon-info" className={className} data-type={type}>
          信息图标
        </div>
      );
    }
    return <div data-testid="mock-icon-close" className={className} />;
  },
  IconAlertTriangleFill: ({ className, type }) => (
    <div
      data-testid="mock-icon-alert-triangle"
      className={className}
      data-type={type}
    >
      警告图标
    </div>
  ),
  IconInfoFill: ({ className, type }) => (
    <div data-testid="mock-icon-info" className={className} data-type={type}>
      信息图标
    </div>
  ),
}));

// 导入被测试的组件
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogBanner,
  DialogDivider,
  DialogScrollArea,
} from "../../../src/components/primitive/dialog";

describe("Dialog 组件", () => {
  it("应正确渲染 Dialog 组件", () => {
    render(
      <Dialog>
        <DialogContent>测试内容</DialogContent>
      </Dialog>,
    );

    expect(screen.getByTestId("mock-dialog-root")).toBeDefined();
    expect(screen.getByTestId("mock-dialog-content")).toBeDefined();
    expect(screen.getByText("测试内容")).toBeDefined();
  });

  it("应正确设置 modal=false", () => {
    render(
      <Dialog>
        <DialogContent>测试内容</DialogContent>
      </Dialog>,
    );

    expect(
      screen.getByTestId("mock-dialog-root").getAttribute("data-modal"),
    ).toBe("false");
  });

  it("应正确渲染 DialogContent 组件", () => {
    render(
      <Dialog>
        <DialogContent zIndex={100}>内容</DialogContent>
      </Dialog>,
    );

    const content = screen.getByTestId("mock-dialog-content");
    expect(content).toBeDefined();
    expect(content.style.zIndex).toBe("101");
  });

  it("应忽略刚打开时触发的外部交互关闭", () => {
    const onInteractOutside = vi.fn();

    render(
      <Dialog open>
        <DialogContent onInteractOutside={onInteractOutside}>
          内容
        </DialogContent>
      </Dialog>,
    );

    const preventDefault = vi.fn();
    dialogMockState.contentProps?.onInteractOutside?.({ preventDefault });

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(onInteractOutside).not.toHaveBeenCalled();
  });

  it("应正确渲染背景层", () => {
    render(
      <Dialog>
        <DialogContent zIndex={100}>内容</DialogContent>
      </Dialog>,
    );

    // 找到自定义背景层
    const backgroundElements = screen.getAllByText("内容");
    const bgElement = backgroundElements[0]?.parentElement
      ?.childNodes[0] as HTMLElement | null;

    expect(bgElement).not.toBeNull();
    expect(bgElement?.className).toContain("fixed inset-0");
    expect(bgElement?.style.zIndex).toBe("100");
  });

  it("应正确渲染 DialogHeader 组件", () => {
    render(<DialogHeader variant="primary">标题区域</DialogHeader>);

    const header = screen.getByText("标题区域");
    expect(header).toBeDefined();
    expect(header.className).toContain("px-6");
  });

  it("应正确渲染 DialogFooter 组件", () => {
    render(<DialogFooter variant="primary">底部区域</DialogFooter>);

    const footer = screen.getByText("底部区域");
    expect(footer).toBeDefined();
    expect(footer.className).toContain("px-6");
    expect(footer.className).toContain("py-3.5");
    expect(footer.className).toContain("gap-2");
  });

  it("应正确渲染 DialogTitle 组件", () => {
    render(<DialogTitle variant="normal">对话框标题</DialogTitle>);

    const title = screen.getByTestId("mock-dialog-title");
    expect(title).toBeDefined();
    expect(title.className).toContain("text-base");
    expect(screen.getByText("对话框标题")).toBeDefined();
  });

  it("应根据 variant 属性正确渲染 DialogTitle", () => {
    const { rerender } = render(
      <DialogTitle variant="normal">标题</DialogTitle>,
    );

    let title = screen.getByTestId("mock-dialog-title");
    expect(title.className).toContain("text-base");

    rerender(<DialogTitle variant="weak">标题</DialogTitle>);

    title = screen.getByTestId("mock-dialog-title");
    expect(title.className).toContain("text-sm");
  });

  it("应正确渲染 DialogDescription 组件", () => {
    render(<DialogDescription>描述文本</DialogDescription>);

    const description = screen.getByTestId("mock-dialog-description");
    expect(description).toBeDefined();
    expect(description.className).toContain("text-sm");
    expect(screen.getByText("描述文本")).toBeDefined();
  });

  it("应正确渲染危险类型的 DialogBanner 组件", () => {
    const { container } = render(
      <DialogBanner variant="danger">警告信息</DialogBanner>,
    );

    expect(screen.getByText("警告信息")).toBeDefined();
    expect(screen.getByTestId("mock-icon-alert-triangle")).toBeDefined();
    // 直接检查顶层div
    const bannerDiv = container.firstChild as HTMLElement;
    expect(bannerDiv.className).toContain("bg-danger-50");
  });

  it("应正确渲染警告类型的 DialogBanner 组件", () => {
    const { container } = render(
      <DialogBanner variant="warning">警告信息</DialogBanner>,
    );

    expect(screen.getByText("警告信息")).toBeDefined();
    expect(screen.getByTestId("mock-icon-alert-triangle")).toBeDefined();
    // 直接检查顶层div
    const bannerDiv = container.firstChild as HTMLElement;
    expect(bannerDiv.className).toContain("bg-alert-50");
  });

  it("应正确渲染信息类型的 DialogBanner 组件", () => {
    const { container } = render(
      <DialogBanner variant="info">提示信息</DialogBanner>,
    );

    expect(screen.getByText("提示信息")).toBeDefined();
    expect(screen.getByTestId("mock-icon-info")).toBeDefined();
    // 直接检查顶层div
    const bannerDiv = container.firstChild as HTMLElement;
    expect(bannerDiv.className).toContain("bg-info-50");
  });

  it("应正确渲染 DialogDivider 组件", () => {
    const { container } = render(<DialogDivider />);

    // 避免使用getByRole("generic")，因为可能有多个匹配
    const divider = container.querySelector("div > div") as HTMLElement;
    expect(divider).toBeDefined();
    expect(divider.className).toContain("w-full");
    expect(divider.className).toContain("h-px");
  });

  it("应正确渲染 DialogScrollArea 组件", () => {
    const { container } = render(<DialogScrollArea>滚动内容</DialogScrollArea>);

    // 使用container来获取DIV元素
    const scrollArea = container.firstChild as HTMLElement;
    expect(scrollArea).toBeDefined();
    expect(scrollArea.className).toContain("overflow-auto");
  });

  it("应正确渲染 DialogBody 组件", () => {
    const { container, rerender } = render(
      <DialogBody variant="primary">主要内容</DialogBody>,
    );

    let body = container.firstChild as HTMLElement;
    expect(body).toBeDefined();
    expect(body.className).toContain("px-6");
    expect(body.className).toContain("pt-6");
    expect(body.className).toContain("pb-10");

    rerender(<DialogBody variant="secondary">次要内容</DialogBody>);

    body = container.firstChild as HTMLElement;
    expect(body.className).toContain("pl-6");
    expect(body.className).toContain("pt-2");
    expect(body.className).toContain("pb-5");
  });

  it("应支持自定义类名", () => {
    const { container } = render(
      <Dialog>
        <DialogContent className="custom-content">
          <DialogHeader className="custom-header">标题</DialogHeader>
          <DialogBody className="custom-body">内容</DialogBody>
          <DialogFooter className="custom-footer">底部</DialogFooter>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByTestId("mock-dialog-content").className).toContain(
      "custom-content",
    );
    expect(screen.getByText("标题").className).toContain("custom-header");
    expect(screen.getByText("底部").className).toContain("gap-2");

    // 查找内容的父元素，即DialogBody
    const bodyElement = container.querySelector(".custom-body");
    expect(bodyElement).toBeDefined();
    expect(bodyElement?.className).toContain("custom-body");

    expect(screen.getByText("底部").className).toContain("custom-footer");
  });
});

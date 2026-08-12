import type { Extension } from "@codemirror/state";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// 定义类型接口
interface CodeMirrorProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  editable?: boolean;
  children?: ReactNode;
  extensions?: unknown[];
}

interface IconProps {
  className?: string;
  onClick?: () => void;
  ref?: React.Ref<SVGSVGElement>;
}

interface DialogProps {
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface DialogTriggerProps {
  children?: ReactNode;
  asChild?: boolean;
}

interface DialogContentProps {
  children?: ReactNode;
  className?: string;
  dialogPortalProps?: {
    container?: {
      id?: string;
    };
  };
}

interface DialogComponentProps {
  children?: ReactNode;
  className?: string;
}

interface IntlMessage {
  id: string;
  defaultMessage?: string;
}

interface ButtonProps {
  children?: ReactNode;
  onClick?: () => void;
}

// 模拟依赖
vi.mock("@zstack/utils", () => ({
  cn: (...inputs: unknown[]) => inputs.filter(Boolean).join(" "),
  getLanguageExtension: (lang: string) => [{ name: lang }],
}));

// 模拟CodeMirror及其extensions
vi.mock("@uiw/react-codemirror", () => ({
  default: ({
    value,
    onChange,
    className,
    editable,
    children,
    extensions,
  }: CodeMirrorProps) => (
    <div
      data-testid="mock-codemirror"
      className={className}
      data-editable={editable?.toString()}
      data-extensions={JSON.stringify(extensions || [])}
    >
      <textarea
        data-testid="mock-editor"
        value={value}
        onChange={(e) =>
          onChange && onChange((e.target as HTMLTextAreaElement).value)
        }
      />
      <div style={{ display: "none" }}>{value}</div>
      {children}
    </div>
  ),
}));

vi.mock("@uiw/codemirror-extensions-langs", () => ({
  langs: {
    javascript: () => ({ name: "javascript" }),
    typescript: () => ({ name: "typescript" }),
    json: () => ({ name: "json" }),
    html: () => ({ name: "html" }),
    css: () => ({ name: "css" }),
    python: () => ({ name: "python" }),
  },
}));

// 模拟图标
vi.mock("@zstack/icon", () => ({
  Icon: ({ type, className, onClick }: IconProps & { type: string }) => (
    <button
      data-testid={type === "expand" ? "mock-icon-expand" : "mock-icon-collapse"}
      className={className}
      onClick={onClick}
    >
      {type === "expand" ? "展开" : "收起"}
    </button>
  ),
  IconExpand: ({ className, onClick }: IconProps) => (
    <button
      data-testid="mock-icon-expand"
      className={className}
      onClick={onClick}
    >
      展开
    </button>
  ),
  IconCollapse: ({ className, onClick }: IconProps) => (
    <button
      data-testid="mock-icon-collapse"
      className={className}
      onClick={onClick}
    >
      折叠
    </button>
  ),
  Dialog: ({
    open,
    title,
    children,
    onOpenChange,
    onConfirm,
    confirmText,
    cancelText,
  }: {
    open: boolean;
    title: string;
    children: React.ReactNode;
    onOpenChange?: (open: boolean) => void;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
  }) => (
    <div data-testid="mock-dialog" data-open={String(open)}>
      <div data-testid="mock-dialog-title">{title}</div>
      <div data-testid="mock-dialog-content">{children}</div>
      <div data-testid="mock-dialog-footer">
        <button
          data-testid="mock-dialog-cancel"
          onClick={() => onOpenChange && onOpenChange(false)}
        >
          {cancelText || "取消"}
        </button>
        <button
          data-testid="mock-dialog-confirm"
          onClick={() => {
            if (onConfirm) onConfirm();
            if (onOpenChange) onOpenChange(false);
          }}
        >
          {confirmText || "确认"}
        </button>
      </div>
    </div>
  ),
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-card">{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-card-content">{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-card-title">{children}</div>
  ),
  CardFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-card-footer">{children}</div>
  ),
  IconButton: ({
    onClick,
    "data-testid": testId,
    children,
  }: {
    onClick?: () => void;
    "data-testid"?: string;
    children?: ReactNode;
  } & IconProps) => (
    <button data-testid={testId} onClick={onClick}>
      {children || "Icon"}
    </button>
  ),
  FullscreenIcon: () => <span data-testid="fullscreen-icon">Fullscreen</span>,
  FullscreenExitIcon: () => (
    <span data-testid="fullscreen-exit-icon">FullscreenExit</span>
  ),
}));

// 模拟UUID
vi.mock("uuid", () => ({
  v4: () => "test-uuid-123",
}));

// 模拟intl
vi.mock("react-intl", () => ({
  useIntl: () => ({
    formatMessage: ({ id, defaultMessage }: IntlMessage) =>
      defaultMessage || id,
  }),
}));

// 模拟Dialog组件
vi.mock("../../../src/components/primitive/dialog", () => ({
  Dialog: ({ children, open, onOpenChange }: DialogProps) => (
    <div data-testid="mock-dialog" data-open={open?.toString()}>
      {children}
      <button
        data-testid="dialog-toggle"
        onClick={() => onOpenChange && onOpenChange(!open)}
      >
        Toggle Dialog
      </button>
    </div>
  ),
  DialogTrigger: ({ children, asChild }: DialogTriggerProps) => (
    <div data-testid="mock-dialog-trigger" data-aschild={asChild?.toString()}>
      {children}
    </div>
  ),
  DialogContent: ({
    children,
    className,
    dialogPortalProps,
  }: DialogContentProps) => (
    <div
      data-testid="mock-dialog-content"
      className={className}
      data-container-id={dialogPortalProps?.container?.id}
    >
      {children}
    </div>
  ),
  DialogHeader: ({ children, className }: DialogComponentProps) => (
    <div data-testid="mock-dialog-header" className={className}>
      {children}
    </div>
  ),
  DialogTitle: ({ children }: DialogComponentProps) => (
    <div data-testid="mock-dialog-title">{children}</div>
  ),
  DialogBody: ({ children, className }: DialogComponentProps) => (
    <div data-testid="mock-dialog-body" className={className}>
      {children}
    </div>
  ),
  DialogFooter: ({ children }: DialogComponentProps) => (
    <div data-testid="mock-dialog-footer">{children}</div>
  ),
  DialogScrollArea: ({ children }: DialogComponentProps) => (
    <div data-testid="mock-dialog-scroll-area">{children}</div>
  ),
  DialogDivider: () => <div data-testid="mock-dialog-divider" />,
}));

// 模拟Button组件
vi.mock("../../../src/components/primitive/button", () => ({
  Button: ({ children, onClick }: ButtonProps) => (
    <button data-testid="mock-button" onClick={onClick}>
      {children}
    </button>
  ),
}));

// 导入被测试的组件
import CodeEditor from "../../../src/components/primitive/code-editor";

describe("CodeEditor 组件", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("应正确渲染基本代码编辑器", () => {
    render(<CodeEditor value="const a = 'hello'" />);
    const editor = screen.getByTestId("mock-codemirror");
    expect(editor).toBeDefined();
    expect(editor.textContent).toContain("const a = 'hello'");
  });

  it("应正确应用尺寸变体", () => {
    const { container } = render(<CodeEditor size="sm" />);
    const editorElement = container.firstChild as HTMLElement;
    expect(editorElement.className).toContain("text-xs");

    const { container: container2 } = render(<CodeEditor size="lg" />);
    const editorElement2 = container2.firstChild as HTMLElement;
    expect(editorElement2.className).toContain("text-base");
  });

  it("应正确应用自定义类名", () => {
    const { container } = render(<CodeEditor className="custom-editor" />);
    const editorElement = container.firstChild as HTMLElement;
    expect(editorElement.className).toContain("custom-editor");
  });

  it("应正确设置可编辑状态", () => {
    const { unmount } = render(<CodeEditor editable={false} />);
    const editor = screen.getByTestId("mock-codemirror");
    expect(editor.getAttribute("data-editable")).toBe("false");

    unmount();
    render(<CodeEditor editable={true} />);
    const editorEditable = screen.getByTestId("mock-codemirror");
    expect(editorEditable.getAttribute("data-editable")).toBe("true");
  });

  it("应响应onChange事件", () => {
    const handleChange = vi.fn();
    render(<CodeEditor onChange={handleChange} />);

    const editor = screen.getByTestId("mock-editor");
    fireEvent.change(editor, { target: { value: "updated code" } });

    expect(handleChange).toHaveBeenCalledWith("updated code");
  });

  it("应根据language属性加载正确的语言扩展", () => {
    render(<CodeEditor language="javascript" />);
    const editor = screen.getByTestId("mock-codemirror");
    const extensions = JSON.parse(
      editor.getAttribute("data-extensions") || "[]",
    );
    expect(extensions.length).toBeGreaterThan(0);
  });

  it("应支持添加额外的扩展", () => {
    // 使用any来避免类型冲突
    const customExtensions = [{ name: "customExt" }] as any[];
    render(
      <CodeEditor
        additionalExtensions={customExtensions}
        language="javascript"
      />,
    );

    const editor = screen.getByTestId("mock-codemirror");
    const extensions = JSON.parse(
      editor.getAttribute("data-extensions") || "[]",
    );
    expect(extensions.length).toBeGreaterThan(1);
  });

  it("值更新时应正确更新编辑器内容", () => {
    const { rerender } = render(<CodeEditor value="initial code" />);

    const initialEditor = screen.getByTestId("mock-codemirror");
    expect(initialEditor.textContent).toContain("initial code");

    rerender(<CodeEditor value="updated code" />);
    expect(initialEditor.textContent).toContain("updated code");
  });
});

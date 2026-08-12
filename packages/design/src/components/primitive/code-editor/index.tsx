import { Icon } from "@zstack/icon";
import { langs } from "@uiw/codemirror-extensions-langs";
import type { ReactCodeMirrorProps } from "@uiw/react-codemirror";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { cn } from "@zstack/utils";
import { cva } from "class-variance-authority";
import * as React from "react";
import { useIntl } from "react-intl";

import { useId } from "../../../utils/use-id.ts";
import { Button } from "../button";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
  DialogScrollArea,
  DialogDivider,
} from "../dialog";

const containerVariants = cva(
  "rounded-xs border border-solid border-neutral-300",
  {
    variants: {
      variant: {
        default: "border-neutral-300",
      },
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export type SupportedLanguage = keyof typeof langs;

interface CodeEditorContextValue {
  language: SupportedLanguage;
  code: string;
  setCode: (code: string) => void;
  isFullscreen: boolean;
  setIsFullscreen: (value: boolean) => void;
  id: string;
  editable: boolean;
}

const CodeEditorContext = React.createContext<
  CodeEditorContextValue | undefined
>(undefined);

export const useCodeEditor = () => {
  const context = React.useContext(CodeEditorContext);
  if (!context) {
    throw new Error("useCodeEditor must be used within a CodeEditor component");
  }
  return context;
};

export interface CodeEditorProps extends Omit<
  ReactCodeMirrorProps,
  "extensions" | "value" | "onChange"
> {
  /** 支持的语言，默认 javascript */
  language?: SupportedLanguage;
  variant?: "default";
  size?: "sm" | "md" | "lg";
  /** 渲染的文本代码 */
  value?: string;
  onChange?: (value: string) => void;
  /** 是否全屏模式，用于受控模式 */
  isFullscreen?: boolean;
  /** 全屏状态变化的回调，用于受控模式 */
  onFullscreenChange?: (isFullscreen: boolean) => void;
  additionalExtensions?: ReactCodeMirrorProps["extensions"];
  className?: string;
  /** 是否可编辑 */
  editable?: boolean;
  /** 是否自动换行，默认 false */
  lineWrapping?: boolean;
}

export interface CodeEditorComposition {
  Toolbar: typeof CodeEditorToolbar & {
    Button: typeof ToolbarButton;
  };
  FullscreenPreview: typeof CodeEditorFullscreenPreview;
}

export const CodeEditor: React.FC<CodeEditorProps> & CodeEditorComposition = ({
  children,
  language = "javascript",
  variant,
  size,
  className = "",
  additionalExtensions = [],
  isFullscreen: isFullscreenProp,
  onFullscreenChange,
  editable = true,
  lineWrapping = false,
  ...props
}) => {
  const [code, setCode] = React.useState(props.value || "");
  const [internalIsFullscreen, setInternalIsFullscreen] = React.useState(false);

  // 判断是否为受控模式
  const isControlled = isFullscreenProp !== undefined;
  // 使用受控值或内部状态
  const isFullscreen = isControlled ? isFullscreenProp : internalIsFullscreen;

  const id = useId();

  React.useEffect(() => {
    setCode(props.value || "");
  }, [props.value]);

  const handleChange = React.useCallback(
    (value: string) => {
      setCode(value);
      props.onChange?.(value);
    },
    [props.onChange],
  );

  // 处理全屏状态变化
  const handleFullscreenChange = React.useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setInternalIsFullscreen(value);
      }
      onFullscreenChange?.(value);
    },
    [isControlled, onFullscreenChange],
  );

  const contextValue = React.useMemo(
    () => ({
      language: language,
      code,
      setCode: handleChange,
      isFullscreen,
      setIsFullscreen: handleFullscreenChange,
      id,
      editable,
    }),
    [
      code,
      handleChange,
      language,
      isFullscreen,
      handleFullscreenChange,
      id,
      editable,
    ],
  );

  const langExtension = React.useMemo(() => {
    if (language in langs) {
      return [langs[language]()];
    }
    return [];
  }, [language]);

  const extensions = React.useMemo(() => {
    const baseExtensions = [...langExtension, ...additionalExtensions];
    if (lineWrapping) {
      baseExtensions.push(EditorView.lineWrapping);
    }
    return baseExtensions;
  }, [langExtension, additionalExtensions, lineWrapping]);

  return (
    <CodeEditorContext.Provider value={contextValue}>
      <div
        className={cn(containerVariants({ variant, size, className }))}
        id={`code-editor-${id}`}
      >
        {/* 将 children 分成两部分：toolbar 和其他内容 */}
        <div className="flex h-full flex-col">
          {/* Toolbar 部分 */}
          {React.Children.map(children, (child) => {
            if (
              React.isValidElement(child) &&
              child.type === CodeEditorToolbar
            ) {
              return child;
            }
            return null;
          })}

          {/* 编辑器和预览的容器 */}
          <div className="relative flex flex-1 overflow-auto">
            {/* 编辑器部分 */}
            <div className="flex-1">
              <CodeMirror
                value={code}
                onChange={setCode}
                extensions={extensions}
                className="h-full [&>div]:!outline-none"
                editable={editable}
                {...props}
              />
            </div>

            {/* todo Preview 部分 */}
            {/* {React.Children.map(children, (child) => {
              if (
                React.isValidElement(child) &&
                child.type === CodeEditorPreview
              ) {
                return child;
              }
              return null;
            })} */}
          </div>
        </div>
      </div>
    </CodeEditorContext.Provider>
  );
};

CodeEditor.displayName = "CodeEditor";

// 定义 Toolbar 组件类型，包含 Button 子组件
interface CodeEditorToolbarType extends React.FC<CodeEditorToolbarProps> {
  Button: typeof ToolbarButton;
}

// Toolbar Component
interface CodeEditorToolbarProps {
  children: React.ReactNode;
  className?: string;
}

const CodeEditorToolbar: CodeEditorToolbarType = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={cn(
        `rounded-rt-0.5 rounded-lt-0.5 flex h-6 bg-neutral-100`,
        className,
      )}
    >
      {children}
    </div>
  );
};

interface ToolbarButtonProps extends React.ButtonHTMLAttributes<SVGElement> {
  variant: "fullscreen";
  active?: boolean;
  className?: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  variant = "fullscreen",
  active = false,
  className,
  ...props
}) => {
  // 从 props 中提取 onClick 属性
  const { onClick } = props;

  const icon = React.useMemo(() => {
    if (variant === "fullscreen") {
      return active ? (
        <Icon type="collapse"
          className={cn("cursor-pointer", className)}
          onClick={onClick}
        />
      ) : (
        <Icon type="expand"
          className={cn("cursor-pointer", className)}
          onClick={onClick}
        />
      );
    }
  }, [variant, active, className, onClick]);

  return icon;
};

// 将 ToolbarButton 作为 Toolbar 的子组件
CodeEditorToolbar.Button = ToolbarButton;

interface CodeEditorFullscreenPreviewProps {
  /** 弹窗标题 */
  title: React.ReactNode;
  /** 是否打开全屏预览，不提供则使用内部状态 */
  open?: boolean;
  /** 打开状态变化的回调 */
  onOpenChange?: (open: boolean) => void;
  /** 底部确认按钮文案 */
  confirmText?: string;
}

const CodeEditorFullscreenPreview: React.FC<
  CodeEditorFullscreenPreviewProps
> = ({ title, open, onOpenChange, confirmText }) => {
  const {
    code,
    setCode,
    language,
    isFullscreen,
    setIsFullscreen,
    id,
    editable,
  } = useCodeEditor();
  const [previewCode, setPreviewCode] = React.useState(code);

  const intl = useIntl();

  // 判断是否为受控模式
  const isControlled = open !== undefined;
  // 使用受控值或内部状态
  const isOpen = isControlled ? open : isFullscreen;

  // 当原始代码变化或对话框打开时，更新预览代码
  React.useEffect(() => {
    if (isOpen) {
      setPreviewCode(code);
    }
  }, [code, isOpen]);

  // 处理打开状态变化
  const handleOpenChange = React.useCallback(
    (value: boolean) => {
      setIsFullscreen(value);
      onOpenChange?.(value);
    },
    [setIsFullscreen, onOpenChange],
  );

  // 处理确认按钮点击，将预览代码更新到主编辑器
  const handleConfirm = React.useCallback(() => {
    setCode(previewCode);
    handleOpenChange(false);
  }, [previewCode, setCode, handleOpenChange]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange} modal>
      <DialogTrigger asChild>
        <CodeEditor.Toolbar.Button
          variant="fullscreen"
          active={false}
          onClick={() => handleOpenChange(true)}
        />
      </DialogTrigger>
      <DialogContent
        className="w-4/5"
        dialogPortalProps={{
          container: document.getElementById(`code-editor-${id}`),
        }}
      >
        <DialogHeader className="justify-between">
          <DialogTitle>{title}</DialogTitle>
          <ToolbarButton
            variant="fullscreen"
            active
            onClick={() => handleOpenChange(false)}
          />
        </DialogHeader>
        <DialogDivider />
        <DialogScrollArea>
          <DialogBody className="min-h-[75vh] p-0">
            <div className="flex-1">
              <CodeMirror
                value={previewCode}
                onChange={setPreviewCode}
                extensions={[langs[language](), EditorView.lineWrapping]}
                className="h-full [&>div]:!outline-none"
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLineGutter: true,
                  highlightActiveLine: true,
                  foldGutter: true,
                }}
                editable={editable}
              />
            </div>
          </DialogBody>
        </DialogScrollArea>
        <DialogDivider />
        <DialogFooter>
          <Button onClick={handleConfirm}>
            {confirmText ||
              intl.formatMessage({
                id: "confirm.ok",
                defaultMessage: "确定",
              })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

CodeEditor.Toolbar = CodeEditorToolbar;
CodeEditor.FullscreenPreview = CodeEditorFullscreenPreview;

export default CodeEditor;

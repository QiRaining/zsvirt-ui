import { bus, cn } from "@zstack/utils";
import { useIntl } from "react-intl";

const EventType = "CHANGE_GLOBAL_DOC_READER_PATH";

export interface HelperDocProps {
  /** 帮助文档链接 */
  path: string;
  className?: string;
  children?: React.ReactNode;
}

/** 唤醒帮助文档按钮，比如：“了解更多” */
export const HelperDoc = ({ path, children, className }: HelperDocProps) => {
  const intl = useIntl();

  const openDoc = (docReaderPath: string) => {
    if (docReaderPath) {
      bus.emit(EventType, docReaderPath);
    }
  };

  return (
    <span
      className={cn(
        "text-theme-600 hover:text-theme-500 cursor-pointer text-xs",
        className,
      )}
      onClick={() => openDoc(path)}
    >
      {children ||
        intl.formatMessage({
          id: "understandMore",
          defaultMessage: "了解更多",
        })}
    </span>
  );
};

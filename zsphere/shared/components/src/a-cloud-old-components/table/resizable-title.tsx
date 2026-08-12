import { useDebounceFn } from "ahooks";
import React, { useRef, useCallback, useState } from "react";
import { Resizable, ResizeCallbackData } from "react-resizable";

export interface IProps {
  width?: number;
  onResize: (data: ResizeCallbackData) => any;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  onResizeStart?: () => void;
  onResizeStop: (width: number) => any;
  className?: any;
  loading?: boolean;
  minWidth?: number;
}

const ResizableTitle: React.FC<IProps> = (props) => {
  const {
    width: initWidth = 0,
    onResize,
    onClick,
    onResizeStart,
    onResizeStop,
    minWidth = 80,
    ...restProps
  } = props;

  const resizing = useRef(false);
  const thRef = useRef<HTMLTableHeaderCellElement>(null);

  const _onClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!resizing.current && onClick) {
        onClick(e);
      }
    },
    [onClick],
  );

  const [width, setWidth] = useState(initWidth);
  const onResizeFn = useCallback<Required<Resizable["props"]>["onResize"]>(
    (e: any, data: any) => {
      e.stopPropagation();
      setWidth(data.size.width);
      onResize(data);
    },
    [onResize],
  );

  const { run: setResizingFalse } = useDebounceFn(
    () => {
      resizing.current = false;
    },
    { wait: 100 },
  );

  // 最后一列 '操作' 不支持拖拽
  if (
    !initWidth ||
    restProps?.className?.includes("ant-table-cell-fix-right")
  ) {
    return <th {...restProps} onClick={onClick} />;
  }

  return React.createElement(
    Resizable as any,
    {
      onResize: onResizeFn,
      onResizeStart: () => {
        resizing.current = true;
        if (thRef.current) {
          setWidth(thRef.current.clientWidth);
        }
        onResizeStart?.();
      },
      onResizeStop: () => {
        if (width) {
          onResizeStop(width);
        }
        setResizingFalse();
      },
      draggableOpts: {
        enableUserSelectHack: true,
      },
      width: width,
      minConstraints: [minWidth, 20] as any,
      height: 0,
    },
    React.createElement("th", { ref: thRef, onClick: _onClick, ...restProps }),
  ) as any;
};

export default ResizableTitle;

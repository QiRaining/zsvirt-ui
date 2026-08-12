import React, { useRef, useCallback } from "react";

import { useStore } from "./store";

export interface ITableDetailProps {
  rowKey: string;
  dataSource?: any[];
  renderRowDetail?:
    | ((
        currentRow: any,
        visible: boolean,
        onClose: () => void,
        getContainer: () => HTMLElement,
      ) => JSX.Element)
    | false;
}

export function TableDetail({
  rowKey,
  dataSource,
  renderRowDetail,
}: ITableDetailProps) {
  const detailVisible = useStore((state) => state.detailVisible);
  const currentRow = useStore((state) => state.currentRow);
  const currentRowKey = currentRow?.[rowKey];
  const hideDetail = useStore((state) => state.actions.hideDetail);
  const containerRef = useRef<HTMLDivElement>(null);
  const getContainer = useCallback(
    () => containerRef.current as HTMLElement,
    [],
  );
  const current =
    (currentRowKey &&
      dataSource?.find((item) => item[rowKey] === currentRowKey)) ||
    currentRow;

  return (
    <div ref={containerRef}>
      {renderRowDetail && typeof renderRowDetail === "function"
        ? renderRowDetail(current, detailVisible, hideDetail, getContainer)
        : null}
    </div>
  );
}

export interface ITableDetailLink extends React.HTMLAttributes<HTMLAnchorElement> {
  currentRow: any;
}

export function TableDetailLink({
  currentRow,
  onClick,
  children,
  ...props
}: ITableDetailLink) {
  const showDetail = useStore((state) => state.actions.showDetail);
  const renderDetail = useStore((state) => state.renderDetail);

  if (!renderDetail) {
    return <span>{children}</span>;
  }

  return (
    <a
      {...props}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        showDetail(currentRow);
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}

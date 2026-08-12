import { Alert } from "@zstack/design";
import { Icon } from "@zstack/icon";
import cls from "classnames";
import { reject as _reject } from "lodash-es";
import React, { useState, useCallback, useMemo, memo } from "react";
import type { Layout, Layouts } from "react-grid-layout";
import { Responsive, WidthProvider } from "react-grid-layout";
import { useIntl } from "react-intl";

import type { SavedDataProps } from "../interface/saved-data-props";
import Widget from "../widgets";

import style from "./style.module.less";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

// breakpoints: wide≥1600, standard≥1280, medium≥1024, compact<768, single<480
// xs is intentionally removed — container goes straight from sm(2col) to xxs(1col)
const GRID_COLS = { lg: 6, md: 4, sm: 2, xs: 2, xxs: 1 } as const;
// horizontal margin between items; vertical margin same
const GRID_MARGIN: [number, number] = [12, 12];
const GRID_BREAKPOINTS = {
  lg: 1600,
  md: 1280,
  sm: 1024,
  xs: 768,
  xxs: 0,
} as const;
// containerPadding: [horizontal, vertical] inside the grid wrapper, per breakpoint
// keeps items flush with the outer padding defined on .gridLayout
const GRID_CONTAINER_PADDING: Record<string, [number, number]> = {
  lg: [24, 12],
  md: [24, 12],
  sm: [16, 12],
  xs: [12, 12],
  xxs: [8, 12],
};

interface IProps {
  data: SavedDataProps;
  isEditable: boolean;
  onChange?: (data: SavedDataProps) => void;
}

const GridLayoutInner: React.FC<IProps> = ({
  isEditable = false,
  onChange,
  data,
}) => {
  const intl = useIntl();
  const [isDragging, setIsDragging] = useState(false);

  // 去重 widgets，防止重复 key 导致 React 警告
  const uniqueWidgets = useMemo(() => {
    if (!data?.widgets) {
      return [];
    }
    const seen = new Set<string>();
    return data.widgets.filter((widget: any) => {
      if (seen.has(widget.uuid)) {
        console.warn(`Duplicate widget uuid detected: ${widget.uuid}`);
        return false;
      }
      seen.add(widget.uuid);
      return true;
    });
  }, [data?.widgets]);

  // 确保 layouts 有效，react-grid-layout 需要有效的 layouts 对象才能渲染
  const safeLayouts = useMemo(() => {
    return data?.layouts || { lg: [] };
  }, [data?.layouts]);

  const onLayoutChange = useCallback(
    (_: Layout[], allLayouts: Layouts) => {
      if (onChange) {
        onChange({
          layouts: allLayouts,
          widgets: data.widgets,
        });
      }
    },
    [onChange, data.widgets],
  );

  const deleteWidget = useCallback(
    (uuid: string) => {
      if (onChange) {
        onChange({
          layouts: data.layouts,
          widgets: _reject(data.widgets, { uuid }),
        });
      }
    },
    [onChange, data.layouts, data.widgets],
  );

  const onDragStop = useCallback(() => {
    setTimeout(() => {
      setIsDragging(false);
    }, 100);
  }, []);

  // 预计算 close 按钮的样式
  const closeStyleUserInfo = useMemo(() => ({ top: "44px" }), []);
  const closeStyleDefault = useMemo(() => ({ top: "8px" }), []);

  const createElement = useCallback(
    (widget: any) => {
      return (
        <div
          key={widget.uuid}
          data-grid={widget.gridData}
          className={cls(style.widgetContainer, {
            [style.moveCursor]: isEditable,
            [style.widgetAnimation]: isEditable && !isDragging,
          })}
        >
          <Widget
            key={widget.uuid}
            type={widget.type}
            {...widget.props}
            isEditable={isEditable}
          />
          {isEditable && <div className={style.closeHover} />}
          {isEditable && (
            <div
              className={style.close}
              onMouseDown={() => deleteWidget(widget.uuid)}
              style={
                widget.type === "user-info"
                  ? closeStyleUserInfo
                  : closeStyleDefault
              }
            >
              <Icon type="close" />
            </div>
          )}
        </div>
      );
    },
    [
      isEditable,
      isDragging,
      deleteWidget,
      closeStyleUserInfo,
      closeStyleDefault,
    ],
  );

  return (
    <div className={isEditable ? style.editGridLayout : style.gridLayout}>
      {isEditable && (
        <Alert
          className={style.headerAlert}
          variant="info"
          display="weak"
          closable
        >
          {intl.formatMessage({
            id: "homepage.alert.edit",
            defaultMessage:
              "You can add widgets to or remove widgets from the dashboard. You can also drag and drop cards to arrange the layout of cards on the dashboard.",
          })}
        </Alert>
      )}
      <ResponsiveReactGridLayout
        cols={GRID_COLS}
        margin={GRID_MARGIN}
        containerPadding={GRID_CONTAINER_PADDING}
        breakpoints={GRID_BREAKPOINTS}
        rowHeight={210}
        onLayoutChange={onLayoutChange}
        layouts={safeLayouts}
        isDraggable={isEditable}
        onDragStart={() => setIsDragging(true)}
        onDragStop={onDragStop}
      >
        {uniqueWidgets.map((widget) => createElement(widget))}
      </ResponsiveReactGridLayout>
    </div>
  );
};

const GridLayout = memo(GridLayoutInner);

export default GridLayout;

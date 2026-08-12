import { Icon } from "@zstack/icon";
import { Drawer as AntDrawer, Space } from "antd";
import { DrawerProps } from "antd/es/drawer";
import { TabPaneProps } from "antd/es/tabs";
import cls from "classnames";
import React from "react";

import { getBaseCls } from "../_utils/common";
import Action, { IActionProps } from "../a-cloud-old-components/action";
import { TabPane, Tabs } from "../a-cloud-old-components/tabs-2";

import "./style.less";

const baseCls = getBaseCls("detail-drawer");

interface ITabTabPanes extends TabPaneProps {
  action?: IActionProps<any, any>;
  children?: React.ReactNode;
  key?: string | number;
  auth?: {
    type: "view" | "block";
    resource: string;
    authKey: string;
    children?: React.ReactNode;
  };
}

type tabTabPanes = Array<ITabTabPanes>;

export interface IDetailDrawerProps {
  open: boolean;
  setOpen?: (open: boolean) => void;
  className?: string;
  onClose?: (e: any) => void;
  tabTabPanes?: tabTabPanes;
  getContainer?: string | HTMLElement;
  children?: React.ReactNode;
  // 从 DrawerProps 中提取需要的属性
  width?: string | number;
  mask?: boolean;
  closable?: boolean;
  closeIcon?: React.ReactNode;
  destroyOnClose?: boolean;
  placement?: "top" | "right" | "bottom" | "left";
  [key: string]: any; // 允许其他属性
}

const Drawer: React.FC<IDetailDrawerProps> = ({
  open,
  setOpen,
  tabTabPanes = [],
  className,
  getContainer,
  onClose: propOnClose,
  children, // 单独解构
  ...props // 这里的 props 不包含 children
}) => {
  const tabTabPanesEle = React.useMemo(() => {
    return tabTabPanes.map(({ children, action, auth, key, ...p }, index) => {
      return (
        <TabPane key={key ?? index} auth={auth as any} {...p}>
          <Space
            direction="vertical"
            size={12}
            className={`${baseCls}-content`}
          >
            {action ? <Action {...action} /> : null}
            <div style={{ width: "100%" }}>{children}</div>
          </Space>
        </TabPane>
      );
    });
  }, [tabTabPanes]);

  const onClose = (e: any) => {
    setOpen?.(false);
    propOnClose?.(e);
  };

  return React.createElement(
    AntDrawer,
    {
      className: cls(baseCls, className),
      width: 600,
      open,
      mask: false,
      closable: true,
      closeIcon: <Icon type="close" />,
      onClose,
      destroyOnClose: true,
      placement: "right",
      getContainer: getContainer || "#app-root",
      ...props,
    } as any,
    children || (
      <Tabs type="line" contentId="detail-drawer-content">
        {tabTabPanesEle}
      </Tabs>
    ),
  );
};

export interface IDetailDraggableProps {
  tabTabPanes: tabTabPanes;
}

const Draggable: React.FC<IDetailDraggableProps> = () => {
  return <div>Draggable</div>;
};

interface Item {
  [prop: string]: any;
}

export interface IDetail extends Item {
  Drawer: typeof Drawer;
  Draggable: typeof Draggable;
}

const Detail: IDetail = {
  Drawer,
  Draggable,
};

export default Detail;

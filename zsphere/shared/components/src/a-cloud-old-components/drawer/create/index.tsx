import { Drawer } from "antd";
import React, { useLayoutEffect, useMemo } from "react";

import { IDrawerCreate } from "../type";
import { DrawerCreateProvider } from "./context";

const drawerBodyStyle = { padding: 0 };

const Action: React.FC<IDrawerCreate> = ({ open, setOpen, children }) => {
  useLayoutEffect(() => {
    const layoutContent = document.getElementById("layout-content")!;

    if (open && layoutContent) {
      layoutContent.style.cssText = ";overflow: hidden;touch-action: none;";
    }

    return () => {
      if (layoutContent) {
        layoutContent.style.cssText = "";
      }
    };
  }, [open]);

  const providerValue = useMemo(
    () => ({
      onBack: () => {
        setOpen(false);
      },
    }),
    [setOpen],
  );

  return React.createElement(
    Drawer,
    {
      placement: "right",
      closable: false,
      open: open,
      mask: false,
      push: false,
      width: "100%",
      destroyOnClose: true,
      getContainer: () => document.getElementById("layout-content")!,
      bodyStyle: drawerBodyStyle,
    } as any,
    React.createElement(
      DrawerCreateProvider,
      { value: providerValue },
      children,
    ),
  );
};

export default Action;

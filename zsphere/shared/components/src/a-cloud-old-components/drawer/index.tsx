import { Drawer as InternalDrawer } from "antd";

import DrawerCreate from "./create";
import {
  context as DrawerCreateContext,
  useDrawerCreate,
} from "./create/context";
import { DrawerForm } from "./form";
import type { DrawerFormProps, DrawerFormRefType } from "./type";

const Drawer: any = InternalDrawer;

Drawer.DrawerForm = DrawerForm;
Drawer.DrawerCreate = DrawerCreate;
Drawer.DrawerCreateContext = DrawerCreateContext;
Drawer.useDrawerCreate = useDrawerCreate;
export type { DrawerFormProps, DrawerFormRefType };
export { useDrawerCreate };

export default Drawer;

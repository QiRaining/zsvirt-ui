import type { IMenu } from "@zstack/zsphere-types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MenuState {
  menuList: unknown;
  menuTree: IMenu[];
}

interface MenuAction {
  setMenuList: (menuList: unknown) => void;
  setMenuTree: (menu: IMenu[]) => void;
}

export const useMenuStore = create<MenuState & MenuAction>()(
  persist(
    (set) => ({
      menuList: [],
      setMenuList: (menuList) => {
        set({ menuList });
      },
      menuTree: [],
      setMenuTree: (menuTree) => {
        set({ menuTree });
      },
    }),
    { name: "zstack-menu-store" },
  ),
);

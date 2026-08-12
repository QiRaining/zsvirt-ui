import { getMenuTree } from "@zstack/zsphere-config";
import { useBaremetalLicenseCheck } from "@zstack/zsphere-hooks";
import type { IMenu } from "@zstack/zsphere-types";
import { filter as _filter } from "lodash-es";
import { useMemo } from "react";
import type { IntlShape } from "react-intl";

const useFilteredMenu = (intl: IntlShape) => {
  const isBaremetalAbsent = useBaremetalLicenseCheck();

  return useMemo(() => {
    const virtualizationMenu = getMenuTree("root", intl);

    const filteredMenu = _filter(
      virtualizationMenu,
      (item) => item.key === "virtualization.resource",
    ).map((item) => ({
      ...item,
      name: intl.formatMessage({
        id: item.i18nKey,
        defaultMessage: item.name,
      }),
    }));

    if (isBaremetalAbsent) {
      return filteredMenu.map((menu) => {
        const filterChildren = (children: IMenu[]): IMenu[] => {
          return children
            .filter((child) => child.key !== "virtualization.bare.metal")
            .map((child) => {
              if (child.children) {
                return {
                  ...child,
                  children: filterChildren(child.children),
                };
              }
              return child;
            });
        };

        return {
          ...menu,
          children: menu.children ? filterChildren(menu.children) : [],
        };
      });
    }

    return filteredMenu;
  }, [intl, isBaremetalAbsent]);
};

export { useFilteredMenu };

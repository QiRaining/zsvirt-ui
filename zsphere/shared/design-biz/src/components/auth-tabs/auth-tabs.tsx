import type { AuthKey } from "@zstack/auth";
import { useAuth } from "@zstack/auth";
import { Tabs } from "@zstack/design";
import type { TabsProps, TabsListItem } from "@zstack/design";
import { useMemo } from "react";
import React from "react";

export interface AuthTabsListItem extends TabsListItem {
  auth?: AuthKey;
  condition?: boolean;
}

export interface AuthTabsProps extends Omit<TabsProps, "tabsList"> {
  tabsList: AuthTabsListItem[];
}

/**
 * Fix: Tailwind preflight (in @layer base) sets border-style:solid on all elements.
 * Combined with antd's global button border-width, this causes unwanted borders on
 * Radix tab trigger buttons and the tab list container.
 *
 * Unlayered styles always beat @layer styles per CSS spec, so this <style> tag
 * reliably overrides the Tailwind preflight regardless of specificity or load order.
 */
const borderFixStyle = `
[data-auth-tabs] [role="tablist"] {
  border-top-style: none;
  border-left-style: none;
  border-right-style: none;
}
[data-auth-tabs] button[role="tab"] {
  border-style: none;
}`;

const AuthTabs = React.forwardRef<React.ElementRef<typeof Tabs>, AuthTabsProps>(
  ({ tabsList, ...restProps }, ref) => {
    const { hasAuth } = useAuth();

    const filteredTabsList = useMemo(
      () =>
        tabsList.filter((item) => {
          if (item.condition === false) {
            return false;
          }
          if (item.auth) {
            return hasAuth(item.auth);
          }
          return true;
        }),
      [tabsList, hasAuth],
    );

    if (!filteredTabsList.length) {
      return null;
    }

    return (
      <div data-auth-tabs className="flex min-h-0 flex-1 flex-col">
        <style>{borderFixStyle}</style>
        <Tabs ref={ref} tabsList={filteredTabsList} {...restProps} />
      </div>
    );
  },
);

AuthTabs.displayName = "AuthTabs";

export { AuthTabs };

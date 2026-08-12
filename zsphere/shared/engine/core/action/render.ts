import { keys } from "lodash-es";

import { fetchData } from "../fetch";
import { buildOption } from "./build";

export function renderActionOption(
  option: ReturnType<typeof buildOption>,
  sheet: string,
  intl: any,
) {
  const { actions, viewMap } = option;
  return {
    list: actions.reduce((mainActions, action) => {
      const {
        key,
        i18nKey,
        name,
        hasChildren,
        authKey,
        resource,
        icon,
        children,
        dividerKey,
      } = action;
      const config: any = {
        key: action.key,
        name: intl.formatMessage({
          id: i18nKey || `${sheet}.${key}`,
          defaultMessage: name,
        }),
        icon,
      };
      if (!hasChildren) {
        config.auth = {
          authKey,
          resource,
          type: "action",
        };
      } else {
        config.children = children?.reduce((subActions, child) => {
          const {
            childKey,
            childAuthKey,
            childDividerKey,
            childI18nKey,
            childIcon,
            childName,
            childResource,
          } = child;
          const childConfig: any = {
            key: childKey,
            name: intl.formatMessage({
              id: childI18nKey ?? `${sheet}.${childKey}`,
              name: childName,
            }),
            auth: {
              authKey: childAuthKey,
              resource: childResource,
              type: "action",
            },
            icon: childIcon,
          };
          subActions.push(childConfig);
          if (childDividerKey) {
            subActions.push({
              key: childDividerKey,
              divider: true,
            });
          }
          return subActions;
        }, [] as any[]);
      }
      mainActions.push(config);
      if (dividerKey) {
        mainActions.push({
          key: dividerKey,
          divider: true,
        });
      }
      return mainActions;
    }, [] as any[]),
    viewMap: viewMap.reduce((views: any, map: any) => {
      const { view, extraKeys, activeKeys } = map;
      views[view] = {
        extraKeys:
          extraKeys?.split(", ").map((cv: string) => cv.slice(1, -1)) || [],
        activeKeys:
          activeKeys?.split(", ").map((cv: string) => cv.slice(1, -1)) || [],
      };
      return views;
    }, {} as any),
  };
}

export async function genActionFromRemote(resourceKey: string, intl: any) {
  const result = await fetchData("Action", { resourceKey });
  const sheet = keys(result)[0];
  const tableData = result[sheet];
  const option = buildOption(sheet, tableData);
  return renderActionOption(option, sheet, intl);
}

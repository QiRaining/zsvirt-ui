import { Text } from "@zstack/design";
import { TableDetailLink } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/access-control-rule";
import type { IOption } from "@zstack/zsphere-engine/src/access-control-rule/useColumnConfig";
import type { AccessControlRule as IAccessControlRule } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { useAccessControlRuleType } from "../hook";

export default () => {
  const intl = useIntl();

  const { accessControlRuleTypeMap, accessControlRuleTypeList } =
    useAccessControlRuleType();

  const columnConfig: IOption<IAccessControlRule> = React.useMemo(
    () => [
      {
        key: "name",
        render: (current: IAccessControlRule) => {
          return (
            <Text>
              <TableDetailLink currentRow={current}>
                {current?.name}
              </TableDetailLink>
            </Text>
          );
        },
      },
      {
        key: "ip",
        render: (current: IAccessControlRule) => {
          return current?.rule;
        },
      },
      {
        key: "strategy",
        filters: accessControlRuleTypeList.map((it) => ({
          value: it.value,
          text: it.label,
        })),
        render: (current: IAccessControlRule) => {
          return accessControlRuleTypeMap.get(current.strategy);
        },
      },
    ],
    [intl],
  );

  return useColumnConfig<IAccessControlRule>(columnConfig);
};

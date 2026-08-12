import { Button, Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { securityGroupRuleList } from "@zstack/virtualization-resource/src/gql/security-group.gql";
import { useSecurityGroupRulesColumns } from "@zstack/virtualization-resource/src/pages/security-group/action/import-sg-rules";
import { handleDownloadSgRule } from "@zstack/virtualization-resource/src/pages/security-group/config/useActionConfig";
import { Auth } from "@zstack/zsphere-components";
import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type {
  IListProps,
  SecurityGroupRuleType,
  IQuery,
} from "@zstack/zsphere-types";
import type {
  SecurityGroupRule as ISecurityGroupRule,
  SecurityGroup as ISecurityGroup,
} from "@zstack/zsphere-types/graphql";
import { usePersistFn } from "ahooks";
import { Dropdown, Menu } from "antd";
import { compact as _compact, orderBy as _orderBy } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

import { useActionConfig, useQueryConfig, useColumnConfig } from "../config";

interface IProps extends IListProps<ISecurityGroupRule> {
  securityGroup: ISecurityGroup[];
  ruleType: SecurityGroupRuleType;
}

const SecurityGroupRuleList: React.FC<
  IProps & Partial<ITableListProps<ISecurityGroupRule>>
> = ({
  securityGroup,
  ruleType,
  defaultQuery = {},
  selectType = "checkbox",
  columnKeys = [],
  ...props
}) => {
  const intl = useIntl();

  const queryConfig = useQueryConfig();
  const actionConfig = useActionConfig(securityGroup, ruleType);
  const columnConfig = useColumnConfig();

  const columns = useSecurityGroupRulesColumns();

  const paginationRef = React.useRef<{ start: number; limit: number }>({
    start: 0,
    limit: 10,
  });

  const toolbar: ITableListProps<ISecurityGroupRule>["toolbar"] = [
    "refresh",
    "operation",
  ];

  const getCheckboxProps = (current: ISecurityGroupRule) => {
    return { disabled: current.priority === 0 };
  };

  const onDownloadClick = usePersistFn((page: string) => {
    if (props?.source?.__typename === "SecurityGroup") {
      if (page === "current") {
        const { start: _start, limit } = paginationRef.current;

        const start = _start;
        const end = _start + limit;

        const rules = _orderBy(
          _compact((props.source as ISecurityGroup).rules).filter(
            (it) => it.type === ruleType,
          ),
          "priority",
        )
          .slice(start, end)
          .filter((it) => it.priority !== 0);

        handleDownloadSgRule(rules, columns, intl);

        return;
      }

      const rules = _orderBy(
        _compact((props.source as ISecurityGroup).rules).filter(
          (it) => it.type === ruleType,
        ),
        "priority",
      )
        .slice(0, 500)
        .filter((it) => it.priority !== 0);

      handleDownloadSgRule(rules, columns, intl);
    }
  });

  const limitMenu = (
    <Menu>
      <Menu.Item onClick={() => onDownloadClick("current")}>
        {intl.formatMessage({
          id: "currentPage",
          defaultMessage: "Current Page",
        })}
      </Menu.Item>
      <Menu.Item onClick={() => onDownloadClick("all")}>
        {intl.formatMessage({
          id: "all",
          defaultMessage: "All",
        })}
      </Menu.Item>
    </Menu>
  );

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={securityGroupRuleList}
      type="securityGroupRuleList"
      resource="security.group.rule"
      showSizeChanger={false}
      toolbar={toolbar}
      allGqlKeysWhenExport
      rowSelection={{
        getCheckboxProps,
      }}
      renderRightToolbar={() => (
        <Auth resource="common" type="block" authKey="export.to.csv">
          <Dropdown overlay={limitMenu} placement="bottomRight">
            <Tooltip
              title={intl.formatMessage({
                id: "export",
                defaultMessage: "Export ",
              })}
            >
              <Button variant="ghost" icon={<Icon type="download" />} />
            </Tooltip>
          </Dropdown>
        </Auth>
      )}
      paginationProps={{
        computePagination: (query: IQuery) => {
          const { start = 0, limit = 10 } = query ?? {};

          const _pagination = { start, limit };

          paginationRef.current = _pagination;

          return _pagination;
        },
      }}
      defaultQuery={defaultQuery}
      selectType={selectType}
      columnKeys={columnKeys}
      {...props}
    />
  );
};

export default SecurityGroupRuleList;

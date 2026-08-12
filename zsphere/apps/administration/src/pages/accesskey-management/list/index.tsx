import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { AccessKey as IAccessKey } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { accessKeyList } from "../../../gql/accesskey.gql";
import { useActionConfig, useColumnConfig, useQueryConfig } from "../config";

const AccessKeyList: React.FC<IListProps<IAccessKey>> = ({
  defaultQuery = {},
  selectType = "checkbox",
  columnKeys = [],
  ...props
}) => {
  const intl = useIntl();
  const queryConfig = useQueryConfig();
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig();

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      toolbarHandleTooltip={{
        title: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "accesskey.tab.local.tooltip",
              defaultMessage:
                "### AccessKey Management\n\nAn AccessKey pair is a security credential that one party authorizes another party to call API operations and access its resources on the platform. An AccessKey pair consists of AccessKey ID and AccessKey secret. AccessKey pairs shall be kept confidential.",
            })}
          </ReactMarkdown>
        ),
      }}
      gql={accessKeyList}
      resource="accesskey.management.local"
      type="AccessKey"
      defaultQuery={defaultQuery}
      selectType={selectType}
      columnKeys={columnKeys}
      {...props}
    />
  );
};

export default AccessKeyList;

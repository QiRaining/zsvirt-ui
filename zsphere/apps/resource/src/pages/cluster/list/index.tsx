import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import { mergeWith } from "lodash-es";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { queryClusterList } from "../../../gql/cluster.gql";
import { useActionConfig, useColumnConfig, useQueryConfig } from "../config";
import { ETabType } from "../constant";

export default ({ helper = {}, ...props }: IListProps<ICluster>) => {
  const intl = useIntl();

  const defaultQuery = useMemo(() => {
    return mergeWith({}, props.defaultQuery, (objValue, srcValue) => {
      if (Array.isArray(objValue)) {
        return objValue.concat(srcValue);
      }
    });
  }, [props.defaultQuery]);

  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig({ view: props?.view });
  const queryConfig = useQueryConfig(defaultQuery);

  const helperMemo: ITableListProps<ICluster>["helper"] = useMemo(
    () => ({
      authKey: `create.cluster`,
      text: intl.formatMessage({
        id: "cluster.hepler",
        defaultMessage: "No available clusters in the Data Center .",
      }),
      microAppName: "hardware",
      to: "/cluster/create",
      ...helper,
    }),
    [intl, helper],
  );

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={queryClusterList}
      type="Cluster"
      helper={helperMemo}
      resource="cluster"
      rowSelection={{
        getCheckboxProps: () => {
          const current = props.source?.current;
          const isBaremetal = props.source?.type === ETabType.BAREMETAL;
          return {
            disabled:
              current?.__typename === "L2Network" &&
              !!current?.isDefault &&
              !isBaremetal,
          };
        },
      }}
      defaultQuery={defaultQuery}
      {...props}
    />
  );
};

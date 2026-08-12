import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { SNSTextTemplate } from "@zstack/zsphere-types/graphql";
import { mergeWith } from "lodash-es";
import React, { useMemo } from "react";

import { snsTextTemplateList } from "../../../gql/zwatch-sns-text-template.gql";
import { useActionConfig, useColumnConfig, useQueryConfig } from "../config";
import Header from "./header";

import style from "./style.module.less";

export default ({
  helper: _helper = {},
  ...props
}: IListProps<SNSTextTemplate>) => {
  const defaultQuery = useMemo(() => {
    return mergeWith({}, props.defaultQuery, (objValue, srcValue) => {
      if (Array.isArray(objValue)) {
        return objValue.concat(srcValue);
      }
    });
  }, [props.defaultQuery]);

  const queryConfig = useQueryConfig(defaultQuery);
  const columnConfig = useColumnConfig();
  const actionConfig = useActionConfig();

  return (
    <>
      <Header />
      <div className={style.main}>
        <TableList
          gql={snsTextTemplateList}
          type="SNSTextTemplate"
          queryConfig={queryConfig}
          actionConfig={actionConfig}
          columnConfig={columnConfig}
          {...props}
          defaultQuery={defaultQuery}
        />
      </div>
    </>
  );
};

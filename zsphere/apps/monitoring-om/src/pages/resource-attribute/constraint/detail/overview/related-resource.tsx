import { Op } from "@zstack/zsphere-types";
import type { ResourceAttributeConstraint } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import List from "../../../value/list";

import style from "./style.module.less";

export interface IProps {
  current?: ResourceAttributeConstraint;
}

export default function RelatedResourceList({ current }: IProps) {
  const intl = useIntl();

  return (
    <>
      <div className={style.listTitle}>
        {intl.formatMessage({
          id: "related.resource",
          defaultMessage: "Associated Resource",
        })}
      </div>
      <List
        view="main"
        defaultQuery={{
          conditions: [
            { key: "keyUuid", op: Op.eq, value: current?.keyUuid ?? "" },
            { key: "value", op: Op.eq, value: current?.parameter ?? "" },
          ],
        }}
        source={current}
      />
    </>
  );
}

import { Op } from "@zstack/zsphere-types";
import type { ResourceAttributeKey } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import List from "../../../constraint/list";

import style from "./style.module.less";

export interface IProps {
  current?: ResourceAttributeKey;
}

export default function ConstraintList({ current }: IProps) {
  const intl = useIntl();

  return (
    <>
      <div className={style.listTitle}>
        {intl.formatMessage({
          id: "resource.attribute.value",
          defaultMessage: "Attribute Value",
        })}
      </div>
      <List
        view="main"
        defaultQuery={{
          conditions: [
            { key: "keyUuid", op: Op.eq, value: current?.uuid ?? "" },
          ],
        }}
        source={current}
      />
    </>
  );
}

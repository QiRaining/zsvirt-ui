import { useLazyQuery } from "@apollo/client";
import type { ISelectProps } from "@zstack/zsphere-components";
import { Select } from "@zstack/zsphere-components";
import type { IQuery } from "@zstack/zsphere-types";
import type { ZoneResponse } from "@zstack/zsphere-types/graphql";
import type { FormInstance } from "antd/es/form";
import React from "react";

import { zoneList } from "../../../gql/zone.gql";

interface IProps extends ISelectProps<any> {
  defaultQuery?: IQuery;
  name?: string;
  form?: FormInstance;
}

const ZoneSelector: React.FC<IProps> = ({
  form,
  name,
  defaultQuery,
  ...props
}) => {
  const [query, { data }] = useLazyQuery<
    {
      zoneList: ZoneResponse;
    },
    IQuery
  >(zoneList);

  React.useEffect(() => {
    query({
      variables: defaultQuery,
    });
  }, [defaultQuery]);

  const options = React.useMemo(() => {
    const list = data?.zoneList?.list ?? [];

    return list.map((it) => ({
      label: it.name,
      value: it.uuid,
    }));
  }, [data?.zoneList]);

  return <Select width="m" options={options} {...props} />;
};

export default ZoneSelector;

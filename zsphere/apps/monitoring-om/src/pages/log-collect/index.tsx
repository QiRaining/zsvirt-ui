import { useQuery } from "@apollo/client";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import type { QueryLogCollectResp } from "@zstack/zsphere-types/graphql";
import { useInterval, useUnmount } from "ahooks";
import React, { useMemo, useState } from "react";

import { logCollectList } from "../../gql/collect-log.gql";
import CardList from "./card";
import Empty from "./empty";
import Header from "./header";

const LogCollect: React.FC = () => {
  const [interval, setInterval] = useState<number | null>(null);

  const { data, refetch } = useQuery<{ logCollectList: QueryLogCollectResp }>(
    logCollectList,
  );

  const { list = [] } = data?.logCollectList ?? {};

  useInterval(() => {
    refetch();
  }, interval);

  useActionSubscribe({
    resourceTypeList: ["LogCollect"],
    onFinish: () => {
      setInterval(null);
      refetch();
    },
  });

  useUnmount(() => setInterval(null));

  const content = useMemo(() => {
    if (list?.length === 0) {
      return <Empty list={list} setInterval={setInterval} refetch={refetch} />;
    }

    return <CardList list={list} setInterval={setInterval} refetch={refetch} />;
  }, [list, refetch]);

  return (
    <div className="main-list-header-tabs-container">
      <Header />
      <div>{content}</div>
    </div>
  );
};

export default LogCollect;

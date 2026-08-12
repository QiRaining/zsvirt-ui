import { useQuery } from "@apollo/client";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  NoData,
} from "@zstack/design";
import { Spin } from "@zstack/zsphere-components";
import { Op } from "@zstack/zsphere-types";
import { AuditingSubList } from "auditing/mf-index";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

import { scriptList } from "../../../../gql/script-library.gql";
import ExecuteRecordList from "../../record-list";
import Header from "./header";
import Overview from "./overview";

const Detail: React.FC = () => {
  const intl = useIntl();
  const [searchParams] = useSearchParams();

  // 从 URL 参数中获取 uuid
  const uuid = searchParams.get("uuid") || "";
  const executeRecordDefaultQuery = useMemo(() => {
    return {
      conditions: [
        {
          key: "scriptUuid",
          op: Op.eq,
          value: uuid,
        },
      ],
    };
  }, [uuid]);

  const { loading, data, refetch } = useQuery(scriptList, {
    variables: {
      conditions: [{ key: "uuid", value: uuid, op: Op.eq }],
    },
  });

  const current = data?.scriptList?.list?.[0];

  if (loading) {
    return <Spin />;
  }

  if (!current) {
    return <NoData />;
  }

  return (
    <div className="bg-neutral-0 w-full overflow-y-auto">
      <Header current={current} refetch={refetch} />
      <Tabs defaultValue="overview">
        <TabsList className="pl-6" variant="card">
          <TabsTrigger value="overview">
            {intl.formatMessage({
              id: "overview",
              defaultMessage: "Overview",
            })}
          </TabsTrigger>
          <TabsTrigger value="list">
            {intl.formatMessage({
              id: "execute.record",
              defaultMessage: "Execution Record",
            })}
          </TabsTrigger>
          <TabsTrigger value="audit">
            {intl.formatMessage({ id: "audit", defaultMessage: "Event" })}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="px-[24px] py-[20px]">
            <Overview current={current} />
          </div>
        </TabsContent>
        <TabsContent value="list">
          <div className="px-[24px] py-[20px]">
            <ExecuteRecordList
              view="sub"
              defaultQuery={executeRecordDefaultQuery}
            />
          </div>
        </TabsContent>
        <TabsContent value="audit">
          <div className="px-[24px] py-[20px]">
            <AuditingSubList resourceUuid={current?.uuid} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Detail;

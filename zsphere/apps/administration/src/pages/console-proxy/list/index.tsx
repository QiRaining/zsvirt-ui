import { useQuery } from "@apollo/client";
import { Text } from "@zstack/design";
import { FieldStack } from "@zstack/form";
import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { ProfileType } from "@zstack/zsphere-types";
import type { ConsoleProxyAgentQueryResp } from "@zstack/zsphere-types/graphql";
import _ from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

import { consoleProxyAgentList } from "../../../gql/console-proxy.gql";
import BasicInfo from "./basic-info";

import style from "./style.module.less";

const List: React.FC = () => {
  const intl = useIntl();

  const { loading, data, refetch } = useQuery<{
    consoleProxyAgentList: ConsoleProxyAgentQueryResp;
  }>(consoleProxyAgentList);
  const { list = [], total } = data?.consoleProxyAgentList || {};

  useActionSubscribe({
    resourceTypeList: ["ConsoleProxyAgent"],
    onProgress: () => {
      refetch?.();
    },
  });

  const dataSet = React.useMemo(() => {
    return _.reduce(
      list,
      (obj, current, index) => {
        const resourceKey = `${current.uuid}`;

        if (!obj[resourceKey]) {
          obj[resourceKey] = {
            resourceKey,
            x: 0,
            y: index,
            node: (props: Omit<IDraggableCardProps, "detail">) => (
              <BasicInfo detail={current} {...props} />
            ),
          };
        }

        return obj;
      },
      {} as any,
    );
  }, [list]);

  return (
    <AutoSkeleton name="console-proxy-list" loading={loading}>
      <div className={style.container}>
        <FieldStack>
          <Text className={style["space-title"]}>
            {intl.formatMessage(
              {
                id: "virtualization.console.proxy.count",
                defaultMessage: "Currently, {m} proxy addresses are in the system.",
              },
              {
                m: <span className={style["space-title-num"]}>{total}</span>,
              },
            )}
          </Text>
          <ResponsiveDndCardsLayout
            profileType={ProfileType.OverviewLayoutConfig}
            resourceType="virtualization-monitoring-om-mn-monitoring"
            cols={1}
            dataSet={dataSet}
          />
        </FieldStack>
      </div>
    </AutoSkeleton>
  );
};

export default List;

import type {
  DocumentNode,
  TypedDocumentNode,
  OperationVariables,
  QueryHookOptions,
} from "@apollo/client";
import {
  gql,
  useQuery as useApolloQuery,
  useSubscription,
  useApolloClient,
} from "@apollo/client";
import { genUuid } from "@zstack/utils";
import type { OperationDefinitionNode } from "graphql";
import { print } from "graphql";
import * as _ from "lodash-es";
import { useMemo } from "react";

interface IQuery {
  asyncQuery?: boolean;
  [key: string]: any;
}

const listenAsyncQuery = gql`
  subscription listenAsyncQuery(
    $sessionId: String!
    $queryName: String!
    $queryId: String!
  ) {
    listenAsyncQuery(
      sessionId: $sessionId
      queryName: $queryName
      queryId: $queryId
    ) {
      inventories
    }
  }
`;

interface Item {
  [prop: string]: unknown;
  uuid: string;
  __typename: string;
}
interface listenAsyncQuery {
  inventories: string[];
}
export function useAsyncQuery<
  TData extends { [prop: string]: { list: Item[] } | Item },
  TVariables extends OperationVariables = OperationVariables,
>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: QueryHookOptions<TData, TVariables>,
) {
  const queryId = useMemo(() => genUuid(), []);
  const apolloClient = useApolloClient();

  const defaultQuery = useMemo(() => {
    const variables = _.cloneDeep(options?.variables! ?? {}) as IQuery;
    if (!variables?.asyncQuery) {
      variables.asyncQuery = true;
    }
    return {
      ...options,
      variables,
    } as QueryHookOptions<TData, TVariables>;
  }, [options, queryId]);

  const queryName = useMemo(() => {
    const opreationDefinition = query.definitions?.find(
      (it) => (it as OperationDefinitionNode)?.operation === "query",
    ) as OperationDefinitionNode;
    return opreationDefinition?.name?.value!;
  }, [query]);

  const { data: _data, ...rest } = useApolloQuery(query, {
    context: {
      headers: {
        "x-query-id": queryId,
      },
    },
    ...defaultQuery,
  });
  const { data: subscriptionData } = useSubscription<{
    listenAsyncQuery: listenAsyncQuery;
  }>(listenAsyncQuery, {
    variables: {
      sessionId: localStorage.getItem("sessionId"),
      queryName,
      queryId,
    },
  });

  const updateCache = (id: string, typeName: string, data: any) => {
    apolloClient.writeFragment({
      id: apolloClient.cache.identify({
        __typename: typeName,
        uuid: id,
      }),
      fragment: gql`
      fragment ${typeName}Fragment on ${typeName} {
        ${_.keys(data)?.join(" ")}
      }
    `,
      data,
      broadcast: false, // 只更新需要修改的字段,其余字段不通过fetchPolicy更新
    });
  };

  const data = useMemo(() => {
    const prev: TData = _.cloneDeep(_data)!;
    if (!prev || !subscriptionData?.listenAsyncQuery || !queryName) {
      return prev;
    }

    const { inventories } = subscriptionData.listenAsyncQuery;
    const fragments: { [props: string]: Item } =
      inventories.reduce<{ [prop: string]: Item }>(
        (obj: { [prop: string]: Item }, _inventory: string) => {
          const inventory: Item = JSON.parse(_inventory);
          obj[inventory.uuid] = {
            ...obj?.[inventory.uuid],
            ...inventory,
          };
          return obj;
        },
        {},
      ) ?? {};
    let _result = prev;
    if (_.keys(fragments)?.length) {
      if ((prev?.[queryName]?.list as Item[])?.length) {
        // 列表查询
        prev[queryName].list = (prev[queryName].list as Item[]).map((item) => {
          const fragment = {
            ...item,
            ...fragments?.[item?.uuid],
          };
          updateCache(item.uuid, item.__typename, fragment);
          return fragment;
        });
        _result = prev;
      } else {
        // 详情页
        const resourceKey = _.keys(prev)?.[0];
        const result = {
          ...prev,
          [resourceKey]: {
            ...prev?.[resourceKey],
            ...fragments?.[(prev?.[resourceKey] as Item)?.uuid],
          },
        };
        _result = result;
      }
      if (
        process.env.NODE_ENV === "development" ||
        localStorage.getItem("debug-ui")
      ) {
        console.log(
          `[Gql AsyncQuery ${
            (query.definitions as ReadonlyArray<OperationDefinitionNode>)?.find(
              (it) => it?.operation === "query",
            )?.name?.value
          }]:`,
          { gql: print(query), result: _result },
        );
      }
    }
    return _result;
  }, [subscriptionData, _data, queryName]);

  return { ...rest, data };
}

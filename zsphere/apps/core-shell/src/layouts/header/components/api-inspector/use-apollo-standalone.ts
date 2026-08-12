import { ApolloClient, InMemoryCache, ApolloLink, gql } from "@apollo/client";
import { HttpLink } from "@apollo/client/link/http";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { ApiInspectorMethod, ApiInspectorType } from "@zstack/zsphere-types";
import type { ApiInspectorDetail } from "@zstack/zsphere-types/graphql";
import { createClient, type Client } from "graphql-ws";
import { useEffect, useState, useRef, useCallback } from "react";

import type { ApiInspectorDetailExtend, StatusType } from "./utils";

interface ApiInspectorResult {
  sessionId: string;
  payload: ApiInspectorDetail;
}

type ApiInspectorListMap = {
  [key in ApiInspectorMethod]: ApiInspectorDetailExtend[];
};

const LIMIT = 500;

const initialCacheList: ApiInspectorListMap = {
  [ApiInspectorMethod.GQL]: [],
  [ApiInspectorMethod.ZQL]: [],
  [ApiInspectorMethod.GET]: [],
  [ApiInspectorMethod.POST]: [],
  [ApiInspectorMethod.PUT]: [],
  [ApiInspectorMethod.DELETE]: [],
  [ApiInspectorMethod.UNKNOWN]: [],
};

const LISTEN_API_INSPECTOR = gql`
  subscription listenApiInspector($sessionId: String!) {
    listenApiInspector(sessionId: $sessionId) {
      sessionId
      payload {
        traceId
        apiId
        type
        method
        timestamp
        zql
        reqPath
        body
        response
        sdkName
      }
    }
  }
`;

function createStandaloneApolloClient(): {
  client: ApolloClient<object>;
  wsClient: Client;
} {
  const uri = "/graphql";
  const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
  const wsUrl = `${wsProtocol}://${window.location.host}/graphql`;

  const wsClient = createClient({
    url: wsUrl,
    shouldRetry: () => true,
    retryAttempts: 5,
  });

  const wsLink = new GraphQLWsLink(wsClient);

  const httpLink = new HttpLink({
    uri: (operation) => `${uri}?gql=${operation.operationName}`,
  });

  const authMiddleware = new ApolloLink((operation, forward) => {
    operation.setContext(({ headers = {} }) => ({
      headers: {
        "x-session-id": localStorage.getItem("sessionId") ?? null,
        ...headers,
      },
    }));
    return forward(operation);
  });

  const splitLink = ApolloLink.split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink,
    authMiddleware.concat(httpLink),
  );

  const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: { errorPolicy: "all", fetchPolicy: "network-only" },
      query: { fetchPolicy: "network-only" },
    },
  });

  return { client, wsClient };
}

interface StandaloneSubscriptionResult {
  data: ApiInspectorDetailExtend[];
  loading: boolean;
  error: Error | null;
  clearData: () => void;
}

export function useStandaloneSubscription(
  enabled: boolean,
): StandaloneSubscriptionResult {
  const [data, setData] = useState<ApiInspectorDetailExtend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const clientRef = useRef<ApolloClient<object> | null>(null);
  const wsClientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const cacheListRef = useRef<ApiInspectorListMap>(initialCacheList);

  const clearData = useCallback(() => {
    setData([]);
    cacheListRef.current = { ...initialCacheList };
  }, []);

  useEffect(() => {
    if (!enabled) {
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
      wsClientRef.current?.dispose();
      wsClientRef.current = null;
      clientRef.current?.stop();
      clientRef.current = null;
      return;
    }

    const { client, wsClient } = createStandaloneApolloClient();
    clientRef.current = client;
    wsClientRef.current = wsClient;

    setLoading(true);
    setError(null);

    const sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      setError(new Error("No session ID found"));
      setLoading(false);
      return;
    }

    const subscription = client
      .subscribe<{ listenApiInspector: ApiInspectorResult }>({
        query: LISTEN_API_INSPECTOR,
        variables: { sessionId },
      })
      .subscribe({
        next({
          data: subData,
        }: {
          data: { listenApiInspector: ApiInspectorResult } | null | undefined;
        }) {
          setLoading(false);
          if (subData?.listenApiInspector?.payload) {
            const payload = subData.listenApiInspector.payload;
            const prevCacheList = cacheListRef.current;

            let newCacheList: ApiInspectorListMap;

            if (payload.type === ApiInspectorType.Request) {
              newCacheList = {
                ...prevCacheList,
                [payload.method]: [
                  ...prevCacheList[payload.method],
                  { ...payload, status: "Pending" as StatusType },
                ]
                  .sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0))
                  .slice(0, LIMIT),
              };
            } else if (payload.type === ApiInspectorType.WaitingWebHook) {
              newCacheList = {
                ...prevCacheList,
                [payload.method]: prevCacheList[payload.method].map((e) =>
                  e.apiId === payload.apiId
                    ? {
                        ...e,
                        status: "WaitingWebHook" as StatusType,
                        webHookResponse: payload.response,
                      }
                    : e,
                ),
              };
            } else if (payload.type === ApiInspectorType.Response) {
              newCacheList = {
                ...prevCacheList,
                [payload.method]: prevCacheList[payload.method].map((e) =>
                  e.apiId === payload.apiId
                    ? {
                        ...e,
                        status: "Done" as StatusType,
                        response: payload.response,
                        responseTime:
                          (payload.timestamp ?? 0) - (e.timestamp ?? 0),
                      }
                    : e,
                ),
              };
            } else {
              newCacheList = prevCacheList;
            }

            cacheListRef.current = newCacheList;
            setData(Object.values(newCacheList).flat());
          }
        },
        error(err: Error) {
          setLoading(false);
          setError(err);
        },
      });

    subscriptionRef.current = subscription;

    return () => {
      subscription.unsubscribe();
      wsClient.dispose();
      client.stop();
    };
  }, [enabled]);

  return { data, loading, error, clearData };
}

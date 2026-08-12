import { gql, useSubscription } from "@apollo/client";
import { Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import { ApiInspectorMethod, ApiInspectorType } from "@zstack/zsphere-types";
import type { ApiInspectorDetail } from "@zstack/zsphere-types/graphql";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useIntl } from "react-intl";

import { cloneDeep, sortBy } from "./lodash-polyfill";
import { useInspectorBroadcaster } from "./use-inspector-channel";
import type { ApiInspectorDetailExtend, StatusType } from "./utils";

type ApiInspectorListMap = {
  [key in ApiInspectorMethod]: ApiInspectorDetailExtend[];
};

interface ApiInspectorResult {
  sessionId: string;
  payload: ApiInspectorDetail;
}

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

const ApiInspector = () => {
  const intl = useIntl();
  const [apiVisible, setApiVisible] = useState<boolean>(false);
  const [cacheList, setCacheList] =
    useState<ApiInspectorListMap>(initialCacheList);

  const popupWindowRef = useRef<Window | null>(null);

  useInspectorBroadcaster(cacheList);

  const { data } = useSubscription<{ listenApiInspector: ApiInspectorResult }>(
    LISTEN_API_INSPECTOR,
    {
      variables: { sessionId: localStorage.getItem("sessionId") },
    },
  );

  const requestCount = useMemo(() => {
    return Object.values(cacheList).reduce((acc, arr) => acc + arr.length, 0);
  }, [cacheList]);

  const pendingCount = useMemo(() => {
    return Object.values(cacheList).reduce(
      (acc, arr) =>
        acc + arr.filter((item) => item.status === "Pending").length,
      0,
    );
  }, [cacheList]);

  const handlePopout = () => {
    if (popupWindowRef.current && !popupWindowRef.current.closed) {
      popupWindowRef.current.focus();
      return;
    }

    const popup = window.open(
      "/inspector-popup",
      "inspector-popup",
      "width=1000,height=700,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes",
    );

    if (popup) {
      popupWindowRef.current = popup;
    }
  };

  useEffect(() => {
    if (data?.listenApiInspector?.payload) {
      if (!apiVisible) {
        setApiVisible(true);
      }
      const payload = data.listenApiInspector.payload || {};

      setCacheList((prevCacheList) => {
        const cacheListNew = cloneDeep(prevCacheList);

        if (payload.type === ApiInspectorType.Request) {
          cacheListNew[payload.method] = sortBy(
            [
              ...cacheListNew[payload.method],
              { ...payload, status: "Pending" as StatusType },
            ],
            "timestamp",
          )?.slice(-LIMIT);
        } else if (payload.type === ApiInspectorType.WaitingWebHook) {
          cacheListNew[payload.method] = cacheListNew[payload.method]?.map(
            (e) => {
              if (e.apiId === payload.apiId) {
                return {
                  ...e,
                  status: "WaitingWebHook" as StatusType,
                  webHookResponse: payload.response,
                };
              }
              return e;
            },
          );
        } else if (payload.type === ApiInspectorType.Response) {
          cacheListNew[payload.method] = cacheListNew[payload.method]?.map(
            (e) => {
              if (e.apiId === payload.apiId) {
                return {
                  ...e,
                  status: "Done" as StatusType,
                  response: payload.response,
                  responseTime: (payload.timestamp ?? 0) - (e.timestamp ?? 0),
                };
              }
              return e;
            },
          );
        }
        return cacheListNew;
      });
    }
  }, [data, apiVisible]);

  if (!apiVisible) {
    return null;
  }

  return (
    <Tooltip
      title={intl.formatMessage({
        id: "apiInspector.popout",
        defaultMessage: "Open API Debugging Window",
      })}
    >
      <button
        onClick={handlePopout}
        className={cn(
          "relative flex h-8 items-center gap-1 rounded px-2.5 transition-all duration-150",
          "text-neutral-0 hover:bg-theme-800 bg-transparent",
        )}
      >
        <Icon className="h-4 w-4" type="activity" />
        {requestCount > 0 && (
          <span
            className={cn(
              "flex h-4 min-w-4 items-center justify-center rounded px-1 text-[10px] leading-none font-medium",
              pendingCount > 0
                ? "bg-alert-500 animate-pulse text-white"
                : "bg-neutral-0/20 text-neutral-0",
            )}
          >
            {requestCount > 99 ? "99+" : requestCount}
          </span>
        )}
      </button>
    </Tooltip>
  );
};

export default React.memo(ApiInspector);

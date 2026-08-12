import { gql, useQuery, useSubscription } from "@apollo/client";
import type { IActionResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IQuery } from "@zstack/zsphere-types";
import type {
  ActionTaskResult,
  QueryOperationLogResp,
} from "@zstack/zsphere-types/graphql";
import { bus } from "@zstack/zsphere-utils";
import React from "react";
import { useIntl } from "react-intl";

const WEB_SSH_URL = gql`
  query webSSHUrl {
    webSSHUrl {
      socketTimeout
    }
  }
`;

const GET_HOST_WEB_SSH_URL = gql`
  mutation getHostWebSshUrl($input: GetHostWebSshUrlInput!) {
    getHostWebSshUrl(input: $input) {
      actionId
    }
  }
`;

const LISTEN_ACTION_RESP = gql`
  subscription listenActionResp($sessionId: String!) {
    listenActionResp(sessionId: $sessionId) {
      actionId
      inventory
      error
    }
  }
`;

const OPERATION_LOG_LIST = gql`
  query operationLogList($conditions: [Condition!], $start: Int, $limit: Int) {
    operationLogList(conditions: $conditions, start: $start, limit: $limit) {
      total
    }
  }
`;

const isWindows =
  ["Windows", "Win16", "Win32", "WinCE"].indexOf(navigator.platform) >= 0;

const termOptions = {
  windowsMode: isWindows,
  cursorBlink: true,
  theme: {
    background: "black",
    foreground: "white",
  },
};

function addDomListener(
  term: Terminal,
  element: HTMLElement | Window,
  type: string,
  handler: (...args: any[]) => any,
): void {
  element.addEventListener(type, handler);
  (term as any)._core.register({
    dispose: () => element.removeEventListener(type, handler),
  });
}

const useWebSocketUrl = (uuid?: string) => {
  const [url, setUrl] = React.useState<string>();
  const [error, setError] = React.useState(false);
  const intl = useIntl();
  const doAction = useAction();

  React.useEffect(() => {
    doAction({
      mutation: GET_HOST_WEB_SSH_URL,
      payload: {
        uuid,
        https: window.location.protocol === "https:",
      },
      name: intl.formatMessage({
        id: "enter.web.terminal",
        defaultMessage: "Enter Web Terminal",
      }),
      total: 1,
      type: "WebSsh",
      onFinish: (result: IActionResult) => {
        if (result?.inventory?.error || !result?.inventory?.webSshSocketUrl) {
          setError(true);
        } else {
          setUrl(result?.inventory?.webSshSocketUrl);
        }
      },
    });
  }, []);

  return { url, error };
};
const useWebsocketData = () => {
  const { data, loading, error } = useQuery(WEB_SSH_URL);

  return {
    loading,
    socketTimeout: data?.webSSHUrl?.socketTimeout,
    error,
  };
};

const validIsLoginout = (error: any) => {
  const errorJSON = JSON.parse(error?.graphQLErrors?.[0]?.message ?? "{}");

  return (
    errorJSON?.code === "ID.1001" ||
    /Invalid sessionId/.test(error?.graphQLErrors?.[0]?.message)
  );
};

const useDataSubscription = () => {
  const [skip, setSkip] = React.useState(false);
  const { data } = useSubscription<{ listenActionResp: ActionTaskResult }>(
    LISTEN_ACTION_RESP,
    {
      variables: { sessionId: localStorage.getItem("sessionId") },
      skip,
    },
  );

  React.useEffect(() => {
    if (data && data.listenActionResp) {
      const { actionId, inventory, error } = data.listenActionResp;

      let inventoryParse;

      try {
        inventoryParse = JSON.parse(inventory!);
      } catch {
        // ignore error
      }

      if (inventoryParse?.webSshSocketUrl || error) {
        bus.emit(`action:finish:${actionId}`, {
          inventory: { ...inventoryParse, error },
        });

        setSkip(true);
      }
    }
  }, [data]);
};
/**
 * 校验登入token
 */
const useValidToken = () => {
  const { error } = useQuery<
    { operationLogList: QueryOperationLogResp },
    IQuery
  >(OPERATION_LOG_LIST, {
    variables: {
      start: 0,
      limit: 1,
    },
    fetchPolicy: "no-cache",
    pollInterval: 10 * 1000,
  });

  return error;
};

export {
  addDomListener,
  termOptions,
  useValidToken,
  useDataSubscription,
  validIsLoginout,
  useWebsocketData,
  useWebSocketUrl,
};

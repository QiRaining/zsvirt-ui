import { useQuery } from "@apollo/client";
import type {
  InternalTimeServerCandidateResult,
  TimeServerResult,
} from "@zstack/zsphere-types/graphql";
import { useInterval } from "ahooks";
import { useRef, useState } from "react";
import { useIntl } from "react-intl";

import {
  getInternalTimeServerCandidates,
  managementNodeList,
  getCurrentTime,
} from "../../gql/time-server.gql";

export enum IModeType {
  OnlyInternal = "OnlyInternal",
  OnlyExternal = "OnlyExternal",
  InternalAndExternal = "InternalAndExternal",
}
interface IMode {
  label: string;
  value: IModeType;
}

export function useServerMode(data?: TimeServerResult) {
  const intl = useIntl();
  const modeMap = new Map<IModeType, IMode>([
    [
      IModeType.OnlyInternal,
      {
        label: intl.formatMessage({ id: "internal", defaultMessage: "Internal" }),
        value: IModeType.OnlyInternal,
      },
    ],
    [
      IModeType.OnlyExternal,
      {
        label: intl.formatMessage({ id: "external", defaultMessage: "External" }),
        value: IModeType.OnlyExternal,
      },
    ],
    [
      IModeType.InternalAndExternal,
      {
        label: intl.formatMessage({
          id: "internal.and.external",
          defaultMessage: "Internal and External",
        }),
        value: IModeType.InternalAndExternal,
      },
    ],
  ]);

  const internalServers = data?.servers.internal || [];
  const internalServerCount = internalServers.length;
  const externalServers = data?.servers.external || [];
  const externalServerCount = externalServers.length;

  let modeType = IModeType.InternalAndExternal;
  if (internalServerCount && !externalServerCount) {
    modeType = IModeType.OnlyInternal;
  }
  if (!internalServerCount && externalServerCount) {
    modeType = IModeType.OnlyExternal;
  }

  return {
    mode: modeMap.get(modeType),
    modeList: Array.from(modeMap.values()),
  };
}

export function useServerHostnames(data?: TimeServerResult) {
  const internal = data?.servers.internal;
  const internalHostnames = internal?.map((item) => item.hostname);
  const external = data?.servers.external;
  const externalHostnames = external?.map((item) => item.hostname);
  return {
    internalHostnames,
    externalHostnames,
  };
}

export function useInternalTimeServerCandidates() {
  const { data, loading, refetch } = useQuery<{
    internalTimeServerCandidates: InternalTimeServerCandidateResult;
  }>(getInternalTimeServerCandidates, {
    fetchPolicy: "network-only",
  });

  const servers = data?.internalTimeServerCandidates.servers || [];

  return {
    refetch,
    servers,
    loading,
  };
}

export function useMnStatus() {
  const { data, loading } = useQuery(managementNodeList);
  const list = data?.managementNodeList.list ?? [];
  const mnAllRunning = list.every((item: any) => item.mnStatus === "running");

  return { mnAllRunning, mnStatusloading: loading };
}

interface ICurrentTime {
  timezone?: string;
  offset?: string;
  currentTime?: {
    MillionSeconds: number;
  };
}

export function useServerTime() {
  const [currentTime, setCurrentTime] = useState<number>();
  const browserServerTimeDiff = useRef(0);

  const { data, loading } = useQuery<{
    getCurrentTime: ICurrentTime;
  }>(getCurrentTime, {
    onCompleted: (result) => {
      const serverTime = result?.getCurrentTime?.currentTime?.MillionSeconds;
      if (serverTime) {
        browserServerTimeDiff.current = Date.now() - serverTime;
      }
    },
    fetchPolicy: "no-cache",
  });

  const timezone = data?.getCurrentTime.timezone;
  const offset = data?.getCurrentTime.offset;

  useInterval(
    () => {
      if (!loading) {
        setCurrentTime(Date.now() - browserServerTimeDiff.current);
      }
    },
    1000,
    { immediate: true },
  );

  return { loading, currentTime, timezone, offset };
}

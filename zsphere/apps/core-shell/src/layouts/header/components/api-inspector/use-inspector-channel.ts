import type { ApiInspectorMethod } from "@zstack/zsphere-types";
import { useEffect, useRef, useCallback, useState } from "react";

import type { ApiInspectorDetailExtend } from "./utils";

const CHANNEL_NAME = "zstack-api-inspector";

const PING_TIMEOUT_MS = 2000;
const PING_INTERVAL_MS = 5000;
const CHUNK_SIZE = 20;

type MessageType =
  | "DATA"
  | "CLEAR"
  | "PING"
  | "PONG"
  | "CHUNK_START"
  | "CHUNK"
  | "CHUNK_END";

interface InspectorMessage {
  type: MessageType;
  payload?: ApiInspectorDetailExtend[];
  timestamp: number;
  chunkInfo?: {
    id: string;
    index: number;
    total: number;
  };
}

function generateChunkId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function sendInChunks(
  channel: BroadcastChannel,
  items: ApiInspectorDetailExtend[],
  baseType: "DATA" | "PONG",
): void {
  const timestamp = Date.now();

  if (items.length <= CHUNK_SIZE) {
    try {
      channel.postMessage({
        type: baseType,
        payload: items,
        timestamp,
      } satisfies InspectorMessage);
      return;
    } catch {
      // fall through to chunked
    }
  }

  const chunkId = generateChunkId();
  const chunks: ApiInspectorDetailExtend[][] = [];

  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    chunks.push(items.slice(i, i + CHUNK_SIZE));
  }

  try {
    channel.postMessage({
      type: "CHUNK_START",
      timestamp,
      chunkInfo: { id: chunkId, index: 0, total: chunks.length },
    } satisfies InspectorMessage);
  } catch {
    return;
  }

  for (let i = 0; i < chunks.length; i++) {
    try {
      channel.postMessage({
        type: "CHUNK",
        payload: chunks[i],
        timestamp,
        chunkInfo: { id: chunkId, index: i, total: chunks.length },
      } satisfies InspectorMessage);
    } catch {
      // continue
    }
  }

  try {
    channel.postMessage({
      type: "CHUNK_END",
      timestamp,
      chunkInfo: { id: chunkId, index: chunks.length, total: chunks.length },
    } satisfies InspectorMessage);
  } catch {
    // ignore
  }
}

function safePostMessage(
  channel: BroadcastChannel | null,
  message: InspectorMessage,
): void {
  if (!channel) {
    return;
  }
  try {
    channel.postMessage(message);
  } catch {
    // ignore
  }
}

type ApiInspectorListMap = {
  [key in ApiInspectorMethod]: ApiInspectorDetailExtend[];
};

export function useInspectorBroadcaster(cacheList: ApiInspectorListMap): void {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const cacheListRef = useRef(cacheList);

  cacheListRef.current = cacheList;

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);

    return () => {
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<InspectorMessage>) => {
      if (event.data.type === "PING" && channelRef.current) {
        const allData = Object.values(cacheListRef.current).flat();
        sendInChunks(channelRef.current, allData, "PONG");
      }
    };

    channelRef.current?.addEventListener("message", handleMessage);

    return () => {
      channelRef.current?.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    if (channelRef.current) {
      const allData = Object.values(cacheList).flat();
      sendInChunks(channelRef.current, allData, "DATA");
    }
  }, [cacheList]);
}

export function useBroadcastClear(): () => void {
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);
    return () => {
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, []);

  return useCallback(() => {
    safePostMessage(channelRef.current, {
      type: "CLEAR",
      timestamp: Date.now(),
    });
  }, []);
}

interface ReceiverResult {
  data: ApiInspectorDetailExtend[];
  isMainWindowActive: boolean;
  clearData: () => void;
}

interface ChunkBuffer {
  id: string;
  chunks: Map<number, ApiInspectorDetailExtend[]>;
  total: number;
  receivedAt: number;
}

export function useInspectorReceiver(): ReceiverResult {
  const [data, setData] = useState<ApiInspectorDetailExtend[]>([]);
  const [isMainWindowActive, setIsMainWindowActive] = useState(true);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const pingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunkBufferRef = useRef<ChunkBuffer | null>(null);

  const clearData = useCallback(() => {
    setData([]);
  }, []);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);
    const channel = channelRef.current;

    const handleMessage = (event: MessageEvent<InspectorMessage>) => {
      const { type, payload, chunkInfo } = event.data;

      switch (type) {
        case "DATA":
        case "PONG":
          setIsMainWindowActive(true);
          if (payload) {
            setData(payload);
          }
          if (type === "PONG" && pingTimeoutRef.current) {
            clearTimeout(pingTimeoutRef.current);
            pingTimeoutRef.current = null;
          }
          break;

        case "CHUNK_START":
          setIsMainWindowActive(true);
          if (chunkInfo) {
            chunkBufferRef.current = {
              id: chunkInfo.id,
              chunks: new Map(),
              total: chunkInfo.total,
              receivedAt: Date.now(),
            };
          }
          if (pingTimeoutRef.current) {
            clearTimeout(pingTimeoutRef.current);
            pingTimeoutRef.current = null;
          }
          break;

        case "CHUNK":
          if (
            chunkInfo &&
            payload &&
            chunkBufferRef.current?.id === chunkInfo.id
          ) {
            chunkBufferRef.current.chunks.set(chunkInfo.index, payload);
          }
          break;

        case "CHUNK_END":
          if (chunkInfo && chunkBufferRef.current?.id === chunkInfo.id) {
            const buffer = chunkBufferRef.current;
            const assembled: ApiInspectorDetailExtend[] = [];

            for (let i = 0; i < buffer.total; i++) {
              const chunk = buffer.chunks.get(i);
              if (chunk) {
                assembled.push(...chunk);
              }
            }

            setData(assembled);
            chunkBufferRef.current = null;
          }
          break;

        case "CLEAR":
          setData([]);
          chunkBufferRef.current = null;
          break;
      }
    };

    channel.addEventListener("message", handleMessage);

    const sendPing = () => {
      channel.postMessage({
        type: "PING",
        timestamp: Date.now(),
      } satisfies InspectorMessage);

      pingTimeoutRef.current = setTimeout(() => {
        setIsMainWindowActive(false);
      }, PING_TIMEOUT_MS);
    };

    sendPing();

    pingIntervalRef.current = setInterval(() => {
      sendPing();
    }, PING_INTERVAL_MS);

    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
      channelRef.current = null;
      chunkBufferRef.current = null;

      if (pingTimeoutRef.current) {
        clearTimeout(pingTimeoutRef.current);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    };
  }, []);

  return {
    data,
    isMainWindowActive,
    clearData,
  };
}

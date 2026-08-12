export interface HaVmStateRefreshEvent {
  eventKey: string;
  resourceUuid: string;
}

export function getHaVmStateRefreshEvent(
  payload: string,
): HaVmStateRefreshEvent | undefined {
  try {
    const parsed = JSON.parse(payload) as {
      haProgress?: {
        info?: unknown;
        parameters?: { fireId?: unknown; haProcess?: unknown };
        resourceType?: unknown;
        resourceUuid?: unknown;
      };
    };
    const haProgress = parsed.haProgress;
    if (
      haProgress?.resourceType !== "VmInstanceVO" ||
      haProgress.parameters?.haProcess !== "success"
    ) {
      return undefined;
    }

    const resourceUuid = haProgress.resourceUuid;
    if (typeof resourceUuid !== "string" || resourceUuid.length === 0) {
      return undefined;
    }

    const fireId = haProgress.parameters?.fireId;
    return {
      eventKey:
        typeof fireId === "string" && fireId.length > 0
          ? fireId
          : `${resourceUuid}:${String(haProgress.info ?? "")}`,
      resourceUuid,
    };
  } catch {
    return undefined;
  }
}

export function shouldRefreshHaVmState({
  handledEventKeys,
  payload,
}: {
  handledEventKeys: Set<string>;
  payload?: string;
}): { shouldRefresh: boolean; resourceUuid?: string } {
  if (!payload) {
    return { shouldRefresh: false };
  }

  const refreshEvent = getHaVmStateRefreshEvent(payload);
  if (!refreshEvent || handledEventKeys.has(refreshEvent.eventKey)) {
    return { shouldRefresh: false };
  }

  handledEventKeys.add(refreshEvent.eventKey);
  return { shouldRefresh: true, resourceUuid: refreshEvent.resourceUuid };
}

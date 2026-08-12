import { describe, expect, it } from "vitest";

import {
  getHaVmStateRefreshEvent,
  shouldRefreshHaVmState,
} from "./ha-progress-vm-state";

describe("ha progress vm state refresh guard", () => {
  it("extracts the HA resource uuid", () => {
    expect(
      getHaVmStateRefreshEvent(
        JSON.stringify({
          haProgress: {
            parameters: { fireId: "fire-uuid", haProcess: "success" },
            resourceType: "VmInstanceVO",
            resourceUuid: "vm-uuid",
          },
        }),
      ),
    ).toEqual({ eventKey: "fire-uuid", resourceUuid: "vm-uuid" });
  });

  it("ignores HA progress for non-VM resources", () => {
    expect(
      getHaVmStateRefreshEvent(
        JSON.stringify({
          haProgress: {
            parameters: { haProcess: "success" },
            resourceType: "HostVO",
            resourceUuid: "host-uuid",
          },
        }),
      ),
    ).toBe(undefined);
  });

  it("ignores non-success VM HA progress", () => {
    expect(
      getHaVmStateRefreshEvent(
        JSON.stringify({
          haProgress: {
            parameters: { haProcess: "running" },
            resourceType: "VmInstanceVO",
            resourceUuid: "vm-uuid",
          },
        }),
      ),
    ).toBe(undefined);
  });

  it("ignores non-HA zwatch payloads", () => {
    expect(
      shouldRefreshHaVmState({
        handledEventKeys: new Set(),
        payload: JSON.stringify({ name: "Alarm" }),
      }),
    ).toEqual({ shouldRefresh: false });
  });

  it("allows completed VM HA progress on any page", () => {
    expect(
      shouldRefreshHaVmState({
        handledEventKeys: new Set(),
        payload: JSON.stringify({
          haProgress: {
            parameters: { fireId: "fire-uuid", haProcess: "success" },
            resourceType: "VmInstanceVO",
            resourceUuid: "vm-uuid",
          },
        }),
      }),
    ).toEqual({ shouldRefresh: true, resourceUuid: "vm-uuid" });
  });

  it("dedupes repeated VM HA progress events", () => {
    const handledEventKeys = new Set<string>();
    const payload = JSON.stringify({
      haProgress: {
        parameters: { fireId: "fire-uuid", haProcess: "success" },
        resourceType: "VmInstanceVO",
        resourceUuid: "vm-uuid",
      },
    });

    expect(shouldRefreshHaVmState({ handledEventKeys, payload })).toEqual({
      shouldRefresh: true,
      resourceUuid: "vm-uuid",
    });
    expect(shouldRefreshHaVmState({ handledEventKeys, payload })).toEqual({
      shouldRefresh: false,
    });
  });

  it("falls back to resource uuid and info when fire id is missing", () => {
    expect(
      getHaVmStateRefreshEvent(
        JSON.stringify({
          haProgress: {
            info: "HA is successfully completed",
            parameters: { haProcess: "success" },
            resourceType: "VmInstanceVO",
            resourceUuid: "vm-uuid",
          },
        }),
      ),
    ).toEqual({
      eventKey: "vm-uuid:HA is successfully completed",
      resourceUuid: "vm-uuid",
    });
  });

  it("ignores completed HA progress after the event has been handled", () => {
    const handledEventKeys = new Set(["fire-uuid"]);

    expect(
      shouldRefreshHaVmState({
        handledEventKeys,
        payload: JSON.stringify({
          haProgress: {
            parameters: { fireId: "fire-uuid", haProcess: "success" },
            resourceType: "VmInstanceVO",
            resourceUuid: "vm-uuid",
          },
        }),
      }),
    ).toEqual({ shouldRefresh: false });
  });
});

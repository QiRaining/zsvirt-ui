export type DisplayLocationType = "list" | "detail";
export type ISortBy = "count" | "size";
export interface ISnapShotContext {
  store: {
    snapshotUuid?: string | undefined;
    snapshotType?: string | undefined;
  };
  setStore: (v: {
    snapshotUuid?: string | undefined;
    snapshotType?: string | undefined;
  }) => void;
}

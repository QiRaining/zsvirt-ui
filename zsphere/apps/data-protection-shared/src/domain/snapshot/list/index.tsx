import { gql, useLazyQuery } from "@apollo/client";
import { ResizableLayout } from "@zstack/zsphere-design-biz";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { Op } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import cls from "classnames";
import React, { useCallback, useMemo, useState, useEffect } from "react";

import SnapShotDetail from "../detail";
import { SnapshotContext } from "../hooks";
import type { DisplayLocationType, ISnapShotContext } from "../types";
import MainList from "./main-list";
import SideList from "./side-list";

import styles from "./style.module.less";

interface IProps {
  displayLocation?: DisplayLocationType;
  current?: IVM;
}

const GET_VM_SNAP_COUNT_LIST = gql`
  query getVMSnapshoCount($conditions: [Condition!]) {
    volumeSnapshotList(conditions: $conditions) {
      total
    }
  }
`;

const RESIZABLE_SIZE_KEY = "snapshotListWidth";
const DEFAULT_WIDTH = 480;

const Main: React.FC<IProps> = ({ displayLocation = "list", current }) => {
  const [store, setStore] = useState<ISnapShotContext["store"]>({});
  const [source, setSource] = useState<any>();
  const [_resizing, setResizing] = useState(false);

  const handleChange = useCallback((item) => {
    setSource(item ?? {});
    if (item?.resourceType !== "vm") {
      setStore({ snapshotUuid: item?.key, snapshotType: item?.snapshotType });
    } else {
      setStore({});
    }
  }, []);

  const volumeUuid = useMemo(() => {
    return current?.rootVolumeUuid ?? source?.volumeUuid;
  }, [current?.rootVolumeUuid, source?.volumeUuid]);

  const [getSnapshoCount, { data: currentVmSnapshotList }] = useLazyQuery(
    GET_VM_SNAP_COUNT_LIST,
  );

  useEffect(() => {
    if (volumeUuid) {
      getSnapshoCount({
        variables: {
          conditions: [
            {
              key: "volumeUuid",
              op: Op.eq,
              value: volumeUuid,
            },
          ],
        },
      });
    }
  }, [getSnapshoCount, volumeUuid]);

  useActionSubscribe({
    resourceTypeList: ["VolumeSnapshotTree", "VolumeSnapshot"],
    onFinish: () => {
      getSnapshoCount({
        variables: {
          conditions: [
            {
              key: "volumeUuid",
              op: Op.eq,
              value: volumeUuid,
            },
          ],
        },
      });
    },
  });

  const snapshotCount = useMemo(
    () => currentVmSnapshotList?.volumeSnapshotList?.total,
    [currentVmSnapshotList?.volumeSnapshotList?.total],
  );

  const isWarning = useMemo(() => snapshotCount >= 5, [snapshotCount]);

  const renderEle = useMemo(() => {
    const snapShotDetailEle = (
      <SnapShotDetail
        snapshotUuid={store?.snapshotUuid}
        snapshotType={store?.snapshotType}
        displayLocation={displayLocation}
      />
    );
    if (!source) {
      return null;
    }
    if (displayLocation === "list") {
      if (store?.snapshotUuid) {
        return snapShotDetailEle;
      }

      return (
        <MainList
          source={source}
          view="main.virtualization"
          snapshotCount={snapshotCount}
        />
      );
    }
    return snapShotDetailEle;
  }, [store, displayLocation, source, snapshotCount]);

  return (
    <SnapshotContext.Provider
      value={{
        store,
        setStore,
      }}
    >
      <div className={styles.body}>
        <ResizableLayout
          storageKey={RESIZABLE_SIZE_KEY}
          defaultSize={DEFAULT_WIDTH}
          minSize={320}
          maxSize={600}
          direction="horizontal"
          resizeEdge="right"
          onResizingChange={setResizing}
        >
          <SideList
            onChange={handleChange}
            displayLocation={displayLocation}
            source={current}
            isWarning={isWarning}
          />
        </ResizableLayout>
        <div
          className={cls(
            displayLocation === "list" ? styles.table : styles.detail,
          )}
        >
          {renderEle}
        </div>
      </div>
    </SnapshotContext.Provider>
  );
};

export default Main;

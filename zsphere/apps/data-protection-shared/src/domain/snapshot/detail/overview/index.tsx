import { Spin, Action } from "@zstack/zsphere-components";
import type { VolumeSnapshotGroup as IVolumeSnapshotGroup } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import { useActionConfig } from "../../config";
import type { DisplayLocationType } from "../../types";
import BasicInfo from "./basic-info";
import List from "./list";

interface IProps {
  displayLocation: DisplayLocationType;
  detail: IVolumeSnapshotGroup;
  loading: boolean;
  refetch?: () => void;
}

const Overview: React.FC<IProps> = ({
  displayLocation,
  detail,
  loading,
  refetch,
}) => {
  const { list, viewMap } = useActionConfig();

  const renderContent = useMemo(() => {
    if (loading) {
      return <Spin size="large" />;
    }
    return (
      <>
        <div style={{ marginBottom: "8px", display: "flex" }}>
          <Action
            view="main.virtualization"
            menuList={list}
            viewMap={viewMap}
            position="header"
            refetch={refetch}
            selectedList={[detail]}
            source={detail}
          />
        </div>
        <BasicInfo detail={detail} displayLocation={displayLocation} />
        <List uuid={detail?.uuid} snapshotType={detail?.snapshotType} />
      </>
    );
  }, [loading, detail, list, viewMap, refetch, displayLocation]);

  return <>{renderContent}</>;
};

export default Overview;

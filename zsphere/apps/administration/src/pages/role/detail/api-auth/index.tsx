import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { ZsvRole } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useState } from "react";

import ApiModal from "./api-modal";
import BizReliabilityInfo from "./bizReliabilityInfo";
import DataProtectionInfo from "./dataProtectionInfo";
import OpsManagementInfo from "./opsManagementInfo";
import ResInventoryAuthInfo from "./resInventoryAuthInfo";
import SysAdminAuthInfo from "./sysAdminAuthInfo";

interface IApiPrivilegeListProps {
  current: ZsvRole;
  refetch: () => void;
}

const ApiPrivilegeList: React.FC<IApiPrivilegeListProps> = ({ current }) => {
  const [apiModalVisible, setApiModalVisible] = useState<boolean>(false);
  const [currentModule, setCurrentModule] = useState<any[]>([]);
  const [title, setTitle] = useState<string>("");

  const handleViewClick = ({
    title: _title,
    apiList,
  }: {
    title: string;
    apiList: any[];
  }) => {
    setCurrentModule(apiList);
    setTitle(_title);
    setApiModalVisible(true);
  };

  const dataSet = useMemo(() => {
    const result: any = {
      resInventoryAuth: {
        resourceKey: "resInventoryAuth",
        x: 0,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <ResInventoryAuthInfo
            handleViewClick={handleViewClick}
            detail={current}
            {...props}
          />
        ),
      },
      bizReliability: {
        resourceKey: "bizReliability",
        x: 1,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <BizReliabilityInfo
            handleViewClick={handleViewClick}
            detail={current}
            {...props}
          />
        ),
      },
      dataProtection: {
        resourceKey: "dataProtection",
        x: 0,
        y: 1,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <DataProtectionInfo
            handleViewClick={handleViewClick}
            detail={current}
            {...props}
          />
        ),
      },
      opsManagement: {
        resourceKey: "opsManagement",
        x: 1,
        y: 1,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <OpsManagementInfo
            handleViewClick={handleViewClick}
            detail={current}
            {...props}
          />
        ),
      },
      sysAdminAuth: {
        resourceKey: "sysAdminAuth",
        x: 1,
        y: 2,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <SysAdminAuthInfo
            handleViewClick={handleViewClick}
            detail={current}
            {...props}
          />
        ),
      },
    };
    return result;
  }, [current]);

  return (
    <>
      <div className="zsv-detail-container">
        <ResponsiveDndCardsLayout
          profileType={ProfileType.OverviewLayoutConfig}
          resourceType="zsv-role-auth-api-privilege"
          cols={2}
          dataSet={dataSet}
        />
      </div>
      {apiModalVisible && (
        <ApiModal
          title={title}
          visible={apiModalVisible}
          setVisible={setApiModalVisible}
          selectedList={currentModule}
        />
      )}
    </>
  );
};

export default ApiPrivilegeList;

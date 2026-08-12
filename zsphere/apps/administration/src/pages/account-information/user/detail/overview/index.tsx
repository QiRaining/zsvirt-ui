import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import { ProfileType, AccountType } from "@zstack/zsphere-types";
import type { AccountVO as IAccount } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import BasicInfo from "./basic-info";
import QuotaInfo from "./quota-info";

interface IProps {
  current: IAccount;
  refetch?: any;
}

const Overview: React.FC<IProps> = ({ current, refetch }) => {
  const dataSet = useMemo(() => {
    const result: any = {
      basicInfo: {
        resourceKey: "basicInfo",
        x: 0,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <BasicInfo {...props} refetch={refetch} detail={current} />
        ),
      },
      ...(current?.type === AccountType.SystemAdmin
        ? {}
        : {
            relatedResource: {
              resourceKey: "relatedResource",
              x: 1,
              y: 0,
              node: (props: Omit<IDraggableCardProps, "detail">) => (
                <QuotaInfo {...props} refetch={refetch} detail={current} />
              ),
            },
          }),
    };
    return result;
  }, [current]);

  return (
    <div className="zsv-detail-container">
      <ResponsiveDndCardsLayout
        profileType={ProfileType.OverviewLayoutConfig}
        resourceType="account-information"
        cols={2}
        dataSet={dataSet}
      />
    </div>
  );
};

export default Overview;

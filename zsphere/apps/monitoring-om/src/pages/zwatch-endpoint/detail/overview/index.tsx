import type { IDraggableCardProps } from "@zstack/zsphere-components";
// import React, { FC } from 'react'
// import { Row, Col } from 'antd'
// import { EndPoint as IEndPoint } from '@zstack/zsphere-types/graphql'
// import BasicInfo from './basic-info'
// import style from './style.module.less'
// interface IProps {
//   current: IEndPoint
//   refetch: any
// }
// const Overview: FC<IProps> = ({ current, refetch }) => {
//   return (
//     <div className={`flex gap-5 ${style.container}`}>
//       <div className="w-[100%]">
//         <BasicInfo detail={current} refetch={refetch} />
//       </div>
//     </div>
//   )
// }
// export default Overview
import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { EndPoint } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import BasicInfo from "./basic-info";

import style from "./style.module.less";

interface IProps {
  current: EndPoint;
  refetch?: any;
  resourceConfig?: any;
}

const cols = 1;

const Overview: React.FC<IProps> = ({ current, refetch, resourceConfig }) => {
  const _intl = useIntl();

  const dataSet = useMemo(() => {
    return {
      basicInfo: {
        resourceKey: "basicInfo",
        x: 0,
        y: 0,
        node: (_props: Omit<IDraggableCardProps, "detail">) => (
          <BasicInfo detail={current} refetch={refetch} />
        ),
      },
    };
  }, [current]);

  return cols === 1 ? (
    <BasicInfo className={style.oneCol} detail={current} refetch={refetch} />
  ) : (
    <ResponsiveDndCardsLayout
      profileType={ProfileType.OverviewLayoutConfig}
      resourceType="virtualization-resource-vm"
      cols={cols}
      dataSet={dataSet}
    />
  );
};

export default Overview;

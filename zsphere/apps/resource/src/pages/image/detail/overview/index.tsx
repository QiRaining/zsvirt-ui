import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { Image as IImage } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import BasicInfo from "./basic-info";
import ExportInfo from "./export-info";
import RelativeResource from "./relative-object";

import style from "./style.module.less";

interface IProps {
  current: IImage;
  refetch?: any;
}

const Overview: React.FC<IProps> = ({ current, refetch }) => {
  const showExportInfo = !!current?.backupStorageRefs?.[0]?.exportUrl;

  const dataSet = useMemo(() => {
    return {
      basicInfo: {
        resourceKey: "basicInfo",
        x: 0,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <BasicInfo detail={current} {...props} />
        ),
      },
      relativeResource: {
        resourceKey: "relativeResource",
        x: 1,
        y: 1,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <RelativeResource detail={current} refetch={refetch} {...props} />
        ),
      },
      ...(showExportInfo
        ? {
            exportInfo: {
              resourceKey: "exportInfo",
              x: 1,
              y: 0,
              node: (props: Omit<IDraggableCardProps, "detail">) => (
                <ExportInfo detail={current} {...props} />
              ),
            },
          }
        : {}),
    };
  }, [current, showExportInfo]);

  return (
    <div className={style.container}>
      <ResponsiveDndCardsLayout
        profileType={ProfileType.OverviewLayoutConfig}
        resourceType="virtualization-resource-image"
        cols={2}
        dataSet={dataSet}
      />
    </div>
  );
};

export default Overview;

import { useQuery } from "@apollo/client";
import type { ILayoutItem } from "@zstack/zsphere-components";
import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import { ProfileType } from "@zstack/zsphere-types";
import type { CertInfo } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import { queryCertInfo } from "../gql/cert.gql";
import CertificateInfo from "./certificate-info";
import IssuerInfo from "./issuer-info";
import OtherInfo from "./other-info";
import Toolbar from "./toolbar";

import style from "./style.module.less";

interface IResp {
  queryCertInfo?: CertInfo;
}

export default function Detail() {
  const { data, loading } = useQuery<IResp>(queryCertInfo, {
    fetchPolicy: "no-cache",
  });

  const current = data?.queryCertInfo;

  const dataSet = useMemo<Record<string, ILayoutItem>>(() => {
    return {
      certificateInfo: {
        resourceKey: "certificateInfo",
        x: 0,
        y: 0,
        node: (props: IDraggableCardProps) => (
          <CertificateInfo current={current} {...props} />
        ),
      },
      subjectInfo: {
        resourceKey: "subjectInfo",
        x: 1,
        y: 0,
        node: (props: IDraggableCardProps) => (
          <IssuerInfo current={current} {...props} />
        ),
      },
      otherInfo: {
        resourceKey: "otherInfo",
        x: 1,
        y: 1,
        node: (props: IDraggableCardProps) => (
          <OtherInfo current={current} {...props} />
        ),
      },
    };
  }, [current]);

  return (
    <AutoSkeleton name="certificate-detail" loading={loading}>
      {current ? (
        <div className={style.container}>
          <div className={style.toolbar}>
            <Toolbar current={current} />
          </div>
          <div className={style.card}>
            <ResponsiveDndCardsLayout
              profileType={ProfileType.OverviewLayoutConfig}
              resourceType="certificate-management"
              cols={2}
              dataSet={dataSet}
            />
          </div>
        </div>
      ) : null}
    </AutoSkeleton>
  );
}

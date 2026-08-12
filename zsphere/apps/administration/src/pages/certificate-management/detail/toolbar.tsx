import { useQuery } from "@apollo/client";
import { Action } from "@zstack/zsphere-components";
import type {
  CertInfo,
  DoubleManagementNodeInfo,
} from "@zstack/zsphere-types/graphql";
import React from "react";

import useActionConfig from "../config/useActionConfig";
import { getDoubleManagementNodeInfo } from "../gql/cert.gql";

export interface IProps {
  current?: CertInfo;
  view?: string;
}

interface IResp {
  getDoubleManagementNodeInfo?: DoubleManagementNodeInfo;
}

export default function Toolbar({
  current,
  view = "virtualization.main",
}: IProps) {
  const { data } = useQuery<IResp>(getDoubleManagementNodeInfo, {
    fetchPolicy: "no-cache",
  });
  const isDualMnDisconnected =
    !!data?.getDoubleManagementNodeInfo &&
    !data.getDoubleManagementNodeInfo.isManagementNodeLegal;
  const { list, viewMap } = useActionConfig({ isDualMnDisconnected });
  return (
    <Action
      position="header"
      resource="https.certificate"
      view={view}
      viewMap={viewMap}
      menuList={list}
      selectedList={current ? [current] : []}
    />
  );
}

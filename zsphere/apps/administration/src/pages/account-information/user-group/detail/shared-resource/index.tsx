import { gql, useQuery } from "@apollo/client";
import { DetailNavLayout } from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import {
  Op,
  ImageQueryType,
  L2NetworkQueryType,
  L3NetworkQueryType,
  VmQueryType,
} from "@zstack/zsphere-types";
import type {
  QuerySharedResourceResult as IQuerySharedResourceResult,
  UserGroup as IUserGroup,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import ImageList from "zsv_resource/image/list";
import L2NetworkList from "zsv_resource/l2-network/list";
import L3NetworkList from "zsv_resource/l3-network/list";
import VmList from "zsv_resource/vm/list";

import style from "../style.module.less";

interface IProps {
  current: IUserGroup;
}

const resourceTypeList: string[] = [
  "VmInstanceVO",
  "ImageVO",
  "L2NetworkVO",
  "L3NetworkVO",
];

export const GET_SHARED_RESOURCE_LIST = gql`
  query zsvSharedResourceList($input: QuerySharedResourceInput!) {
    zsvSharedResourceList(input: $input) {
      value
      type
    }
  }
`;

const SharedResource: React.FC<IProps> = ({ current }) => {
  const intl = useIntl();
  const [key, setKey] = React.useState<number>(0);

  const { data, refetch } = useQuery(GET_SHARED_RESOURCE_LIST, {
    fetchPolicy: "no-cache",
    variables: {
      input: {
        groupUuid: current.uuid,
        resourceTypeList,
      },
    },
  });

  const _zsvSharedResourceList: any = {};
  const { zsvSharedResourceList } = data ?? {};
  if (zsvSharedResourceList) {
    zsvSharedResourceList.forEach((item: IQuerySharedResourceResult) => {
      _zsvSharedResourceList[item.type] = item.value;
    });
  }

  useActionSubscribe({
    resourceTypeList: [
      "L3Network",
      "L2Network",
      "Owner",
      "Image",
      "VmInstance",
      "VmTemplate",
      "UserGroup",
    ],
    onFinish: () => {
      setKey((prev) => prev + 1);
      setTimeout(() => refetch(), 0);
    },
  });

  const PageList = useMemo(() => {
    const pageList = [
      {
        key: "vm",
        name: intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" }),
        count: _zsvSharedResourceList?.vmInstance ?? 0,
        showTitle: true,
        auth: {
          type: "view",
          authKey: "list",
          resource: "vm",
        } as any,
        page: (
          <>
            <VmList
              key={key}
              view="sub.virtualization.userGroup.shared"
              toolbar={["refresh", "operation", "search"] as any}
              source={current}
              defaultQuery={{
                type: VmQueryType.ZSV_SHARED_RESOURCE,
                conditions: [{ key: "state", op: Op.ne, value: "Destroyed" }],
                extraConditions: [
                  { key: "groupUuid", op: Op.eq, value: current.uuid },
                ],
              }}
            />
          </>
        ),
      },
      {
        key: "image",
        name: intl.formatMessage({ id: "image", defaultMessage: "Image" }),
        count: _zsvSharedResourceList?.image ?? 0,
        showTitle: true,
        auth: {
          type: "view",
          authKey: "list",
          resource: "image",
        } as any,
        page: (
          <div>
            <ImageList
              view="sub.zsv.shared.resource"
              source={current}
              defaultQuery={{
                type: ImageQueryType.ZSV_SHARED_RESOURCE,
                conditions: [
                  { key: "format", op: Op.ne, value: "vmtx" },
                  { key: "system", op: Op.eq, value: "false" },
                ],
                extraConditions: [
                  { key: "groupUuid", op: Op.eq, value: current.uuid },
                  { key: "status", op: Op.ne, value: "Deleted" },
                ],
              }}
            />
          </div>
        ),
      },
      {
        key: "l2network",
        showTitle: true,
        name: intl.formatMessage({
          id: "virtualization.l2network",
          defaultMessage: "Distributed Switch",
        }),
        count: _zsvSharedResourceList?.l2Network ?? 0,
        auth: {
          type: "view",
          authKey: "list",
          resource: "l2network",
        } as any,
        page: (
          <L2NetworkList
            source={current}
            view="sub.zsv.shared.resource"
            defaultQuery={{
              type: L2NetworkQueryType.ZSV_SHARED_RESOURCE,
              extraConditions: [
                { key: "groupUuid", op: Op.eq, value: current.uuid },
              ],
            }}
          />
        ),
      },
      {
        key: "l3network",
        showTitle: true,
        name: intl.formatMessage({
          id: "virtualization.l3network",
          defaultMessage: "Distributed Port Group",
        }),
        count: _zsvSharedResourceList?.l3Network ?? 0,
        auth: {
          type: "view",
          authKey: "list",
          resource: "flat.network",
        } as any,
        page: (
          <L3NetworkList
            key={key}
            source={current}
            view="sub.zsv.shared.resource"
            defaultQuery={{
              type: L3NetworkQueryType.ZSV_Shared_Resource_Flat_Network,
              extraConditions: [
                { key: "groupUuid", op: Op.eq, value: current.uuid },
              ],
            }}
          />
        ),
      },
    ];

    return pageList;
  }, [intl, current, _zsvSharedResourceList, key]);

  return (
    <DetailNavLayout
      className={style["advanced-config-contanier"]}
      pageList={PageList}
    />
  );
};

export default SharedResource;

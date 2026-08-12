import { gql, useQuery } from "@apollo/client";
import { Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import {
  DetailNavLayout,
  Radio,
  Auth,
  useAuth,
} from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import {
  Op,
  ImageQueryType,
  L2NetworkQueryType,
  L3NetworkQueryType,
  VmQueryType,
} from "@zstack/zsphere-types";
import type {
  AccountVO as IAccount,
  QuerySharedResourceResult as IQuerySharedResourceResult,
} from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import ImageList from "zsv_resource/image/list";
import L2NetworkList from "zsv_resource/l2-network/list";
import L3NetworkList from "zsv_resource/l3-network/list";
import VMTemplateList from "zsv_resource/vm-template/list";
import VmList from "zsv_resource/vm/list";

import style from "../style.module.less";

const STYLE_SHARED_RESOURCE_HEADER = {
  marginBottom: 12,
  display: "flex",
  alignItems: "center",
} as const;
const STYLE_INFO_ICON = {
  marginLeft: 4,
  cursor: "pointer",
  fontSize: 16,
  color: "var(--neutral-400)",
} as const;

interface IProps {
  current: IAccount;
}

enum SharedResourceType {
  User = "User",
  UserGroup = "UserGroup",
}

const resourceTypeList: string[] = [
  "VmInstanceVO",
  "TemplatedVmInstanceVO",
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
  const [sharedType, setSharedType] = useState<SharedResourceType>(
    SharedResourceType.User,
  );
  const { hasAuth } = useAuth();

  const { data, refetch } = useQuery(GET_SHARED_RESOURCE_LIST, {
    fetchPolicy: "no-cache",
    variables: {
      input: {
        accountUuid: current.uuid,
        sharedType,
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

  useEffect(() => {
    refetch();
  }, [sharedType]);

  useActionSubscribe({
    resourceTypeList: [
      "Image",
      "AccountVO",
      "L2Network",
      "L3Network",
      "VmInstance",
      "VmTemplate",
      "Owner",
    ],
    onFinish: () => {
      setTimeout(() => refetch(), 0);
    },
  });

  const resourceProps: Map<string, any> = new Map([
    [
      "vm",
      {
        view:
          sharedType === SharedResourceType.UserGroup
            ? "sub.virtualization.userGroup"
            : "sub.virtualization.user",
        toolbar:
          sharedType === SharedResourceType.UserGroup
            ? (["refresh", "search"] as any)
            : undefined,
        defaultQuery: {
          type: VmQueryType.ZSV_SHARED_RESOURCE,
          conditions: [{ key: "state", op: Op.ne, value: "Destroyed" }],
          extraConditions: [
            { key: "accountUuid", op: Op.eq, value: current.uuid },
            { key: "sharedType", op: Op.eq, value: sharedType },
          ],
        },
      },
    ],
    [
      "template",
      {
        view:
          sharedType === SharedResourceType.UserGroup
            ? "sub.zsv.shared.resource.by.userGroup"
            : "sub.zsv.shared.resource",
        toolbar:
          sharedType === SharedResourceType.UserGroup
            ? (["refresh", "search"] as any)
            : undefined,
        defaultQuery: {
          type: VmQueryType.Get_VMINSTANCETEMPLATE_BY_SHARED_RESOURCE,
          extraConditions: [
            { key: "accountUuid", op: Op.eq, value: current.uuid },
            { key: "sharedType", op: Op.eq, value: sharedType },
          ],
        },
      },
    ],
    [
      "image",
      {
        view:
          sharedType === SharedResourceType.UserGroup
            ? "sub.zsv.shared.resource.by.userGroup"
            : "sub.zsv.shared.resource",
        toolbar:
          sharedType === SharedResourceType.UserGroup
            ? (["refresh", "search"] as any)
            : undefined,
        defaultQuery: {
          type: ImageQueryType.ZSV_SHARED_RESOURCE,
          conditions: [
            { key: "format", op: Op.ne, value: "vmtx" },
            { key: "system", op: Op.eq, value: "false" },
          ],
          extraConditions: [
            { key: "accountUuid", op: Op.eq, value: current.uuid },
            { key: "status", op: Op.ne, value: "Deleted" },
            { key: "sharedType", op: Op.eq, value: sharedType },
          ],
        },
      },
    ],
    [
      "l2network",
      {
        view:
          sharedType === SharedResourceType.UserGroup
            ? "sub.zsv.shared.resource.by.userGroup"
            : "sub.zsv.shared.resource",
        toolbar:
          sharedType === SharedResourceType.UserGroup
            ? (["refresh", "search"] as any)
            : undefined,
        defaultQuery: {
          type: L2NetworkQueryType.ZSV_SHARED_RESOURCE,
          extraConditions: [
            { key: "accountUuid", op: Op.eq, value: current.uuid },
            { key: "sharedType", op: Op.eq, value: sharedType },
          ],
        },
      },
    ],
    [
      "l3network",
      {
        view:
          sharedType === SharedResourceType.UserGroup
            ? "sub.zsv.shared.resource.by.userGroup"
            : "sub.zsv.shared.resource",
        toolbar:
          sharedType === SharedResourceType.UserGroup
            ? (["refresh", "search"] as any)
            : undefined,
        defaultQuery: {
          type: L3NetworkQueryType.ZSV_Shared_Resource_Flat_Network,
          conditions: [{ key: "type", op: Op.eq, value: "portGroup" }],
          extraConditions: [
            { key: "accountUuid", op: Op.eq, value: current.uuid },
            { key: "sharedType", op: Op.eq, value: sharedType },
          ],
        },
      },
    ],
  ]);

  const PageList = useMemo(() => {
    const pageList = [
      {
        key: "vm",
        name: intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" }),
        count: _zsvSharedResourceList?.vmInstance,
        showTitle: true,
        auth: {
          type: "view",
          authKey: "list",
          resource: "virtualization.vm",
        } as any,
        list: <VmList source={current} {...resourceProps.get("vm")} />,
      },
      {
        key: "template",
        name: intl.formatMessage({ id: "template", defaultMessage: "Template" }),
        count: _zsvSharedResourceList?.templatedVmInstance ?? 0,
        showTitle: true,
        auth: {
          type: "view",
          authKey: "list",
          resource: "virtualization.vm.template",
        } as any,
        list: (
          <VMTemplateList
            view="sub.zsv.shared.resource"
            source={current}
            {...resourceProps.get("template")}
          />
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
          resource: "virtualization.image",
        } as any,
        list: (
          <ImageList
            view="sub.zsv.shared.resource"
            source={current}
            {...resourceProps.get("image")}
          />
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
        list: (
          <L2NetworkList
            source={current}
            view="sub.zsv.shared.resource"
            {...resourceProps.get("l2network")}
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
        list: (
          <L3NetworkList
            source={current}
            view="sub.zsv.shared.resource"
            {...resourceProps.get("l3network")}
          />
        ),
      },
    ];

    const _pageList = pageList.map((item) => {
      return {
        ...item,
        page: (
          <>
            <div style={STYLE_SHARED_RESOURCE_HEADER}>
              <Radio.Group
                optionType="button"
                defaultValue={sharedType}
                onChange={(e) => setSharedType(e.target.value)}
              >
                <Radio.Button value={SharedResourceType.User}>
                  {intl.formatMessage({
                    id: "user.shared",
                    defaultMessage: "User",
                  })}
                </Radio.Button>
                <Auth
                  resource="virtualization.userGroup"
                  type="view"
                  authKey="list"
                >
                  <Radio.Button value={SharedResourceType.UserGroup}>
                    {intl.formatMessage({
                      id: "userGroup.shared",
                      defaultMessage: "User Group",
                    })}
                  </Radio.Button>
                </Auth>
              </Radio.Group>
              <Tooltip
                title={
                  hasAuth({
                    resource: "virtualization.userGroup",
                    type: "view",
                    authKey: "list",
                  }) ? (
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "shared.tooltip",
                        defaultMessage: "### Share Resources\n\n- User: Display resources shared specifically with the user and globally shared resources.\n- User Group: After a user joins a user group, display resources shared specifically with the user group and globally shared resources. To manage these resources, go to the Shared Resources tab in the User Group details page. ",
                      })}
                    </ReactMarkdown>
                  ) : (
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "shared.no.userGroup.tooltip",
                        defaultMessage: `### Shared Resources

- User: Display resources shared specifically with the user and globally shared resources.`,
                      })}
                    </ReactMarkdown>
                  )
                }
              >
                <Icon type="info" style={STYLE_INFO_ICON} />
              </Tooltip>
            </div>
            {item.list}
          </>
        ),
      };
    });

    return _pageList;
  }, [intl, current, _zsvSharedResourceList, sharedType, resourceProps]);

  return (
    <DetailNavLayout
      className={style["advanced-config-contanier"]}
      pageList={PageList}
    />
  );
};

export default SharedResource;

import { useSuspenseQuery } from "@apollo/client";
import { imageList } from "@zstack/virtualization-resource/src/gql/image.gql";
import { processCache } from "@zstack/virtualization-resource/src/utils/page-cache";
import { AuthTabs, type AuthTabsListItem } from "@zstack/zsphere-design-biz";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { useVirtualizationResourceStore } from "@zstack/zsphere-platform-store";
import { ImageMediaType, Op, ShareType } from "@zstack/zsphere-types";
import type { Image as IImage } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";
import { SharingPermissions } from "zsv_administration_shared/account-information/mf-index";
import AuditList from "zsv_auditing/auditing-sub-list";
import { useShallow } from "zustand/react/shallow";

import Header from "./header";
import Overview from "./overview";
import VmList from "./vm";

const currentPlaceholder = {
  __typename: "Image",
  uuid: "",
  name: "",
  createDate: "",
  lastOpDate: "",
  description: "",
  architecture: null,
  state: "",
  status: "",
  size: 0,
  actualSize: 0,
  md5Sum: null,
  url: "",
  mediaType: "",
  guestOsType: null,
  type: "",
  platform: null,
  format: "raw",
  system: false,
  bootMode: "Legacy",
  baremetal2Image: false,
  toPublic: false,
  shareType: "None",
  useFor: null,
  virtio: true,
  backupStorageRefs: [
    {
      __typename: "BackupStorageRef",
      imageUuid: "",
      backupStorageUuid: "",
      installPath: "",
      status: "",
      exportMd5Sum: null,
      exportUrl: null,
      createDate: "",
      lastOpDate: "",
    },
  ],
  backupStorage: {
    __typename: "BackupStorage",
    name: "",
    uuid: "",
    type: "",
    zone: { __typename: "Zone", uuid: "" },
  },
  owner: {
    __typename: "Owner",
    name: "",
    uuid: "",
    type: "account",
  },
};

const ImageDetail: React.FC = () => {
  const intl = useIntl();

  const { currentUser } = usePlatformStore();

  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";

  const { data, refetch: imageRefetch } = useSuspenseQuery<{
    imageList: { list: IImage[] };
  }>(imageList, {
    fetchPolicy: "cache-and-network",
    variables: {
      conditions: [
        { key: "uuid", op: Op.eq, value: uuid },
        { key: "system", op: Op.eq, value: "false" },
      ],
    },
  });

  const [currentResource, cachedImages, setCachedImages] =
    useVirtualizationResourceStore(
      useShallow((state) => [
        state.currentResource,
        state.cachedImages,
        state.setCachedImages,
      ]),
    );

  const refetch = () => {
    imageRefetch();
  };

  // Update cache in useEffect to avoid updating state during render
  useEffect(() => {
    const newData = data?.imageList?.list?.[0];
    if (newData && uuid) {
      const currentCachedImages =
        useVirtualizationResourceStore.getState().cachedImages;
      processCache(uuid, currentCachedImages, setCachedImages, newData);
    }
  }, [data?.imageList?.list, uuid]);

  // Only compute value in useMemo, no side effects
  const current = useMemo(() => {
    const newData = data?.imageList?.list?.[0];
    // 当有查询数据时，优先使用查询返回的 name
    if (newData) {
      return newData as IImage;
    }
    // 只有在没有查询数据时，才使用缓存或 currentResource?.name 作为占位符
    const cachedInstanceIndex = cachedImages.findIndex(
      (item) => item?.data?.uuid === uuid,
    );
    const cachedImage =
      cachedInstanceIndex > -1 ? cachedImages[cachedInstanceIndex].data : null;
    const temp = {
      ...currentPlaceholder,
      ...cachedImage,
      name: cachedImage?.name || currentResource?.name,
    };
    return temp as IImage;
  }, [data?.imageList?.list, uuid, cachedImages, currentResource?.name]);

  const defaultQueryAudit = useMemo(
    () => ({
      conditions: [
        {
          key: "resourceUuid",
          op: Op.eq,
          value: uuid,
        },
      ],
    }),
    [uuid],
  );

  useActionSubscribe({
    resourceTypeList: ["Image", "Owner"],
    onFinish: () => {
      refetch();
    },
  });

  const showAudit =
    current?.owner?.uuid === currentUser?.accountUuid ||
    currentUser?.currentIdentity === "Admin";

  const tabsList: AuthTabsListItem[] = useMemo(
    () => [
      {
        label: intl.formatMessage({ id: "overview", defaultMessage: "Overview" }),
        value: "overview",
        content: () => <Overview current={current!} refetch={refetch} />,
      },
      {
        label: intl.formatMessage({
          id: "associate.vm",
          defaultMessage: "Associated VM",
        }),
        value: "vm",
        condition: current?.mediaType !== ImageMediaType.DataVolumeTemplate,
        auth: {
          type: "view" as const,
          authKey: "list",
          resource: "virtualization.vm",
        },
        content: () => <VmList current={current!} refetch={refetch} />,
      },
      {
        label: intl.formatMessage({
          id: "sharing.permissions",
          defaultMessage: "Sharing Permissions",
        }),
        value: "sharing.permissions",
        condition: current?.shareType === ShareType.Group,
        content: () => (
          <SharingPermissions
            source={current}
            defaultQuery={{
              extraConditions: [
                {
                  key: "resourceUuid",
                  op: Op.eq,
                  value: current?.uuid,
                },
              ],
            }}
          />
        ),
      },
      {
        label: intl.formatMessage({ id: "audit", defaultMessage: "Event" }),
        value: "auditing",
        condition: showAudit,
        auth: {
          type: "view" as const,
          authKey: "list",
          resource: "virtualization.auditing",
        },
        content: () => (
          <AuditList view="sub" defaultQuery={defaultQueryAudit} />
        ),
      },
    ],
    [intl, current, refetch, showAudit, defaultQueryAudit],
  );

  return (
    <div className="zsv-detail-container">
      <Header current={current} refetch={refetch} />
      <AuthTabs
        variant="line"
        tabsList={tabsList}
        contentId="main-tab"
        rootClassName="flex flex-col flex-1"
        listClassName="pl-6"
        contentClassName="px-6 py-5 flex-1 flex min-w-0 flex-col"
      />
    </div>
  );
};

export default React.memo(ImageDetail);

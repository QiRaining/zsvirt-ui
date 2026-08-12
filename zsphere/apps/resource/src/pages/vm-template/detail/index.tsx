import { useSuspenseQuery } from "@apollo/client";
import { templatedVmInstance } from "@zstack/virtualization-resource/src/gql/vm.gql";
import { useResourceConfigQuery } from "@zstack/virtualization-resource/src/pages/vm/hooks/use-resource-config-query";
import VMList from "@zstack/virtualization-resource/src/pages/vm/list";
import { processCache } from "@zstack/virtualization-resource/src/utils/page-cache";
import { AuthTabs, type AuthTabsListItem } from "@zstack/zsphere-design-biz";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { useVirtualizationResourceStore } from "@zstack/zsphere-platform-store";
import type { IActionSubscribe } from "@zstack/zsphere-types";
import { Op, ShareType, VmQueryType } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";
import { SharingPermissions } from "zsv_administration_shared/account-information/mf-index";
import AuditList from "zsv_auditing/auditing-sub-list";
import { useShallow } from "zustand/react/shallow";

import Header from "./header";
import Overview from "./overview";
import { currentPlaceholder } from "./placeHolder";

const vmConfigItemList = [
  "vm.cpu.hypervisor.feature",
  "numa",
  "emulateHyperV",
  "migrate.autoConverge",
  "hotPlugEnabled",
  "hotPlugMemory",
  "vmPortOff",
  "bootMenuSplashTimeout",
  "spiceStreamingMode",
  "crash.strategy",
  "soundType",
  "videoType",
  "vmMachineType",
];

const VmTemplateDetail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";
  const [routerTabTarget, serRouterTabTarget] = useState<undefined | string>(
    "overview",
  );
  const intl = useIntl();

  const [resourceConfig, refetchResourceConfig, resourceConfigLoading] =
    useResourceConfigQuery(uuid, ["vm", "kvm", "pciDevice"], vmConfigItemList);

  const { data, refetch: vmTemplateRefetch } = useSuspenseQuery(
    templatedVmInstance,
    {
      fetchPolicy: "cache-and-network",
      variables: { uuid },
    },
  );

  const refetch = () => {
    vmTemplateRefetch();
  };

  const [currentResource, cachedVMTemplate, setCachedVMTemplate] =
    useVirtualizationResourceStore(
      useShallow((state) => [
        state.currentResource,
        state.cachedVMTemplate,
        state.setCachedVMTemplate,
      ]),
    );

  // Update cache in useEffect to avoid updating state during render
  useEffect(() => {
    const vmData = data?.templatedVmInstance;
    if (vmData && uuid) {
      const currentCachedVMTemplate =
        useVirtualizationResourceStore.getState().cachedVMTemplate;
      processCache(uuid, currentCachedVMTemplate, setCachedVMTemplate, vmData);
    }
  }, [data?.templatedVmInstance, uuid, setCachedVMTemplate]);

  // Only compute value in useMemo, no side effects
  const currentVM = useMemo(() => {
    const vmData = data?.templatedVmInstance;
    if (vmData) {
      // 当有查询数据时，优先使用查询返回的 name
      return { ...currentPlaceholder, ...vmData } as IVM;
    }
    // Get cached VM template without updating state
    const cachedInstanceIndex = cachedVMTemplate.findIndex(
      (item) => item?.data?.uuid === uuid,
    );
    const cachedVm =
      cachedInstanceIndex > -1
        ? cachedVMTemplate[cachedInstanceIndex].data
        : null;
    // 只有在没有查询数据时，才使用 currentResource?.name 作为占位符
    return {
      ...currentPlaceholder,
      ...cachedVm,
      name: cachedVm?.name || currentResource?.name,
    } as IVM;
  }, [
    data?.templatedVmInstance,
    uuid,
    cachedVMTemplate,
    currentResource?.name,
  ]);

  const defaultQuery = useMemo(
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
    resourceTypeList: [
      "VmNic",
      "Owner",
      "Volume",
      "CreateVolume",
      "VmInstance",
      "VolumeSnapshot",
      "VolumeSnapshotGroup",
      "LocalBackupDataVolume",
      "BindSchedulerJobGroup",
      "AttachDataVolumeToVm",
      "DetachDataVolumeFromVm",
      "DeleteBackupData",
      "VmTemplate",
    ],
    onFinish: () => {
      refetchResourceConfig();
      return refetch();
    },
  } as IActionSubscribe);

  useEffect(() => {
    setTimeout(() => {
      serRouterTabTarget();
    }, 0);
  }, [routerTabTarget]);

  const tabsList: AuthTabsListItem[] = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "virtualization.overview",
          defaultMessage: "Overview",
        }),
        value: "overview",
        content: () => (
          <Overview
            current={currentVM}
            refetch={refetch}
            resourceConfig={resourceConfig}
            resourceConfigLoading={resourceConfigLoading}
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "related.instance",
          defaultMessage: "Associated VM",
        }),
        value: "vmList",
        auth: {
          type: "view" as const,
          authKey: "list",
          resource: "virtualization.vm",
        },
        content: () => (
          <VMList
            view="sub.zsv.vm.template"
            customView="virtualization.custom"
            withResourceAttribute
            defaultQuery={{
              type: VmQueryType.GetVmInstanceTemplateRelatedVM,
              conditions: [
                { key: "state", op: Op.ne, value: "Destroyed" },
                { key: "zoneUuid", value: currentVM?.zoneUuid, op: Op.eq },
              ],
              extraConditions: [
                { key: "templatedVMUuid", value: uuid, op: Op.eq },
              ],
            }}
            toolbar={["refresh", "search"]}
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "sharing.permissions",
          defaultMessage: "Sharing Permissions",
        }),
        value: "sharing.permissions",
        condition: currentVM?.shareType === ShareType.Group,
        content: () => (
          <SharingPermissions
            source={currentVM}
            defaultQuery={{
              extraConditions: [
                {
                  key: "resourceUuid",
                  op: Op.eq,
                  value: currentVM?.uuid,
                },
              ],
            }}
          />
        ),
      },
      {
        label: intl.formatMessage({ id: "audit", defaultMessage: "Event" }),
        value: "auditing",
        auth: {
          type: "view" as const,
          authKey: "list",
          resource: "virtualization.auditing",
        },
        content: () => <AuditList view="sub" defaultQuery={defaultQuery} />,
      },
    ],
    [intl, currentVM, refetch, resourceConfig, uuid, defaultQuery],
  );

  return (
    <div className="zsv-detail-container">
      <Header current={currentVM} refetch={refetch} />
      <AuthTabs
        variant="line"
        tabsList={tabsList}
        contentId="main-tab"
        routerTarget={routerTabTarget}
        rootClassName="flex flex-col flex-1"
        listClassName="pl-6"
        contentClassName="px-6 py-5 flex-1 flex min-w-0 flex-col"
      />
    </div>
  );
};

export default React.memo(VmTemplateDetail);

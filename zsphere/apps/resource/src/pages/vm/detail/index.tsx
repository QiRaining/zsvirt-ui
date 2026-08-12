import { useSuspenseQuery } from "@apollo/client";
import { vmInstanceDetail } from "@zstack/virtualization-resource/src/gql/instance.gql";
import { useResourceConfigQuery } from "@zstack/virtualization-resource/src/pages/vm/hooks/use-resource-config-query";
import { processCache } from "@zstack/virtualization-resource/src/utils/page-cache";
import { AuthTabs, type AuthTabsListItem } from "@zstack/zsphere-design-biz";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { useVirtualizationResourceStore } from "@zstack/zsphere-platform-store";
import type { IActionSubscribe } from "@zstack/zsphere-types";
import { Op, ShareType } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";
import { SharingPermissions } from "zsv_administration_shared/account-information/mf-index";
import AuditList from "zsv_auditing/auditing-sub-list";
import { Main as SnapShotInDetailTab } from "zsv_data_protection_shared/snapshot/mf-index";
import ZWatchAlarmInDetailTab from "zsv_shared/zwatch-alarm/alarm-tab";
import { useShallow } from "zustand/react/shallow";

import { AuthCheck } from "../../../components/no-permission-page/context";
import Backup from "./backup";
import Header from "./header";
import Monitoring from "./monitoring";
import Overview from "./overview";
import { currentPlaceholder } from "./placeholder";
import Settings from "./settings";

const VmDetail: React.FC = () => {
  const intl = useIntl();

  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid");
  const { data, refetch: vmRefetch } = useSuspenseQuery<{ vmInstance: IVM }>(
    vmInstanceDetail,
    {
      fetchPolicy: "cache-and-network",
      variables: { uuid },
    },
  );

  const [currentResource, cachedVms, setCachedVms] =
    useVirtualizationResourceStore(
      useShallow((state) => [
        state.currentResource,
        state.cachedVms,
        state.setCachedVms,
      ]),
    );

  const refetch = React.useCallback(() => {
    vmRefetch();
  }, [vmRefetch]);

  const [resourceConfig, refetchResourceConfig, resourceConfigLoading] =
    useResourceConfigQuery(
      uuid || "",
      ["vm", "kvm", "pciDevice"],
      [
        "vm.cpu.hypervisor.feature",
        "vm.cpu.quota",
        "vm.cpuid.vendor",
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
        "kvmHiddenState",
        "enable.uefi.secure.boot",
      ],
    );

  const auditDefaultQuery = useMemo(
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

  const zWatchAlarmDefaultQuery = useMemo(
    () => ({
      extraConditions: [
        {
          key: "resourceUuid",
          op: Op.eq,
          value: uuid,
        },
      ],
    }),
    [uuid],
  );

  // Update cache in useEffect to avoid updating state during Render
  useEffect(() => {
    if (data?.vmInstance && uuid) {
      processCache(uuid, cachedVms, setCachedVms, {
        ...data.vmInstance,
      });
    }
  }, [data?.vmInstance, uuid]);

  const current = useMemo(() => {
    // 当有查询数据时，优先使用查询返回的 name
    if (data?.vmInstance) {
      return data.vmInstance as IVM;
    }
    // 只有在没有查询数据时，才使用缓存或 currentResource?.name 作为占位符
    const cachedVmIndex = cachedVms.findIndex(
      (item) => item?.data?.uuid === uuid,
    );
    const cachedVm = cachedVmIndex > -1 ? cachedVms[cachedVmIndex].data : null;
    const temp = {
      ...currentPlaceholder,
      ...cachedVm,
      name: cachedVm?.name || currentResource?.name,
    };
    return temp as IVM;
  }, [data?.vmInstance, uuid, cachedVms, currentResource?.name]);

  // 监听部分
  useActionSubscribe({
    resourceTypeList: [
      "VmNic",
      "Owner",
      "Volume",
      "VmTemplate",
      "CreateVolume",
      "VmInstance",
      "VolumeSnapshot",
      "VolumeSnapshotGroup",
      "LocalBackupDataVolume",
      "BindSchedulerJobGroup",
      "AttachDataVolumeToVm",
      "DetachDataVolumeFromVm",
      "DeleteBackupData",
      "AccountVO",
      "UserGroup",
      "GuestToolsIso",
    ],
    onFinish: () => {
      refetchResourceConfig();
      return refetch();
    },
  } as IActionSubscribe);

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
            current={current!}
            refetch={refetch}
            resourceConfig={resourceConfig}
            resourceConfigLoading={resourceConfigLoading}
          />
        ),
      },
      {
        label: intl.formatMessage({ id: "monitor", defaultMessage: "Monitoring" }),
        value: "monitoring",
        content: () => <Monitoring uuid={uuid} />,
      },
      {
        label: intl.formatMessage({ id: "snapshot", defaultMessage: "Snapshot" }),
        value: "snapshot",
        noPadding: true,
        content: () => (
          <SnapShotInDetailTab displayLocation="detail" current={current} />
        ),
        auth: {
          type: "view" as const,
          authKey: "list",
          resource: "virtualization.snapshot",
        },
      },
      {
        label: intl.formatMessage({ id: "backup", defaultMessage: "Backup" }),
        value: "backup",
        content: () => <Backup current={current} />,
        auth: {
          type: "view" as const,
          authKey: "list",
          resource: "virtualization.protected.resource.vm",
        },
      },
      {
        label: intl.formatMessage({
          id: "alarm.tabName",
          defaultMessage: "Alarm",
        }),
        value: "zwatch.alarm",
        content: () => (
          <AuthCheck
            resourceTypes={[
              "virtualization.zwatch.alarm",
              "virtualization.alarm.message",
            ]}
          >
            <ZWatchAlarmInDetailTab
              source={current}
              view="sub.vm.instance"
              defaultQuery={zWatchAlarmDefaultQuery}
              nameSpace="ZStack/VM"
            />
          </AuthCheck>
        ),
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
        label: intl.formatMessage({
          id: "advancedSetting",
          defaultMessage: "Advanced Settings",
        }),
        value: "setting",
        noPadding: true,
        content: () => (
          <Settings detail={current!} resourceConfig={resourceConfig} />
        ),
      },
      {
        label: intl.formatMessage({ id: "audit", defaultMessage: "Event" }),
        value: "auditing",
        content: () => (
          <AuditList view="sub" defaultQuery={auditDefaultQuery} />
        ),
        auth: {
          type: "view" as const,
          authKey: "list",
          resource: "virtualization.auditing",
        },
      },
    ],
    [
      intl,
      current,
      refetch,
      resourceConfig,
      resourceConfigLoading,
      uuid,
      zWatchAlarmDefaultQuery,
      auditDefaultQuery,
    ],
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

export default React.memo(VmDetail);

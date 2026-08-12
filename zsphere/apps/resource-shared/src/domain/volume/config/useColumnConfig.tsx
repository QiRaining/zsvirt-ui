import { Text } from "@zstack/design";
import { useAuth } from "@zstack/zsphere-components";
import { Constant, ResourceName, Link } from "@zstack/zsphere-components";
import type { ConstantEnum } from "@zstack/zsphere-constant";
import { ConstantType } from "@zstack/zsphere-constant";
import { useColumnConfig } from "@zstack/zsphere-engine/src/volume";
import type { IOption } from "@zstack/zsphere-engine/src/volume/useColumnConfig";
import { VolumeState, VolumeStatus, VolumeType } from "@zstack/zsphere-types";
import { LeftNavType, NavView } from "@zstack/zsphere-types";
import type { Volume as IVolume } from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";
import {
  isEqual as _isEqual,
  pick as _pick,
  startsWith as _startsWith,
  omit as _omit,
} from "lodash-es";
import { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

import style from "./style.module.less";

export default ({ view }: { view: string }) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  const [searchParams] = useSearchParams();
  const filterStatus = searchParams.get("dashboardState") as string | null;
  const getFilteredAttached = useCallback(() => {
    switch (filterStatus) {
      case "Attached":
        return ["true"];
      case "NotAttached":
        return ["false"];
      default:
        return [];
    }
  }, [filterStatus]);

  const getFilteredBackupTaskType = useCallback(() => {
    switch (filterStatus) {
      case "__BackupJob__":
        return ["BackupJob"];
      case "__OtherTasks__":
        return ["OtherTasks"];
      case "__None__":
        return ["__None__"];
      default:
        return [];
    }
  }, [filterStatus]);

  const hasBackupdataAuth = useMemo(
    () =>
      hasAuth({
        type: "view",
        authKey: "list",
        resource: "local.backup.data.vo",
      }),
    [],
  );

  const backupTaskTypeFilterOptions = useMemo(() => {
    return [
      {
        text: (
          <Constant
            enumType={ConstantType.VolumeBackupTaskType}
            value={"BackupJob" as ConstantEnum}
          />
        ),
        value: "BackupJob",
      },
      {
        text: (
          <Constant
            enumType={ConstantType.VolumeBackupTaskType}
            value={"OtherTasks" as ConstantEnum}
          />
        ),
        value: "OtherTasks",
      },
      {
        text: intl.formatMessage({ id: "none", defaultMessage: "None" }),
        value: "__None__",
      },
    ];
  }, [intl]);

  const statusFilterOptions = useMemo(() => {
    if (_isEqual(view, "main")) {
      return _pick(VolumeStatus, [
        VolumeStatus.Creating,
        VolumeStatus.Migrating,
        VolumeStatus.Ready,
      ]);
    }
    if (_isEqual(view, "main.notinstantiated")) {
      return _pick(VolumeStatus, [VolumeStatus.NotInstantiated]);
    }
    if (_isEqual(view, "recycle")) {
      return _pick(VolumeStatus, [VolumeStatus.Deleted]);
    }
    if (_startsWith(view, "sub") || _startsWith(view, "select")) {
      return _pick(VolumeStatus, [
        VolumeStatus.Creating,
        VolumeStatus.Ready,
        VolumeStatus.Migrating,
      ]);
    }

    return {};
  }, [view]);

  const typeFilterOptions = useMemo(() => {
    if (["sub.account", "sub.project"].includes(view)) {
      return {};
    }
    return _omit(VolumeType, [VolumeType.Memory]);
  }, [view]);

  const option: IOption<IVolume> = useMemo(
    () => [
      {
        key: "name",
        render: ({ name }) => {
          return <Text>{name}</Text>;
        },
      },
      {
        key: "backupDataCount",
        render: ({ relatedResource, uuid, status }) => {
          if (hasBackupdataAuth && status !== VolumeStatus.Deleted) {
            return (
              <Link
                to={{
                  pathname: `/volume/detail?uuid=${uuid}`,
                  state: {
                    _keyArr: ["volume", "backup.data"],
                  },
                }}
                microAppName="resource-pool"
                key={uuid}
              >
                {relatedResource?.backupData || 0}
              </Link>
            );
          }
          return relatedResource?.backupData || 0;
        },
      },
      {
        key: "type",
        filterEnumType: ConstantType.VolumeType,
        filterOptions: typeFilterOptions,
      },
      {
        key: "state",
        filterOptions: VolumeState,
      },
      {
        key: "status",
        filterOptions: statusFilterOptions,
      },
      {
        key: "backup.status",
        gqlKey: "backupStatus",
        render: ({ backupStatus = "Ready" }) => (
          <Constant value={backupStatus} />
        ),
      },
      {
        key: "actualSize",
        formatter: ({ actualSize = 0 }) => formatStorage(actualSize, 2),
      },
      {
        key: "backupTaskType",
        searchKey: "__BackupTaskType__",
        gqlKey: "backupTaskType",
        auth: {
          type: "block",
          authKey: "disaster.recovery.and.cdp",
          resource: "volume",
        },
        filters: backupTaskTypeFilterOptions,
        defaultFilteredValue: getFilteredBackupTaskType(),
      },
      {
        key: "size",
        formatter: ({ size = 0 }) => formatStorage(size, 2),
      },
      {
        key: "vm-instance",
        searchKey: "__attachedVm__",
        filterMultiple: false,
        gqlKey: "vmInstance",
        filters:
          view !== "sub.virtualization.zone.recyle"
            ? [
                {
                  text: intl.formatMessage({
                    id: "loaded",
                    defaultMessage: "Attached",
                  }),
                  value: "true",
                },
                {
                  text: intl.formatMessage({
                    id: "notLoaded",
                    defaultMessage: "Unattached",
                  }),
                  value: "false",
                },
              ]
            : null,
        defaultFilteredValue: getFilteredAttached(),
        render: ({
          vmInstance,
          templatedVmInstance,
          templatedVmInstanceCache,
        }) => {
          if (vmInstance?.length > 0) {
            const val = vmInstance?.map((item: any, _index: any) => {
              return (
                <ResourceName
                  key={item?.uuid}
                  value={item?.name}
                  link={{
                    to: `/vm`,
                    microAppName: "virtualization-resource",
                    uuid: item?.uuid,
                    leftnav: LeftNavType.ClusterHost,
                    navView: NavView.Resource,
                  }}
                />
              );
            });
            return <Text>{val}</Text>;
          }
          if (templatedVmInstance?.length > 0) {
            const val = templatedVmInstance.map((item: any) => {
              return (
                <ResourceName
                  key={item.uuid}
                  value={item.name}
                  link={{
                    to: `/vm-template`,
                    microAppName: "virtualization-resource",
                    uuid: item.uuid,
                    leftnav: LeftNavType.TemplateVm,
                    navView: NavView.Template,
                  }}
                />
              );
            });
            return <Text>{val}</Text>;
          }
          if (templatedVmInstanceCache?.length > 0) {
            const val = templatedVmInstanceCache.map(
              (item: any, index: number) => {
                return (
                  <Text key={item?.uuid ?? `cache-${index}`}>{item.name}</Text>
                );
              },
            );
            return <Text>{val}</Text>;
          }
          return (
            <span className={style[`text-color`]}>
              {intl.formatMessage({ id: "none", defaultMessage: "None" })}
            </span>
          );
        },
      },
      {
        key: "primary-storage",
        gqlKey: "primaryStorage",
        auth: {
          type: "block",
          authKey: "primary.storage",
          resource: "volume",
        },
        render: ({ primaryStorage }) => (
          <Text>{primaryStorage ? primaryStorage.name : ""}</Text>
        ),
      },
      {
        key: "owner",
        auth: {
          type: "block",
          authKey: "owner",
          resource: "volume",
        },
        render: (value: any) => {
          return (
            <Link.Owner uuid={value?.owner?.uuid} type={value?.owner?.type}>
              {value?.owner?.name}
            </Link.Owner>
          );
        },
      },
      {
        key: "backup.task.status",
        render: ({ backupTaskStatus }: IVolume) => {
          return <Constant value={backupTaskStatus as any} />;
        },
      },
      {
        key: "lastDetachTime",
        formatter: (value) => value?.lastDetachDate,
      },
      {
        key: "isShareable",
        auth: {
          type: "block",
          authKey: "isShareable",
          resource: "volume",
        },
        searchKey: "__shareable__",
        filters: [
          {
            text: intl.formatMessage({ id: "yes", defaultMessage: "Yes" }),
            value: "true",
          },
          {
            text: intl.formatMessage({ id: "no", defaultMessage: "No" }),
            value: "false",
          },
        ],
        render: ({ isShareable = false }) =>
          isShareable
            ? intl.formatMessage({ id: "yes", defaultMessage: "Yes" })
            : intl.formatMessage({ id: "no", defaultMessage: "No" }),
      },
      {
        key: "zone",
        render: (current) => {
          return (
            <ResourceName
              value={current.primaryStorage?.zone?.name}
              link={{
                leftnav: LeftNavType.ClusterHost,
                to: `/zone`,
                microAppName: "virtualization-resource",
                uuid: current.primaryStorage?.zone?.uuid,
              }}
            />
          );
        },
      },
    ],
    [hasBackupdataAuth, intl, statusFilterOptions, typeFilterOptions],
  );

  return useColumnConfig<IVolume>(option);
};

import { useSuspenseQuery } from "@apollo/client";
import { zoneList } from "@zstack/virtualization-resource/src/gql/zone.gql";
import { processCache } from "@zstack/virtualization-resource/src/utils/page-cache";
import { AuthTabs, type AuthTabsListItem } from "@zstack/zsphere-design-biz";
import { useBaremetalLicenseCheck } from "@zstack/zsphere-hooks";
import { useVirtualizationResourceStore } from "@zstack/zsphere-platform-store";
import { Op } from "@zstack/zsphere-types";
import cls from "classnames";
import qs from "qs";
import React, { useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { useNavigate, useLocation, useSearchParams } from "react-router";
import AuditingSubList from "zsv_auditing/auditing-sub-list";
import { useShallow } from "zustand/react/shallow";

import BackupStorageAndTemplate from "./backup-storage";
import BareMetal from "./bare-metal";
import ClusterHost from "./cluster-host";
import DataStorage from "./data-storage";
import Header from "./header";
import Instance from "./instance";
import Network from "./network";
import Overview from "./overview";
import Topo from "./overview/topo";
import StorageTarget from "./storage-target";
import TemplatedVM from "./templatedvm";

import style from "./style.module.less";

const currentPlaceholder = {
  __typename: "Zone",
  clusterCount: 0,
  hostCount: 0,
  primaryStorageCount: 0,
  l2NetworkCount: 0,
  vmInstanceCount: 0,
  volumeCount: 0,
  backupStorageCount: 0,
  uuid: "",
  name: "",
  description: null,
  state: "Enabled",
  isDefault: false,
  createDate: "",
  lastOpDate: "",
};

interface IProps {
  location?: Location;
}

const DataCenterDetail: React.FC<IProps> = () => {
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";
  const intl = useIntl();
  const navigate = useNavigate();
  const location = useLocation();
  const isBaremetalAbsent = useBaremetalLicenseCheck();

  const [routerTabTarget, setRouterTabTarget] = useState("");

  useEffect(() => {
    const { pathname, search, state } = location;
    const searchObj = qs.parse(search, { ignoreQueryPrefix: true });
    const locationState = (state ?? {}) as Record<string, unknown>;
    const {
      uuid: _uuid,
      toExport,
      toRecycleBin,
      toSubVmList,
      toSubHostList,
      activeKey,
      ...rest
    } = searchObj;
    let searchStr = _uuid ? `?uuid=${_uuid}&` : "?";
    searchStr += Object.keys(rest ?? {})
      .map((key) => `${key}=${rest[key]}`)
      .join("&");
    if (toExport) {
      navigate(`${pathname}${searchStr}`, {
        replace: true,
        state: {
          ...locationState,
          _keyArr: ["exportRecord"],
          toExport,
        },
      });
      setRouterTabTarget("exportRecord");
    }
    if (toRecycleBin) {
      navigate(`${pathname}${searchStr}`, {
        replace: true,
        state: {
          ...locationState,
          _keyArr: ["recycle"],
          toRecycleBin,
        },
      });
      setRouterTabTarget("recycle");
    }
    if (toSubVmList) {
      navigate(`${pathname}${searchStr}`, {
        replace: true,
        state: {
          ...locationState,
          _keyArr: ["virtual.instance"],
          toSubVmList,
        },
      });
      setRouterTabTarget("virtual.instance");
    }
    if (toSubHostList) {
      navigate(`${pathname}${searchStr}`, {
        replace: true,
        state: {
          ...locationState,
          _keyArr: ["cluster.and.host"],
          toSubHostList,
          tabType: "host",
        },
      });
      setRouterTabTarget("cluster.and.host");
    }
    if (activeKey === "storageTarget") {
      navigate(`${pathname}${searchStr}`, {
        replace: true,
        state: {
          ...locationState,
          _keyArr: ["storageTarget"],
        },
      });
      setRouterTabTarget("storageTarget");
    }
  }, [location, navigate]);

  const { data, refetch } = useSuspenseQuery(zoneList, {
    variables: {
      conditions: [
        {
          key: "uuid",
          value: uuid,
        },
      ],
    },
  });

  const [currentResource, cachedZones, setCachedZones] =
    useVirtualizationResourceStore(
      useShallow((state) => [
        state.currentResource,
        state.cachedZones,
        state.setCachedZones,
      ]),
    );

  // Update cache in useEffect to avoid updating state during render
  useEffect(() => {
    const newData = data?.zoneList?.list?.[0];
    if (newData && uuid) {
      const currentCachedZones =
        useVirtualizationResourceStore.getState().cachedZones;
      processCache(uuid, currentCachedZones, setCachedZones, newData);
    }
  }, [data?.zoneList?.list, uuid, setCachedZones]);

  // Only compute value in useMemo, no side effects
  const current = useMemo(() => {
    const newData = data?.zoneList?.list?.[0];
    if (newData) {
      // 当有查询数据时，优先使用查询返回的 name
      return { ...currentPlaceholder, ...newData };
    }
    // Get cached zone without updating state
    const cachedInstanceIndex = cachedZones.findIndex(
      (item) => item?.data?.uuid === uuid,
    );
    const cachedZone =
      cachedInstanceIndex > -1 ? cachedZones[cachedInstanceIndex].data : null;
    // 只有在没有查询数据时，才使用 currentResource?.name 作为占位符
    return {
      ...currentPlaceholder,
      ...cachedZone,
      name: cachedZone?.name || currentResource?.name,
    };
  }, [data, uuid, cachedZones, currentResource?.name]);

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

  const tabsList = useMemo<AuthTabsListItem[]>(() => {
    const list: AuthTabsListItem[] = [
      {
        label: intl.formatMessage({
          id: "virtualization.overview",
          defaultMessage: "Overview",
        }),
        value: "overview",
        content: () => (
          <Overview current={current!} topo={<Topo detail={current} />} />
        ),
      },
      {
        label: intl.formatMessage({
          id: "cluster.and.host",
          defaultMessage: "Cluster and Host",
        }),
        value: "cluster.and.host",
        content: () => <ClusterHost current={current!} />,
      },
      {
        label: intl.formatMessage({
          id: "virtual.instance",
          defaultMessage: "Virtual Machine",
        }),
        value: "virtual.instance",
        content: () => <Instance current={current!} />,
      },
      {
        label: intl.formatMessage({
          id: "virtual.data.store",
          defaultMessage: "Data Storage",
        }),
        value: "dataStore",
        auth: {
          type: "view",
          authKey: "list",
          resource: "virtualization.primary.storage",
        },
        content: () => <DataStorage current={current!} />,
      },
      {
        label: intl.formatMessage({
          id: "iamge.storage",
          defaultMessage: "Image Storage",
        }),
        value: "imageStore",
        auth: {
          type: "view",
          authKey: "list",
          resource: "virtualization.backup.storage",
        },
        content: () => <BackupStorageAndTemplate current={current!} />,
      },
      {
        label: intl.formatMessage({
          id: "virtual.templated.vm",
          defaultMessage: "Template",
        }),
        value: "templatedVm",
        auth: {
          type: "view",
          authKey: "list",
          resource: "virtualization.vm.template",
        },
        content: () => <TemplatedVM current={current!} />,
      },
      {
        label: intl.formatMessage({
          id: "virtual.storageTarget",
          defaultMessage: "Storage Target",
        }),
        value: "storageTarget",
        noPadding: true,
        content: () => <StorageTarget current={current!} />,
      },
      {
        label: intl.formatMessage({
          id: "virtual.network",
          defaultMessage: "Network",
        }),
        value: "network",
        noPadding: true,
        content: () => <Network current={current!} />,
      },
      ...(!isBaremetalAbsent
        ? [
            {
              label: intl.formatMessage({
                id: "bareMetal",
                defaultMessage: "Bare Metal Management",
              }),
              value: "bareMetal",
              content: () => <BareMetal current={current!} />,
            },
          ]
        : []),
      {
        label: intl.formatMessage({ id: "audit", defaultMessage: "Event" }),
        value: "auditing",
        auth: {
          type: "view",
          authKey: "list",
          resource: "virtualization.auditing",
        },
        content: () => <AuditingSubList defaultQuery={defaultQuery} />,
      },
    ];
    return list;
  }, [intl, current, isBaremetalAbsent, defaultQuery]);

  return (
    <div className={cls("zsv-detail-container", style.zoneDetail)}>
      <Header current={current} refetch={refetch} />
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

export default DataCenterDetail;

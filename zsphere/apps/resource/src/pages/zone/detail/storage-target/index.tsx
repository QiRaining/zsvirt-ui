import { useLazyQuery } from "@apollo/client";
import { RadioGroup } from "@zstack/design";
import { fiberChannelStorageCount } from "@zstack/virtualization-resource/src/gql/fiber-channel-storage.gql";
import { iscsiServerCount } from "@zstack/virtualization-resource/src/gql/iscsi-server.gql";
import { nvmeServerCount } from "@zstack/virtualization-resource/src/gql/nvme-server.gql";
import DataStorageResourceTree from "@zstack/virtualization-resource/src/pages/data-storage/resource-tree";
// NvmeServer
import type { IResourceType } from "@zstack/virtualization-resource/src/pages/data-storage/resource-tree/hooks/types";
// FC Server
import FiberChannelLunResourceTreeDetail from "@zstack/virtualization-resource/src/pages/fiber-channel-lun/tree-detail";
import FiberChannelStorageResourceTreeDetail from "@zstack/virtualization-resource/src/pages/fiber-channel-storage/tree-detail";
// IscsiServer
import IScsiServerLunResourceTreeDetail from "@zstack/virtualization-resource/src/pages/iscsi-lun/tree-detail";
import IScsiServerIQNResourceTreeDetail from "@zstack/virtualization-resource/src/pages/iscsi-server/iqn/tree-detail";
import IScsiServerResourceTreeDetail from "@zstack/virtualization-resource/src/pages/iscsi-server/tree-detail";
import NvmeServeLunResourceTreeDetail from "@zstack/virtualization-resource/src/pages/nvme-lun/tree-detail";
import NvmeServerResourceTreeDetail from "@zstack/virtualization-resource/src/pages/nvme-server/tree-detail";
import NvmeServerNQNResourceTreeDetail from "@zstack/virtualization-resource/src/pages/nvme-server/tree-detail/nqn";
import { Empty, useAuth } from "@zstack/zsphere-components";
import { ResizableLayout } from "@zstack/zsphere-design-biz";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { Op, type IQuery, type TreeResourceType } from "@zstack/zsphere-types";
import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import { useLocalStorageState, useSessionStorageState } from "ahooks";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

import style from "./style.module.less";
const MARGIN_BOTTOM_12_STYLE = { marginBottom: 12 } as const;
const HEIGHT_100_PERCENT_STYLE = { height: "100%" } as const;

enum TopTabType {
  IscsiServer = "virtualization.iscsi.server",
  FiberChannelStorage = "virtualization.fiber.channel.storage",
  NvmeServer = "virtualization.nvme.server",
}

interface IStorageResource {
  uuid: string | undefined;
  resource: TreeResourceType | undefined;
}

interface IStorageResources {
  [key: string]: IStorageResource;
}

type StorageType = "IscsiServer" | "FiberChannelStorage" | "NvmeServer";

interface IProps {
  current: IZone;
}

const DEFAULT_WIDTH = 480;
const RESIZABLE_SIZE_KEY = "storageDetailWidth";

const DataStorage: React.FC<IProps> = ({ current }) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  const [visible, setVisible] = useState(false);
  const [searchParams] = useSearchParams();
  const scsiLunSourceType =
    searchParams.get("scsiLunSourceType") ?? "iscsiServer";
  const currentUuid = current?.uuid;
  const ref = useRef<HTMLDivElement>(null);

  const initialResources: IStorageResources = {
    IscsiServer: { uuid: undefined, resource: undefined },
    FiberChannelStorage: { uuid: undefined, resource: undefined },
    NvmeTarget: { uuid: undefined, resource: undefined },
    NvmeServer: { uuid: undefined, resource: undefined },
  };

  const [currentDataStorageDetailResource, setCurrentResource] =
    useLocalStorageState<IStorageResources>(
      "dataStorageDetail",
      initialResources,
    );

  const [tabType, setTabType] = useSessionStorageState<StorageType>(
    "storage-target-tab-type",
    "IscsiServer",
  );

  const queries = useMemo(() => {
    const createDefaultQuery = (key: string): IQuery => ({
      conditions: currentUuid
        ? [
            {
              key,
              op: Op.eq,
              value: currentUuid,
            },
          ]
        : [],
    });

    return {
      iscsiServer: createDefaultQuery("zoneUuid"),
      fiberChannel: createDefaultQuery("__ZoneUuids__"),
      nvmeServer: createDefaultQuery("zoneUuid"),
    };
  }, [currentUuid]);

  const queryMap = useMemo<Record<StorageType, IQuery>>(
    () => ({
      IscsiServer: queries.iscsiServer,
      FiberChannelStorage: queries.fiberChannel,
      NvmeServer: queries.nvmeServer,
    }),
    [queries],
  );

  const [getIscsiServerCount, { data: iscsiServerData }] = useLazyQuery(
    iscsiServerCount,
    {
      fetchPolicy: "no-cache",
      variables: queries.iscsiServer,
    },
  );

  const [getFiberChannelStorageCount, { data: fcData }] = useLazyQuery(
    fiberChannelStorageCount,
    {
      fetchPolicy: "no-cache",
      variables: queries.fiberChannel,
    },
  );

  const [getNvmeServerCount, { data: nvmeServerData }] = useLazyQuery(
    nvmeServerCount,
    {
      fetchPolicy: "no-cache",
      variables: queries.nvmeServer,
    },
  );

  const currentResource = useMemo(
    () =>
      currentDataStorageDetailResource[tabType] || {
        uuid: undefined,
        resource: undefined,
      },
    [tabType, currentDataStorageDetailResource],
  );

  const { activeMenuKey, resizable } = useMemo(() => {
    const keyMap: Record<StorageType, TopTabType> = {
      IscsiServer: TopTabType.IscsiServer,
      FiberChannelStorage: TopTabType.FiberChannelStorage,
      NvmeServer: TopTabType.NvmeServer,
    };

    const resourceTypeMap: Record<StorageType, string[]> = {
      IscsiServer: ["iscsi-server", "iscsi-iqn", "iscsi-lun"],
      FiberChannelStorage: ["fiber-channel-storage", "fiber-channel-lun"],
      NvmeServer: ["nvme-server", "nvme-nqn", "nvme-lun"],
    };

    const isResizable =
      visible &&
      currentResource?.uuid &&
      resourceTypeMap[tabType]?.includes(currentResource.resource || "");

    return {
      activeMenuKey: keyMap[tabType],
      resizable: isResizable,
    };
  }, [tabType, visible, currentResource]);

  const handleResourceChange = useCallback(
    (resource: IResourceType) => {
      const newResource: IStorageResource = {
        uuid: resource.uuid || undefined,
        resource: resource.resource || undefined,
      };
      setCurrentResource((prev) => ({
        ...prev,
        [tabType]: newResource,
      }));
      setVisible(true);
    },
    [tabType, setCurrentResource],
  );

  // Effects
  useEffect(() => {
    getIscsiServerCount({ variables: queries.iscsiServer });
    getFiberChannelStorageCount({ variables: queries.fiberChannel });
    getNvmeServerCount({ variables: queries.nvmeServer });
  }, [
    currentUuid,
    getIscsiServerCount,
    getFiberChannelStorageCount,
    getNvmeServerCount,
    queries,
  ]);

  useEffect(() => {
    if (scsiLunSourceType === "fiberChannel") {
      setTabType("FiberChannelStorage");
    }
    if (scsiLunSourceType === "nvmeServer") {
      setTabType("NvmeServer");
    }
  }, [scsiLunSourceType, setTabType]);

  useEffect(() => {
    const counts = {
      IscsiServer: iscsiServerData?.iscsiServerList?.total,
      FiberChannelStorage: fcData?.fiberChannelStorageList?.total,
      NvmeServer: nvmeServerData?.nvmeServerList?.total,
    };

    if (counts[tabType] === 0) {
      setCurrentResource((prev) => ({
        ...prev,
        [tabType]: { uuid: undefined, resource: undefined },
      }));
    }
  }, [
    tabType,
    iscsiServerData,
    fcData,
    nvmeServerData,
    currentUuid,
    setCurrentResource,
  ]);

  useActionSubscribe({
    resourceTypeList: ["IscsiServer", "FiberChannelStorage", "NvmeServer"],
    onFinish: () => {
      const actions = {
        IscsiServer: () =>
          getIscsiServerCount({ variables: queries.iscsiServer }),
        FiberChannelStorage: () =>
          getFiberChannelStorageCount({ variables: queries.fiberChannel }),
        NvmeServer: () => getNvmeServerCount({ variables: queries.nvmeServer }),
      };
      actions[tabType]?.();
    },
  });

  const renderStorageDetail = () => {
    if (!currentResource?.uuid) {
      return null;
    }

    const detailComponents: Record<string, React.ReactNode> = {
      "iscsi-server": (
        <IScsiServerResourceTreeDetail
          uuid={currentResource.uuid}
          setVisible={() => setVisible(false)}
        />
      ),
      "iscsi-iqn": (
        <IScsiServerIQNResourceTreeDetail
          uuid={currentResource.uuid}
          setVisible={() => setVisible(false)}
        />
      ),
      "iscsi-lun": (
        <IScsiServerLunResourceTreeDetail uuid={currentResource.uuid} />
      ),
      "fiber-channel-storage": (
        <FiberChannelStorageResourceTreeDetail
          uuid={currentResource.uuid}
          setVisible={() => setVisible(false)}
        />
      ),
      "fiber-channel-lun": (
        <FiberChannelLunResourceTreeDetail
          uuid={currentResource.uuid}
          setVisible={() => setVisible(false)}
        />
      ),
      "nvme-server": (
        <NvmeServerResourceTreeDetail
          uuid={currentResource.uuid}
          setVisible={() => setVisible(false)}
        />
      ),
      "nvme-nqn": (
        <NvmeServerNQNResourceTreeDetail
          uuid={currentResource.uuid}
          setVisible={() => setVisible(false)}
        />
      ),
      "nvme-lun": (
        <NvmeServeLunResourceTreeDetail
          uuid={currentResource.uuid}
          setVisible={() => setVisible(false)}
        />
      ),
    };

    return detailComponents[currentResource.resource || ""];
  };

  return (
    <div className={style.container} ref={ref}>
      <ResizableLayout
        storageKey={RESIZABLE_SIZE_KEY}
        defaultSize={DEFAULT_WIDTH}
        minSize={320}
        maxSize={600}
        direction="horizontal"
        resizeEdge="right"
      >
        <div className={style.leftContent}>
          <RadioGroup
            variant="outline"
            value={tabType}
            style={MARGIN_BOTTOM_12_STYLE}
            onValueChange={(val) => setTabType(val as StorageType)}
            options={[
              {
                value: "IscsiServer",
                label: intl.formatMessage(
                  {
                    id: "iscsiServerStorage.n",
                    defaultMessage: "iSCSI Storage ({n})",
                  },
                  { n: iscsiServerData?.iscsiServerList?.total ?? 0 },
                ),
              },
              {
                value: "FiberChannelStorage",
                label: intl.formatMessage(
                  {
                    id: "fc.storage.n",
                    defaultMessage: "FC Storage ({n})",
                  },
                  { n: fcData?.fiberChannelStorageList?.total ?? 0 },
                ),
              },
              ...(hasAuth({
                resource: "storage.target",
                type: "block",
                authKey: "NvmeServer",
              })
                ? [
                    {
                      value: "NvmeServer" as const,
                      label: intl.formatMessage(
                        {
                          id: "NVMe.server.n",
                          defaultMessage: "NVMe Storage ({n})",
                        },
                        { n: nvmeServerData?.nvmeServerList?.total ?? 0 },
                      ),
                    },
                  ]
                : []),
            ]}
          />

          {tabType && (
            <DataStorageResourceTree
              activeMenuKey={activeMenuKey}
              height={1000}
              source={current}
              defaultQuery={queryMap[tabType]}
              currentResource={currentResource}
              setCurrentResource={handleResourceChange}
              setDetailVisible={setVisible}
            />
          )}
        </div>
      </ResizableLayout>

      <div className={style.rightContent}>
        {!resizable && (
          <div
            className="flex items-center justify-center"
            style={HEIGHT_100_PERCENT_STYLE}
          >
            <Empty
              type="Table"
              description={intl.formatMessage({
                id: "common.no.data",
                defaultMessage: "No Data",
              })}
            />
          </div>
        )}
        {renderStorageDetail()}
      </div>
    </div>
  );
};

export default DataStorage;

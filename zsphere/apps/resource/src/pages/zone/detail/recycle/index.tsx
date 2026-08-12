import { useLazyQuery } from "@apollo/client";
import { RadioGroup } from "@zstack/design";
import { baremetalInstanceCount } from "@zstack/virtualization-resource/src/gql/baremetal-instance.gql";
import { imageCount } from "@zstack/virtualization-resource/src/gql/image.gql";
import { instanceCount } from "@zstack/virtualization-resource/src/gql/vm.gql";
import { volumeCount } from "@zstack/virtualization-resource/src/gql/volume.gql";
import ImageList from "@zstack/virtualization-resource/src/pages/image/list";
import VMList from "@zstack/virtualization-resource/src/pages/vm/list";
import VolumeList from "@zstack/virtualization-resource/src/pages/volume/list";
import { useAuth, usePersistTabState } from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import type { IActionSubscribe, IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import { useMount } from "ahooks";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

const BaremetalInstanceList = React.lazy(() =>
  import("zsv_baremetal/baremetal-instance/list").catch(() => ({
    default: () => null,
  })),
);

import style from "./style.module.less";

const MARGIN_BOTTOM_12_STYLE = { marginBottom: 12 } as const;

interface IProps {
  current?: IZone;
}

const RESOURCE_TYPES = {
  VM: "vm",
  IMAGE: "image",
  DISK: "disk",
  BARE_METAL_INSTANCE: "baremetalInstance",
} as const;

type ResourceType = (typeof RESOURCE_TYPES)[keyof typeof RESOURCE_TYPES];

const Recycle: React.FC<IProps> = ({ current }) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();

  const hasVmAuth = hasAuth({
    type: "view",
    authKey: "list",
    resource: "virtualization.vm",
  });

  const hasImageAuth = hasAuth({
    type: "view",
    authKey: "list",
    resource: "virtualization.image",
  });

  const hasBmInstanceAuth = hasAuth({
    type: "view",
    authKey: "list",
    resource: "virtualization.bm.instance",
  });

  const tabState = useMemo(() => {
    const orderedTypes: ResourceType[] = [];

    if (hasVmAuth) {
      orderedTypes.push(RESOURCE_TYPES.VM);
    }

    if (hasImageAuth) {
      orderedTypes.push(RESOURCE_TYPES.IMAGE);
    }

    orderedTypes.push(RESOURCE_TYPES.DISK);

    if (hasBmInstanceAuth) {
      orderedTypes.push(RESOURCE_TYPES.BARE_METAL_INSTANCE);
    }

    return orderedTypes;
  }, [hasVmAuth, hasImageAuth, hasBmInstanceAuth]);

  const { activeKey, onChange } = usePersistTabState("recycle", tabState);

  const vmDefaultQuery = useMemo<IQuery>(() => {
    const baseQuery: IQuery = {
      conditions: [
        { key: "state", op: Op.eq, value: "Destroyed" },
        ...(current?.uuid
          ? [{ key: "zoneUuid", value: current.uuid, op: Op.eq }]
          : []),
      ],
    };
    return baseQuery;
  }, [current]);

  const imageDefaultQuery = useMemo<IQuery>(() => {
    const baseQuery: IQuery = {
      conditions: [
        ...(current?.uuid
          ? [{ key: "backupStorage.zone.uuid", op: Op.eq, value: current.uuid }]
          : []),
        { key: "format", op: Op.ne, value: "vmtx" },
        { key: "system", op: Op.eq, value: "false" },
        { key: "status", op: Op.eq, value: "Deleted" },
      ],
    };
    return baseQuery;
  }, [current]);

  const volumeDefaultQuery = useMemo<IQuery>(() => {
    const conditions: IQuery["conditions"] = [
      { key: "status", op: Op.eq, value: "Deleted" },
      { key: "type", op: Op.eq, value: "Data" },
      {
        key: "format",
        op: Op.ne,
        value: "vmtx",
      },
    ];

    if (current?.uuid) {
      conditions.push({
        key: "primaryStorage.zone.uuid",
        op: Op.eq,
        value: current?.uuid,
      });
    }

    return {
      conditions,
    };
  }, [current]);

  const baremetalInstanceDefaultQuery = useMemo<IQuery>(() => {
    const baseQuery: IQuery = {
      conditions: [
        { key: "state", op: Op.eq, value: "Destroyed" },
        ...(current?.uuid
          ? [{ key: "zoneUuid", value: current.uuid, op: Op.eq }]
          : []),
      ],
    };
    return baseQuery;
  }, [current]);

  const [getVmCount, { data: vmData }] = useLazyQuery(instanceCount, {
    fetchPolicy: "no-cache",
    variables: vmDefaultQuery,
  });

  const [getImageCount, { data: imageData }] = useLazyQuery(imageCount, {
    fetchPolicy: "no-cache",
    variables: imageDefaultQuery,
  });

  const [getVolumeCount, { data: volumeData }] = useLazyQuery(volumeCount, {
    fetchPolicy: "no-cache",
    variables: volumeDefaultQuery,
  });

  const [getBaremetalInstanceCount, { data: baremetalInstanceData }] =
    useLazyQuery(baremetalInstanceCount, {
      fetchPolicy: "no-cache",
      variables: baremetalInstanceDefaultQuery,
    });

  useMount(() => {
    getVmCount();
    getImageCount();
    getVolumeCount();
    getBaremetalInstanceCount();
  });

  useActionSubscribe({
    resourceTypeList: ["Volume", "VmInstance", "Image", "BaremetalInstance"],
    onFinish: (e: string) => {
      if (e === "Volume") {
        getVolumeCount();
      }
      if (e === "VmInstance") {
        getVmCount();
      }
      if (e === "Image") {
        getImageCount();
      }
      if (e === "BaremetalInstance") {
        getBaremetalInstanceCount();
      }
    },
  } as IActionSubscribe);

  return (
    <div className={style.container}>
      <RadioGroup
        variant="outline"
        value={activeKey}
        style={MARGIN_BOTTOM_12_STYLE}
        onValueChange={onChange}
        options={[
          ...(hasVmAuth
            ? [
                {
                  value: "vm",
                  label: intl.formatMessage(
                    {
                      id: "virtualization.instance.n",
                      defaultMessage: "Virtual Machine ({n})",
                    },
                    {
                      n: vmData?.vmInstanceList?.total || 0,
                    },
                  ),
                },
              ]
            : []),
          ...(hasImageAuth
            ? [
                {
                  value: "image",
                  label: intl.formatMessage(
                    {
                      id: "virtualization.image.n",
                      defaultMessage: "Image ({n})",
                    },
                    { n: imageData?.imageList?.total ?? 0 },
                  ),
                },
              ]
            : []),
          {
            value: "disk",
            label: intl.formatMessage(
              { id: "virtualization.disk.n", defaultMessage: "Disk ({n})" },
              { n: volumeData?.volumeList?.total ?? 0 },
            ),
          },
          ...(hasBmInstanceAuth
            ? [
                {
                  value: "baremetalInstance",
                  label: intl.formatMessage(
                    {
                      id: "virtualization.baremetalInstance.n",
                      defaultMessage: "Bare Metal Instance ({n})",
                    },
                    {
                      n:
                        baremetalInstanceData?.baremetalInstanceList?.total ??
                        0,
                    },
                  ),
                },
              ]
            : []),
        ]}
      />

      {activeKey === "vm" && (
        <VMList
          view="sub.virtualization.zone.recyle"
          defaultQuery={vmDefaultQuery}
        />
      )}
      {activeKey === "image" && (
        <ImageList
          view="sub.virtualization.zone.recyle"
          defaultQuery={imageDefaultQuery}
        />
      )}
      {activeKey === "disk" && (
        <VolumeList
          view="sub.virtualization.zone.recyle"
          defaultQuery={volumeDefaultQuery}
        />
      )}
      {activeKey === "baremetalInstance" && (
        <React.Suspense fallback={null}>
          <BaremetalInstanceList
            view="main.destroyed"
            defaultQuery={baremetalInstanceDefaultQuery}
          />
        </React.Suspense>
      )}
    </div>
  );
};

export default Recycle;

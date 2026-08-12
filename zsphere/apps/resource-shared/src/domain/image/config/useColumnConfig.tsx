import { Text } from "@zstack/design";
import {
  AuthHander,
  State,
  Tag,
  useAuth,
  Constant,
  ResourceName,
  useShare,
  ShareType,
  useShareTypeFilters,
} from "@zstack/zsphere-components";
import { ConstantEnum, ConstantType } from "@zstack/zsphere-constant";
import { useColumnConfig } from "@zstack/zsphere-engine/src/image";
import type { IOption } from "@zstack/zsphere-engine/src/image/useColumnConfig";
import {
  CpuArchitecture,
  ImageFormat,
  ImageMediaType,
  ImagePlatform,
  ImageState,
  ImageStatus,
  Op,
} from "@zstack/zsphere-types";
import { LeftNavType } from "@zstack/zsphere-types";
import { NavView } from "@zstack/zsphere-types";
import type { Image } from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";
import { omit } from "lodash-es";
import { useMemo } from "react";
import { useIntl } from "react-intl";

import { getGuestIcon, useGetGuestNameEnum } from "../utils";

export const volumeImageAuth = {
  authKey: "volumeImage",
  type: "block" as const,
  resource: "volume",
};

export default ({
  view,
  defaultQuery,
}: {
  view?: string;
  defaultQuery?: any;
}) => {
  const intl = useIntl();
  const shareTypeFilters = useShareTypeFilters(view);
  const guestNameEnum = useGetGuestNameEnum();

  const { isShareResource } = useShare();
  const { hasAuth } = useAuth();
  let formatOptions = omit(ImageFormat, ImageFormat.vmtx);
  const format =
    defaultQuery?.conditions?.filter((t: any) => t.key === "format")?.[0] ?? {};
  if (format?.op === Op.ne && format?.value === "iso") {
    formatOptions = omit(ImageFormat, [ImageFormat.vmtx, ImageFormat.iso]);
  }
  if (format?.op === Op.eq && format?.value === "iso") {
    formatOptions = omit(ImageFormat, [
      ImageFormat.qcow2,
      ImageFormat.vmtx,
      ImageFormat.raw,
    ]);
  }
  const shareTypeMap = useMemo<Record<string, string>>(
    () => ({
      Public: intl.formatMessage({
        id: "global.shared",
        defaultMessage: "Share Globally",
      }),
      Group: intl.formatMessage({
        id: "share.type.group",
        defaultMessage: "Share With Users/User Groups",
      }),
      None: intl.formatMessage({ id: "no.share", defaultMessage: "Not Share" }),
    }),
    [intl],
  );

  const options: IOption<Image> = [
    {
      key: "name",
      linkResource: {
        microAppName: "virtualization-resource",
        path: "image",
      },
      formatter: (current: Image) =>
        view?.includes("select") ||
        (view &&
          [
            "sub.virtualization.zone.detail.exported",
            "sub.virtualization.backup-storage.detail.exported",
          ].includes(view)) ? (
          current?.name
        ) : (
          <ResourceName
            value={current?.name}
            isRouterManaged
            link={{
              to: `/image`,
              microAppName: "virtualization-resource",
              uuid: current?.uuid,
              leftnav: LeftNavType.TemplateVm,
              navView: NavView.Resource,
            }}
          />
        ),
      extra: (current: Image) => {
        return isShareResource([current]) ? (
          <Tag round size="small" level="weak">
            {intl.formatMessage({
              id: "sharedResource",
              defaultMessage: "Share Resource",
            })}
          </Tag>
        ) : null;
      },
    },
    {
      key: "format",
      filterOptions: formatOptions,
    },
    {
      key: "shareType",
      render: (row: Image) => {
        return <ShareType type={row.shareType!} />;
      },
      exportToCSVRender: (row) => {
        return shareTypeMap[row.shareType] ?? row.shareType;
      },
      filters: shareTypeFilters,
      filterEnumType: ConstantType.ShareType,
      auth: {
        type: "block",
        authKey: "share.type",
        resource: "common",
      },
    },
    {
      key: "mediaType",
      filters: [
        {
          value: ImageMediaType.RootVolumeTemplate,
          text: (
            <Constant
              value={
                ImageMediaType.RootVolumeTemplate as unknown as ConstantEnum
              }
            />
          ),
        },
        {
          value: ImageMediaType.DataVolumeTemplate,
          text: (
            <AuthHander {...volumeImageAuth}>
              <Constant
                value={
                  ImageMediaType.DataVolumeTemplate as unknown as ConstantEnum
                }
              />
            </AuthHander>
          ),
        },
      ].filter(
        (cv) =>
          cv.value === ImageMediaType.RootVolumeTemplate ||
          (cv.value === ImageMediaType.DataVolumeTemplate &&
            hasAuth(volumeImageAuth)),
      ),
      searchKey: "__mediaType__",
      render: (row: Image) => {
        const mediaType =
          row?.mediaType === ImageMediaType.DataVolumeTemplate
            ? ImageMediaType.DataVolumeTemplate
            : ImageMediaType.RootVolumeTemplate;
        return <Constant value={mediaType as unknown as ConstantEnum} />;
      },
    },
    {
      key: "state",
      filterOptions: ImageState,
    },
    {
      key: "status",
      filters: [
        {
          text: <Constant value={ImageStatus.Creating} />,
          value: ImageStatus.Creating,
          i18nKey: "creating",
        },
        {
          text: (
            <>
              <Constant value={ImageStatus.Downloading} /> /{" "}
              <Constant value={ConstantEnum.Uploading} />
            </>
          ),
          value: ImageStatus.Downloading,
          i18nKey: "downloading.uploading",
        },
        {
          text: <Constant value={ImageStatus.Error} />,
          value: ImageStatus.Error,
          i18nKey: "error",
        },
        {
          text: <Constant value={ImageStatus.Migrating} />,
          value: ImageStatus.Migrating,
          i18nKey: "migrating",
        },
        {
          text: <Constant value={ImageStatus.Ready} />,
          value: ImageStatus.Ready,
          i18nKey: "ready",
        },
      ],
      render: (row: Image) => {
        if (row.status === "Downloading" && row.url.indexOf("upload") === 0) {
          const value = intl.formatMessage({
            id: "uploading",
            defaultMessage: "Uploading",
          });
          return <State name={value} type="progress" />;
        }
        return <Constant value={row.status as unknown as ConstantEnum} />;
      },
    },
    {
      key: "size",
      formatter: ({ size }) => formatStorage(size, 2),
    },
    {
      key: "platform",
      filterOptions: omit(
        ImagePlatform,
        ImagePlatform.Paravirtualization,
        ImagePlatform.WindowsVirtio,
      ),
      render: (row: Image) => {
        const platform =
          row?.mediaType === ImageMediaType.DataVolumeTemplate
            ? "-"
            : row?.platform;
        return <Constant value={platform as ConstantEnum} />;
      },
    },
    {
      key: "guestOsType",
      filters: guestNameEnum?.map((it) => {
        return {
          text: (
            <State
              name={it?.value}
              icon={it?.icon}
              color={{ color: "neutral", number: 600 }}
            />
          ),
          value: it.value,
        };
      }),
      render: ({ guestOsType }) => {
        const icon = getGuestIcon(guestOsType, guestNameEnum)?.icon;
        if (icon) {
          return (
            <State
              name={
                `${guestOsType}`?.includes("openSUSE")
                  ? "openSUSE"
                  : guestOsType
              }
              icon={icon}
              color={{ color: "neutral", number: 600 }}
            />
          );
        }
        return guestOsType ? <Text>{guestOsType}</Text> : "-";
      },
    },
    {
      key: "backupStorage",
      render: (row: any) => {
        const uuid = row?.backupStorage?.uuid;
        return (
          <ResourceName
            value={row?.backupStorage?.name}
            link={{
              to: `/backup-storage`,
              microAppName: "virtualization-resource",
              uuid,
              leftnav: LeftNavType.TemplateVm,
            }}
          />
        );
      },
      auth: {
        resource: "image",
        type: "block",
        authKey: "backup.storage",
      },
    },
    {
      key: "owner",
      render: ({ owner }: Image) => {
        if (!owner) {
          return intl.formatMessage({ id: "empty", defaultMessage: "Empty" });
        }
        if (owner?.uuid === "36c27e8ff05c4780bf6d2fa65700f22e") {
          return owner?.name;
        }
        return (
          <ResourceName
            value={owner?.name}
            link={{
              leftnav: LeftNavType.ClusterHost,
              to: `/account-information/user`,
              microAppName: "virtualization-administration",
              uuid: owner?.uuid,
            }}
          />
        );
      },
      exportToCSVRender: ({ owner }) =>
        owner?.name ||
        intl.formatMessage({ id: "empty", defaultMessage: "Empty" }),
      auth: {
        resource: "image",
        type: "block",
        authKey: "owner",
      },
    },
    {
      key: "architecture",
      filterOptions: CpuArchitecture,
    },
    {
      key: "zone",
      render: (current) => {
        return (
          <ResourceName
            value={current.backupStorage?.zone?.name}
            link={{
              leftnav: LeftNavType.ClusterHost,
              to: `/zone`,
              microAppName: "virtualization-resource",
              uuid: current.backupStorage?.zone?.uuid,
            }}
          />
        );
      },
    },
  ];

  return useColumnConfig(options);
};

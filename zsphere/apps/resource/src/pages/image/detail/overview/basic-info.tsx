import { Text } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { syncImageSize } from "@zstack/virtualization-resource/src/gql/image.gql";
import { DraggableCard } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import {
  ResourceName,
  List,
  Constant,
  ShareType,
  useShare,
} from "@zstack/zsphere-components";
import type { ConstantEnum } from "@zstack/zsphere-constant";
import { LongText, CopyableText } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import { ImageMediaType } from "@zstack/zsphere-types";
import { LeftNavType } from "@zstack/zsphere-types";
import type {
  Image as IImage,
  SyncImageSizePayload as ISyncImageSizePayload,
} from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import ModifyConfigModal from "../../action/modify-config";

import style from "./style.module.less";

interface IProps {
  detail: IImage;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const BasicInfo: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed = false,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const { verifyShareResource } = useShare();
  const [modifyModalVisible, setModifyModalVisible] = useState(false);

  const {
    status,
    mediaType,
    format,
    size,
    actualSize,
    shareType,
    owner,
    description,
    uuid,
    availableUserVm = 0,
    createDate,
  } = detail;

  const { getServerTime } = useTime();

  const refreshActualSize = async () => {
    const payload: ISyncImageSizePayload = { uuid };
    doAction({
      mutation: syncImageSize,
      payload,
      name: intl.formatMessage({
        id: "refresh.imageActualSize",
        defaultMessage: "Refresh Image Actual Size",
      }),
      total: 1,
      type: "Image",
    });
  };

  const renderOwner = useMemo(() => {
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
  }, [intl, owner]);

  const list: ListItem[] = useMemo(
    () => [
      {
        label: intl.formatMessage({ id: "status", defaultMessage: "Status" }),
        value: <Constant value={status as unknown as ConstantEnum} />,
      },
      {
        label: intl.formatMessage({
          id: "imageType",
          defaultMessage: "Image Type",
        }),
        value:
          ImageMediaType.DataVolumeTemplate === mediaType
            ? intl.formatMessage({
                id: "volumeImage",
                defaultMessage: "Disk Image",
              })
            : intl.formatMessage({
                id: "systemImage",
                defaultMessage: "System Image",
              }),
      },
      {
        label: intl.formatMessage({
          id: "imageFormat",
          defaultMessage: "Image Format",
        }),
        value: format,
      },
      {
        label: intl.formatMessage({ id: "capacity", defaultMessage: "Capacity" }),
        value: <Text>{formatStorage(size, 2)}</Text>,
      },
      {
        label: intl.formatMessage({
          id: "actualSize",
          defaultMessage: "Actual Size",
        }),
        value: (
          <div className={style.actualSizeValue}>
            <span>{formatStorage(actualSize, 2)}</span>
            {!verifyShareResource(detail) && status !== "Deleted" && (
              <span
                onClick={() => refreshActualSize()}
                className={style.refreshBtn}
              >
                {intl.formatMessage({ id: "refresh", defaultMessage: "Refresh" })}
              </span>
            )}
          </div>
        ),
      },
      {
        label: intl.formatMessage({
          id: "shareMode",
          defaultMessage: "Sharing Mode",
        }),
        auth: {
          type: "block",
          authKey: "share.type",
          resource: "common",
        },
        value: <ShareType type={shareType!} />,
      },
      ...(mediaType !== ImageMediaType.DataVolumeTemplate
        ? [
            {
              label: intl.formatMessage({
                id: "associate.vm",
                defaultMessage: "Associated VM",
              }),
              value: <Text>{availableUserVm}</Text>,
            },
          ]
        : []),
      {
        label: intl.formatMessage({ id: "owner", defaultMessage: "Owner" }),
        auth: {
          type: "block",
          authKey: "owner",
          resource: "image",
        },
        value: renderOwner,
      },
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        value: <LongText value={description || undefined} canModify />,
      },
      {
        label: intl.formatMessage({ id: "uuid", defaultMessage: "UUID" }),
        value: <CopyableText>{uuid}</CopyableText>,
      },
      {
        label: intl.formatMessage({
          id: "createTime",
          defaultMessage: "Creation Time",
        }),
        value: getServerTime(createDate!).format("YYYY-MM-DD HH:mm:ss"),
      },
      //  去除所有最后操作时间
      // {
      //   label: intl.formatMessage({ id: 'last.op.date', defaultMessage: '最后操作时间' }),
      //   value: getServerTime(lastOpDate!).format('YYYY-MM-DD HH:mm:ss')
      // }
    ],
    [detail, intl, getServerTime],
  );

  const selectedListDetail = useMemo(() => [detail], [detail]);

  return (
    <>
      <DraggableCard
        title={intl.formatMessage({
          id: "basic.info",
          defaultMessage: "Basic Info",
        })}
        isList
        onCollapseChange={onCollapseChange}
        collapsed={collapsed}
        titleActions={
          verifyShareResource(detail)
            ? []
            : [
                {
                  icon: "edit",
                  tooltip: intl.formatMessage({
                    id: "edit.config",
                    defaultMessage: "Modify Configuration",
                  }),
                  onClick: () => setModifyModalVisible(true),
                  authKey: "modify.config",
                  resource: "image",
                },
              ]
        }
      >
        <List list={list} bordered={false} />
      </DraggableCard>
      <ModifyConfigModal
        visible={modifyModalVisible}
        setVisible={setModifyModalVisible}
        selectedList={selectedListDetail}
      />
    </>
  );
};

export default BasicInfo;

import { gql } from "@apollo/client";
import { Icon } from "@zstack/icon";
import { DraggableCard } from "@zstack/zsphere-components";
import { List, ResourceName } from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import { NavView } from "@zstack/zsphere-types";
import type { Image as IImage } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import style from "./style.module.less";

interface IProps {
  detail: IImage;
  refetch?: any;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}
const calcHash = gql`
  mutation calcHash($input: CalcHashInput!) {
    calcHash(input: $input) {
      actionId
    }
  }
`;
const RelativeResource: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed = false,
  refetch,
}) => {
  const intl = useIntl();
  const [icon, setIcon] = useState("refresh");
  const doAction = useAction();
  const refresh = async () => {
    setIcon("loader");
    const payload = {
      uuid: detail?.uuid,
      backupStorageUuid: detail?.backupStorage?.uuid,
    };
    doAction({
      mutation: calcHash,
      payload,
      name: intl.formatMessage({
        id: "calc.hash",
        defaultMessage: "Calculate MD5",
      }),
      onFinish: () => {
        refetch();
      },
      onProgress: () => {
        setIcon("refresh");
      },
      total: 1,
      type: "Image",
    });
  };

  const list = useMemo(() => {
    const { backupStorage, url, backupStorageRefs, md5Sum } = detail;
    const md5 =
      backupStorage?.type === "Ceph"
        ? "-"
        : md5Sum ||
          (url &&
          /(?:http)|(?:https)|(?:ftp)|(?:sftp)|(?:file)|(?:upload)/.test(
            url.toLocaleLowerCase(),
          ) ? (
            <span className={style.md5}>
              {intl.formatMessage({ id: "none", defaultMessage: "None" })}
              <Icon
                className={style.cursor}
                type={icon as any}
                color="info"
                onClick={() => refresh()}
              />
            </span>
          ) : (
            "-"
          ));
    return [
      {
        label: intl.formatMessage({
          id: "backupStorage",
          defaultMessage: "Image Storage",
        }),
        value: (
          <ResourceName
            value={backupStorage?.name}
            link={{
              uuid: backupStorage?.uuid,
              to: "/backup-storage",
              microAppName: "virtualization-resource",
              navView: NavView.Resource,
            }}
          />
        ),
      },
      {
        label: intl.formatMessage({ id: "url", defaultMessage: "URL" }),
        value: <CopyableText>{url}</CopyableText>,
      },
      {
        label: intl.formatMessage({
          id: "md5Sum",
          defaultMessage: "MD5",
        }),
        icon: "info" as any,
        iconTooltip: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "md5Sum.tooltip",
              defaultMessage: `### MD5

Calculate the MD5 value of an image uploaded to a virtualized platform for verification purposes. This can be used to confirm whether the uploaded image is complete and intact.

Note:
1. Only images uploaded via URL or local file support MD5 calculation.
2. Images in a distributed repository do not support MD5 calculation.
3. After uploading an image in VMDK format, it will be automatically converted. Therefore, the MD5 value obtained here cannot be used as a basis for verifying the integrity of the uploaded image.`,
            })}
          </ReactMarkdown>
        ),
        value: md5,
      },
      {
        label: intl.formatMessage({
          id: "installPath",
          defaultMessage: "Installation Path",
        }),
        value: (
          <CopyableText>{backupStorageRefs?.[0]?.installPath}</CopyableText>
        ),
      },
    ];
  }, [detail, intl]);

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "relative.object",
        defaultMessage: "Related Objects",
      })}
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default RelativeResource;

import type { DocumentNode } from "@apollo/client";
import { gql, useSubscription } from "@apollo/client";
import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type {
  ActionTaskResult,
  Image as IImage,
} from "@zstack/zsphere-types/graphql";
import { bus } from "@zstack/zsphere-utils";
import React, { useEffect, useMemo } from "react";

import { useActionConfig, useColumnConfig, useQueryConfig } from "../config";

const QUERY_IMAGE_LIST = gql`
  fragment imageFields on Image {
    uuid
    name
    createDate
    lastOpDate
    description
    architecture
    state
    status
    size
    actualSize
    md5Sum
    url
    mediaType
    guestOsType
    type
    platform
    format
    system
    bootMode
    baremetal2Image
    toPublic
    shareType
    useFor
    guestOsType
    virtio
    isZmigrateImage
    backupStorageRefs {
      imageUuid
      backupStorageUuid
      installPath
      status
      exportMd5Sum
      exportUrl
      createDate
      lastOpDate
    }
    backupStorage {
      name
      uuid
      type
      zone {
        uuid
        name
      }
    }
    availableUserVm
    owner {
      name
      uuid
      type
    }
  }

  query imageList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $extraConditions: [Condition!]
    $type: ImageQueryType
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    imageList(
      start: $start
      limit: $limit
      replyWithCount: true
      conditions: $conditions
      extraConditions: $extraConditions
      type: $type
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      list {
        ...imageFields
      }
    }
  }
`;

const LISTEN_ACTION_RESP = gql`
  subscription listenActionResp($sessionId: String!) {
    listenActionResp(sessionId: $sessionId) {
      sessionId
      actionId
      state
      type
      listenerType
      id
      fields
      inventory
      error
      listenerType
    }
  }
`;

export interface IImagePlainListProps extends Omit<
  ITableListProps<IImage>,
  "gql"
> {
  toolbar?: ITableListProps<IImage>["toolbar"];
  gql?: DocumentNode;
  source?: ITableListProps<IImage>["source"];
}

const ImagePlainList: React.FC<IImagePlainListProps> = ({
  view,
  defaultQuery,
  source,
  actionConfig,
  columnConfig,
  queryConfig,
  gql,
  toolbar,
  ...props
}) => {
  const defaultQueryConfig = useQueryConfig({ view, defaultQuery });
  const defaultActionConfig =
    useActionConfig() as unknown as ITableListProps<IImage>["actionConfig"];
  const defaultColumnConfig = useColumnConfig({ view, defaultQuery });

  const { data } = useSubscription<{ listenActionResp: ActionTaskResult }>(
    LISTEN_ACTION_RESP,
    {
      variables: { sessionId: localStorage.getItem("sessionId") },
    },
  );
  useEffect(() => {
    if (data?.listenActionResp.type === "Image") {
      bus.emit(`action:refetch:Image`);
    }
  }, [data]);

  const defaultToolbar: ITableListProps<IImage>["toolbar"] = useMemo(() => {
    const baseToolbar: ITableListProps<IImage>["toolbar"] = [
      "refresh",
      "operation",
      "search",
      "setting",
    ];
    if (view === "sub.virtualization.backup-storage") {
      return [...(Array.isArray(baseToolbar) ? baseToolbar : []), "export"];
    }
    return baseToolbar;
  }, [view]);

  return (
    <TableList
      view={view}
      columnConfig={columnConfig || defaultColumnConfig}
      actionConfig={actionConfig || defaultActionConfig}
      queryConfig={queryConfig || defaultQueryConfig}
      gql={gql || QUERY_IMAGE_LIST}
      source={source}
      defaultQuery={defaultQuery}
      type="Image"
      resource="image"
      toolbar={toolbar || defaultToolbar}
      {...props}
    />
  );
};

export default React.memo(ImagePlainList);

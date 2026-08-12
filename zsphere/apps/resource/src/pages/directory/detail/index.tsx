import { useSuspenseQuery } from "@apollo/client";
import { getGroupDirTreeByUuid } from "@zstack/virtualization-resource/src/gql/directory.gql";
import { vmDirectoryGroupByUuid } from "@zstack/virtualization-resource/src/gql/vm-directory.gql";
import DirList from "@zstack/virtualization-resource/src/pages/directory/list";
import type { VMGroupDirectoryTree } from "@zstack/virtualization-resource/src/pages/directory/utils";
import { getTreeList } from "@zstack/virtualization-resource/src/pages/directory/utils";
import Instance from "@zstack/virtualization-resource/src/pages/vm/list";
import { processCache } from "@zstack/virtualization-resource/src/utils/page-cache";
import { TabPane, Tabs } from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { useVirtualizationResourceStore } from "@zstack/zsphere-platform-store";
import { Op } from "@zstack/zsphere-types";
import React, { useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";
import { useShallow } from "zustand/react/shallow";

import Header from "./header";

const DirDetail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";
  const intl = useIntl();
  const currentPlaceholder = {
    __typename: "VMGroupDirectory",
    key: "",
    title: "",
    level: null,
    name: intl.formatMessage({
      id: "virtualization.default.dir",
      defaultMessage: "Default Group",
    }),
    parentUuid: null,
    zoneUuid: "",
    uuid: "uuid",
    groupName: "default",
    vmCount: 0,
  };
  const [treeData, setTreeData] = useState<VMGroupDirectoryTree[]>([]);

  const { data, refetch: directoryRefetch } = useSuspenseQuery(
    vmDirectoryGroupByUuid,
    {
      fetchPolicy: "cache-and-network",
      variables: {
        conditions: [
          {
            key: "uuid",
            op: Op.eq,
            value: uuid,
          },
        ],
      },
    },
  );

  const refetch = () => {
    directoryRefetch();
  };

  const [currentResource, cachedDirectories, setCachedDirectories] =
    useVirtualizationResourceStore(
      useShallow((state) => [
        state.currentResource,
        state.cachedDirectories,
        state.setCachedDirectories,
      ]),
    );

  // Update cache in useEffect to avoid updating state during render
  useEffect(() => {
    if (!uuid.startsWith("-2")) {
      const newData = data?.vmDirectoryGroupByUuid?.list?.[0];
      if (newData && uuid) {
        const currentCachedDirectories =
          useVirtualizationResourceStore.getState().cachedDirectories;
        processCache(
          uuid,
          currentCachedDirectories,
          setCachedDirectories,
          newData,
        );
      }
    }
  }, [data?.vmDirectoryGroupByUuid?.list, uuid]);

  // Only compute value in useMemo, no side effects
  const current = useMemo(() => {
    if (uuid.startsWith("-2")) {
      return {
        ...currentPlaceholder,
        zoneUuid: uuid.split("-2").pop(),
      };
    }
    const newData = data?.vmDirectoryGroupByUuid?.list?.[0];
    if (newData) {
      // 当有查询数据时，优先使用查询返回的 name
      return { ...currentPlaceholder, ...newData };
    }
    // Get cached directory without updating state
    const cachedInstanceIndex = cachedDirectories.findIndex(
      (item) => item?.data?.uuid === uuid,
    );
    const cachedDirectory =
      cachedInstanceIndex > -1
        ? cachedDirectories[cachedInstanceIndex].data
        : null;
    // 只有在没有查询数据时，才使用 currentResource?.name 作为占位符
    return {
      ...currentPlaceholder,
      ...cachedDirectory,
      name: cachedDirectory?.name || currentResource?.name,
    };
  }, [
    data?.vmDirectoryGroupByUuid?.list,
    uuid,
    cachedDirectories,
    currentResource?.name,
  ]);

  const { data: treeList, refetch: treeRefetch } = useSuspenseQuery(
    getGroupDirTreeByUuid,
    {
      variables: {
        conditions: [
          {
            key: "uuid",
            op: Op.eq,
            value: current?.uuid,
          },
        ],
      },
    },
  );

  useEffect(() => {
    if (treeList) {
      const list = treeList?.getGroupDirTreeByUuid?.list ?? [];
      const formatedTreeData = getTreeList(list, current?.uuid);
      setTreeData(formatedTreeData);
    }
  }, [treeList, current?.uuid]);

  useActionSubscribe({
    resourceTypeList: ["DirectoryGroup"],
    onFinish: () => {
      refetch();
    },
  });

  return (
    <div className="zsv-detail-container">
      <Header current={current} refetch={refetch} />
      <Tabs
        type="line"
        key="directory"
        destroyInactiveTabPane
        contentId="main-tab"
      >
        <TabPane
          tab={intl.formatMessage({
            id: "virtual.instance",
            defaultMessage: "Virtual Machine",
          })}
          key="virtual.instance"
        >
          <Instance
            view="sub.virtualization.zone"
            source={current!}
            defaultQuery={{
              conditions: [
                {
                  key: "vmgroup",
                  op: Op.eq,
                  value: uuid?.startsWith("-2") ? "-2" : current?.groupName,
                },
                { key: "state", op: Op.ne, value: "Destroyed" },
                { key: "zoneUuid", op: Op.eq, value: current?.zoneUuid },
              ],
            }}
          />
        </TabPane>
        {/*若为默认分组或者第三层级分组，则不展示虚拟机分组Tab*/}
        {current?.groupName !== "default" &&
          current?.groupName?.split("/")?.length !== 3 && (
            <TabPane
              tab={intl.formatMessage({
                id: "virtual.directory",
                defaultMessage: "VM Group",
              })}
              key="virtual.directory"
            >
              <DirList treeData={treeData} refetch={treeRefetch} />
            </TabPane>
          )}
      </Tabs>
    </div>
  );
};

export default React.memo(DirDetail);

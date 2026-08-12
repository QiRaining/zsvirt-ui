import { useQuery, gql } from "@apollo/client";
import DirList from "@zstack/virtualization-resource/src/pages/directory/list";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import { Op } from "@zstack/zsphere-types";
import type { VMGroupDirectory } from "@zstack/zsphere-types/graphql";
import React, { useState, useEffect } from "react";

const getTreeList = (
  list: VMGroupDirectory[],
  key: string,
): VMGroupDirectory[] => {
  return list
    .filter((item) => {
      return item?.parentUuid === key;
    })
    .map((item: VMGroupDirectory) => {
      const children = getTreeList(list, item.key);
      if (children.length < 1) {
        return { ...item };
      }
      return { ...item, children };
    });
};

const vmDirectoryGroupList = gql`
  query vmDirectoryGroupList(
    $conditions: [Condition!]
    $type: DirectoryQueryType
  ) {
    vmDirectoryGroupList(conditions: $conditions, type: $type) {
      list {
        key
        title
        level
        name
        parentUuid
        groupName
        vmCount
        uuid
        createDate
        zoneUuid
      }
    }
  }
`;

interface IProps {
  current: any;
}

const DirGroupList: React.FC<IProps> = ({ current }) => {
  const [treeData, setTreeData] = useState([]);

  const { loading, data, refetch } = useQuery(vmDirectoryGroupList, {
    variables: {
      conditions: [
        {
          key: "zoneUuid",
          value: current?.uuid,
          op: Op.eq,
        },
      ],
    },
  });

  useEffect(() => {
    if (data) {
      const groupTreeData = data?.vmDirectoryGroupList?.list ?? [];
      const formatedTreeData = getTreeList(
        groupTreeData?.filter((t: any) => t.key !== "-1"),
        "-1",
      ) as any;
      setTreeData(formatedTreeData);
    }
  }, [data]);

  return (
    <AutoSkeleton name="zone-instance-group-detail" loading={loading}>
      {current ? (
        <DirList
          treeData={treeData}
          refetch={refetch}
          source={current}
          view="main"
        />
      ) : null}
    </AutoSkeleton>
  );
};

export default React.memo(DirGroupList);

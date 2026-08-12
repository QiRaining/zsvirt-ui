import { gql, useQuery } from "@apollo/client";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { useEffect } from "react";

const isDoubleManagementNode = gql`
  query isDoubleManagementNode {
    isDoubleManagementNode
  }
`;

export const useGetManageMentNodeInfo = () => {
  const { data } = useQuery(isDoubleManagementNode);
  // 分开订阅，避免订阅整个 store
  const setManagementNode = usePlatformStore(
    (state) => state.setManagementNode,
  );
  useEffect(() => {
    setManagementNode({
      isDoubleManagementNode: !!data?.isDoubleManagementNode,
    });
  }, [data]);
};

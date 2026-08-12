import { gql, useLazyQuery } from "@apollo/client";
import {
  Op,
  VmQueryType,
  L2NetworkQueryType,
  L3NetworkQueryType,
  ImageQueryType,
  ZsvRoleQueryType,
  UserGroupQueryType,
  AccountQueryType,
} from "@zstack/zsphere-types";
import { useMemo } from "react";

import { PREDEFINED_OTHER_UUID } from "../role/utils";

const queryL3NetworkList = gql`
  query queryL3NetworkList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $type: L3NetworkQueryType
    $extraConditions: [Condition!]
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    l3NetworkList(
      conditions: $conditions
      start: $start
      limit: $limit
      type: $type
      extraConditions: $extraConditions
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      list {
        name
        uuid
      }
    }
  }
`;

const queryL2NetworkList = gql`
  query queryL2Network(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $type: L2NetworkQueryType
    $extraConditions: [Condition!]
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    l2NetworkList(
      conditions: $conditions
      start: $start
      limit: $limit
      type: $type
      extraConditions: $extraConditions
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      list {
        name
        uuid
      }
    }
  }
`;

const queryTemplatedVmInstanceList = gql`
  query templatedVmInstanceList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $type: VmQueryType
    $extraConditions: [Condition!] = []
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    vmInstanceList(
      start: $start
      limit: $limit
      replyWithCount: true
      conditions: $conditions
      type: $type
      extraConditions: $extraConditions
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      list {
        uuid
        name
      }
    }
  }
`;

const queryVmInstanceList = gql`
  query vmInstanceList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $type: VmQueryType
    $extraConditions: [Condition!] = []
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    vmInstanceList(
      start: $start
      limit: $limit
      replyWithCount: true
      conditions: $conditions
      type: $type
      extraConditions: $extraConditions
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      list {
        name
        uuid
      }
    }
  }
`;

const queryAccountList = gql`
  query accountList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $start: Int
    $limit: Int
    $type: AccountQueryType
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    accountList(
      conditions: $conditions
      extraConditions: $extraConditions
      start: $start
      limit: $limit
      type: $type
      sortBy: $sortBy
      sortDirection: $sortDirection
      replyWithCount: true
    ) {
      list {
        uuid
        name
      }
      total
    }
  }
`;

const queryUserGroupList = gql`
  query userGroupList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $type: UserGroupQueryType
    $start: Int
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    userGroupList(
      conditions: $conditions
      extraConditions: $extraConditions
      type: $type
      start: $start
      limit: $limit
      sortBy: $sortBy
      sortDirection: $sortDirection
      replyWithCount: true
    ) {
      list {
        uuid
        name
      }
      total
    }
  }
`;

const queryZsvRoleList = gql`
  query zsvRoleList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $start: Int
    $type: ZsvRoleQueryType
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    zsvRoleList(
      conditions: $conditions
      extraConditions: $extraConditions
      start: $start
      limit: $limit
      type: $type
      sortBy: $sortBy
      sortDirection: $sortDirection
      replyWithCount: true
    ) {
      list {
        uuid
        name
      }
      total
    }
  }
`;

const queryImageList = gql`
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
        name
        uuid
      }
    }
  }
`;

const useQuerySharedResource = ({
  uuid,
  type = "account",
}: {
  uuid: string;
  type: "account" | "userGroup";
}) => {
  const [
    _queryVmInstanceList,
    { data: vmInstanceData, loading: vmInstanceLoading },
  ] = useLazyQuery(queryVmInstanceList, {
    variables: {
      type: VmQueryType.ZSV_SHARED_RESOURCE,
      extraConditions:
        type === "account"
          ? [{ key: "accountUuid", op: Op.eq, value: uuid }]
          : [{ key: "groupUuid", op: Op.eq, value: uuid }],
      limit: 100,
    },
    fetchPolicy: "no-cache",
  });

  const [
    _queryTemplatedVmInstanceList,
    { data: templatedVmInstanceData, loading: templatedVmInstanceLoading },
  ] = useLazyQuery(queryTemplatedVmInstanceList, {
    variables: {
      type: VmQueryType.Get_VMINSTANCETEMPLATE_BY_SHARED_RESOURCE,
      extraConditions:
        type === "account"
          ? [{ key: "accountUuid", op: Op.eq, value: uuid }]
          : [{ key: "groupUuid", op: Op.eq, value: uuid }],
      limit: 100,
    },
    fetchPolicy: "no-cache",
  });

  const [_queryImageList, { data: imageData, loading: imageLoading }] =
    useLazyQuery(queryImageList, {
      variables: {
        type: ImageQueryType.ZSV_SHARED_RESOURCE,
        extraConditions:
          type === "account"
            ? [{ key: "accountUuid", op: Op.eq, value: uuid }]
            : [{ key: "groupUuid", op: Op.eq, value: uuid }],
      },
      fetchPolicy: "no-cache",
    });

  const [
    _queryL2NetworkList,
    { data: L2NetworkData, loading: l2NetworkLoading },
  ] = useLazyQuery(queryL2NetworkList, {
    variables: {
      type: L2NetworkQueryType.ZSV_SHARED_RESOURCE,
      extraConditions:
        type === "account"
          ? [{ key: "accountUuid", op: Op.eq, value: uuid }]
          : [{ key: "groupUuid", op: Op.eq, value: uuid }],
    },
  });

  const [
    _queryL3NetworkList,
    { data: L3NetworkData, loading: l3NetworkLoading },
  ] = useLazyQuery(queryL3NetworkList, {
    variables: {
      type: L3NetworkQueryType.ZSV_Shared_Resource_Flat_Network,
      extraConditions:
        type === "account"
          ? [{ key: "accountUuid", op: Op.eq, value: uuid }]
          : [{ key: "groupUuid", op: Op.eq, value: uuid }],
    },
    fetchPolicy: "no-cache",
  });

  const [_queryZsvRoleList, { data: zsvRoleData, loading: zsvRoleLoading }] =
    useLazyQuery(queryZsvRoleList, {
      variables: {
        type:
          type === "account"
            ? ZsvRoleQueryType.GET_ROLE_BY_ACCOUNT
            : ZsvRoleQueryType.GET_ROLE_BY_USERGROUP,
        conditions: [
          {
            key: "uuid",
            op: Op.ne,
            value: PREDEFINED_OTHER_UUID,
          },
        ],
        extraConditions:
          type === "account"
            ? [{ key: "accountUuid", op: Op.eq, value: uuid }]
            : [{ key: "userGroupUuid", op: Op.eq, value: uuid }],
      },
      fetchPolicy: "no-cache",
    });

  const [
    _queryUserGroupList,
    { data: userGroupData, loading: userGroupLoading },
  ] = useLazyQuery(queryUserGroupList, {
    variables: {
      type: UserGroupQueryType.GET_USERGROUP_BY_ACCOUNT,
      extraConditions: [{ key: "accountUuid", op: Op.eq, value: uuid }],
    },
    fetchPolicy: "no-cache",
  });

  const [_queryAccountList, { data: accountData, loading: accountLoading }] =
    useLazyQuery(queryAccountList, {
      variables: {
        type: AccountQueryType.GET_ACCOUNT_BY_USERGROUP,
        conditions: [
          {
            key: "name",
            op: Op.ne,
            value: "admin",
          },
        ],
        extraConditions: [{ key: "userGroupUuid", op: Op.eq, value: uuid }],
      },
      fetchPolicy: "no-cache",
    });

  const result = useMemo(() => {
    if (
      vmInstanceLoading ||
      templatedVmInstanceLoading ||
      imageLoading ||
      l2NetworkLoading ||
      l3NetworkLoading ||
      zsvRoleLoading ||
      userGroupLoading ||
      accountLoading
    ) {
      return {
        vmInstanceList: [],
        templatedVmInstanceList: [],
        imageList: [],
        l2NetworkList: [],
        l3NetworkList: [],
        zsvRoleList: [],
        userGroupList: [],
        accountList: [],
      };
    }

    return {
      vmInstanceList: vmInstanceData?.vmInstanceList?.list || [],
      templatedVmInstanceList:
        templatedVmInstanceData?.vmInstanceList?.list || [],
      imageList: imageData?.imageList?.list || [],
      l2NetworkList: L2NetworkData?.l2NetworkList?.list || [],
      l3NetworkList: L3NetworkData?.l3NetworkList?.list || [],
      zsvRoleList: zsvRoleData?.zsvRoleList?.list || [],
      userGroupList: userGroupData?.userGroupList?.list || [],
      accountList: accountData?.accountList?.list || [],
    };
  }, [
    vmInstanceData,
    templatedVmInstanceData,
    imageData,
    L2NetworkData,
    L3NetworkData,
    vmInstanceLoading,
    templatedVmInstanceLoading,
    imageLoading,
    l2NetworkLoading,
    l3NetworkLoading,
    zsvRoleData,
    zsvRoleLoading,
    userGroupData,
    userGroupLoading,
    accountData,
    accountLoading,
  ]);

  return {
    querySharedResource: () => {
      _queryVmInstanceList();
      _queryTemplatedVmInstanceList();
      _queryImageList();
      _queryL2NetworkList();
      _queryL3NetworkList();
      _queryZsvRoleList();
      _queryUserGroupList();
      _queryAccountList();
    },
    loading:
      vmInstanceLoading ||
      templatedVmInstanceLoading ||
      imageLoading ||
      l2NetworkLoading ||
      l3NetworkLoading ||
      zsvRoleLoading ||
      userGroupLoading ||
      accountLoading,
    result,
  };
};

export { useQuerySharedResource };

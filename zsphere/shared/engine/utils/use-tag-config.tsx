import { gql, useLazyQuery } from "@apollo/client";
import {
  Condition,
  Identity,
  UIExtendedLicenseType,
  Op,
} from "@zstack/zsphere-types";
import { NoTagResourceResp, TagQueryResp } from "@zstack/zsphere-types/graphql";
import { useCallback, useState, useMemo, useRef, useEffect } from "react";
import { useIntl } from "react-intl";

import { IQueryProps } from "./index";
import { ICandidate } from "./types";

const GET_NO_TAG_RESOURCE = gql`
  query getNoTagResource(
    $resourceType: String
    $resourceConditions: [Condition!]
  ) {
    noTagResource(
      resourceType: $resourceType
      resourceConditions: $resourceConditions
    ) {
      resourceType
      count
    }
  }
`;

const QUERY_TAG_LIST_BY_RESOURCE = gql`
  query queryTagListByResource(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $resourceType: String
    $resourceConditions: [Condition!]
  ) {
    tagListByResource(
      conditions: $conditions
      start: $start
      limit: $limit
      resourceType: $resourceType
      resourceConditions: $resourceConditions
    ) {
      total
      list {
        uuid
        name
        color
        type
        createDate
        value
        lastOpDate
        description
        owner {
          uuid
          type
          name
        }
        resourceCount
      }
    }
  }
`;

type OwnerType = "admin" | "tentant";

interface SearchState {
  searchValue: string;
  currentPage: number;
  options: ICandidate["options"];
  hasMore: boolean;
  total: number;
}

const INITIAL_STATE: SearchState = {
  searchValue: "",
  currentPage: 0,
  options: [],
  hasMore: true,
  total: 0,
};

const ITEMS_PER_PAGE = 10;

function useGetTagConfig(queryProps?: IQueryProps, ownerType?: OwnerType) {
  const intl = useIntl();
  const [state, setState] = useState<SearchState>(INITIAL_STATE);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [getTagList, { loading: tagLoading }] = useLazyQuery<{
    tagListByResource: TagQueryResp;
  }>(QUERY_TAG_LIST_BY_RESOURCE, {
    fetchPolicy: "network-only",
    onCompleted: handleTagListCompleted,
    onError: (error) => {
      console.error("Tag list query error:", error);
    },
  });

  const [getNoTagResource, { loading: noTagLoading }] = useLazyQuery<{
    noTagResource: NoTagResourceResp;
  }>(GET_NO_TAG_RESOURCE, {
    fetchPolicy: "network-only",
    onCompleted: handleNoTagCompleted,
    onError: (error) => {
      console.error("No tag resource query error:", error);
    },
  });

  function handleTagListCompleted(data: { tagListByResource: TagQueryResp }) {
    const list = data.tagListByResource?.list || [];
    const total = data.tagListByResource?.total || 0;

    const newOptions = list.map((item) => ({
      key: item.uuid,
      label: item.name || item.uuid,
      extra: {
        color: item.color,
        count: item.resourceCount,
        ownerType,
      },
    }));

    setState((prevState) => {
      const isFirstPage = prevState.currentPage === 1;
      const updatedOptions = isFirstPage
        ? newOptions
        : [
            ...(prevState.options || []).filter((opt) => opt.key !== "none"),
            ...newOptions,
          ];

      return {
        ...prevState,
        options: updatedOptions,
        hasMore: updatedOptions.length < total,
        total,
      };
    });

    if (queryProps) {
      getNoTagResource({
        variables: {
          resourceType: queryProps.resourceType,
          resourceConditions: queryProps.defaultQuery?.conditions,
        },
      });
    }
  }

  function handleNoTagCompleted(data: { noTagResource: NoTagResourceResp }) {
    const count = data.noTagResource?.count || 0;

    if (count > 0) {
      const noTagOption = {
        key: "none",
        label: intl.formatMessage({
          id: "not.bound",
          defaultMessage: "Not attached",
        }),
        extra: {
          count,
          ownerType,
        },
      };

      setState((prevState) => {
        // 检查是否应该显示"未绑定"选项
        const shouldShow =
          !prevState.searchValue ||
          noTagOption.label
            .toLowerCase()
            .includes(prevState.searchValue.toLowerCase());

        if (!shouldShow) {
          return prevState;
        }

        // 移除已存在的"未绑定"选项，然后添加到开头
        const filteredOptions = (prevState.options || []).filter(
          (opt) => opt.key !== "none",
        );

        return {
          ...prevState,
          options: [noTagOption, ...filteredOptions],
        };
      });
    }
  }

  const resetSearch = useCallback(() => {
    setState(INITIAL_STATE);
    // 取消正在进行的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const onSearch = useCallback(
    (value: string = "", page: number = 1) => {
      // 如果是新搜索，重置状态
      if (page === 1) {
        setState({
          ...INITIAL_STATE,
          searchValue: value,
          currentPage: page,
        });
      } else {
        setState((prev) => ({
          ...prev,
          currentPage: page,
        }));
      }

      // 取消之前的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const start = (page - 1) * ITEMS_PER_PAGE;
      const conditions: Condition[] = [];

      // 添加搜索条件
      if (value) {
        conditions.push({
          key: "name",
          value,
          op: Op.like,
        });
      }

      // 添加所有者类型条件
      if (ownerType) {
        conditions.push({
          key: "owner",
          values: [ownerType === "admin" ? "admin" : "other"],
          op: Op.in,
        });
      }

      if (queryProps) {
        const { defaultQuery, resourceType } = queryProps;
        const resourceConditions = defaultQuery?.conditions;

        // 请求标签列表
        getTagList({
          variables: {
            resourceType,
            conditions,
            resourceConditions,
            sortBy: "resourceCount",
            start,
            limit: ITEMS_PER_PAGE,
          },
        });
      } else {
        // 没有queryProps时的处理
        getTagList({
          variables: {
            conditions,
            sortBy: "resourceCount",
            start,
            limit: ITEMS_PER_PAGE,
          },
        });
      }
    },
    [queryProps, ownerType, getTagList, getNoTagResource, intl],
  );

  // 清理函数
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 当 ownerType 变化时重置搜索
  useEffect(() => {
    resetSearch();
  }, [ownerType, resetSearch]);

  const label = useMemo(() => {
    if (!ownerType) {
      return intl.formatMessage({ id: "tag", defaultMessage: "Tag" });
    }

    switch (ownerType) {
      case "admin":
        return intl.formatMessage({
          id: "admin.tag",
          defaultMessage: "Admin Tag",
        });
      case "tentant":
        return intl.formatMessage({
          id: "tentant.tag",
          defaultMessage: "User Tag",
        });
      default:
        return intl.formatMessage({ id: "tag", defaultMessage: "Tag" });
    }
  }, [intl, ownerType]);

  const candidate: ICandidate = useMemo(
    () => ({
      label,
      key: ownerType || "tag",
      type: "tag",
      searchKey: "__tagUuid__",
      loading: tagLoading || noTagLoading,
      options: state.options,
      onSearch,
    }),
    [label, ownerType, tagLoading, noTagLoading, state.options, onSearch],
  );

  return {
    candidate,
    resetSearch,
  };
}

export const useTagConfig = (queryProps?: IQueryProps) => {
  const { currentUser, license } = queryProps || {};

  const showIdentity = useMemo(() => {
    const isAdmin = [
      Identity.PlatformAdmin,
      Identity.IAM2SystemAdmin,
      Identity.Admin,
      Identity.PlatformUser,
    ].includes(currentUser?.currentIdentity);

    const isValidLicense = ![
      UIExtendedLicenseType.Basic,
      UIExtendedLicenseType.Standard,
      UIExtendedLicenseType.TrialExt,
    ].includes(license?.main);

    return isAdmin && isValidLicense;
  }, [currentUser, license]);

  // 始终创建所有候选项，但只返回需要的
  const adminConfig = useGetTagConfig(queryProps, "admin");
  const tenantConfig = useGetTagConfig(queryProps, "tentant");
  const defaultConfig = useGetTagConfig(queryProps);

  const candidates: ICandidate[] = useMemo(() => {
    if (showIdentity) {
      return [adminConfig.candidate, tenantConfig.candidate];
    }
    return [defaultConfig.candidate];
  }, [
    showIdentity,
    adminConfig.candidate,
    tenantConfig.candidate,
    defaultConfig.candidate,
  ]);

  return {
    candidates,
  };
};

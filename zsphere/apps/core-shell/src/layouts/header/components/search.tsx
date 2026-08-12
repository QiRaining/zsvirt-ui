import { useLazyQuery } from "@apollo/client";
import { Spin, Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Alert, useAuth, useRegisterCommand } from "@zstack/zsphere-components";
import { AuthTabs } from "@zstack/zsphere-design-biz";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import type { IMenu } from "@zstack/zsphere-types";
import type { SearchResource } from "@zstack/zsphere-types/graphql";
import { escapeRegExp } from "@zstack/zsphere-utils";
import { useClickAway, useDebounce } from "ahooks";
import { Input, List } from "antd";
import cls from "classnames";
import qs from "qs";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";

import globalConfigSvg from "../../../assets/images/global-search.svg?inline";
import { searchResourceList } from "../../../gql/search.gql";
import { useConfigAuth } from "../../../utils/use-config-auth";
import useRecordSearchHistory from "../hooks/use-record-search-history";
// import useSearchDoc from "../hooks/use-search-doc";
import useSearchMenu from "../hooks/use-search-menu";

import style from "../style.module.less";

interface IProps {
  position?: "center" | "side";
}

enum ITabs {
  all = "all",
  menu = "menu",
  resource = "resource",
  doc = "doc",
}

interface ISearchHistoryTabPane {
  setKeyword: (v: string) => void;
}

interface IResource {
  resourceName: string;
  resourceType: string;
  uuid: string;
  [key: string]: string;
}

const SEARCH_THUMBNAIL_COUNT = 3;
const SEARCH_TYPE = "header";
const SEARCH_MAX_LENGTH = 32;

const EmptyNoResult: React.FC = () => {
  const intl = useIntl();

  return (
    <div className={style.empty}>
      <div className={cls(style.circle, style.circleEmpty)}>
        <Icon type="inbox" className={style.circleIcon} />
      </div>
      <p>
        {intl.formatMessage({
          id: "header.search.no.search.result",
          defaultMessage: "No results found",
        })}
      </p>
    </div>
  );
};

const EmptyInit: React.FC = () => {
  const intl = useIntl();

  return (
    <div className={style.empty}>
      <div className={style.circle}>
        <img src={globalConfigSvg} alt="" />
      </div>
      <p>
        {intl.formatMessage({
          id: "header.search.empty.placeholder",
          defaultMessage: "Search by keyword",
        })}
      </p>
    </div>
  );
};

const SearchHistoryTabPane: React.FC<ISearchHistoryTabPane> = ({
  setKeyword,
}) => {
  const intl = useIntl();
  const { getSearchHistory, clearSearchHistory } = useRecordSearchHistory();

  const onTagClick = (val: string) => {
    setKeyword(val);
  };

  if (getSearchHistory(SEARCH_TYPE).length === 0) {
    return <EmptyInit />;
  }

  return (
    <div className={style.historyContainer}>
      <div className={style.historyTitleContainer}>
        <span>
          {intl.formatMessage({
            id: "header.search.recent.search",
            defaultMessage: "Recent search",
          })}
        </span>
        <span className={style.historyTrashIcon}>
          <Icon type="trash" onClick={() => clearSearchHistory(SEARCH_TYPE)} />
        </span>
      </div>
      <div className={style.historyContentContainer}>
        {getSearchHistory(SEARCH_TYPE).map((e) => (
          <div
            key={e}
            className={style.historyTag}
            onClick={() => onTagClick(e)}
          >
            {e}
          </div>
        ))}
      </div>
    </div>
  );
};

const Search: React.FC<IProps> = ({ position = "center" }) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();

  const findFirstHasAuthPathname = (menuItem: IMenu): string | undefined => {
    if (
      menuItem?.path &&
      hasAuth({ resource: menuItem.key, authKey: "list", type: "view" })
    ) {
      return menuItem?.path;
    }
    if (menuItem?.children) {
      for (const _item of menuItem.children ?? []) {
        const path = findFirstHasAuthPathname(_item);
        if (path) {
          return path;
        }
      }
    }
  };

  const { hasConfig } = useConfigAuth();

  // 分开订阅状态字段，避免订阅整个 store
  const currentZone = usePlatformStore((state) => state.currentZone);
  const openPlatformStatus = usePlatformStore(
    (state) => state.openPlatformStatus,
  );
  const currentZMigrate = usePlatformStore((state) => state.currentZMigrate);
  const { setSearchHistory } = useRecordSearchHistory();
  const { getCurrentBreadList, searchMenu, getCurrentOrder } = useSearchMenu();
  // const { search: searchDocRemote } = useSearchDoc();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  const [tabKey, setTabKey] = useState<ITabs>(ITabs.all);
  const [focus, setFocus] = useState<boolean>(false);
  const [word, setWord] = useState<string>("");
  const [resourceFullList, setResourceFullList] = useState<SearchResource[]>(
    [],
  );
  const [resourceList, setResourceList] = useState<SearchResource[]>([]);
  const [resourceCount, setResourceCount] = useState<number>(0);
  const [menuList, setMenuList] = useState<any[]>([]);
  const [menuCount, setMenuCount] = useState<number>(0);
  const [docList, setDocList] = useState<any[]>([]);
  const [docCount, setDocCount] = useState<number>(0);
  // const [docLoading, setDocLoading] = useState<boolean>(false);
  const [unLockWord, setUnLockWord] = useState<string>("");
  const lock = useRef(false); // 解决中文输入法的bug
  const inputRef = useRef<any>(null);
  const [selectedIndex, setSelectedIndex] = useState<Record<ITabs, number>>({
    [ITabs.all]: -1,
    [ITabs.menu]: -1,
    [ITabs.resource]: -1,
    [ITabs.doc]: -1,
  });

  const debouncedWord = useDebounce(word, { wait: 500 });
  const isWordDebouncing = !!word && debouncedWord !== word;

  const [searchResource, { loading: resourceLoading }] = useLazyQuery(
    searchResourceList,
    { fetchPolicy: "no-cache" },
  );

  const isLoading = resourceLoading || isWordDebouncing;

  // 大屏管理员本质是平台管理员，对于资源无隔离，所以大屏管理员在调用全局搜索接口时是全量数据，
  // 因此需要额外通过 hasAuth 来做显示拦截
  // ZSTAC-47951
  // 提取 hasAuth 函数到 useEffect 外部，避免 hook 依赖问题
  const hasAuthFn = hasAuth;

  useEffect(() => {
    const list = resourceFullList.filter((item) => {
      // 迁移网关虚拟机使用迁移服务的菜单权限
      const resourceType =
        item?.resourceType === "GatewayVmInstanceVO"
          ? "MigrationServiceVO"
          : item?.resourceType;

      const labelList = [...(getCurrentBreadList(resourceType) || [])];
      const key = labelList[labelList.length - 1]?.key;
      return key && hasAuthFn({ resource: key, authKey: "list", type: "view" });
    });
    setResourceList(list);
    setResourceCount(list.length);
  }, [resourceFullList, hasAuthFn]);

  // const searchDoc = async (value: string) => {
  //   setDocLoading(true);
  //   const respList = await searchDocRemote(value);
  //   setDocList(respList);
  //   setDocCount(respList.length);
  //   setDocLoading(false);
  // };

  const currentEnv = usePlatformStore((state) => state.currentEnv);
  const zopsSupportable = usePlatformStore((state) => state.zopsSupportable);

  useClickAway(() => {
    inputRef.current?.blur();
    setFocus(false);
  }, [searchRef]);

  useEffect(() => {
    if (debouncedWord) {
      search();
    }
  }, [debouncedWord]);

  useEffect(() => {
    if (!word) {
      clear();
    }
  }, [word]);

  useEffect(() => {
    clear();
  }, [currentZone?.uuid, intl]);

  const onWordChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.CompositionEvent<HTMLInputElement>,
  ) => {
    setFocus(true);
    if (e.type === "compositionstart") {
      lock.current = true;
      return;
    }

    const { value = "" } = (e?.target as any) ?? {};
    setUnLockWord(value);

    if (e.type === "compositionend") {
      lock.current = false;
    }

    if (!lock.current) {
      const { value: wordValue = "" } = (e?.target as any) ?? {};
      setWord(wordValue);
    }
  };

  const search = () => {
    if (!debouncedWord) {
      return;
    }
    setFocus(true);
    resetList();
    const res = searchMenu(debouncedWord)?.filter((itemList) => {
      const item = itemList?.[itemList.length - 1];

      if (item.key === "inspection") {
        return zopsSupportable;
      }

      if (item.parentKey === "open.platform") {
        // 隐藏菜单管理，该功能通过 openPlatformStatus 判断
        return openPlatformStatus;
      }

      // 未安装迁移服务时隐藏迁移资源/迁移任务菜单 ZSV-12014
      if (
        [
          "virtualization.zmigrate.resource",
          "virtualization.zmigrate.task",
        ].includes(item.key) &&
        !currentZMigrate?.installed
      ) {
        return false;
      }

      if (
        [
          "virtualization.cluster.host",
          "virtualization.network",
          "virtualization.data.storage",
          "virtualization.template.vm",
          "virtualization.bare.metal",
        ].includes(item.parentKey)
      ) {
        return false;
      }
      return (
        hasAuth({ resource: item.key, authKey: "list", type: "view" }) &&
        hasConfig(item?.path ?? "")
      );
    });
    setMenuList(res);
    setMenuCount(
      res?.filter((itemList) => {
        const item = itemList?.[itemList.length - 1];
        return (
          hasAuth({ resource: item?.key, authKey: "list", type: "view" }) &&
          hasConfig(item?.path ?? "")
        );
      })?.length || 0,
    );
    searchResource({
      variables: {
        keyword: debouncedWord?.slice(0, SEARCH_MAX_LENGTH),
        zoneUuid: "",
      },
    }).then((result) => {
      if (!word) {
        return;
      }
      const resourceList = result?.data?.searchResource?.list ?? [];
      const sortedResourceList = resourceList
        .filter((item: IResource) => !!item)
        .sort(
          (lhs: IResource, rhs: IResource) =>
            getCurrentOrder(lhs.resourceType) -
            getCurrentOrder(rhs.resourceType),
        );
      setResourceFullList(sortedResourceList);
    });
    // if (hasAuth({ resource: "common", authKey: "help.center", type: "block" }))
    //   searchDoc(debouncedWord);
  };

  const resetList = () => {
    setResourceList([]);
    setResourceCount(0);
    setMenuList([]);
    setMenuCount(0);
    setDocList([]);
    setDocCount(0);
    setSelectedIndex({
      [ITabs.all]: -1,
      [ITabs.menu]: -1,
      [ITabs.resource]: -1,
      [ITabs.doc]: -1,
    });
  };

  const onHistoryWordClick = (value: string) => {
    setUnLockWord(value);
    setWord(value);
  };

  const clear = () => {
    setUnLockWord("");
    setWord("");
    resetList();
    setTabKey(ITabs.all);
  };

  const jumpTo = (url: string, searchStr: string) => {
    if (!url) {
      return;
    }
    navigate({
      pathname: url,
      search: `?${searchStr}`,
    });
    setSearchHistory(debouncedWord, SEARCH_TYPE);
  };

  // const openDoc = (path: string) => {
  //   if (!path) return;
  //   setSearchHistory(debouncedWord, SEARCH_TYPE);
  //   setDocReaderPath(path);
  // };

  const highlightExactSearchWord = (label: string = "", value: string) => {
    if (!value) {
      return label;
    }
    const labelReg = new RegExp(escapeRegExp(value), "gi");
    const labelsActualValues = label.match(labelReg);
    return (
      <span>
        {label
          .split(labelReg)
          .reduce((prev: any[], current: string, i: number) => {
            if (!i) {
              return [current];
            }
            return prev.concat(
              <mark key={i}>
                {labelsActualValues?.[i - 1] ??
                  labelsActualValues?.[0] ??
                  value}
              </mark>,
              current,
            );
          }, [])}
      </span>
    );
  };

  const renderTabName = (type: ITabs, count: number = 0, showCount = false) => {
    let name = "";
    switch (type) {
      case ITabs.all:
        name = intl.formatMessage({
          id: "header.search.tabs.all",
          defaultMessage: "All",
        });
        break;
      case ITabs.menu:
        name = intl.formatMessage({
          id: "header.search.tabs.menu",
          defaultMessage: "Features",
        });
        break;
      case ITabs.resource:
        name = intl.formatMessage({
          id: "header.search.tabs.resource",
          defaultMessage: "Resources",
        });
        break;
      case ITabs.doc:
        name = intl.formatMessage({
          id: "header.search.tabs.doc",
          defaultMessage: "Documentation",
        });
        break;
      default:
        name = "";
        break;
    }
    return `${name}${showCount ? ` (${count})` : ""}`;
  };

  const renderAllList = (
    menuListParam: any[] = [],
    resourceListParam: SearchResource[] = [],
    _docListParam: any[],
    selectedItemIndex: number,
    handleMouseMove: (currentIndex: number) => () => void,
  ) => {
    const showNewStyle = currentEnv === "virtualization";
    const menuListLength = Math.min(menuListParam.length, 3);
    const menuListSelectedItemIndex =
      selectedItemIndex < menuListLength ? selectedItemIndex : -1;
    const resourceListSelectedItemIndex = selectedItemIndex - menuListLength;
    const handleResourceMouseMove = (currentIndex: number) =>
      handleMouseMove(currentIndex + menuListLength);
    return (
      <>
        {menuListParam.length > 0 && menuCount > 0 && (
          <div className={style.allItemsContainer}>
            <div
              className={cls(style.allItemsTitle, {
                [style.allItemsTitleMark]: showNewStyle,
              })}
            >
              {renderTabName(ITabs.menu, menuCount, !!word)}
              {menuListParam.length > SEARCH_THUMBNAIL_COUNT && (
                <a
                  className={style.allItemsMore}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setTabKey(ITabs.menu);
                  }}
                >
                  {intl.formatMessage({
                    id: "header.search.list.more",
                    defaultMessage: "More",
                  })}
                </a>
              )}
            </div>
            {renderMenuList(
              menuListParam.slice(0, 3),
              menuListSelectedItemIndex,
              handleMouseMove,
              handleListMouseLeave(ITabs.all),
              showNewStyle,
            )}
          </div>
        )}
        {resourceListParam.length > 0 && (
          <div className={style.allItemsContainer}>
            <div
              className={cls(style.allItemsTitle, {
                [style.allItemsTitleMark]: showNewStyle,
              })}
            >
              {renderTabName(ITabs.resource, resourceCount, !!word)}
              {resourceListParam.length > SEARCH_THUMBNAIL_COUNT && (
                <a
                  className={style.allItemsMore}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setTabKey(ITabs.resource);
                  }}
                >
                  {intl.formatMessage({
                    id: "header.search.list.more",
                    defaultMessage: "More",
                  })}
                </a>
              )}
            </div>
            {renderResourceList(
              resourceListParam.slice(0, 3),
              resourceListSelectedItemIndex,
              handleResourceMouseMove,
              handleListMouseLeave(ITabs.all),
              false,
              true,
            )}
          </div>
        )}
        {/* {docListParam.length > 0 && (
          <Auth resource="common" type="block" authKey="help.center">
            <div className={style.allItemsContainer}>
              <div
                className={cls(style.allItemsTitle, {
                  [style.allItemsTitleMark]: showNewStyle,
                })}
              >
                {renderTabName(ITabs.doc, docCount, !!word)}
              </div>
              {renderDocList(docListParam.slice(0, 3), false)}
              {docListParam.length > SEARCH_THUMBNAIL_COUNT && (
                <div
                  className={cls(style.allItemsMore, {
                    [style.allItemsMoreUnderMark]: showNewStyle,
                  })}
                  onClick={() => setTabKey(ITabs.doc)}
                >
                  <a>
                    {intl.formatMessage({
                      id: "header.search.list.more",
                      defaultMessage: "查看更多",
                    })}
                    {showNewStyle && (
                      <Icon className={style.moreIcon} type="arrow-right" />
                    )}
                  </a>
                </div>
              )}
            </div>
          </Auth>
        )} */}
      </>
    );
  };

  const handleResourceItemClick = (item?: SearchResource) => {
    if (!item) {
      return;
    }

    // 迁移网关虚拟机跳转到迁移服务-迁移概览 tab（无 detail 子页面）
    if (item.resourceType === "GatewayVmInstanceVO") {
      inputRef.current?.blur();
      setFocus(false);
      jumpTo(
        "/virtualization-monitoring-om/migration-service",
        qs.stringify({ tab: "overview" }),
      );
      return;
    }

    const labelList = [...(getCurrentBreadList(item.resourceType) || [])];
    const urlSearch = qs.parse(window.location.search, {
      ignoreQueryPrefix: true,
    });
    const labelSearch = qs.parse(
      /[^?=&]+(.+)?$/g?.exec(
        labelList[labelList.length - 1]?.path ?? "",
      )?.[1] ?? "",
      { ignoreQueryPrefix: true },
    );
    inputRef.current?.blur();
    setFocus(false);
    jumpTo(
      `${labelList[labelList.length - 1]?.path?.replace(/\?.+$/, "")}/detail`,
      qs.stringify({
        ...urlSearch,
        ...labelSearch,
        uuid: item.uuid,
      }),
    );
  };

  const renderResourceList = (
    resourceListParam: SearchResource[],
    selectedItemIndex: number,
    handleMouseMove: (currentIndex: number) => () => void,
    handleMouseLeave: () => void,
    _showMore: boolean = true,
    showNewStyle: boolean = false,
  ) => {
    return (
      <div onMouseLeave={handleMouseLeave}>
        <List
          dataSource={resourceListParam}
          renderItem={(item, index) => {
            // 迁移网关虚拟机使用迁移服务的面包屑
            const breadResourceType =
              item.resourceType === "GatewayVmInstanceVO"
                ? "MigrationServiceVO"
                : item.resourceType;
            const labelList = [
              ...getCurrentBreadList(breadResourceType),
            ].reverse();
            const labelName = labelList[0]?.name;
            const icon = labelList.find((label) => label.iconKey)?.iconKey;
            let resourceName = item.resourceName;
            if (
              intl.locale === "zh-CN" &&
              ["AlarmVO", "EventSubscriptionVO"].includes(
                item.resourceType as string,
              )
            ) {
              resourceName = item.resourceZhName;
            }
            return (
              <div
                key={item.uuid}
                className={cls(style.searchItem, {
                  [style.searchItemUnderMark]: showNewStyle,
                  [style.searchItemSelected]: selectedItemIndex === index,
                })}
                onClick={(e) => {
                  e.stopPropagation();
                  handleResourceItemClick(item);
                }}
                onMouseMove={handleMouseMove(index)}
              >
                <div className={style.searchItemIcon}>
                  <Icon type={icon} />
                </div>
                <div className={style.searchItemName}>
                  <Text>
                    {highlightExactSearchWord(resourceName, debouncedWord)}
                  </Text>
                </div>
                <div className={style.searchItemBread}>{labelName}</div>
              </div>
            );
          }}
        />
      </div>
    );
  };

  const handleMenuItemClick = (items?: IMenu[]) => {
    if (!items?.length) {
      return;
    }
    const item = items[items.length - 1];
    const path = findFirstHasAuthPathname(item);
    if (path) {
      inputRef.current?.blur();
      setFocus(false);
      setSearchHistory(debouncedWord, SEARCH_TYPE);
      navigate(path);
    }
  };

  const renderItem = (
    item: IMenu,
    _labelList: any[],
    showNewStyle: boolean,
    isSelected: boolean,
    onMouseMove: React.MouseEventHandler<HTMLAnchorElement>,
  ) => {
    if (hasAuth({ resource: item.key, authKey: "list", type: "view" })) {
      if (item?.source === "system") {
        return (
          <a
            className={cls(style.searchItem, {
              [style.searchItemUnderMark]: showNewStyle,
              [style.searchItemSelected]: isSelected,
            })}
            onClick={(e) => {
              e.stopPropagation();
              handleMenuItemClick([item]);
            }}
            onMouseMove={onMouseMove}
          >
            <div className={style.searchItemIcon}>
              <Icon type={item.iconKey as any} />
            </div>
            <div className={style.searchItemName}>
              {highlightExactSearchWord(
                intl.formatMessage({
                  id: item.i18nKey,
                  defaultMessage: item.name,
                }),
                debouncedWord,
              )}
            </div>
          </a>
        );
      }
    }
    return null;
  };

  const renderMenuList = (
    menuListParam: any[],
    selectedItemIndex: number,
    handleMouseMove: (currentIndex: number) => () => void,
    handleMouseLeave: () => void,
    showNewStyle: boolean = false,
  ) => {
    return (
      <div onMouseLeave={handleMouseLeave}>
        {menuListParam.map((items, i) => {
          const labelList = [...items].slice(0, -1);
          const item = items[items.length - 1];
          if (item.key === "inspection" && !zopsSupportable) {
            return null;
          }

          const isSelected = i === selectedItemIndex;
          return (
            <React.Fragment key={item.key}>
              {renderItem(
                item,
                labelList,
                showNewStyle,
                isSelected,
                handleMouseMove(i),
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // const renderItemContent = (matches: any[], q: string) => {
  //   const splitOn = (str: string, ...indices: number[]) =>
  //     [0, ...indices].map((n, i, m) => str.slice(n, m[i + 1]));
  //   let exactFlag = false;
  //   const filteredMatches = matches.map((item) => {
  //     let splitIndex: number[] = [];
  //     const cusIndices: Array<Array<number>> = [[], []];
  //     item?.indices?.forEach((i: number[]) => {
  //       if (
  //         q.length === i[1] - i[0] + 1 &&
  //         q === item?.value?.slice(i[0], i[1] + 1)
  //       ) {
  //         cusIndices[0].push(i[0], i[1] + 1);
  //       } else {
  //         cusIndices[1].push(i[0], i[1] + 1);
  //       }
  //     });
  //     if (cusIndices[0].length) {
  //       splitIndex = cusIndices?.[0] ?? [];
  //       exactFlag = true;
  //     } else if (!exactFlag) {
  //       splitIndex = cusIndices?.[1] ?? [];
  //     }
  //     const splitStr = splitOn(item.value, ...splitIndex);
  //     return splitStr
  //       .reduce((prev: any[], current: string, i: number) => {
  //         if (i % 2 === 0) {
  //           return [...prev, current];
  //         }
  //         return [...prev, <mark key={i}>{current}</mark>];
  //       }, [])
  //       .concat(" ");
  //   });
  //   return (
  //     <Typography.Paragraph
  //       ellipsis={{
  //         rows: 2,
  //       }}
  //     >
  //       {/* {_.map(matches, 'value').join(',')} */}
  //       {filteredMatches}
  //     </Typography.Paragraph>
  //   );
  // };

  // const renderDocList = (docListParam: any[], showMore = true) => {
  //   const dataList = docListParam.slice(0, docLimit);
  //   return (
  //     <>
  //       <InfiniteScroll
  //         initialLoad={false}
  //         pageStart={0}
  //         loadMore={() => onLoadMore(ITabs.doc, docListParam?.length)}
  //         hasMore={dataList.length < docListParam.length}
  //         useWindow={false}
  //       >
  //         <List
  //           dataSource={dataList}
  //           renderItem={(item, i) => (
  //             <div
  //               className={style.searchDocItem}
  //               key={i}
  //               onClick={() => openDoc(item?.item?.path)}
  //             >
  //               <div className={style.searchItemTitle}>
  //                 <Text
  //                   ellipsis
  //                   value={highlightExactSearchWord(
  //                     item?.item?.article,
  //                     debouncedWord,
  //                   )}
  //                 />
  //               </div>
  //               <div className={style.searchItemContent}>
  //                 {renderItemContent(item?.matches ?? [], debouncedWord)}
  //               </div>
  //               <div className={style.searchItemTagContainer}>
  //                 {item?.item?.topic && (
  //                   <div className={style.searchItemTag}>
  //                     {item?.item?.topic}
  //                   </div>
  //                 )}
  //                 {item?.item?.chapter && (
  //                   <div className={style.searchItemTag}>
  //                     {item?.item?.chapter}
  //                   </div>
  //                 )}
  //               </div>
  //             </div>
  //           )}
  //         />
  //       </InfiniteScroll>
  //       {showMore && dataList.length < docListParam.length && (
  //         <div className={style.spinCenter}>
  //           <Spin />
  //         </div>
  //       )}
  //       {showMore &&
  //         !(dataList.length < docListParam.length) &&
  //         currentEnv !== "virtualization" && (
  //           <p className={style.searchNoMoreDataP}>
  //             {intl.formatMessage({
  //               id: "globalSearch.theEnd",
  //               defaultMessage: "以上是全部内容",
  //             })}
  //           </p>
  //         )}
  //     </>
  //   );
  // };

  const upToMaxLength = useMemo(() => {
    if (debouncedWord?.length > SEARCH_MAX_LENGTH) {
      return true;
    }
    return false;
  }, [debouncedWord]);

  const lengthAlertText = useMemo(() => {
    if (debouncedWord?.length > SEARCH_MAX_LENGTH) {
      return (
        <div className={style.searchLengthAlertContainer}>
          <Alert
            display="weak"
            type="warning"
            message={intl.formatMessage(
              {
                id: "search.validator.maxSize",
                defaultMessage:
                  "The search box supports up to 32 characters. Therefore, {word} and followed characters will be ignored.",
              },
              {
                word: debouncedWord?.slice(0, SEARCH_MAX_LENGTH)?.slice(-3),
              },
            )}
            style={{
              paddingLeft: "24px",
            }}
          />
        </div>
      );
    }

    return <></>;
  }, [debouncedWord, intl]);

  const [, activateSearchCmd] = useRegisterCommand({
    id: "activate.global.search",
    fn: () => {
      inputRef.current?.focus();
      setFocus(true);
    },
  });

  const [, exitSearchCmd] = useRegisterCommand({
    id: "exit.global.search",
    fn: () => {
      inputRef.current?.blur();
      setFocus(false);
    },
    when: () => focus,
  });

  const [, switchTabCmd] = useRegisterCommand({
    id: "switch.global.search.result.type",
    fn: () => {
      let nextTabKey: ITabs;
      switch (tabKey) {
        case ITabs.all:
          nextTabKey = ITabs.menu;
          break;
        case ITabs.menu:
          nextTabKey = ITabs.resource;
          break;
        case ITabs.resource:
        default:
          nextTabKey = ITabs.all;
          break;
      }
      setTabKey(nextTabKey);
    },
    when: () => focus,
  });

  const [, moveCursorCmd] = useRegisterCommand({
    id: "move.global.search.selected.item",
    fn: (direction) => {
      const nextIndex = selectedIndex[tabKey] + (direction === "up" ? -1 : 1);
      let listLength = 0;
      switch (tabKey) {
        case ITabs.all:
          listLength =
            Math.min(menuList.length, 3) + Math.min(resourceList.length, 3);
          break;
        case ITabs.menu:
          listLength = menuList.length;
          break;
        case ITabs.resource:
          listLength = resourceList.length;
          break;
      }
      if (nextIndex >= 0 && nextIndex < listLength) {
        setSelectedIndex({
          ...selectedIndex,
          [tabKey]: nextIndex,
        });
      }
    },
    when: () => focus,
  });

  const [, selectResultCmd] = useRegisterCommand({
    id: "select.global.search.result",
    fn: () => {
      let index: number;
      switch (tabKey) {
        case ITabs.all:
          index = selectedIndex[ITabs.all];
          if (index < Math.min(menuList.length, 3)) {
            handleMenuItemClick(menuList[index]);
          } else {
            handleResourceItemClick(
              resourceList[index - Math.min(menuList.length, 3)],
            );
          }
          break;
        case ITabs.menu:
          handleMenuItemClick(menuList[selectedIndex[ITabs.menu]]);
          break;
        case ITabs.resource:
          handleResourceItemClick(resourceList[selectedIndex[ITabs.resource]]);
          break;
      }
    },
    when: () => focus,
  });

  useEffect(() => {
    const selectedItem = searchRef.current?.querySelector(
      `.ant-tabs-tabpane-active .${style.searchItemSelected}`,
    );
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const handleListMouseMove =
    (tabType: ITabs) => (currentIndex: number) => () => {
      if (currentIndex !== selectedIndex[tabType]) {
        setSelectedIndex({
          ...selectedIndex,
          [tabType]: currentIndex,
        });
      }
    };

  const handleListMouseLeave = (tabType: ITabs) => () => {
    setSelectedIndex({
      ...selectedIndex,
      [tabType]: -1,
    });
  };

  // 渲染标签页内容的通用函数（基于原 renderTabPane 逻辑）
  const renderTabContent = useCallback(
    (
      tabType: ITabs,
      loading: boolean,
      count: number,
      renderList: JSX.Element,
      showNoMoreData: boolean = true,
    ) => {
      const isInit = !word; // 没有搜索词时为初始状态

      return (
        <div
          className={cls(
            style.searchDropdownContentContainer,
            style[`${tabType}-tab`],
            {
              [style.searchDropdownContentContainerNew]: !word,
            },
          )}
          style={{
            paddingTop: upToMaxLength ? 0 : "20px",
          }}
        >
          {isInit &&
            !loading &&
            (tabType === ITabs.all ? (
              <SearchHistoryTabPane setKeyword={onHistoryWordClick} />
            ) : (
              <EmptyInit />
            ))}
          {lengthAlertText}
          {!isInit && count === 0 && !loading && <EmptyNoResult />}
          {!isInit && count > 0 && (
            <>
              {renderList}
              {showNoMoreData &&
                !loading &&
                currentEnv !== "virtualization" && (
                  <p className={style.searchNoMoreDataP}>
                    {intl.formatMessage({
                      id: "globalSearch.theEnd",
                      defaultMessage: "The end.",
                    })}
                  </p>
                )}
            </>
          )}
          {loading && count === 0 && (
            <div className={cls(style.spinCenter, style.emptySpinContainer)}>
              <Spin />
            </div>
          )}
        </div>
      );
    },
    [
      word,
      isLoading,
      onHistoryWordClick,
      currentEnv,
      intl,
      upToMaxLength,
      lengthAlertText,
    ],
  );

  const TabsItems = useMemo(() => {
    const items = [
      {
        value: ITabs.all,
        label: renderTabName(
          ITabs.all,
          resourceCount + menuCount + docCount,
          !!word,
        ),
        content: renderTabContent(
          ITabs.all,
          isLoading,
          resourceCount + menuCount + docCount,
          renderAllList(
            menuList,
            resourceList,
            docList,
            selectedIndex[ITabs.all],
            handleListMouseMove(ITabs.all),
          ),
        ),
      },
      {
        value: ITabs.menu,
        label: renderTabName(ITabs.menu, menuCount, !!word),
        content: renderTabContent(
          ITabs.menu,
          false,
          menuCount,
          renderMenuList(
            menuList,
            selectedIndex[ITabs.menu],
            handleListMouseMove(ITabs.menu),
            handleListMouseLeave(ITabs.menu),
          ),
        ),
      },
      {
        value: ITabs.resource,
        label: renderTabName(ITabs.resource, resourceCount, !!word),
        content: renderTabContent(
          ITabs.resource,
          isLoading,
          resourceCount,
          renderResourceList(
            resourceList,
            selectedIndex[ITabs.resource],
            handleListMouseMove(ITabs.resource),
            handleListMouseLeave(ITabs.resource),
          ),
        ),
      },
    ];

    // 添加文档标签页（如果有权限）
    // if (
    //   hasAuth({
    //     resource: "common",
    //     authKey: "help.center",
    //     type: "block",
    //   })
    // ) {
    //   items.push({
    //     label: renderTabName(ITabs.doc, docCount),
    //     key: ITabs.doc,
    //     children: renderTabContent(
    //       ITabs.doc,
    //       docLoading,
    //       docCount,
    //       renderDocList(docList),
    //       false // 文档标签页不显示"没有更多数据了"
    //     ),
    //   });
    // }

    return items;
  }, [
    resourceCount,
    menuCount,
    docCount,
    menuList,
    resourceList,
    docList,
    selectedIndex,
    handleListMouseMove,
    handleListMouseLeave,
    isLoading,
    // docLoading,
    word,
    currentEnv,
    onHistoryWordClick,
    intl,
    hasAuth,
    renderTabName,
    renderAllList,
    renderResourceList,
    renderMenuList,
    // renderDocList,
    renderTabContent,
  ]);

  return (
    <div
      className={cls(style.search, {
        [style.searchFocus]: focus,
        [style.positionSide]: position === "side",
        [style.zsv]: true,
      })}
      ref={searchRef}
      onClick={() => {
        inputRef.current?.focus();
      }}
    >
      {!focus && !debouncedWord && (
        <div className={style.searchTitle}>
          {intl.formatMessage({
            id: "search",
            defaultMessage: "Search",
          })}
        </div>
      )}
      <Input
        ref={inputRef}
        className="dark"
        prefix={<Icon type="search" />}
        allowClear
        onChange={(e) => onWordChange(e)}
        onCompositionStart={(e) => onWordChange(e)}
        onCompositionEnd={(e) => onWordChange(e)}
        onFocus={() => setFocus(true)}
        onClick={() => setFocus(true)}
        value={unLockWord}
        suffix={
          !focus && activateSearchCmd ? (
            <div className={style.searchKey}>{activateSearchCmd.keyLabel}</div>
          ) : undefined
        }
      />
      <div
        className={cls(
          style.searchDropdownContainer,
          { [style.dropdownFocus]: focus },
          { [style.noWord]: !word },
        )}
      >
        <AuthTabs
          tabsList={TabsItems}
          value={tabKey}
          onValueChange={(e) => {
            setTabKey(e as ITabs);
            inputRef.current?.focus();
          }}
          rootClassName="flex-1 min-h-0 flex flex-col"
          contentClassName="flex-1 min-h-0 overflow-auto"
          listClassName={style.searchTabsList}
        />
        <div className={style.legend}>
          {moveCursorCmd && (
            <div className={style.legendItem}>
              <div className={style.legendKey}>
                {[...moveCursorCmd.keyLabelMap.values()].join("")}
              </div>
              <div className={style.legendLabel}>
                {intl.formatMessage({
                  id: "global.search.move.selected.item",
                  defaultMessage: "Scroll",
                })}
              </div>
            </div>
          )}
          {selectResultCmd && (
            <div className={style.legendItem}>
              <div className={style.legendKey}>{selectResultCmd.keyLabel}</div>
              <div className={style.legendLabel}>
                {intl.formatMessage({
                  id: "global.search.select.result",
                  defaultMessage: "Select",
                })}
              </div>
            </div>
          )}
          {switchTabCmd && (
            <div className={style.legendItem}>
              <div className={style.legendKey}>{switchTabCmd.keyLabel}</div>
              <div className={style.legendLabel}>
                {intl.formatMessage({
                  id: "global.search.switch.type",
                  defaultMessage: "Switch",
                })}
              </div>
            </div>
          )}
          {exitSearchCmd && (
            <div className={style.legendItem}>
              <div className={style.legendKey}>{exitSearchCmd.keyLabel}</div>
              <div className={style.legendLabel}>
                {intl.formatMessage({
                  id: "global.search.exit.search",
                  defaultMessage: "Exit",
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;

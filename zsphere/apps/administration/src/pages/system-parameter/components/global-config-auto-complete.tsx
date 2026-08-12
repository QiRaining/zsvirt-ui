import { Button } from "@zstack/design";
import { Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { escapeRegExp } from "@zstack/zsphere-utils";
import { Select } from "antd";
import cls from "classnames";
import * as _ from "lodash-es";
import type { SetStateAction, Dispatch } from "react";
import React, { useState, useCallback } from "react";
import { useIntl } from "react-intl";
import { useNavigate, useLocation } from "react-router";

import { useRecordSearchHistory } from "./hook";

import style from "./style.module.less";

const globalConfigSvg = require("../../assets/images/global-search.svg?inline");

const SEARCH_TYPE = "global-config";

interface IProps {
  dataResources: any[];
  setTargetTab?: Dispatch<SetStateAction<string>>;
  placeholder?: string;
}

interface ISearchHistoryTabPane {
  setKeyword: (v: string) => void;
}

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

interface ISearchResultItemProps {
  item: any;
  value: string;
  onSelect: (item: any) => void;
  highlight: (label: string | undefined, value: string) => React.ReactNode;
}

const SearchResultItem: React.FC<ISearchResultItemProps> = ({
  item,
  value,
  onSelect,
  highlight,
}) => {
  const handleClick = useCallback(() => {
    onSelect(item);
  }, [item, onSelect]);

  return (
    <Text onClick={handleClick} className={style["search-value"]}>
      {highlight(item.name, value)}
    </Text>
  );
};

const SearchHistoryTabPane: React.FC<ISearchHistoryTabPane> = ({
  setKeyword,
}) => {
  const intl = useIntl();
  const { getSearchHistory, clearSearchHistory } = useRecordSearchHistory();

  const handleTagClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const { value } = event.currentTarget.dataset;

      if (value) {
        setKeyword(value);
      }
    },
    [setKeyword],
  );

  const handleClearSearchHistory = useCallback(() => {
    clearSearchHistory(SEARCH_TYPE);
  }, [clearSearchHistory]);

  if (getSearchHistory(SEARCH_TYPE).length === 0) {
    return <></>;
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
          <Button variant="link" onClick={handleClearSearchHistory}>
            {intl.formatMessage({
              id: "virtualization.clear_data",
              defaultMessage: "Clear out",
            })}
          </Button>
        </span>
      </div>
      <div className={style.historyContentContainer}>
        {getSearchHistory(SEARCH_TYPE).map((e) => (
          <div
            key={e}
            className={style.historyTag}
            data-value={e}
            onClick={handleTagClick}
          >
            {e}
          </div>
        ))}
      </div>
    </div>
  );
};

const GlobalConfigSelect: React.FC<IProps> = ({
  dataResources = [],
  setTargetTab: _setTargetTab,
  placeholder,
}) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const location = useLocation() as {
    pathname: string;
    search: string;
    hash: string;
    state?: { _keyArr: [string, string?] };
  };
  const [value, setValue] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [filteredData, setFilteredData] = useState<{
    basicData: any[];
    advancedData: any[];
    allData: any[];
  }>({
    basicData: [],
    advancedData: [],
    allData: [],
  });
  const { setSearchHistory, getSearchHistory } = useRecordSearchHistory();

  const jumpTo = useCallback(
    (item: any) => {
      setSearchHistory(value, SEARCH_TYPE);
      setIsActive(false);
      // setTargetTab(settingType)
      navigate(
        `${location.pathname}${location.search}#${_.snakeCase(item.secondCategoryKey)}`,
        {
          replace: true,
          state: {
            ...location.state,
            _keyArr: ["virtualization.system.parameter", item.firstCategoryKey],
            highlightedItemKey: item.key,
          },
        },
      );
    },
    [
      location.pathname,
      location.search,
      location.state,
      navigate,
      setSearchHistory,
      value,
    ],
  );

  const handleSearch = useCallback(
    (searchValue: string) => {
      setValue(searchValue);
      // 标记有merge key 的配置，分类的时候取一条即可。
      const mergeKeyFlag = {} as { [key: string]: boolean };

      if (searchValue) {
        const basicData: any[] = [];
        const advancedData: any[] = [];
        const allData: any[] = [];

        for (const globalConfig of dataResources) {
          const mergeKey = _.get(globalConfig, "mergeKey");

          if (_.startsWith(globalConfig.key, "virtualization.")) {
            // globalConfig.description.includes(searchValue)
            if (
              globalConfig.name.includes(searchValue) &&
              !mergeKeyFlag[mergeKey]
            ) {
              if (_.isEqual(globalConfig.categoryType, "Basic")) {
                basicData.push(globalConfig);

                allData.push(globalConfig);
              }

              if (_.isEqual(globalConfig.categoryType, "Advanced")) {
                advancedData.push(globalConfig);

                allData.push(globalConfig);
              }

              if (mergeKey) {
                mergeKeyFlag[mergeKey] = true;
              }
            }
          }
        }

        setFilteredData({
          basicData,
          advancedData,
          allData,
        });
      } else {
        setFilteredData({
          basicData: [],
          advancedData: [],
          allData: [],
        });
      }
    },
    [dataResources],
  );

  const suffixIcon = !value ? (
    <>
      {/* <span className={style.suffix} /> */}
      <Icon type="search" />
    </>
  ) : null;

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

  const handleCancelHighlightItem = useCallback(() => {
    const id = location.hash.replace("#", "");
    const container = document.getElementById(id);

    const highlightedItem = container?.querySelector("div.highlighted-item");

    if (highlightedItem) {
      highlightedItem.classList.remove("highlighted-item");
    }
  }, [location.hash]);

  const handleJumpToBasicSetting = useCallback(
    (item: any) => {
      jumpTo(item);
    },
    [jumpTo],
  );

  const handleFocus = useCallback(() => {
    setIsActive(true);
  }, [setIsActive]);

  const handleBlur = useCallback(() => {
    handleCancelHighlightItem();
  }, [handleCancelHighlightItem]);

  const handleDropdownVisibleChange = useCallback(
    (open: boolean) => {
      setIsActive(open);
    },
    [setIsActive],
  );

  const renderContentOnAllTab = useCallback(() => {
    if (getSearchHistory(SEARCH_TYPE).length > 0 && !value) {
      return <SearchHistoryTabPane setKeyword={handleSearch} />;
    }

    const ele = [];

    if (filteredData.allData?.length) {
      const allDataEle = (
        <React.Fragment key="all-data">
          {_.map(filteredData.allData, (item) => (
            <SearchResultItem
              key={item.key ?? item.name}
              item={item}
              value={value}
              onSelect={handleJumpToBasicSetting}
              highlight={highlightExactSearchWord}
            />
          ))}
        </React.Fragment>
      );

      ele.push(allDataEle);
    }

    if (ele.length > 0) {
      return ele.concat(
        <p key="no-more-data" className={style.searchNoMoreDataP}>
          {intl.formatMessage({
            id: "globalSearch.theEnd",
            defaultMessage: "The end.",
          })}
        </p>,
      );
    }

    if (value) {
      return <EmptyNoResult />;
    }

    return <EmptyInit />;
  }, [
    filteredData.allData,
    getSearchHistory,
    handleJumpToBasicSetting,
    handleSearch,
    intl,
    value,
  ]);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
    },
    [],
  );

  const renderDropdown = useCallback(
    () => (
      <div className={style.autoCompleteTab} onMouseDown={handleMouseDown}>
        {renderContentOnAllTab()}
      </div>
    ),
    [handleMouseDown, renderContentOnAllTab],
  );

  return (
    <Select
      className={style.autoComplete}
      style={{ width: isActive ? "320px" : "160px" }}
      onFocus={handleFocus}
      onBlur={handleBlur}
      dropdownMatchSelectWidth={320}
      popupClassName={style.dropdownClassName}
      open={isActive}
      onDropdownVisibleChange={handleDropdownVisibleChange}
      searchValue={value}
      onSearch={handleSearch}
      showSearch
      dropdownRender={renderDropdown}
      suffixIcon={suffixIcon}
      allowClear
      placeholder={placeholder}
    />
  );
};

export default GlobalConfigSelect;

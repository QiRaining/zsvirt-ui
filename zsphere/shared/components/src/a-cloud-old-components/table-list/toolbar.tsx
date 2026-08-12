import { Icon } from "@zstack/icon";
import { Item } from "@zstack/zsphere-types";
import { useControllableValue } from "ahooks";
import { Button, Dropdown, Menu, Space, Tooltip } from "antd";
import cls from "classnames";
import { isFunction } from "lodash-es";
import React, { useMemo } from "react";

import { getBaseCls } from "../../_utils/common";
import Auth from "../auth";
import { SearchVersion } from "../config";
import { getTooltip } from "../field/horizontal";
import Search, { ISearchCondition } from "../search";
import { CustomColumn, ExportToExcel, SearchAdvanced } from "./components";
import { ICandidate } from "./components/search-advanced/type";

import "./style.less";
import { IToolbarProps } from "./type";

const baseCls = getBaseCls("table-list-toolbar");
const zsvCls = getBaseCls("table-list-toolbar-zsv");

const showToolbarItems: IToolbarProps<any>["toolbar"] = [
  "refresh",
  "operation",
  "search",
  "setting",
];

function Toolbar<T extends Item>(props: IToolbarProps<T>) {
  const {
    view: _view,
    customView,
    children,
    refetch,
    queryConfig,
    selectedList,
    renderMiddleToolbar,
    renderRightToolbar,
    toolbar = showToolbarItems,
    toggleOptions,
    columnConfig,
    columnKeys,
    resource,
    viewMap,
    menuList,
    setCustomRefresh,
    customRefresh,
    iQuery,
    gql,
    onRefetchBtnClick,
    toolbarHandleTooltip,
    limitLoop,
    extraColumns,
    showExtraColumnKey,
    customFileName,
    renderCustomExportModal,
    disabledKeyList,
    filterColumns,
    allGqlKeysWhenExport,
    searchProps,
    searchVersion,
    setQuery,
    onlySingleSearch,
    resourceAttributeColumnList,
    resourceAttributeSearch,
    customColumnLoading,
  } = props;
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  const view = isFunction(_view) ? _view(selectedList) : _view;

  const [value, onChange] = useControllableValue<string>(props, {
    defaultValue: "__table__",
    valuePropName: "selectedToggleKey",
    trigger: "onToggleSelect",
  });

  const handleTooltip = useMemo(() => {
    const tooltipProps = getTooltip(toolbarHandleTooltip);

    if (tooltipProps?.title) {
      return (
        <Tooltip {...tooltipProps}>
          <span>
            <Icon type="info" className={`${baseCls}-handle-tooltip`} />
          </span>
        </Tooltip>
      );
    }
  }, [toolbarHandleTooltip]);

  if (toolbar === false || !toolbar?.length) {
    return null;
  }

  const menu = (
    <Menu
      {...({
        onSelect: ({ key }: { key: any }) => onChange(key as string),
      } as any)}
    >
      {toggleOptions?.map(({ key, label }) => (
        <Menu.Item key={key}>{label}</Menu.Item>
      ))}
    </Menu>
  );

  const isSelectView = view.startsWith("select");

  const getPopupContainer = (node: HTMLElement) => {
    if (node.parentElement) {
      return node.parentElement;
    }

    return document.body;
  };

  return (
    <div className={cls(baseCls, { [zsvCls]: true })}>
      <div className={`${baseCls}-row`}>
        <div className={`${baseCls}-left`}>
          <div className={`${baseCls}-left-container`}>
            {toolbar.includes("refresh") && (
              <Button
                className={`${baseCls}-refresh-btn`}
                onClick={() =>
                  onRefetchBtnClick ? onRefetchBtnClick() : refetch()
                }
              >
                <Icon type="refresh" />
              </Button>
            )}
            {isSelectView ||
              (toolbar.includes("operation") &&
                children({ position: "toolbar", selectedList }))}
            {renderMiddleToolbar?.()}
            {toolbar.includes("search") &&
              queryConfig &&
              queryConfig.length > 0 &&
              (searchVersion === SearchVersion.V1 ? (
                <Search
                  query={iQuery}
                  onlySingleSearch={onlySingleSearch}
                  setQuery={setQuery}
                  conditions={queryConfig as ISearchCondition[]}
                  container={searchContainerRef}
                  {...searchProps}
                />
              ) : (
                <SearchAdvanced
                  candidates={queryConfig as ICandidate[]}
                  resourceAttributeSearch={resourceAttributeSearch}
                />
              ))}

            {isSelectView || handleTooltip}
          </div>
        </div>
        <div className={`${baseCls}-right`}>
          <Space size={8}>
            <Space size={4}>
              {isSelectView ? null : (
                <>
                  {toolbar.includes("setting") && !customColumnLoading && (
                    <Auth
                      resource="common"
                      type="block"
                      authKey="custom.column"
                    >
                      <CustomColumn
                        columnConfig={columnConfig as any}
                        resourceAttributeColumnList={
                          resourceAttributeColumnList as any
                        }
                        columnKeys={columnKeys as any}
                        view={view}
                        customView={customView}
                        resource={resource}
                        viewMap={viewMap}
                        menuList={menuList as any}
                        setCustomRefresh={setCustomRefresh}
                        disabledKeyList={disabledKeyList}
                      />
                    </Auth>
                  )}
                  {toolbar.includes("export") && (
                    <Auth
                      resource="common"
                      type="block"
                      authKey="export.to.csv"
                    >
                      <ExportToExcel
                        resource={resource}
                        columnKeys={columnKeys}
                        query={iQuery}
                        gql={gql}
                        columnConfig={columnConfig}
                        view={view}
                        customRefresh={customRefresh}
                        limitLoop={limitLoop}
                        extraColumns={extraColumns}
                        showExtraColumnKey={showExtraColumnKey}
                        customFileName={customFileName}
                        renderCustomExportModal={renderCustomExportModal}
                        filterColumns={filterColumns}
                        allGqlKeysWhenExport={allGqlKeysWhenExport}
                      />
                    </Auth>
                  )}
                  {toolbar.includes("toggle") && (
                    <Dropdown
                      dropdownRender={() => menu}
                      trigger={["click"]}
                      getPopupContainer={getPopupContainer}
                    >
                      <Button>
                        {toggleOptions?.find(({ key }) => key === value)
                          ?.icon && (
                          <Icon
                            type={
                              toggleOptions!.find(({ key }) => key === value)!
                                .icon!
                            }
                          />
                        )}
                        {toggleOptions?.find(({ key }) => key === value)?.label}
                        <Icon type="arrow-ios-down" />
                      </Button>
                    </Dropdown>
                  )}
                </>
              )}
            </Space>

            {renderRightToolbar?.()}
          </Space>
        </div>
      </div>
      {toolbar.includes("search") &&
        (searchVersion === SearchVersion.V1 ? (
          <div ref={searchContainerRef} className={`${baseCls}-search`} />
        ) : (
          <SearchAdvanced.Filter />
        ))}
    </div>
  );
}

export default Toolbar;

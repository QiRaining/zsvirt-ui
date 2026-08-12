import { Icon } from "@zstack/icon";
import { Select } from "@zstack/zsphere-components";
import { Illustration } from "@zstack/zsphere-illustration";
import cls from "classnames";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import type { ILegend } from "./type";

import style from "./style.module.less";

const Legend = ({
  dataSource = [],
  hostCount = 0,
  clusterCount = 0,
  l2Count = 0,
  l3Count = 0,
  vmCount = 0,
  resourceTypeMap,
  collapsed,
  setCollapsed,
  onSelect,
}: ILegend) => {
  const intl = useIntl();

  const options = useMemo(() => {
    const parsedOptions = dataSource.map((item) => ({
      label: item.title || item.id,
      value: item.id,
      extra: [resourceTypeMap?.get(item.resourceType) || item.resourceType],
    }));
    return parsedOptions;
  }, [dataSource, resourceTypeMap]);

  return (
    <div
      className={cls(style["network-topo-legend"], {
        [style.collapsed]: collapsed,
      })}
    >
      <div className={style["network-topo-legend-container"]}>
        <div className={style["network-topo-legend-title"]}>
          {intl.formatMessage({
            id: "topology.resource",
            defaultMessage: "Topology Resources",
          })}
        </div>
        <div className={style["network-topo-legend-list"]}>
          <div className={style["network-topo-legend-list-search"]}>
            <Select
              options={options}
              width={216}
              showSearch
              allowClear
              filterOption={(inputValue, option) => {
                if (!option) {
                  return false;
                }
                const value = option.value;
                if (value != null) {
                  const valueStr = String(value);
                  if (valueStr.includes(inputValue)) {
                    return true;
                  }
                }
                if (option.children && React.isValidElement(option.children)) {
                  const childrenProps = option.children.props as any;
                  if (childrenProps?.option?.label?.includes(inputValue)) {
                    return true;
                  }
                }
                return false;
              }}
              placeholder={intl.formatMessage({
                id: "topology.resource.search.placeholder",
                defaultMessage: "Resource Name / UUID",
              })}
              onSelect={onSelect}
            />
          </div>
          <div
            className={`flex justify-between gap-1 ${style["network-topo-legend-list-item"]}`}
          >
            <div>
              <div className="flex items-center gap-2">
                <Illustration type="3d-server" size={24} />
                {intl.formatMessage({ id: "host", defaultMessage: "Host" })}
              </div>
            </div>
            <div>{hostCount}</div>
          </div>
          <div
            className={`flex justify-between gap-1 ${style["network-topo-legend-list-item"]}`}
          >
            <div>
              <div className="flex items-center gap-2">
                <Illustration type="3d-cluster" size={24} />
                {intl.formatMessage({
                  id: "cluster",
                  defaultMessage: "Cluster",
                })}
              </div>
            </div>
            <div>{clusterCount}</div>
          </div>
          <div
            className={`flex justify-between gap-1 ${style["network-topo-legend-list-item"]}`}
          >
            <div>
              <div className="flex items-center gap-2">
                <Illustration type="3d-distributedswitch" size={24} />
                {intl.formatMessage({
                  id: "switch",
                  defaultMessage: "Switch",
                })}
              </div>
            </div>
            <div>{l2Count}</div>
          </div>
          <div
            className={`flex justify-between gap-1 ${style["network-topo-legend-list-item"]}`}
          >
            <div>
              <div className="flex items-center gap-2">
                <Illustration type="3d-distributedportgroup" size={24} />
                {intl.formatMessage({
                  id: "port.group",
                  defaultMessage: "Port Group",
                })}
              </div>
            </div>
            <div>{l3Count}</div>
          </div>
          <div
            className={`flex justify-between gap-1 ${style["network-topo-legend-list-item"]}`}
          >
            <div>
              <div className="flex items-center gap-2">
                <Illustration type="3d-computer" size={24} />
                {intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" })}
              </div>
            </div>
            <div>{vmCount}</div>
          </div>
        </div>
      </div>
      <div
        className={style["network-topo-legend-collapse-btn"]}
        onClick={() => setCollapsed?.()}
      >
        <Icon type={collapsed ? "arrowhead-left" : "arrowhead-right"} />
      </div>
    </div>
  );
};

export default Legend;

import { useLazyQuery } from "@apollo/client";
import { Tooltip, Divider } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { Icon } from "@zstack/icon";
import { getHostNUMANode } from "@zstack/virtualization-resource/src/gql/vm.gql";
import type { ISelectProps } from "@zstack/zsphere-components";
import { Progress, Select, Tag } from "@zstack/zsphere-components";
import type { HostNUMANode as IHostNUMANode } from "@zstack/zsphere-types/graphql";
import { Tree } from "antd";
import { produce } from "immer";
import { sortBy, uniq } from "lodash-es";
import React, { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";

import styles from "./style.module.less";

type IRawValue = string[];

interface IProps<VT> extends ISelectProps<VT> {
  treeData: TreeData;
  hostNUMANodeObj: {
    [key: string]: string;
  };
  type?: "create" | "vnuma" | "detail";
}

export type TreeData = TreeDataItem[];
export interface TreeDataArgs {
  uuid?: string;
  uuidType?: "vm" | "host";
}

interface TreeDataItem {
  title: string;
  key: string;
  disabled?: boolean;
  numaNode: string;
  children:
    | {
        title: JSX.Element;
        key: string;
        disabled?: boolean;
      }[]
    | undefined;
}

export const cpuStrToArr = (cpuStr: string = "") => {
  cpuStr = cpuStr ?? "";
  const cpuSet: Set<string> = new Set();
  cpuStr.split(",").forEach((item) => {
    if (/^\d{1,9}-\d{1,9}$/.test(item)) {
      let [a, b] = item.split("-");
      if (a > b) {
        [a, b] = [b, a];
      }
      for (let i = Number(a); i <= Number(b); i += 1) {
        cpuSet.add(String(i));
      }
    }
    if (/^\d{1,9}$/.test(item)) {
      cpuSet.add(item);
    }

    if (/^\^\d{1,9}$/.test(item)) {
      cpuSet.delete(item[1]);
    }
  });
  return [...cpuSet];
};

export const useTreeData = (
  uuid?: string,
  uuidType: "vm" | "host" = "host",
) => {
  const { getCurrentServerTimeMillionSeconds } = useTime();
  const intl = useIntl();

  const [_queryHostNUMANode, { data: hostNUMANode }] = useLazyQuery<{
    getHostNUMANode: IHostNUMANode;
  }>(getHostNUMANode);

  const queryHostNUMANode = useCallback(() => {
    const currentTime = getCurrentServerTimeMillionSeconds();
    _queryHostNUMANode({
      variables: {
        uuid,
        uuidType,
        withCPUUsedUtilization: true,
        isAverage: true,
        startTime: String(Math.round((currentTime - 15 * 60 * 1000) / 1000)),
        endTime: String(Math.round(currentTime / 1000)),
      },
    });
  }, [_queryHostNUMANode, uuid, uuidType]);

  const { numaNodeList = [], pCPUUsedList = [] } = useMemo(() => {
    const { numaNodeList: _numaNodeList, pCPUUsedList: _pCPUUsedList } =
      hostNUMANode?.getHostNUMANode ?? {};
    return {
      numaNodeList: _numaNodeList ?? [],
      pCPUUsedList: _pCPUUsedList ?? [],
    };
  }, [hostNUMANode]);

  sortBy(numaNodeList, (item) => item.numaNode);

  const hostNUMANodeObj = useMemo(() => {
    const obj: { [key: string]: string } = {};
    numaNodeList.forEach((item) => {
      item.cpus?.forEach((cpuNum) => {
        obj[cpuNum] = item.numaNode;
      });
    });
    return obj;
  }, [numaNodeList]);

  const hostCPUUsedObj = useMemo(() => {
    const obj: { [key: string]: number } = {};
    pCPUUsedList.forEach((item) => {
      obj[item.cpuNum] = Number(item.value.toFixed(2));
    });
    return obj;
  }, [pCPUUsedList]);

  const judgeColor = (percent: number) => {
    if (percent < 60) {
      return "#3EA1FA";
    }
    if (percent >= 60 && percent < 80) {
      return "#FFB53F";
    }
    if (percent >= 80) {
      return "#FF766F";
    }
    return "#3EA1FA";
  };

  const treeData = useMemo(() => {
    return numaNodeList.map((item) => {
      const treeNode = {
        title: `NUMA node ${item.numaNode}`,
        key: `NUMA node ${item.numaNode}`,
        numaNode: item.numaNode,
        children: item.cpus?.map((cpu) => ({
          title: (
            <div className={styles.nodeItem}>
              <span>{cpu}</span>
              <Tooltip
                title={
                  <div>
                    <span>
                      {intl.formatMessage({
                        id: "cpuLoadUtilization",
                        defaultMessage: " CPU Utilization",
                      })}
                    </span>
                    {` : ${hostCPUUsedObj[cpu]}%`}
                  </div>
                }
              >
                <Progress.Bar
                  percent={hostCPUUsedObj[cpu]}
                  strokeColor={judgeColor(hostCPUUsedObj[cpu])}
                  showInfo={false}
                  strokeWidth={4}
                />
              </Tooltip>
            </div>
          ),
          key: cpu,
        })),
      };
      if (!treeNode.children?.length) {
        delete treeNode.children;
      }
      return treeNode;
    });
  }, [hostCPUUsedObj, intl, numaNodeList]);

  return {
    hostNUMANodeObj,
    treeData,
    queryHostNUMANode,
  };
};

export const getSelectValueFromCheckedKeys = (checkedKeys: string[] = []) => {
  return checkedKeys.filter((item) => !item.includes("NUMA node"));
};

const PcpuSelect: React.FC<IProps<IRawValue>> = ({
  value,
  onChange,
  treeData,
  hostNUMANodeObj,
  type = "detail",
  ...props
}) => {
  const intl = useIntl();
  const onCheck = useCallback(
    (checkedKeysValue: any) => {
      onChange?.(checkedKeysValue, []);
    },
    [onChange],
  );

  const onClear = useCallback(() => {
    onChange?.([], []);
  }, [onChange]);

  const selectValue = useMemo(() => {
    return getSelectValueFromCheckedKeys(value);
  }, [value]);

  const selectedNumaList = useMemo(() => {
    return uniq(selectValue.map((cpuNum) => hostNUMANodeObj[cpuNum]));
  }, [hostNUMANodeObj, selectValue]);

  const onDropdownVisibleChange = useCallback(() => {
    if (selectedNumaList.length > 1 && type === "vnuma") {
      onChange?.([], []);
    }
  }, [onChange, selectedNumaList.length, type]);

  const treeTataWithDisabled = useMemo(() => {
    const _treeData = produce(treeData, (draft) => {
      if (selectedNumaList.length === 1 && type === "vnuma") {
        draft.forEach((item) => {
          if (selectedNumaList[0] !== item.numaNode) {
            item.disabled = true;
            item.children?.forEach((cpuNode) => {
              cpuNode.disabled = true;
            });
          }
        });
      }
    });
    return _treeData;
  }, [selectedNumaList, treeData, type]);

  return (
    <Select
      mode="multiple"
      onChange={onChange}
      value={selectValue}
      onDropdownVisibleChange={onDropdownVisibleChange}
      getPopupContainer={() => document.body}
      popupClassName={styles.dropdownContainer}
      tagRender={(tagProps) => {
        const {
          value: tagValue,
          closable,
          onClose,
          ...restTagProps
        } = tagProps;
        const label = selectValue.find((item) => item === tagValue);
        return (
          <Tag closable={closable} onClose={onClose} {...restTagProps}>
            {label}
          </Tag>
        );
      }}
      dropdownRender={() => (
        <div
          style={{ width: props.width }}
          className={styles.selectDropdownRender}
        >
          <div className={styles.selectHeader}>
            <div className={styles.selectTotal}>
              {intl.formatMessage(
                {
                  id: "vm.select.pcpu.total",
                  defaultMessage: "Selected ({total})",
                },
                { total: selectValue.length },
              )}
            </div>
            <div className={styles.selectClear} onClick={onClear}>
              {intl.formatMessage({
                id: "vm.select.pcpu.clear",
                defaultMessage: "Clear",
              })}
            </div>
          </div>
          <Divider className={styles.divider} />
          <div className={styles.treeContainer}>
            <Tree
              checkable
              onCheck={onCheck}
              checkedKeys={value}
              treeData={treeTataWithDisabled}
              defaultExpandAll
              switcherIcon={
                <Icon
                  type="arrow-ios-down"
                  size={16}
                  className={styles.switcherIcon}
                />
              }
              selectable={false}
              blockNode={true}
            />
          </div>
        </div>
      )}
      {...props}
    />
  );
};

export default React.memo(PcpuSelect);

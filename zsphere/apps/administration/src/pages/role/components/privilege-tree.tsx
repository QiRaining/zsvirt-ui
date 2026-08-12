import { Button, Tooltip, Checkbox } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { DialogBase } from "@zstack/zsphere-design-biz";
import type { IMenu } from "@zstack/zsphere-types";
import { useControllableValue, useDebounceFn } from "ahooks";
import { Tree, Input } from "antd";
import * as _ from "lodash-es";
import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useIntl } from "react-intl";

import { useRoleFilterConfig } from "../hooks/use-ui-privilege/use-role-filter-config";
import { useSubAction } from "../hooks/use-ui-privilege/use-sub-action";
import { buildPrivilegeTree } from "../utils";
import Empty from "./empty";

import styles from "./style.module.less";

const STYLE_ACTION_ROW = { marginBottom: 12 } as const;
const STYLE_MODAL_CONTENT = { padding: "24px 24px 40px" } as const;
const STYLE_SEARCH_INPUT = { marginBottom: 18 } as const;
const STYLE_CHECK_TITLE = { marginTop: "8px" } as const;
const STYLE_ACTION_GROUP = { width: "100%", paddingLeft: "24px" } as const;
const STYLE_TREE_SWITCHER_ICON = {
  color: "var(--neutral-600)",
  fontSize: "16px",
} as const;

interface TreeNode {
  menuKey: string;
  name: string;
  children?: TreeNode[];
  tabs?: TreeNode[];
}

interface Action {
  key: string;
  name: string;
  selected: boolean;
}

interface UIPrivilege {
  [key: string]: {
    actions: Action[];
    views: any[];
  };
}

const NodeEditIcon: React.FC<{
  menuKey: string;
  onEdit: (menuKey: string) => void;
}> = ({ menuKey, onEdit }) => {
  const handleClick = useCallback(() => {
    onEdit(menuKey);
  }, [menuKey, onEdit]);

  return (
    <Icon className={styles["edit-icon"]} type="edit" onClick={handleClick} />
  );
};

interface PrivilegeTreeProps {
  value?: any;
  onChange?: (value: any) => void;
  treeStruct?: IMenu[];
}

const PrivilegeTree: React.FC<PrivilegeTreeProps> = ({
  value,
  onChange,
  treeStruct = [],
}) => {
  const intl = useIntl();
  const [state, setState] = useControllableValue<{
    uiPrivilege: UIPrivilege;
    checkedKeys: string[];
  }>(
    { value, onChange },
    {
      defaultValue: {
        uiPrivilege: {},
        checkedKeys: [],
      },
    },
  );
  const [currentKey, setCurrentKey] = useState<string>("");
  const [checkActionList, setCheckActionList] = useState<string[]>([]);
  const [actionCheckedAll, setActionCheckedAll] = useState<boolean>(false);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [searchText, setSearchText] = useState<string>("");

  const { getSubAction } = useSubAction();
  const { filteredMenuKeys } = useRoleFilterConfig();

  useEffect(() => {
    setCheckedKeys(state.checkedKeys || []);
  }, [state.checkedKeys]);

  const clickNode = useCallback(
    (key: string) => {
      setCurrentKey(key);
      const actions = state.uiPrivilege[key]?.actions || [];
      setCheckActionList(
        actions
          .filter((view: Action) => view.selected)
          .map((action: Action) => `${key}|${action.key}`),
      );
      setActionCheckedAll(actions.every((action: Action) => action.selected));
    },
    [state.uiPrivilege],
  );

  const handleNodeClick = useCallback(
    (menuKey: string) => {
      clickNode(menuKey);
    },
    [clickNode],
  );

  const getNodeTitle = useCallback(
    (node: TreeNode) => {
      const { menuKey } = node;
      const uiPrivilege = state?.uiPrivilege?.[menuKey];

      if (!uiPrivilege) {
        return null;
      }

      return (
        <div className="flex">
          <div style={{ flex: 1 }}>{node.name}</div>
          {menuKey !== "dashboard" && uiPrivilege.actions?.length > 0 && (
            <div className={styles.description}>
              <span>
                {intl.formatMessage({ id: "action", defaultMessage: "Actions" })}
              </span>
              <span>
                (
                {
                  uiPrivilege.actions.filter(
                    (action: Action) => action.selected,
                  ).length
                }
                /{uiPrivilege.actions.length})
              </span>
              <span className={styles.split}>|</span>
              <Tooltip
                title={intl.formatMessage({
                  id: "set",
                  defaultMessage: "Set",
                })}
              >
                <NodeEditIcon menuKey={menuKey} onEdit={handleNodeClick} />
              </Tooltip>
            </div>
          )}
        </div>
      );
    },
    [handleNodeClick, intl, state?.uiPrivilege],
  );

  const treeData = useMemo(
    () =>
      buildPrivilegeTree(treeStruct, {
        filteredMenuKeys,
        getNodeTitle,
        isDashboardDisabled: true,
      }),
    [treeStruct, filteredMenuKeys, getNodeTitle],
  );

  const onCheckAllAction = useCallback(() => {
    const newState = _.cloneDeep(state.uiPrivilege);
    const actions = newState[currentKey].actions;
    const newCheckedAll = !actionCheckedAll;
    actions.forEach((item: Action) => {
      item.selected = newCheckedAll;
    });
    const newCheckActionList = newCheckedAll
      ? actions.map((item: Action) => `${currentKey}|${item.key}`)
      : [];

    setState({ ...state, uiPrivilege: newState });
    setCheckActionList(newCheckActionList);
    setActionCheckedAll(newCheckedAll);
  }, [actionCheckedAll, currentKey, state]);

  const onChangeActions = useCallback(
    (checkedValue: string[]) => {
      const newState = _.cloneDeep(state.uiPrivilege);
      const actions = newState[currentKey].actions;
      const _checkedKeys = checkedValue.map((item) => item.split("|")[1]);

      actions.forEach((item: Action) => {
        item.selected = _checkedKeys.includes(item.key);
      });

      setState({ ...state, uiPrivilege: newState });
      setCheckActionList(checkedValue);
      setActionCheckedAll(checkedValue.length === actions.length);
    },
    [currentKey, state],
  );

  const { run: searchRun } = useDebounceFn(
    (inputVal: string) => {
      setSearchText(inputVal);
    },
    { wait: 200 },
  );

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      searchRun(event.target.value);
    },
    [searchRun],
  );

  const getActionItem = useCallback(() => {
    if (!currentKey) {
      return null;
    }

    const actions = _.cloneDeep(
      state.uiPrivilege[currentKey]?.actions || [],
    ).filter((item: Action) =>
      item.name.toLowerCase().includes(searchText.toLowerCase()),
    );

    let subConfig: any = getSubAction(currentKey);
    let subActionKeys: any = [];

    if (subConfig) {
      subConfig = _.keys(subConfig)
        .map((key: string) => {
          const filteredActions = actions.filter(
            (action: any) => subConfig[key].keys.indexOf(action.key) > -1,
          );
          subActionKeys = subActionKeys.concat(subConfig[key].keys);
          return {
            actions: filteredActions,
            key,
            name: subConfig[key].name,
          };
        })
        .filter((config: { name: string; actions: Action[] }) => {
          // 检查 config.name 或其中的任何 action.name 是否匹配搜索文本
          return (
            config.name.toLowerCase().includes(searchText.toLowerCase()) ||
            config.actions.some((action: Action) =>
              action.name.toLowerCase().includes(searchText.toLowerCase()),
            )
          );
        });
    }

    return (
      <Empty isSearching={!!searchText} dataSource={actions}>
        <div className="flex flex-wrap gap-y-3" style={STYLE_ACTION_ROW}>
          {actions.map((action: Action) => {
            const itemValue = `${currentKey}|${action.key}`;
            const itemId = `action-${currentKey}-${action.key}`;
            return (
              <div className="w-[50%]" key={action.key}>
                <div className="flex items-center">
                  <Checkbox
                    id={itemId}
                    checked={checkActionList.includes(itemValue)}
                    onCheckedChange={(checked) => {
                      const newList = checked
                        ? [...checkActionList, itemValue]
                        : checkActionList.filter((v) => v !== itemValue);
                      onChangeActions(newList);
                    }}
                  />
                  <label
                    htmlFor={itemId}
                    className="cursor-pointer pl-2 text-sm"
                  >
                    {action.name}
                  </label>
                </div>
              </div>
            );
          })}
        </div>
        {subConfig
          ? subConfig.map((config: any) => {
              return config?.actions?.length ? (
                <div className={styles["sub-action"]} key={config.key}>
                  <div className={styles["sub-action-title"]}>
                    {config.name}
                  </div>
                  <div className="flex flex-wrap gap-y-3">
                    {config.actions.map((action: any) => {
                      const itemValue = `${currentKey}|${action.key}`;
                      const itemId = `sub-action-${currentKey}-${action.key}`;
                      return (
                        <div className="w-[50%]" key={action.key}>
                          <div className="flex items-center">
                            <Checkbox
                              id={itemId}
                              checked={checkActionList.includes(itemValue)}
                              onCheckedChange={(checked) => {
                                const newList = checked
                                  ? [...checkActionList, itemValue]
                                  : checkActionList.filter(
                                      (v) => v !== itemValue,
                                    );
                                onChangeActions(newList);
                              }}
                            />
                            <label
                              htmlFor={itemId}
                              className="cursor-pointer pl-2 text-sm"
                            >
                              {action.name}
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null;
            })
          : null}
      </Empty>
    );
  }, [currentKey, state.uiPrivilege, searchText]);

  const handleCloseModal = useCallback(() => {
    setCurrentKey("");
    setSearchText("");
  }, []);

  const handleModalVisibleChange = useCallback(() => {
    setCurrentKey("");
  }, []);

  const privilegeSetModal = useMemo(() => {
    if (!currentKey) {
      return null;
    }

    const actions = state.uiPrivilege[currentKey]?.actions || [];

    return (
      <DialogBase
        title={intl.formatMessage({
          id: "edit.ui.auth",
          defaultMessage: "Modify UI Permissions",
        })}
        visible={!!currentKey}
        setVisible={handleModalVisibleChange}
        widthClassName="w-[600px]"
        onCancel={handleCloseModal}
        footer={
          <>
            <Button variant="link" onClick={handleCloseModal}>
              {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
            </Button>
            <Button variant="primary" onClick={handleCloseModal}>
              {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
            </Button>
          </>
        }
      >
        <div className={styles["card-content"]} style={STYLE_MODAL_CONTENT}>
          <Input
            style={STYLE_SEARCH_INPUT}
            placeholder={intl.formatMessage({
              id: "input.search.placeholder",
              defaultMessage: "Search",
            })}
            suffix={<Icon type="search" />}
            onChange={handleSearchChange}
          />
          <div className={styles["action-list"]}>
            {actions.length > 0 && (
              <>
                <div
                  className={styles["check-title"]}
                  style={STYLE_CHECK_TITLE}
                >
                  <div className="flex items-center">
                    <Checkbox
                      onCheckedChange={onCheckAllAction}
                      checked={
                        !!checkActionList.length &&
                        checkActionList.length < actions.length
                          ? "indeterminate"
                          : actionCheckedAll
                      }
                    />
                    <span
                      className={`${styles["action-name"]} cursor-pointer pl-2 text-sm`}
                    >
                      {intl.formatMessage({
                        id: "action",
                        defaultMessage: "Actions",
                      })}
                      <span className={styles["action-value"]}>
                        ({checkActionList.length}/{actions.length})
                      </span>
                    </span>
                  </div>
                </div>
                <div className={styles.item} style={STYLE_ACTION_GROUP}>
                  {getActionItem()}
                </div>
              </>
            )}
          </div>
        </div>
      </DialogBase>
    );
  }, [
    actionCheckedAll,
    checkActionList,
    currentKey,
    getActionItem,
    intl,
    onCheckAllAction,
    onChangeActions,
    searchRun,
    state.uiPrivilege,
    handleCloseModal,
    handleModalVisibleChange,
    handleSearchChange,
  ]);

  const onCheck = useCallback(
    (_keys: any, e: { checkedNodes: Array<{ key: string }> }) => {
      const newState = _.cloneDeep(state);
      const menuKeys = e.checkedNodes.map((item) => item.key);

      const removeKeys = _.difference(checkedKeys, menuKeys);
      const addKeys = _.difference(menuKeys, checkedKeys);

      removeKeys.forEach((key: string) => {
        if (newState?.uiPrivilege[key]) {
          newState.uiPrivilege[key].actions.forEach((action: Action) => {
            action.selected = false;
          });
          newState.uiPrivilege[key].views.forEach((view: any) => {
            view.selected = false;
          });
        }
      });

      addKeys.forEach((key: string) => {
        if (newState?.uiPrivilege[key]) {
          newState.uiPrivilege[key].actions.forEach((action: Action) => {
            action.selected = true;
          });
          newState.uiPrivilege[key].views.forEach((view: any) => {
            view.selected = true;
          });
        }
      });

      setCheckedKeys(menuKeys);
      setState({ ...newState, checkedKeys: menuKeys });
    },
    [checkedKeys, state],
  );

  return (
    <div className={styles["tree-contanier"]}>
      <div className={styles["card-content"]}>
        <Tree
          checkable
          showLine
          onCheck={onCheck}
          checkedKeys={checkedKeys}
          blockNode={true}
          switcherIcon={
            <Icon type="arrow-ios-down" style={STYLE_TREE_SWITCHER_ICON} />
          }
          treeData={treeData}
        />
      </div>
      {privilegeSetModal}
    </div>
  );
};

export default PrivilegeTree;

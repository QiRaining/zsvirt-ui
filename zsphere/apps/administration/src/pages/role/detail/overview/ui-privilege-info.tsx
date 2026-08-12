import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { DraggableCard } from "@zstack/zsphere-components";
import { getMenuTree } from "@zstack/zsphere-config";
import { DialogBase } from "@zstack/zsphere-design-biz";
import { ZsvRoleQueryType } from "@zstack/zsphere-types";
import type { ZsvRole as IZsvRole } from "@zstack/zsphere-types/graphql";
import { useDebounceFn } from "ahooks";
import { Input, Tree } from "antd";
import * as _ from "lodash-es";
import type { FC } from "react";
import { useCallback, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import {
  isVirtualMachineUserRole,
  isSodOrResourceViewerRole,
  buildPrivilegeTree,
  createKeyToMenuKeyMap,
} from "zsv_administration_shared/role/utils";

import EditConfig from "../../action/edit-config";
import Empty from "../../components/empty";
import { usePrivilegeBuilder } from "../../hooks/use-ui-privilege/use-privilege-builder";
import { useRoleFilterConfig } from "../../hooks/use-ui-privilege/use-role-filter-config";
import { useSubAction } from "../../hooks/use-ui-privilege/use-sub-action";

import styles from "./style.module.less";

const STYLE_MARGIN_BOTTOM_12 = { marginBottom: 12 } as const;
const STYLE_INPUT_SEARCH = {
  marginBottom: 18,
  width: "100%",
  maxWidth: "552px",
} as const;
const STYLE_ACTION_LIST = { maxHeight: 480, overflowY: "auto" } as const;
const STYLE_MARGIN_TOP_8 = { marginTop: "8px" } as const;
const STYLE_ICON_COLOR_NEUTRAL_600 = {
  color: "var(--neutral-600)",
  fontSize: "16px",
} as const;

interface IProps {
  detail: IZsvRole;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  refetch: () => void;
}

const UIPrivilegeInfo: FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed,
}) => {
  const intl = useIntl();
  const [editConfigVisible, setEditConfigVisible] = useState<boolean>(false);
  const [currentKey, setCurrentKey] = useState<string>("");
  const [currentTitle, setCurrentTitle] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");

  //获取菜单树和权限配置
  const menu = useMemo(() => getMenuTree("root", intl), [intl]);

  const { buildPrivilegeMap } = usePrivilegeBuilder();
  const { getSubAction } = useSubAction();
  const { filteredMenuKeys } = useRoleFilterConfig(detail);

  const keyToMenuKeyMap = useMemo(() => createKeyToMenuKeyMap(), []);
  const _isSodOrViewer = isSodOrResourceViewerRole(detail?.uuid as string);
  const _uiPrivilege = useMemo(
    () =>
      buildPrivilegeMap({
        roleUuid: detail?.uuid ?? "",
        isSodOrViewer: _isSodOrViewer,
      }),
    [buildPrivilegeMap, detail?.uuid, _isSodOrViewer],
  );

  /**
   * 将UI权限资源类型转换为菜单键
   * @param resourceType 资源类型
   * @returns 菜单键
   */
  const transformUiPrivilegeKeyToKey = (resourceType: string) => {
    for (const [key, value] of keyToMenuKeyMap.entries()) {
      if (value === resourceType) {
        return key;
      }
    }
    return resourceType;
  };

  /**
   * 处理角色的UI权限数据
   */
  const uiPrivilege = useMemo(() => {
    // 非预定义角色||虚拟机用户
    if (
      detail?.type !== ZsvRoleQueryType.Predefined ||
      isVirtualMachineUserRole(detail?.uuid)
    ) {
      return JSON.parse(detail?.uiPrivilege || "{}");
    }

    //转换预定义角色的权限键
    const transformedPrivilege = Object.entries(
      JSON.parse(detail?.uiPrivilege || "{}"),
    ).reduce(
      (acc, [key, value]) => {
        const newKey = transformUiPrivilegeKeyToKey(key);
        if (newKey) {
          if (!acc[newKey]) {
            // 如果这个 newKey 还不存在，创建一个新对象
            acc[newKey] = {
              resourceType: newKey,
              actionKey: newKey,
              viewKey: key,
              effect: (value as any).effect,
              views: [],
              actions: [],
            };
          }

          // 合并 views 和 actions
          acc[newKey].views = [
            ...new Set([...acc[newKey].views, ...((value as any).views || [])]),
          ];
          acc[newKey].actions = [
            ...new Set([
              ...acc[newKey].actions,
              ...((value as any).actions || []),
            ]),
          ];

          // 更新 effect，如果新的 value 有 effect
          if ((value as any).effect) {
            acc[newKey].effect = (value as any).effect;
          }
        }

        return acc;
      },
      {} as Record<string, any>,
    );

    return transformedPrivilege;
  }, [detail]);

  const { run: searchRun } = useDebounceFn(
    (inputVal: string) => {
      setSearchText(inputVal);
    },
    {
      wait: 200,
    },
  );

  const getActionItem = useCallback(() => {
    if (!currentKey) {
      return null;
    }

    //获取并过滤操作列表
    const actions = _.compact(
      _.cloneDeep(uiPrivilege?.[currentKey]?.actions)?.map((action: string) => {
        return _uiPrivilege[currentKey].actions.find(
          (item: any) => item.key === action,
        );
      }),
    ).filter((item: any) =>
      item.name.toLowerCase().includes(searchText.toLowerCase()),
    );

    //获取子操作配置
    let subConfig: any = getSubAction(currentKey);
    let subActionKeys: any = [];
    if (subConfig) {
      subConfig = _.keys(subConfig)
        ?.map((key: string) => {
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
        .filter((config: { name: string; actions: any[] }) => {
          // 检查 config.name 或其中的任何 action.name 是否匹配搜索文本
          return (
            config.name.toLowerCase().includes(searchText.toLowerCase()) ||
            config.actions.some((action: any) =>
              action.name.toLowerCase().includes(searchText.toLowerCase()),
            )
          );
        });
    }

    return (
      <Empty isSearching={!!searchText} dataSource={[...actions]}>
        <div className="flex flex-wrap gap-y-3" style={STYLE_MARGIN_BOTTOM_12}>
          {actions?.map((action: any) => (
            <div className="w-[50%]" key={action.name}>
              <div>{action.name}</div>
            </div>
          ))}
        </div>

        {subConfig?.map((config: any) => {
          return (
            config.actions.length > 0 && (
              <div className={styles["sub-action"]} key={config.key}>
                <div className={styles["sub-action-title"]}>{config.name}</div>
                <div className="flex flex-wrap gap-y-3">
                  {config.actions?.map((action: any) => (
                    <div className="w-[50%]" key={action.key}>
                      {action.name}
                    </div>
                  ))}
                </div>
              </div>
            )
          );
        })}
      </Empty>
    );
  }, [currentKey, getSubAction, searchText, uiPrivilege, _uiPrivilege]);

  const handleCloseModal = useCallback(() => {
    setCurrentKey("");
    setCurrentTitle("");
    setSearchText("");
  }, []);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      searchRun(event.target.value);
    },
    [searchRun],
  );

  const handleViewClick = useCallback(
    (event: React.MouseEvent<HTMLSpanElement>) => {
      const { menuKey, title } = event.currentTarget.dataset;

      if (menuKey) {
        setCurrentKey(menuKey);
      }

      if (title) {
        setCurrentTitle(title);
      }
    },
    [],
  );

  const handleEditConfigClick = useCallback(() => {
    setEditConfigVisible(true);
  }, []);

  const privilegeSetModal = useMemo(() => {
    if (!currentKey) {
      return null;
    }

    const currentUIPrivilege = _uiPrivilege[currentKey];
    const currentActions = uiPrivilege[currentKey]?.actions || [];

    const actionCount =
      currentUIPrivilege?.actions?.filter((action: any) =>
        currentActions.includes(action.key),
      )?.length || 0;

    return (
      <DialogBase
        key={currentKey}
        title={intl.formatMessage({
          id: "check.ui.auth",
          defaultMessage: "View UI Permissions",
        })}
        visible={!!currentKey}
        setVisible={handleCloseModal}
        widthClassName="w-[600px]"
        onCancel={handleCloseModal}
        footer={
          <Button variant="primary" onClick={handleCloseModal}>
            {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
          </Button>
        }
      >
        <div className={styles["card-content"]}>
          <Input
            style={STYLE_INPUT_SEARCH}
            placeholder={intl.formatMessage({
              id: "input.search.placeholder",
              defaultMessage: "Search",
            })}
            suffix={<Icon type="search" />}
            onChange={handleSearchChange}
          />

          {currentUIPrivilege?.actions?.length > 0 && (
            <div style={STYLE_ACTION_LIST}>
              <div className={styles["check-title"]} style={STYLE_MARGIN_TOP_8}>
                <div className={styles.rect} />
                <span className={styles["action-name"]}>
                  {intl.formatMessage({ id: "action", defaultMessage: "Actions" })}
                  ：
                  <span className={styles["action-value"]}>
                    ({actionCount}/{currentUIPrivilege.actions.length})
                  </span>
                </span>
              </div>
              <div className={styles["action-list"]}>{getActionItem()}</div>
            </div>
          )}
        </div>
      </DialogBase>
    );
  }, [currentKey, currentTitle, intl, handleCloseModal]);

  const getNodeTitle = useCallback(
    (node: any) => {
      const { menuKey } = node;

      if (!_uiPrivilege[menuKey]) {
        return null;
      }
      // SOD角色和只读角色不依赖服务端 uiPrivilege 数据，只需要 _uiPrivilege 有视图即可显示
      if (!_isSodOrViewer && !uiPrivilege[menuKey]) {
        return null;
      }

      const serverActions = uiPrivilege[menuKey]?.actions || [];

      const selectActionList = _uiPrivilege[menuKey].actions.filter(
        (action: any) => serverActions.indexOf(action.key) > -1,
      );

      const hasViews = _uiPrivilege[menuKey].views?.length > 0;
      const hasActions = _uiPrivilege[menuKey].actions?.some(
        (action: any) => serverActions.indexOf(action.key) > -1,
      );

      // 只要有视图权限或操作权限，就显示菜单项
      if (!hasViews && !hasActions) {
        return null;
      }

      return (
        <div className="flex">
          <div style={{ flex: 1 }}>{node.name}</div>
          {hasActions && (
            <div className={styles.description}>
              <span>
                {intl.formatMessage({ id: "action", defaultMessage: "Actions" })}
              </span>
              <span>
                ({selectActionList?.length}/
                {_uiPrivilege?.[menuKey]?.actions?.length})
              </span>
              <span className={styles.split}>|</span>
              <span
                className={styles.link}
                data-menu-key={menuKey}
                data-title={node.name}
                onClick={handleViewClick}
              >
                {intl.formatMessage({
                  id: "view",
                  defaultMessage: "View",
                })}
              </span>
            </div>
          )}
        </div>
      );
    },
    [_uiPrivilege, uiPrivilege, handleViewClick, intl, _isSodOrViewer],
  );

  const treeData = useMemo(
    () =>
      buildPrivilegeTree(menu, {
        filteredMenuKeys,
        getNodeTitle,
        isDashboardDisabled: false,
      }),
    [menu, filteredMenuKeys, getNodeTitle],
  );

  const memoizedSelectedList = useMemo<[IZsvRole]>(() => [detail], [detail]);

  return (
    <>
      <DraggableCard
        title={intl.formatMessage({
          id: "uiPrivilege",
          defaultMessage: "UI Permissions",
        })}
        isList
        onCollapseChange={onCollapseChange}
        collapsed={collapsed}
        titleActions={
          detail?.type === ZsvRoleQueryType.Predefined
            ? []
            : [
                {
                  icon: "edit",
                  onClick: handleEditConfigClick,
                  authKey: "virtualization.edit.config",
                  resource: "zsv.role",
                },
              ]
        }
      >
        <div className={styles["tree-contanier"]}>
          <Tree
            showLine={{ showLeafIcon: true }}
            blockNode={true}
            switcherIcon={
              <Icon
                type="arrow-ios-down"
                style={STYLE_ICON_COLOR_NEUTRAL_600}
              />
            }
            treeData={treeData}
          />
        </div>
      </DraggableCard>
      {privilegeSetModal}
      <EditConfig
        visible={editConfigVisible}
        setVisible={setEditConfigVisible}
        view=""
        position="header"
        selectedList={memoizedSelectedList}
      />
    </>
  );
};

export default UIPrivilegeInfo;

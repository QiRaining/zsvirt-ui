import { Button, Text, Tooltip, Divider } from "@zstack/design";
import { Icon } from "@zstack/icon";
import type { VMGroupDirectoryTree } from "@zstack/virtualization-resource/src/pages/directory/utils";
import CreateVM from "@zstack/virtualization-resource/src/pages/vm/create";
import { ResourceName, Tag, useAuth } from "@zstack/zsphere-components";
import { LeftNavType, NavView } from "@zstack/zsphere-types";
import { Dropdown, Menu } from "antd";
import type { DropDownProps } from "antd/es/dropdown";
import cls from "classnames";
import dayjs from "dayjs";
import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import { useIntl } from "react-intl";

import CreatGroup from "../action/create";
import DeleteGroup from "../action/delete";
import UpdateGroup from "../action/update";

import style from "./style.module.less";

const EMPTY_LIST: never[] = [];

const buttonPaddingStyle = { padding: "0 8px" } as const;

interface IProps {
  title: string;
  itemKey: string;
  level?: number;
  isSelected?: boolean;
  state?: string;
  status?: string;
  createDate?: string;
  vmCount?: number;
  width: number;
  groupName: string;
  zoneUuid: string;
  disabled?: boolean;
  // 开启右键菜单
  rightClickMenu?: boolean;
  //选择列表
  selectedList: VMGroupDirectoryTree[];
  nodeData: any;
  onDropdownVisibleChange?: DropDownProps["onVisibleChange"];
}

const TreeNodeTitle: React.FC<IProps> = ({
  title,
  groupName,
  itemKey,
  createDate,
  vmCount,
  width,
  zoneUuid,
  disabled,
  rightClickMenu,
  onDropdownVisibleChange,
  nodeData,
  selectedList,
}) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  const [modifyGroupNameVisible, setModifyGroupNameVisible] =
    useState<boolean>(false);
  const [createGroupVisible, setCreateGroupVisble] = useState<boolean>(false);
  const [createVMVisible, setCreateVMVisible] = useState<boolean>(false);
  const [deleteGroupVisible, setDeleteGroupVisble] = useState<boolean>(false);
  const divRef = useRef<HTMLDivElement>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  useEffect(() => {
    if (!disabled) {
      return;
    }
    const checkBox =
      divRef.current?.parentNode?.parentNode?.previousSibling?.firstChild;
    if (
      checkBox &&
      checkBox instanceof HTMLElement &&
      checkBox.classList.contains("ant-tree-checkbox-inner")
    ) {
      const handleMouseEnter = () => setTooltipVisible(true);
      const handleMouseLeave = () => setTooltipVisible(false);
      checkBox.addEventListener("mouseenter", handleMouseEnter);
      checkBox.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        checkBox.removeEventListener("mouseenter", handleMouseEnter);
        checkBox.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [disabled]);

  const level = groupName.split("/").length;

  const canCreateSubGroup = hasAuth({
    authKey: "virtualization.create.sub.directory",
    resource: "vm.dir.group",
    type: "action",
  });
  const canCreateVM = hasAuth({
    authKey: "virtualization.create.vm",
    resource: "vm.dir.group",
    type: "action",
  });
  const canEdit = hasAuth({
    authKey: "edit",
    resource: "vm.dir.group",
    type: "action",
  });
  const canDelete = hasAuth({
    authKey: "delete",
    resource: "vm.dir.group",
    type: "action",
  });
  const hasAnyAction = canCreateSubGroup || canCreateVM || canEdit || canDelete;

  const current = useMemo(
    () => ({
      title,
      groupName,
      createDate,
      vmCount,
      width,
      zoneUuid,
      key: itemKey,
      uuid: itemKey,
      type: "default",
      name: title,
      __typename: "VMGroupDirectory",
    }),
    [createDate, groupName, itemKey, title, vmCount, width, zoneUuid],
  );
  const selectedListCurrent = useMemo(() => [current], [current]);
  const selectedListNodeData = useMemo(() => [nodeData], [nodeData]);
  const menuTitleEle = useMemo(() => {
    let operationObj = {
      modeText: "",
      contentText: "",
    };

    if (selectedList.length > 1) {
      operationObj = {
        modeText: intl.formatMessage({
          id: "operation.modeText.multiple",
          defaultMessage: "Batch Operations",
        }),
        contentText: intl.formatMessage(
          {
            id: "operation.modeText.multiple.contentText",
            defaultMessage: "{num} objects",
          },
          {
            num: selectedList?.length,
          },
        ),
      };
    } else {
      const item = selectedList?.[0] ?? {};

      operationObj = {
        modeText: intl.formatMessage({
          id: "operation.modeText.single",
          defaultMessage: "Operation",
        }),
        contentText: item.name ?? item.uuid,
      };
    }

    return (
      <Menu.Item key="menu-title" className={style.menuTitle}>
        <div className="flex items-center gap-2">
          <span className={style["menu-title-operation-mode"]}>
            <Text>{operationObj.modeText}</Text>
          </span>
          <Divider className={style["menu-title-divider"]} type="vertical" />
          <span className={style["menu-title-operation-content"]}>
            <Text>{operationObj.contentText}</Text>
          </span>
        </div>
      </Menu.Item>
    );
  }, [selectedList, intl]);
  const menuContentEle = useCallback(
    (byRowRightClick = false) => {
      if (selectedList.length === 1 || !byRowRightClick) {
        return (
          <>
            {/* 最深层级，无法再创建分组 */}
            {canCreateSubGroup &&
              (level === 3 ? (
                <Menu.Item key="create-sub-group-disabled" disabled>
                  <Tooltip
                    placement="left"
                    title={intl.formatMessage({
                      id: "group.deepest.limit",
                      defaultMessage:
                        "Could not create sub-groups now. Only three levels of hierarchy are supported.",
                    })}
                  >
                    {intl.formatMessage({
                      id: "create.sub.group",
                      defaultMessage: "Create Sub Group",
                    })}
                  </Tooltip>
                </Menu.Item>
              ) : (
                <Menu.Item
                  key="create-sub-group"
                  onClick={({ domEvent }) => {
                    domEvent.stopPropagation(); //阻止冒泡
                    setCreateGroupVisble(true);
                  }}
                >
                  {intl.formatMessage({
                    id: "create.sub.group",
                    defaultMessage: "Create Sub Group",
                  })}
                </Menu.Item>
              ))}
            {/* 主节点 只支持创建分组 */}
            {itemKey !== "-1" && (
              <>
                {canCreateVM && (
                  <Menu.Item
                    key="create-vm"
                    onClick={() => {
                      setCreateVMVisible(true);
                    }}
                  >
                    {intl.formatMessage({
                      id: "create.vm",
                      defaultMessage: "New Virtual Machine",
                    })}
                  </Menu.Item>
                )}
                {canEdit && (
                  <Menu.Item
                    key="modify-group-name"
                    onClick={() => setModifyGroupNameVisible(true)}
                  >
                    {intl.formatMessage({
                      id: "modify.group.name",
                      defaultMessage: "Edit Name",
                    })}
                  </Menu.Item>
                )}
                {canDelete && (
                  <Menu.Item
                    key="delete-group"
                    onClick={() => setDeleteGroupVisble(true)}
                  >
                    {intl.formatMessage({
                      id: "delete.vm.group",
                      defaultMessage: "Delete Group",
                    })}
                  </Menu.Item>
                )}
              </>
            )}
          </>
        );
      }
      if (selectedList.length > 1) {
        return canDelete ? (
          <Menu.Item
            key="delete-group-multiple"
            onClick={() => setDeleteGroupVisble(true)}
          >
            {intl.formatMessage({
              id: "delete.vm.group",
              defaultMessage: "Delete Group",
            })}
          </Menu.Item>
        ) : null;
      }
      return <></>;
    },
    [
      selectedList,
      intl,
      level,
      current,
      canCreateSubGroup,
      canCreateVM,
      canEdit,
      canDelete,
    ],
  );

  const actionMenu = useCallback(
    (byRowRightClick = false) => {
      return (
        <Menu>
          {byRowRightClick && menuTitleEle}
          {menuContentEle(byRowRightClick)}
        </Menu>
      );
    },
    [menuContentEle, menuTitleEle],
  );

  return (
    <Dropdown
      onVisibleChange={onDropdownVisibleChange}
      overlay={actionMenu(true)}
      trigger={["contextMenu"]}
      disabled={disabled || !rightClickMenu || !hasAnyAction}
      overlayClassName={style["dropdown-width-160"]}
    >
      <div
        className={cls(style.treeTitleContainer, {
          [style.disabled]: !!disabled,
        })}
        data-key={itemKey}
        ref={divRef}
      >
        {disabled && (
          <div className={style.tooltipWrapper}>
            <Tooltip
              title={intl.formatMessage({
                id: "vm.group.default.checkbox.notSupported",
                defaultMessage: "Default groups do not support checking and operating...",
              })}
              placement="top"
              open={tooltipVisible}
            >
              <div className={style.tooltipAnchor} />
            </Tooltip>
          </div>
        )}
        <div className={style.titleContainer}>
          <Icon type="folder" />
          <ResourceName
            value={
              itemKey === "-2"
                ? intl.formatMessage({
                    id: "virtualization.default.dir",
                    defaultMessage: "Default Group",
                  })
                : title
            }
            link={{
              to: `/directory`,
              microAppName: "virtualization-resource",
              uuid: itemKey === "-2" ? `-2${zoneUuid}` : current?.uuid,
              leftnav: LeftNavType.ClusterHost,
              navView: NavView.Group,
            }}
          />
          {itemKey === "-2" && (
            <Tag round level="weak">
              {intl.formatMessage({
                id: "default",
                defaultMessage: "Default",
              })}
            </Tag>
          )}
        </div>
        <div style={{ width: (width - 80) * 0.3 }}>{vmCount}</div>
        <div style={{ width: (width - 80) * 0.3 }}>
          {itemKey === "-2"
            ? "-"
            : dayjs(createDate).format("YYYY-MM-DD HH:mm:ss")}
        </div>
        <div className={style.action}>
          {hasAnyAction && (
            <Dropdown
              overlay={actionMenu(false)}
              trigger={["click"]}
              placement="bottomRight"
              disabled={disabled}
            >
              {disabled ? (
                <Tooltip
                  placement="left"
                  title={intl.formatMessage({
                    id: "vm.group.default.action.notSupported",
                    defaultMessage: "Default groups do not support checking and operation..",
                  })}
                >
                  <span>
                    <Button
                      size="small"
                      style={buttonPaddingStyle}
                      disabled
                      icon={<Icon type="more-horizontal" />}
                    />
                  </span>
                </Tooltip>
              ) : (
                <Button
                  variant="secondary"
                  size="small"
                  style={buttonPaddingStyle}
                  icon={<Icon type="more-horizontal" />}
                />
              )}
            </Dropdown>
          )}
        </div>
        {/**Action List**/}
        <UpdateGroup
          visible={modifyGroupNameVisible}
          setVisible={setModifyGroupNameVisible}
          selectedList={selectedListCurrent}
        />
        <CreatGroup
          visible={createGroupVisible}
          setVisible={setCreateGroupVisble}
          selectedList={selectedListCurrent}
        />
        <DeleteGroup
          visible={deleteGroupVisible}
          setVisible={setDeleteGroupVisble}
          selectedList={selectedListNodeData}
        />
        <CreateVM
          visible={createVMVisible}
          setVisible={setCreateVMVisible}
          source={current}
          selectedList={EMPTY_LIST}
          view=""
          position="header"
        />
      </div>
    </Dropdown>
  );
};

export default TreeNodeTitle;

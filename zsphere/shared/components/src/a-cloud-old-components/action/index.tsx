import { InfoPopover } from "@zstack/design";
import { Icon, type IconTypes } from "@zstack/icon";
import { IActionRef } from "@zstack/zsphere-types";
import { usePersistFn } from "ahooks";
import {
  Divider as AntdDivider,
  Button,
  Dropdown,
  DropDownProps,
  Menu,
  Space,
  Tooltip,
} from "antd";
import cls from "classnames";
import { produce } from "immer";
import { eq, isEmpty, isFunction } from "lodash-es";
import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { useIntl } from "react-intl";

import { getBaseCls } from "../../_utils/common";
import Auth, { useAuth } from "../auth";
import { getTooltip } from "../field/horizontal/index";
import { useNotSupportedAction } from "../modal/action/hooks";
import Text from "../text";
import { useMenu } from "./hooks";
import type {
  IActionProps,
  IFlatActionMap,
  IMenuItem,
  IViewMapKey,
} from "./type";
import {
  cloneDeep,
  findAuthByKey,
  getActiveKeys,
  initFlatActionMap,
  mergeActionMap,
  verifyAll,
} from "./utils";

import "./style.less";

const baseCls = getBaseCls("action");

function Action<T>(
  props: IActionProps<T>,
  ref: React.ForwardedRef<IActionRef>,
) {
  const {
    menuList = [],
    viewMap,
    view: _view,
    selectedList,
    source,
    setSelectedList,
    refetch,
    extraKeys,
    activeKeys,
    position: _position = "toolbar",
    resource,
    byRowRightClick = false,
  } = props;

  const intl = useIntl();
  const { hasAuth } = useAuth();
  const [suffixIcon, setSuffixIcon] = useState<IconTypes>("arrow-ios-down");
  const view = isFunction(_view) ? _view(selectedList) : _view;

  const position = view.startsWith("select") ? undefined : _position;

  const viewMapKey = position ? `${view}/${position}` : view;

  const keys = useMemo(() => {
    if (Array.isArray(extraKeys)) {
      return extraKeys;
    }

    if (extraKeys === false) {
      return [];
    }

    const { extraKeys: e = [] } = viewMap?.[viewMapKey as IViewMapKey] ?? {};

    return e;
  }, [viewMap, viewMapKey, extraKeys]);

  const computedActiveKeys = useMemo(() => {
    let aKeys = getActiveKeys({
      menuList,
      view,
      activeKeys,
      viewMap,
      extraKeys: keys,
      position,
    });

    // table 右键菜单加入 “独立外置” 操作
    if (byRowRightClick) {
      aKeys = aKeys.concat(keys);
    }

    return aKeys.filter((authKey) =>
      hasAuth(
        findAuthByKey(authKey, menuList! as any) ?? {
          type: "action",
          authKey,
          resource,
        },
      ),
    );
  }, [
    menuList,
    view,
    activeKeys,
    viewMap,
    keys,
    position,
    hasAuth,
    resource,
    byRowRightClick,
  ]);

  const computedExtraKeys = keys;

  const initFlatAction = useMemo(
    () =>
      initFlatActionMap({
        menuList,
        keys: computedExtraKeys,
        source,
      }),
    [menuList, computedExtraKeys, source],
  );
  // useRef 保留首次校验状态
  const initFlatActionRef = useRef<IFlatActionMap<T>>();

  const [flatActionMap, setFlatActionMap] =
    useState<IFlatActionMap<T>>(initFlatAction);

  const userClickRef = useRef<boolean>(false);

  const isDestroyedRef = useRef<boolean>(false);

  useEffect(() => {
    setFlatActionMap(initFlatAction);
  }, [view]);

  const [verifyKey, reVerify] = useReducer((x) => x + 1, 0);

  useImperativeHandle(ref, () => ({
    reVerify: () => reVerify(),
  }));

  const performValidate = usePersistFn(() => {
    if (userClickRef.current) {
      userClickRef.current = false;
      return;
    }

    const isInitFlatActionChange = initFlatActionRef.current !== initFlatAction;

    if (isInitFlatActionChange) {
      initFlatActionRef.current = initFlatAction;
    }

    // 当前校验需要基于上次校验（防止已渲染过的组件被错误卸载）
    const flatActionMapComputed = isInitFlatActionChange
      ? mergeActionMap(initFlatAction, flatActionMap)
      : flatActionMap;

    isDestroyedRef.current = false;

    verifyAll(flatActionMapComputed, selectedList).then((newFlatActionMap) => {
      // 组件销毁时，停止异步执行
      if (!isDestroyedRef.current) {
        setFlatActionMap(newFlatActionMap);
      }
    });
  });

  useEffect(() => {
    performValidate();

    return () => {
      isDestroyedRef.current = true;
    };
  }, [initFlatAction, performValidate, selectedList, verifyKey]);

  const extraFlatActionMap = useMemo(
    () =>
      Object.entries(flatActionMap).reduce<IFlatActionMap<T>>(
        (prev, [key, value]) =>
          computedExtraKeys.includes(key) ? { ...prev, [key]: value } : prev,
        {},
      ),
    [flatActionMap, computedExtraKeys],
  );

  const { getSkipModal } = useNotSupportedAction();

  const [skipModal, renderSkipModal] = useState<React.ReactNode>();
  const [originSelectedList, setOriginSelectedList] = useState<T[]>([]);

  const renderOperation = useMemo(() => {
    if (byRowRightClick) return null;

    const isRow = position === "row";

    const actions = Object.entries(extraFlatActionMap).map(([key, action]) => {
      const disabled = action?.disabled || !action?.preValid || !action?.valid;
      const auth = {
        type: "action" as const,
        resource,
        authKey: key,
        ...action?.auth,
      };

      const wrapperTooltip = (ele: React.ReactNode) => {
        const disabledToolTipProps = getTooltip(
          typeof action?.tooltip === "function"
            ? action?.tooltip({ disabled, source, selectedList })
            : action?.tooltip,
        );
        if (
          disabled &&
          disabledToolTipProps &&
          (selectedList?.length || action.defaultShowTooltip)
        )
          return (
            <Tooltip {...disabledToolTipProps} key={key}>
              {ele}
            </Tooltip>
          );
        return ele;
      };

      const onClick = async () => {
        if (disabled) {
          return;
        }

        // toolbar 点击前设置有效选择
        if (action.validators && position === "toolbar") {
          const newSelectedList: T[] = [];
          const notSupportedList: T[] = [];

          for (const item of selectedList) {
            const promiseArray = action.validators.map((validator) =>
              validator(item, action.source, selectedList),
            );

            const results = await Promise.all(promiseArray);
            const valid = results.reduce(
              (result, current) => result && current,
              true,
            );

            if (valid) {
              newSelectedList.push(item);
            } else {
              notSupportedList.push(item);
            }
          }

          if (action.notSupportedModal && notSupportedList.length) {
            let { notSupportedModal } = action;
            if (isFunction(notSupportedModal)) {
              notSupportedModal = notSupportedModal(selectedList, source);
            }

            const { SkipModal, isContinue } = getSkipModal({
              ...notSupportedModal,
              notSupportedList,
            } as any);

            const modal = <SkipModal visible />;

            renderSkipModal(modal);
            await isContinue().finally(() =>
              renderSkipModal(React.cloneElement(modal, { visible: false })),
            );
          }

          if (setSelectedList) {
            // 用户点击按钮，改写 selectedList，不会触发校验
            userClickRef.current = true;
            setSelectedList?.(newSelectedList);
          }

          action?.onClick?.({
            setSelectedList,
            selectedList: newSelectedList,
            refetch,
            source,
          });
        } else {
          action?.onClick?.({ setSelectedList, selectedList, refetch, source });
        }

        setOriginSelectedList(selectedList);
        setFlatActionMap(
          produce((draft) => {
            draft[action.key].visible = true;
            draft[action.key].shouldRender = true;
          }),
        );
      };

      if (disabled && action?.trigger === "hide") {
        return null;
      }

      if (action.extraRender) {
        return (
          <Auth key={key} {...auth}>
            <span key={key}>
              {action.extraRender({
                disabled,
                source,
                selectedList,
                onClick,
                position,
              })}
            </span>
          </Auth>
        );
      }

      if (isRow) {
        return action.icon ? (
          <Auth key={key} {...auth}>
            <Tooltip title={action.name} key={key}>
              <span>
                <Icon
                  data-testid={`action-${action.key}`}
                  type={action.icon}
                  onClick={onClick}
                  className={
                    disabled ? `${baseCls}-icon-disabled` : `${baseCls}-icon`
                  }
                />
              </span>
            </Tooltip>
          </Auth>
        ) : (
          <Auth key={key} {...auth}>
            {wrapperTooltip(
              <Button
                key={key}
                data-testid={`action-${action.key}`}
                type="text"
                onClick={onClick}
                disabled={disabled}
                className={`${baseCls}-text-btn`}
              >
                {action.name}
              </Button>,
            )}
          </Auth>
        );
      }

      return (
        <Auth key={key} {...auth}>
          {wrapperTooltip(
            <Button
              key={key}
              onClick={onClick}
              disabled={disabled}
              className={`${baseCls}-btn`}
              data-testid={`action-${action.key}`}
              type={
                view?.indexOf("main") > -1 && action.primary
                  ? "primary"
                  : "default"
              }
            >
              {action.icon && (
                <Icon style={action?.iconStyle} key={key} type={action.icon} />
              )}
              {action.name}
            </Button>,
          )}
        </Auth>
      );
    });
    let size: number;

    if (isRow) {
      size = 3;
    } else {
      size = 4;
    }

    return (
      <Space
        size={size}
        style={{ marginRight: isRow ? 3 : 8 }}
        className={`${baseCls}-btn-container`}
      >
        {actions}
      </Space>
    );
  }, [
    extraFlatActionMap,
    getSkipModal,
    position,
    refetch,
    resource,
    selectedList,
    setSelectedList,
    source,
    view,
    byRowRightClick,
  ]);

  const renderButton = useMemo(() => {
    if (position === "row" && !byRowRightClick) {
      return (
        <Button size="small" className={`${baseCls}-icon-btn`}>
          <Icon type="more-horizontal" />
        </Button>
      );
    }

    if (position === "directory" || byRowRightClick) return <div />;

    let actionBtnName = intl.formatMessage({
      id: "batchAction",
      defaultMessage: "Actions",
    });
    if (position === "header")
      actionBtnName =
        computedExtraKeys?.length > 0
          ? intl.formatMessage({
              id: "moreAction",
              defaultMessage: "Actions",
            })
          : intl.formatMessage({ id: "action", defaultMessage: "Actions" });
    return (
      <Button className={`${baseCls}-dropdown-btn`} data-testid="action-more">
        {actionBtnName}
        <Icon type={suffixIcon} />
      </Button>
    );
  }, [position, intl, suffixIcon]);

  const setVisibleMapRef = useRef<{
    [key: string]: (visible: boolean) => void;
  }>({});

  const renderActionWrappers = useMemo(
    () =>
      Object.entries(extraFlatActionMap).map(([key, item]) => {
        if (!setVisibleMapRef.current![key]) {
          setVisibleMapRef.current![key] = (visible: boolean) => {
            setFlatActionMap(
              produce((draft) => {
                draft[key].visible = visible;
              }),
            );
          };
        }
        const setVisible = setVisibleMapRef.current?.[key];
        if (item.ActionWrapper && item.shouldRender) {
          return (
            <item.ActionWrapper
              key={key}
              view={view}
              selectedList={selectedList}
              setSelectedList={setSelectedList}
              refetch={refetch}
              source={source}
              visible={item.visible}
              position={position!}
              setVisible={setVisible}
              reVerify={reVerify}
              originSelectedList={originSelectedList}
            />
          );
        }

        return null;
      }),
    [
      extraFlatActionMap,
      view,
      selectedList,
      setSelectedList,
      refetch,
      source,
      position,
      originSelectedList,
    ],
  );

  const actionInner = useMemo(() => {
    if (!computedActiveKeys?.length) {
      return;
    }

    // cloud 中 computedActiveKeys 为 1 ，且 position 不等于 row 和 directory 时。已显示到 extraKeys 中。
    if (
      position === "row" ||
      position === "directory" ||
      computedActiveKeys?.length > 0
    ) {
      return (
        <ActionInner
          {...props}
          verifyKey={verifyKey}
          reVerify={reVerify}
          extraKeys={computedExtraKeys}
          setSuffixIcon={setSuffixIcon}
        >
          {renderButton}
        </ActionInner>
      );
    }
  }, [
    props,
    computedActiveKeys,
    position,
    computedExtraKeys,
    renderButton,
    verifyKey,
  ]);

  return (
    <>
      {extraKeys !== false && (
        <>
          {renderOperation}
          {renderActionWrappers}
          {skipModal}
        </>
      )}
      {actionInner}
    </>
  );
}

function ActionInner<T>(
  props: IActionProps<T> & {
    children?: React.ReactNode;
    extraKeys: string[];
    verifyKey: number;
    reVerify: () => void;
    setSuffixIcon: Function;
    align?: DropDownProps["align"];
    onPopupAlign?: (elem: HTMLElement) => void;
  },
) {
  const {
    menuList,
    viewMap,
    view: _view,
    selectedList,
    setSelectedList,
    refetch,
    source,
    placement = "bottomLeft",
    children,
    extraKeys,
    activeKeys,
    resource,
    getPopupContainer,
    verifyKey,
    position: _position = "toolbar",
    reVerify,
    verifyPolicy = "once",
    visible,
    setSuffixIcon,
    byRowRightClick = false,
    align,
    onPopupAlign,
    getItemName,
  } = props;

  const intl = useIntl();

  const view = isFunction(_view) ? _view(selectedList) : _view;

  const position = view.startsWith("select") ? undefined : _position;

  const computedActiveKeys = useMemo(() => {
    const result = getActiveKeys({
      menuList,
      view,
      activeKeys,
      viewMap,
      extraKeys,
      position,
    });
    // table 右键菜单加入 “独立外置” 操作
    if (byRowRightClick) {
      return result.concat(extraKeys);
    }
    return result;
  }, [
    menuList,
    view,
    activeKeys,
    viewMap,
    extraKeys,
    position,
    byRowRightClick,
  ]);

  const initFlatAction = useMemo(
    () =>
      initFlatActionMap({
        menuList,
        keys: computedActiveKeys,
        source,
      }),
    [menuList, computedActiveKeys, source],
  );

  const initFlatActionRef = useRef<IFlatActionMap<T>>();

  const [flatActionMap, setFlatActionMap] =
    useState<IFlatActionMap<T>>(initFlatAction);
  const userClickRef = useRef<boolean>(false);
  const isDropdownVisibleRef = useRef<boolean>(false);
  const isDestroyedRef = useRef<boolean>(false);
  const selectedListRef = useRef<T[]>(selectedList);
  const isValidateRef = useRef<boolean>(false);

  const { menu: newMenuList, someAuth } = useMenu({
    position,
    computedActiveKeys,
    menuList,
    resource,
    byRowRightClick,
  });

  useEffect(() => {
    setFlatActionMap(initFlatAction);
  }, [view]);

  const performValidate = usePersistFn(
    (_initFlatAction = initFlatAction, _selectedList = selectedList) => {
      if (!isDropdownVisibleRef.current && !visible) {
        return;
      }

      if (userClickRef.current) {
        userClickRef.current = false;
        return;
      }

      // 如果已经校验过一次且selectedList没有发生改变的话且校验策略为仅校验一次
      // 则跳过校验
      if (
        isValidateRef.current &&
        eq(selectedListRef.current, _selectedList) &&
        verifyPolicy === "once"
      ) {
        return;
      }
      selectedListRef.current = _selectedList;
      isValidateRef.current = true;

      const isInitFlatActionChange = !eq(
        initFlatActionRef.current,
        _initFlatAction,
      );

      if (isInitFlatActionChange) {
        initFlatActionRef.current = _initFlatAction;
      }

      const flatActionMapComputed = isInitFlatActionChange
        ? mergeActionMap(_initFlatAction, flatActionMap)
        : flatActionMap;

      isDestroyedRef.current = false;
      verifyAll(flatActionMapComputed, _selectedList).then(
        (newFlatActionMap) => {
          if (!isDestroyedRef.current) {
            setFlatActionMap(newFlatActionMap);
          }
        },
      );
    },
  );

  /*
      因点击Dropdown后， performValidate()进行了整体的一次校验且只校验一次。使flatActionMap有了校验信息。
      切换语言后， initFlatAction中英文会改变，但不会包含上一次的校验逻辑，不能直接使用setFlatActionMap()
      initFlatActionRef :不包含校验逻辑，initFlatAction与initFlatActionRef对比后，可以得出不包含逻辑校验的相应属性。
    */

  useEffect(() => {
    const isInitFlatActionChange = eq(
      initFlatActionRef.current,
      initFlatAction,
    );

    if (!isInitFlatActionChange && initFlatActionRef.current) {
      const newFlatActionMap = cloneDeep(flatActionMap);

      Object.keys(initFlatAction).forEach((key) => {
        if (!eq(initFlatActionRef.current?.[key], initFlatAction[key])) {
          const currentAction = initFlatActionRef.current?.[key];
          const newAction = initFlatAction[key];
          if (currentAction && newAction) {
            Object.keys(currentAction).forEach((it) => {
              const prop = it as keyof typeof currentAction;
              if (currentAction[prop] !== newAction[prop]) {
                (newFlatActionMap[key] as Record<string, any>)[prop] =
                  newAction[prop];
              }
            });
          }
        }
      });

      setFlatActionMap(newFlatActionMap);
    }
  }, [intl]);

  useEffect(() => {
    performValidate(cloneDeep(initFlatAction), cloneDeep(selectedList));
    return () => {
      isDestroyedRef.current = true;
    };
  }, [initFlatAction, performValidate, selectedList, visible]);

  useEffect(() => {
    isValidateRef.current = false;
  }, [verifyKey]);

  const { getSkipModal } = useNotSupportedAction();

  const [skipModal, renderSkipModal] = useState<JSX.Element>();
  // skip 会修改 SelectedList ，保存原来的 SelectedList
  const [originSelectedList, setOriginSelectedList] = useState<T[]>([]);

  const renderActions = useCallback(
    (actions: Array<IMenuItem<T>>): any[] => {
      if (!isEmpty(flatActionMap)) {
        return actions.reduce<any[]>((prev, item: IMenuItem<T>) => {
          const wrapperDivider = (menuItem: any) => {
            const result: any[] = [];

            // 如果 divider 为 true 且 name 存在，添加元素
            if (item.divider && item.name) {
              result.push(menuItem);
            }
            // 如果 divider 为 false，添加元素
            else if (!item.divider) {
              result.push(menuItem);
            }
            // 如果 divider 为 true 但 name 不存在，不添加元素（只添加 divider）

            // 如果 divider 为 true，添加分割线
            if (item.divider) {
              result.push({
                type: "divider",
                key: `${item.key}-divider`,
                className: `${baseCls}-divider`,
              });
            }

            return [...prev, ...result];
          };

          const description =
            typeof item.description === "function"
              ? item.description({ selectedList, source })
              : item.description;

          if (item.children?.length) {
            if (!someAuth(item.children)) {
              return prev;
            }

            let subMenuLabel: React.ReactNode = <Text value={item.name} />;

            if (description) {
              const subMenuDescription = (
                <span
                  className={`${baseCls}-description-icon`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <InfoPopover
                    content={getTooltip(description).title as React.ReactNode}
                  />
                </span>
              );

              subMenuLabel = (
                <Text value={item.name}>
                  <Space>
                    {item.name}
                    {subMenuDescription}
                  </Space>
                </Text>
              );
            }

            return wrapperDivider({
              key: item.key,
              label: subMenuLabel,
              children: renderActions(item.children),
              popupClassName: `${baseCls}-sub-menu`,
              className: `${baseCls}-menu-item`,
            });
          }

          const descriptionTooltip = description ? (
            <span
              onClick={(e) => e.stopPropagation()}
              style={{ display: "flex", alignItems: "center" }}
            >
              <span
                className={`${baseCls}-description-icon`}
                onClick={(e) => e.stopPropagation()}
              >
                <InfoPopover
                  content={getTooltip(description).title as React.ReactNode}
                />
              </span>
            </span>
          ) : null;

          const action = flatActionMap[item.key];

          const disabled =
            action?.disabled || !action?.preValid || !action?.valid;

          const auth = {
            type: "action" as const,
            resource,
            authKey: item.key,
            ...item?.auth,
          };

          const onClick = async () => {
            if (disabled) {
              return;
            }

            // toolbar 点击前设置有效选择
            if (action.validators && position === "toolbar") {
              const newSelectedList: T[] = [];
              const notSupportedList: T[] = [];

              for (const it of selectedList) {
                const promiseArray = action.validators.map((validator) =>
                  validator(it, action.source, selectedList),
                );

                const results = await Promise.all(promiseArray);
                const valid = results.reduce(
                  (result, current) => result && current,
                  true,
                );

                if (valid) {
                  newSelectedList.push(it);
                } else {
                  notSupportedList.push(it);
                }
              }

              if (action.notSupportedModal && notSupportedList.length) {
                let { notSupportedModal } = action;
                if (isFunction(notSupportedModal)) {
                  notSupportedModal = notSupportedModal(selectedList, source);
                }
                const { SkipModal, isContinue } = getSkipModal({
                  ...notSupportedModal,
                  notSupportedList,
                } as any);

                const modal = <SkipModal visible />;

                renderSkipModal(modal);

                await isContinue().finally(() =>
                  renderSkipModal(
                    React.cloneElement(modal, { visible: false }),
                  ),
                );
              }

              if (setSelectedList) {
                // 用户点击按钮，改写 selectedLst，不会触发校验
                userClickRef.current = true;
                setSelectedList?.(newSelectedList);
              }
              action?.onClick?.({
                setSelectedList,
                selectedList: newSelectedList,
                refetch,
                source,
              });
            } else {
              action?.onClick?.({
                setSelectedList,
                selectedList,
                refetch,
                source,
              });
            }

            setOriginSelectedList(selectedList);
            setFlatActionMap(
              produce((draft) => {
                draft[action.key].visible = true;
                draft[action.key].shouldRender = true;
              }),
            );
          };

          // 显示 tooltip
          if (item.extraRender) {
            return wrapperDivider({
              key: item.key,
              label: (
                <Auth key={item.key} {...auth}>
                  {item.extraRender({
                    disabled,
                    source,
                    selectedList,
                    onClick,
                    position,
                  })}
                </Auth>
              ),
            });
          }

          if (disabled) {
            if (action?.trigger === "hide") {
              return prev;
            }

            const tooltipProps = getTooltip(
              typeof item.tooltip === "function"
                ? item.tooltip({
                    disabled,
                    source,
                    selectedList,
                  })
                : item.tooltip,
            );

            return wrapperDivider({
              key: item.key,
              disabled: true,
              className: `${baseCls}-menu-item`,
              label: (
                <Auth key={item.key} {...auth}>
                  <Tooltip
                    placement={item.tooltipPlacement || "topRight"}
                    {...tooltipProps}
                    arrowPointAtCenter
                  >
                    {descriptionTooltip ? (
                      <span>{item.name}</span>
                    ) : (
                      <div>{item.name}</div>
                    )}
                  </Tooltip>
                  {descriptionTooltip}
                </Auth>
              ),
            });
          }

          return wrapperDivider({
            key: item.key,
            className: `${baseCls}-menu-item`,
            onClick,
            label: (
              <Auth key={item.key} {...auth}>
                <Text value={item.name}>
                  <>
                    {item.name}
                    {descriptionTooltip}
                  </>
                </Text>
              </Auth>
            ),
          });
        }, []);
      }

      return [];
    },
    [
      flatActionMap,
      getSkipModal,
      position,
      refetch,
      resource,
      selectedList,
      setSelectedList,
      someAuth,
      source,
    ],
  );

  const menuTitleItem = useMemo(() => {
    if (!byRowRightClick && position !== "row" && position !== "header")
      return null;

    let operationObj: {
      modeText: React.ReactNode;
      contentText: React.ReactNode;
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
      const item = (selectedList?.[0] ?? {}) as T as any;

      operationObj = {
        modeText: intl.formatMessage({
          id: "operation.modeText.single",
          defaultMessage: "Operation",
        }),
        contentText: getItemName ? getItemName(item) : (item.name ?? item.uuid),
      };
    }

    const key = "menu-item-title";

    return {
      key: `action-${key}`,
      className: `${baseCls}-menu-item-title`,
      label: (
        <div style={{ width: "100%", display: "flex" }}>
          <div className={`${baseCls}-menu-title-operation-mode`}>
            {operationObj.modeText}
          </div>
          <AntdDivider
            key={`${key}-divider`}
            className={`${baseCls}-operation-divider`}
            type="vertical"
          />
          <div className={`${baseCls}-menu-title-operation-content`}>
            {operationObj.contentText}
          </div>
        </div>
      ),
    };
  }, [byRowRightClick, selectedList, intl, getItemName, position]);

  const menuItems = useMemo(() => {
    const items = renderActions(newMenuList);
    if (menuTitleItem) {
      return [menuTitleItem, ...items];
    }
    return items;
  }, [newMenuList, renderActions, menuTitleItem]);

  const renderMenu = useMemo(
    () => (
      <Menu
        className={`${baseCls}-menu`}
        expandIcon={<Icon type="arrow-ios-right" />}
        items={menuItems}
      />
    ),
    [menuItems],
  );

  const renderActionWrappers = useMemo(
    () =>
      Object.entries(flatActionMap).map(([key, item]) => {
        if (item.ActionWrapper && item.shouldRender) {
          return (
            <item.ActionWrapper
              key={key}
              view={view}
              selectedList={selectedList}
              originSelectedList={originSelectedList}
              setSelectedList={setSelectedList}
              refetch={refetch}
              source={source}
              visible={item.visible}
              position={position!}
              setVisible={(visible: boolean) => {
                // 关闭 modal 时 恢复箭头指向
                if (!visible) {
                  setSuffixIcon("arrow-ios-down");
                }

                setFlatActionMap(
                  produce((draft) => {
                    draft[key].visible = visible;
                  }),
                );
              }}
              reVerify={reVerify}
            />
          );
        }

        return null;
      }),
    [
      flatActionMap,
      view,
      selectedList,
      originSelectedList,
      setSelectedList,
      refetch,
      source,
      position,
      reVerify,
      setSuffixIcon,
    ],
  );

  if (!newMenuList.length) {
    return null;
  }

  return (
    <>
      <Dropdown
        dropdownRender={() => renderMenu}
        trigger={["click"]}
        className={cls(`${baseCls}-dropdown`)}
        overlayClassName={cls({
          [`${baseCls}-dropdown-width-320`]: byRowRightClick,
        })}
        placement={placement}
        {...(position === "directory" || byRowRightClick
          ? {
              open: visible,
            }
          : {})}
        onOpenChange={(_visible: boolean) => {
          isDropdownVisibleRef.current = _visible;
          performValidate();
          props?.setSuffixIcon(_visible ? "arrow-ios-up" : "arrow-ios-down");
        }}
        getPopupContainer={(...params) => {
          const ele = getPopupContainer?.(...params);

          if (ele) {
            return ele;
          }

          return (
            document.getElementById("zstack-header-detail") || document.body
          );
        }}
        align={align}
        onPopupAlign={onPopupAlign}
      >
        {children}
      </Dropdown>
      {renderActionWrappers}
      {skipModal}
    </>
  );
}

// forwardRef会吞掉泛型,我们需要使用类型断言恢复类型推导
export default forwardRef(Action) as <T>(
  props: IActionProps<T> & { ref?: ForwardedRef<IActionRef> },
) => ReturnType<typeof Action>;

export {
  LicenseActionConfigProvider,
  useActionByLicense,
  useLicenseAction,
} from "./license";

export type { IActionProps, IMenuItem } from "./type";

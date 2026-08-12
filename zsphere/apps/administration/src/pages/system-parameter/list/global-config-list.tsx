import { Icon } from "@zstack/icon";
import type { ListItem } from "@zstack/zsphere-components";
import { DetailNavLayout, List, Switch } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import type {
  GlobalConfig as IGlobalConfig,
  UpdateGlobalConfigPayload,
} from "@zstack/zsphere-types/graphql";
import cls from "classnames";
import * as _ from "lodash-es";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { useLocation } from "react-router";

import { EditComponents } from "../edit-components";
import { i18nConfig } from "./util";

import style from "./style.module.less";

interface IProps {
  globalConfigValueMap: { [key: string]: IGlobalConfig };
  globalConfigList: any[];
  ok: (payloadList: UpdateGlobalConfigPayload[], configName?: string) => void;
  layout?: (pageList: IPageList[]) => React.ReactNode | IPageList[];
  readOnly?: boolean;
}

interface IPageList {
  key: string;
  name: string | React.ReactNode;
  showTitle: boolean;
  page: React.ReactElement;
}

interface IConfigActionLinkProps {
  inputType: string;
  mergeKey?: string;
  mergeKeyList?: string[];
  globalConfigItemMap: { [key: string]: any };
  globalConfigValueMap: { [key: string]: IGlobalConfig };
  configKey: string;
  setCurrItem: React.Dispatch<React.SetStateAction<any>>;
  setActionType: React.Dispatch<React.SetStateAction<string>>;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const ConfigActionLink: React.FC<IConfigActionLinkProps> = ({
  inputType,
  mergeKey,
  mergeKeyList,
  globalConfigItemMap,
  globalConfigValueMap,
  configKey,
  setCurrItem,
  setActionType,
  setVisible,
}) => {
  const handleActionClick = useCallback(() => {
    if (mergeKey) {
      setCurrItem(
        _.map(mergeKeyList || [], (itKey) => ({
          ..._.get(globalConfigItemMap, itKey),
          formItem: {
            ..._.get(globalConfigItemMap, [itKey, "formItem"]),
            ..._.get(globalConfigValueMap, itKey),
          },
          key: itKey,
        })),
      );
    } else {
      setCurrItem({
        ..._.get(globalConfigItemMap, configKey),
        formItem: {
          ..._.get(globalConfigItemMap, [configKey, "formItem"]),
          ..._.get(globalConfigValueMap, [configKey]),
        },
        key: configKey,
      });
    }
    setActionType(inputType);
    setVisible(true);
  }, [
    configKey,
    globalConfigItemMap,
    globalConfigValueMap,
    inputType,
    mergeKey,
    mergeKeyList,
    setActionType,
    setCurrItem,
    setVisible,
  ]);

  return (
    <div
      className={`w-[50%] ${style["action-link"]}`}
      onClick={handleActionClick}
    >
      {inputType === "Switch" ? (
        <Switch
          size="small"
          checked={_.get(globalConfigValueMap, [configKey, "value"]) === "true"}
        />
      ) : (
        <Icon type="edit" style={STYLE_ICON} />
      )}
    </div>
  );
};

const STYLE_ICON = { cursor: "pointer", height: 16, width: 16 } as const;

const GlobalConfigList: React.FC<IProps> = ({
  globalConfigValueMap,
  globalConfigList,
  ok,
  layout,
  readOnly,
}) => {
  const intl = useIntl();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state?: { highlightedItemKey?: string };
  };
  const [visible, setVisible] = useState<boolean>(false);
  const [currItem, setCurrItem] = useState<any>(null);
  const [actionType, setActionType] = useState<string>("");
  const genEditComponent = EditComponents();

  const Com = _.get(
    genEditComponent,
    actionType,
    null,
  ) as React.ComponentType<any> | null;

  const globalConfigItemMap = useMemo(() => {
    return _.reduce(
      globalConfigList || [],
      (obj, it) => {
        // 虚拟化的key都加了virtualization
        const _key = _.replace(it.key, "virtualization.", "");

        obj[_key] = it;

        return obj;
      },
      {} as { [key: string]: any },
    );
  }, [globalConfigList]);

  const getValue = (
    key: string,
    {
      componentProps,
      translateValue,
      mergeKey,
      mergeKeyList,
      selectList,
      unitList,
    }: {
      componentProps?: any;
      translateValue?: Function;
      mergeKey?: string;
      mergeKeyList?: string[];
      selectList?: string[];
      unitList?: string[];
    },
  ) => {
    if (
      !!mergeKey &&
      mergeKeyList &&
      mergeKeyList?.length > 0 &&
      translateValue
    ) {
      return translateValue(
        _.map(mergeKeyList, (_key) => ({
          ..._.get(globalConfigValueMap, _key),
          formItem: _.get(globalConfigItemMap, [_key, "formItem"]),
        })),
      );
    }

    if (translateValue) {
      return translateValue(_.get(globalConfigValueMap, [key, "value"]), {
        componentProps,
        selectList,
        unitList,
      });
    }

    return _.get(globalConfigValueMap, [key, "value"]);
  };

  const { pageList } = useMemo<{ pageList: IPageList[] }>(() => {
    const pageListMap = {} as { [key: string]: IPageList };

    const firstSecondCategoryKeyMap = {} as { [key: string]: string[] };
    const secondCategoryKeyInfo = {} as { [key: string]: string };
    const configListMap = {} as { [key: string]: ListItem[] };
    // 标记有merge key 的配置，分类的时候取一条即可。
    const mergeKeyFlag = {} as { [key: string]: boolean };

    for (const globalConfig of globalConfigList) {
      // 虚拟化的key都加了virtualization
      const _key = _.replace(globalConfig.key, "virtualization.", "");
      // N条全局配置合并成一条
      const mergeKey = _.get(globalConfig, "mergeKey");
      const mergeKeyList = _.compact(_.split(mergeKey, "||"));
      // 呈现给用户的值需要转换一下
      const translateValue = _.get(globalConfig, [
        "formItem",
        "translateValue",
      ]);
      // 选择列表
      const selectList = _.get(globalConfig, ["formItem", "selectList"], []);
      // 下拉列表
      const unitList = _.get(globalConfig, ["formItem", "unitList"], []);
      // 操作弹窗类型
      const inputType = _.get(globalConfig, ["formItem", "inputType"]);
      const componentProps = _.get(globalConfig, [
        "formItem",
        "componentProps",
      ]);

      const cfg = i18nConfig[globalConfig.key] ?? {};

      if (!firstSecondCategoryKeyMap[globalConfig.firstCategoryKey]) {
        firstSecondCategoryKeyMap[globalConfig.firstCategoryKey] = [
          globalConfig.secondCategoryKey,
        ];
      } else {
        firstSecondCategoryKeyMap[globalConfig.firstCategoryKey].push(
          globalConfig.secondCategoryKey,
        );
      }

      secondCategoryKeyInfo[globalConfig.secondCategoryKey] =
        globalConfig.secondCategory;

      if (!configListMap[globalConfig.secondCategoryKey]) {
        if (mergeKey) {
          mergeKeyFlag[mergeKey] = true;
        }
        configListMap[globalConfig.secondCategoryKey] = [
          {
            className: cls({
              "highlighted-item":
                globalConfig.key === location.state?.highlightedItemKey,
            }),
            label: globalConfig.name,
            icon: "info",
            iconTooltip: (
              <ReactMarkdown>
                {cfg.getDescription
                  ? cfg.getDescription(intl)
                  : globalConfig.description}
              </ReactMarkdown>
            ),
            value: (
              <div className="flex">
                <div className={!readOnly ? "w-[50%]" : "w-full"}>
                  {getValue(_key, {
                    componentProps,
                    translateValue,
                    mergeKey,
                    mergeKeyList,
                    selectList,
                    unitList,
                  })}
                </div>
                {!readOnly && (
                  <ConfigActionLink
                    inputType={inputType}
                    mergeKey={mergeKey}
                    mergeKeyList={mergeKeyList}
                    globalConfigItemMap={globalConfigItemMap}
                    globalConfigValueMap={globalConfigValueMap}
                    configKey={_key}
                    setCurrItem={setCurrItem}
                    setActionType={setActionType}
                    setVisible={setVisible}
                  />
                )}
              </div>
            ),
          },
        ];
      } else if (!mergeKeyFlag[mergeKey]) {
        if (mergeKey) {
          mergeKeyFlag[mergeKey] = true;
        }
        configListMap[globalConfig.secondCategoryKey].push({
          className: cls({
            "highlighted-item":
              globalConfig.key === location.state?.highlightedItemKey,
          }),
          label: globalConfig.name,
          icon: "info",
          iconTooltip: (
            <ReactMarkdown>
              {cfg.getDescription
                ? cfg.getDescription(intl)
                : globalConfig.description}
            </ReactMarkdown>
          ),
          value: (
            <div className="flex">
              <div className={!readOnly ? "w-[50%]" : "w-full"}>
                {getValue(_key, {
                  componentProps,
                  translateValue,
                  mergeKey,
                  mergeKeyList,
                  selectList,
                  unitList,
                })}
              </div>
              {!readOnly && (
                <ConfigActionLink
                  inputType={inputType}
                  mergeKey={mergeKey}
                  mergeKeyList={mergeKeyList}
                  globalConfigItemMap={globalConfigItemMap}
                  globalConfigValueMap={globalConfigValueMap}
                  configKey={_key}
                  setCurrItem={setCurrItem}
                  setActionType={setActionType}
                  setVisible={setVisible}
                />
              )}
            </div>
          ),
        });
      }

      pageListMap[globalConfig.firstCategoryKey] = {
        key: globalConfig.firstCategoryKey,
        name: globalConfig.firstCategory,
        showTitle: true,
        page: <></>,
      };
    }

    _.forEach(_.keys(firstSecondCategoryKeyMap), (firstCategoryKey) => {
      const secondCategoryKeys = _.uniq(
        _.get(firstSecondCategoryKeyMap, firstCategoryKey),
      );

      pageListMap[firstCategoryKey].page = (
        <div className={style.configLit} key={firstCategoryKey}>
          {_.map(secondCategoryKeys, (secondCategoryKey) => {
            return (
              <div
                className={style.config}
                key={secondCategoryKey}
                id={_.snakeCase(secondCategoryKey)}
              >
                <div className={style.configTitle}>
                  {_.get(secondCategoryKeyInfo, secondCategoryKey)}
                </div>
                <List
                  key={`${firstCategoryKey}.${secondCategoryKey}`}
                  list={_.get(configListMap, secondCategoryKey, [])}
                />
              </div>
            );
          })}
        </div>
      );
    });

    return {
      pageList: _.values(pageListMap) as IPageList[],
    };
  }, [globalConfigList, intl, location.state?.highlightedItemKey, !readOnly]);

  useEffect(() => {
    const scrollToAnchor = () => {
      // 锚点定位
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);

      if (element) {
        element.scrollIntoView({
          behavior: "auto",
          block: "end",
          inline: "nearest",
        });
      }
    };

    if (location.hash) {
      scrollToAnchor();
    }
  }, [location]);

  // 初始化配置页面时，依据映射表是否为空对象判断全局配置数据是否响应成功
  // 因为接口响应约 1.6s，需加 loading 遮罩，避免用户看到空数据状态
  const isGlobalConfigDataInitDone = _.isEmpty(globalConfigValueMap);

  const layoutEle = useMemo(() => {
    if (isGlobalConfigDataInitDone) {
      return null;
    }

    const ele = layout?.(pageList);
    const isElement = React.isValidElement(ele);
    const layoutPageList = (
      isElement ? pageList : ele || pageList
    ) as IPageList[];

    const _layout = isElement ? (
      ele
    ) : (
      <DetailNavLayout pageList={layoutPageList as unknown as IPageList[]} />
    );

    return (
      <>
        {Com && (
          <Com
            setVisible={setVisible}
            visible={visible}
            currItem={currItem}
            ok={ok}
          />
        )}
        {_layout}
      </>
    );
  }, [
    Com,
    setVisible,
    visible,
    currItem,
    ok,
    isGlobalConfigDataInitDone,
    pageList,
    layout,
  ]);

  return (
    <AutoSkeleton name="system-parameter" loading={isGlobalConfigDataInitDone}>
      {layoutEle}
    </AutoSkeleton>
  );
};

export default React.memo(GlobalConfigList);

import { usePersistFn } from "ahooks";
import cls from "classnames";
import { isNil } from "lodash-es";
import React from "react";

import { getBaseCls } from "../_utils/common";
import {
  AuthInfoContext,
  useAuthInfoContext,
  useRouterByAuth,
} from "../a-cloud-old-components/auth";
import { usePersistTabState } from "../a-cloud-old-components/tabs-2/hooks/use-persist-tab-store";
import Text from "../a-cloud-old-components/text/index";

import "./style.less";
import type { IDetailNavLayout } from "./type";

const baseCls = getBaseCls("detail-nav-layout");

const DetailNavLayout: React.FC<IDetailNavLayout> = ({
  pageList,
  className,
  cacheConfig,
}) => {
  // 以下是猥琐解法，这里写的时候我自己都笑了
  // 需求是这个Jira
  // 经过研究之后发现原有的useRouterByAuth存state会带上search参数，所以每到一个新的详情页自然是不同的state
  // 所以就没法利用路由缓存把用户上次点的给缓存下来
  // usePersistTabState缓存的时候是不带search参数的，自然可以满足需求，但是又丢失了权限控制
  // 又要缓存，又要权限控制。于是只好综合起来用了。
  // todo: 搞一个支持权限控制又支持路由控制的钩子

  // 这种有意思的注释，真是太棒了
  const {
    activeKey: __activeKey,
    onChange,
    hasAuth,
  } = useRouterByAuth(pageList);

  const { activeKey: _activeKey, onChange: _onChange } = usePersistTabState(
    cacheConfig?.contentId || "",
    pageList,
  );

  const persistOnChange = usePersistFn(_onChange);

  const pageListFiltered = pageList.filter((page) =>
    page?.auth ? hasAuth(page.auth) : true,
  );

  // 这里计算activeKey，先看看有没有缓存，并判断一下有没有权限，有的话就取，没的话就用Auth算出来的
  // 因为缓存的key只能通过onChange来获得，只要用户没权限，那自然没法点过去，那权限控制自然是有用的
  const activeKey = (() => {
    if (
      cacheConfig &&
      _activeKey &&
      pageListFiltered.find((p) => p.key === _activeKey)
    ) {
      return _activeKey;
    }
    return __activeKey;
  })();

  const current = React.useMemo(
    () => pageList.find((page) => page.key === activeKey),
    [activeKey, pageList],
  );

  const { value } = useAuthInfoContext(activeKey);

  const leftNav = React.useMemo(() => {
    return pageListFiltered.map((page) => {
      return (
        <div
          key={page.key}
          onClick={() => {
            cacheConfig && persistOnChange(page.key);
            onChange(page.key);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              cacheConfig && persistOnChange(page.key);
              onChange(page.key);
            }
          }}
          role="none"
          tabIndex={0}
          className={cls(`${baseCls}-nav-item`, {
            [`${baseCls}-nav-item-active`]: page.key === activeKey,
          })}
        >
          <div className={cls(`${baseCls}-nav-item-option`)}>
            <span className={cls(`${baseCls}-nav-item-option-title`)}>
              <Text
                value={page.name as string}
                ellipsis={true}
                tooltipProps={{ title: page.name }}
                tooltipPlacement={"right"}
              />
            </span>
            {!isNil(page.count) ? <span>{page.count}</span> : null}
          </div>
        </div>
      );
    });
  }, [activeKey, pageListFiltered, cacheConfig, persistOnChange, onChange]);

  return (
    <div className={cls(baseCls, className)}>
      <div className={`${baseCls}-nav`}>{leftNav}</div>
      <div className={cls(`${baseCls}-panel`, current?.className)}>
        {(current?.showTitle || current?.actions) && (
          <div className={`${baseCls}-panel-title-container`}>
            <div className={`${baseCls}-panel-title-container-name`}>
              {current.name}
            </div>
            <div className={`${baseCls}-panel-title-container-action`}>
              {current?.actions}
            </div>
          </div>
        )}
        <AuthInfoContext.Provider value={value}>
          {current?.page}
        </AuthInfoContext.Provider>
      </div>
    </div>
  );
};

export default DetailNavLayout;

import { Affix, Menu } from "antd";
import cls from "classnames";
import type { CSSProperties } from "react";
import React, { useCallback, useMemo, useState } from "react";

import { getBaseCls } from "../_utils/common";
import Auth, {
  AuthInfoContext,
  useAuthInfoContext,
  useRouterByAuth,
} from "../a-cloud-old-components/auth";
import Text from "../a-cloud-old-components/text";

import "./style.less";
import type { IDetailNavPage, IPageGroup, IPageProps } from "./type";

const { Item, ItemGroup } = Menu;

const baseCls = getBaseCls("detail-nav");

const DetailNav: React.FC<IPageProps> = ({ className, pageList }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const list = pageList.reduce<Array<IDetailNavPage>>((prev, group) => {
    prev.push(...(group.children ?? []));
    return prev;
  }, []);

  const { activeKey, onChange, hasAuth } = useRouterByAuth(list);

  const current = useMemo(
    () => list.find((page) => page.key === activeKey),
    [activeKey, list],
  );
  const { value } = useAuthInfoContext(activeKey);
  const [isFixed, setIsFixed] = useState(false);
  const [fixedStyle, setFixedStyle] = useState<CSSProperties>({});
  // 如果当前组件没有被展示出来则不触发Affix的固定效果,防止组件闪烁
  const isDisplay = useCallback(() => {
    if (!ref.current) return false;
    const { width, height } = ref.current.getBoundingClientRect();
    return width !== 0 && height !== 0;
  }, []);
  const onFixedChange = useCallback((affixed: boolean | undefined) => {
    setIsFixed(!!affixed);
    if (affixed) {
      setTimeout(() => {
        const { height: containerHeight = 0 } =
          (
            document.querySelector("#layout-content") as HTMLElement
          )?.getBoundingClientRect() ?? {};
        const { height: menuHeight = 0 } =
          ref.current
            ?.querySelector(`.${baseCls}-menu-fixed`)
            ?.getBoundingClientRect() ?? {};

        if (!menuHeight || !containerHeight) return;
        if (containerHeight < menuHeight) {
          setFixedStyle((p) => ({
            ...p,
            height: `${containerHeight}px`,
            minHeight: "unset",
          }));
        }
      }, 0);
    } else {
      setFixedStyle({});
    }
  }, []);

  return (
    <div className={cls(baseCls, className)} ref={ref}>
      {/**
       * document.querySelector('#layout-content')属于和zstack业务强绑定了
       * 如果没有这个元素，则不会触发affix的滚动监听
       * 把它放到全局的ConfigProvider里作为一个配置项可能会更通用一些
       */}
      <Affix
        onChange={onFixedChange}
        target={() =>
          isDisplay()
            ? (document.querySelector("#layout-content") as HTMLElement)
            : null
        }
      >
        <div
          style={fixedStyle}
          className={cls(`${baseCls}-menu`, isFixed && `${baseCls}-menu-fixed`)}
        >
          <Menu selectedKeys={[activeKey]} {...({} as any)}>
            {pageList.map((group: IPageGroup) => {
              if (
                !group.children.some(({ auth }) =>
                  auth ? hasAuth(auth) : true,
                )
              ) {
                return null;
              }

              return (
                <ItemGroup key={group.key} title={group.name}>
                  {group.children.map((page: IDetailNavPage) => {
                    const ele = (
                      <Item
                        className={`${baseCls}-item`}
                        key={page.key}
                        onClick={() => onChange(page.key)}
                      >
                        <div className={`${baseCls}-link`}>
                          <Text value={page.name}>{page.name}</Text>
                        </div>
                        <span className={`${baseCls}-count`}>
                          <Text value={page.count}>{page.count}</Text>
                        </span>
                      </Item>
                    );

                    return page.auth ? (
                      <Auth
                        key={page.key}
                        type={page.auth.type}
                        authKey={page.auth.authKey}
                        resource={page.auth.resource}
                      >
                        {ele}
                      </Auth>
                    ) : (
                      ele
                    );
                  })}
                </ItemGroup>
              );
            })}
          </Menu>
        </div>
      </Affix>
      {/* <Divider className={`${baseCls}-divider`} type="vertical" /> */}
      <div className={`${baseCls}-page`}>
        {current?.showTitle && (
          <div className={`${baseCls}-title`}>{current.name}</div>
        )}
        <div className="main-list-panel">
          <AuthInfoContext.Provider value={value}>
            {current?.page}
          </AuthInfoContext.Provider>
        </div>
      </div>
    </div>
  );
};

export default DetailNav;
export type { IDetailNavPage, IPageGroup };

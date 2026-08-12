import type { DocumentNode } from "@apollo/client";
import { useApolloClient } from "@apollo/client";
import type { Item } from "@zstack/zsphere-types";
import { get, isFunction } from "lodash-es";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import type { IActionProps, IMenuItem } from "../a-cloud-old-components/action";
import Action from "../a-cloud-old-components/action";

import "./style.less";

export type ActionProps<T, U extends Item = Item> = Omit<
  IActionProps<T, U>,
  "viewMap" | "menuList" | "selectedList" | "view" | "defaultQuery"
> & {
  children: React.ReactNode;
  getContainer?: () => HTMLDivElement;
  actionConfig: {
    [propName: string]: ActionConfig<T, U>;
  };
  view: string | ((selecedList: T[], resourcetype: string) => string);
  defaultQuery?: any;
};

type ActionConfig<T, U extends Item = Item> = {
  viewMap: Pick<IActionProps<T, U>, "viewMap">;
  list: Array<Omit<IMenuItem<T, U>, "key"> & { key: any }>;
  gql?: DocumentNode;
  queryKey?: string;
};

function ActionWrapper<T extends Item>({
  children,
  getContainer = undefined,
  actionConfig,
  view: _view,
  defaultQuery,
  ...props
}: ActionProps<T>) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [currentConfig, setCurrentConfig] = useState<any>({
    menuList: [],
    viewMap: {},
  });
  const [currentType, setCurrentType] = useState<any>("");
  const [selectedList, setSelectedList] = useState<Item[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const apolloClient = useApolloClient();

  const rootContainer = useMemo(() => {
    if (getContainer) return getContainer();
    return document.body;
  }, [getContainer]);

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });

  const handleClickOutside = useCallback(
    (event: any) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setVisible(false);
      }
    },
    [containerRef],
  );

  const getTypeNode: any = (node: any) => {
    const type = node?.getAttribute?.("data-type");
    const key = node?.getAttribute?.("data-key");
    return type && key ? { type, key } : getTypeNode(node?.parentNode);
  };

  const onContextMenu = async (event: any) => {
    const resource = getTypeNode(event.target);
    if (resource) {
      setPosition({ x: event.clientX, y: event.clientY });
      const config = actionConfig?.[resource.type];
      setCurrentConfig({
        menuList: config?.list ?? [],
        viewMap: config?.viewMap ?? {},
      });
      setCurrentType(resource.type);

      const dq = defaultQuery?.[resource.type as any];

      const _gql = config?.gql;
      const queryKey = config?.queryKey ?? "uuid";
      if (_gql) {
        const { data } = await apolloClient.query({
          query: _gql,
          variables: {
            conditions: [
              {
                key: queryKey,
                value: resource.key,
              },
            ],
            ...dq,
          },
          errorPolicy: "ignore",
        });
        const list = get(Object.values(data)?.[0], "list", []);
        setSelectedList(list);
      } else
        setSelectedList([
          {
            [queryKey]:
              resource?.type === "root-node"
                ? window.location.hostname
                : resource.key,
          },
        ]);
      setVisible(true);
    }
  };
  const view = isFunction(_view)
    ? (resourceList: any) => _view(resourceList, currentType)
    : _view;

  const actionElemet = createPortal(
    <div
      className="action-container"
      key={`${position.x}${position.y}`}
      style={{ top: `${position.y}px`, left: `${position.x}px` }}
      ref={containerRef}
    >
      <Action
        {...props}
        {...currentConfig}
        getPopupContainer={() => document.body}
        selectedList={selectedList}
        source={selectedList?.[0]}
        visible={visible}
        view={view}
        placement="bottomLeft"
        byRowRightClick
        align={{
          overflow: {
            adjustX: true,
            adjustY: false,
          },
        }}
        onPopupAlign={(elem: HTMLElement) => {
          const top = parseInt(elem.style.top, 10);
          const bottom = window.innerHeight - top - elem.clientHeight;
          if (bottom < 20 && containerRef.current) {
            containerRef.current.style.transform = `translate(0,${
              bottom - 20
            }px)`;
          }
        }}
      />
    </div>,
    rootContainer,
  );

  return (
    <div onContextMenu={onContextMenu}>
      {children}
      {actionElemet}
    </div>
  );
}

export default ActionWrapper;

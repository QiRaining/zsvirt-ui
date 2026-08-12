import type { DocumentNode } from "@apollo/client";
import { useApolloClient, gql } from "@apollo/client";
import { Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { IconState } from "@zstack/zsphere-components";
import type { ActionTaskResult } from "@zstack/zsphere-types/graphql";
import { getNeutralColor } from "@zstack/zsphere-utils";
import React, { useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import type { Subject } from "rxjs";
import { filter } from "rxjs/operators";

import type { TreeResourceType } from "../../utils";
import { getName } from "../utils";

import style from "./style.module.less";

const resourceWithStateList = [
  "vm",
  "host",
  "backup-storage",
  "primary-storage",
  "baremetal-instance",
  "baremetal-chassis",
];

const iconStateColor = getNeutralColor("light", 400) as any;

const iconTypeMap = new Map([
  ["zone", "building"],
  ["cluster", "server-1"],
  ["host", "disk-2"],
  ["vm", "monitor"],
  ["l2-network", "server-4"],
  ["l3-network", "d-portgroup"],
  ["backup-storage", "server"],
  ["primary-storage", "storage"],
  ["root-node", "editor"],
  ["directory", "folder"],
  ["vm-template", "file-paste"],
  ["baremetal-cluster", "server-1"],
  ["baremetal-instance", "monitor"],
  ["baremetal-chassis", "server-2"],
]);

interface IProps {
  title: string;
  titleNode?: React.ReactNode;
  itemKey: string;
  level?: number;
  isSelected?: boolean;
  type?: TreeResourceType;
  state?: string;
  iconType?: string;
  extra?: React.ReactNode;
}

const TreeNodeTitle: React.FC<IProps> = React.memo(
  ({
    title,
    titleNode,
    itemKey,
    state: iconState,
    iconType,
    type = "vm",
    extra,
  }) => {
    //对应的资源状态
    const intl = useIntl();

    const icon = useMemo(() => {
      if (iconType) {
        return <Icon type={iconType as any} width={16} />;
      }

      const mappedIconType = iconTypeMap.get(type);
      if (!mappedIconType) {
        return null;
      }

      return resourceWithStateList.includes(type) ? (
        <IconState
          state={iconState as any}
          color={iconStateColor}
          resourceKey={mappedIconType as any}
          size={16}
        />
      ) : (
        <Icon type={mappedIconType as any} />
      );
    }, [iconType, type, iconState]);

    const treeTitle = useMemo(
      () => getName(intl, { key: itemKey, name: title, title }),
      [intl, itemKey, title],
    );

    return (
      <div
        className={style.treeTitleContainer}
        data-type={type}
        data-key={itemKey}
      >
        <div className={style.titlePart}>
          {icon}
          <div className={style.title}>
            <Text>{(titleNode as any) ?? treeTitle}</Text>
          </div>
        </div>
        {extra}
      </div>
    );
  },
);

TreeNodeTitle.displayName = "TreeNodeTitle";

export default TreeNodeTitle;

interface IResourceTreeNodeTitle extends IProps {
  transform: (data: unknown) => string | undefined;
  query: DocumentNode;
}

export const ResourceTreeNodeTitle = React.memo(function ResourceTreeNodeTitle({
  transform,
  query,
  ...props
}: IResourceTreeNodeTitle) {
  const { state: initState, itemKey } = props;
  const [state, setState] = useState(initState);

  useEffect(() => {
    setState(initState);
  }, [initState]);

  const apolloClient = useApolloClient();
  useEffect(() => {
    const sub = apolloClient
      .watchQuery({
        query,
        variables: { uuid: itemKey },
        errorPolicy: "ignore",
        fetchPolicy: "cache-only",
      })
      .subscribe(({ data }) => {
        if (!data) {
          return;
        }
        const newState = transform(data);
        if (newState) {
          setState(newState);
        }
      });
    return () => sub.unsubscribe();
  }, [apolloClient, itemKey, query]);

  // 监听 action 的 progress 事件，补偿 writeFragment({ broadcast: false }) 不触发 watchQuery 的问题。
  // 批量操作（如开机）通过 middleState 和 WebSocket 推送更新 Apollo 缓存时使用了 broadcast: false，
  // 导致上方的 watchQuery({ fetchPolicy: "cache-only" }) 无法感知缓存变化。
  // 这里通过订阅 progress 事件，在匹配当前节点 uuid 时主动从缓存中读取最新的 state。
  //
  useEffect(() => {
    const actionRespSubject = (window as any).g_action_subscribe as Subject<{
      data: ActionTaskResult;
      type: "progress" | "finish";
    }>;
    if (!actionRespSubject) {
      return;
    }

    const sub = actionRespSubject
      .pipe(
        filter(
          ({ data, type: eventType }) =>
            eventType === "progress" &&
            data.id === itemKey &&
            !!data.fields?.includes("state"),
        ),
      )
      .subscribe(({ data }) => {
        try {
          // writeFragment 使用 __typename + uuid 作为缓存 key，
          // 这里用 readFragment 直接按 entity 读取，不依赖 query 层的缓存
          const typename = data.type;
          if (!typename) {
            return;
          }
          const cached = apolloClient.readFragment({
            id: apolloClient.cache.identify({
              __typename: typename,
              uuid: itemKey,
            }),
            fragment: gql`
              fragment TreeNodeState on ${typename} {
                state
              }
            `,
          });
          if (cached?.state) {
            setState(cached.state);
          }
        } catch {
          // 缓存未命中时忽略
        }
      });
    return () => sub.unsubscribe();
  }, [apolloClient, itemKey]);

  return <TreeNodeTitle {...props} state={state} />;
});

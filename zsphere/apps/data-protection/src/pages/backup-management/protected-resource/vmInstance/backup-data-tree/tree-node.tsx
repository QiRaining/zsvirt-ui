import type { DocumentNode } from "@apollo/client";
import { useApolloClient } from "@apollo/client";
import { Text } from "@zstack/design";
import { IconState } from "@zstack/zsphere-components";
import { getNeutralColor } from "@zstack/zsphere-utils";
import React, { useState, useEffect } from "react";

import style from "./style.module.less";

const iconStateColor = getNeutralColor("light", 400) as any;

interface IProps {
  title: string;
  titleNode?: React.ReactNode;
  itemKey: string;
  level?: number;
  isSelected?: boolean;
  state?: string;
  extra?: React.ReactNode;
}

const TreeNodeTitle: React.FC<IProps> = React.memo(
  ({ title, titleNode, itemKey, state: iconState, extra }) => {
    return (
      <div
        className={style.treeTitleContainer}
        data-type="vm"
        data-key={itemKey}
      >
        <div className={style.titlePart}>
          <IconState
            state={iconState as any}
            color={iconStateColor}
            resourceKey="monitor"
            size={16}
          />
          <div className={style.treeNodeTitle}>
            <Text>{(titleNode as any) ?? title}</Text>
          </div>
        </div>
        {extra}
      </div>
    );
  },
);

TreeNodeTitle.displayName = "TreeNodeTitle";

interface IResourceTreeNodeTitle extends IProps {
  transform: (data: unknown) => string | undefined;
  query: DocumentNode;
}

export function ResourceTreeNodeTitle({
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

  return <TreeNodeTitle {...props} state={state} />;
}

export default TreeNodeTitle;

import { gql, useApolloClient, useMutation, useQuery } from "@apollo/client";
import { Checkbox, Tooltip } from "@zstack/design";
import { usePageStateStore } from "@zstack/hooks";
import { Icon } from "@zstack/icon";
import { useCommandInfo } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import { genUuid } from "@zstack/zsphere-utils";
import { Popover, Tabs } from "antd";
import { produce } from "immer";
import React, { useMemo, useCallback } from "react";
import { useIntl } from "react-intl";
import { useNavigate, useLocation } from "react-router";
import { sprintf } from "sprintf-js";

import { LeftNavType, NavView } from "../types";

import style from "./style.module.less";

const QueryPersonalizationConfig = gql`
  query queryPersonalizationConfig(
    $profileType: ProfileType!
    $resourceType: String!
  ) {
    queryPersonalizationConfig(
      profileType: $profileType
      resourceType: $resourceType
    ) {
      userId
      profileType
      resourceType
      value
    }
  }
`;

const UpdatePersonalizationConfig = gql`
  mutation updatePersonalizationConfig(
    $input: UpdatePersonalizationConfigInput!
  ) {
    updatePersonalizationConfig(input: $input) {
      actionId
    }
  }
`;

interface IQuickLinkItem {
  key: string;
  name: string;
  link: {
    path: string;
    tab?: {
      contentId: string;
      key: string;
    };
  };
  setting?: {
    disabled?: boolean;
  };
}

export default function QuickLink() {
  const intl = useIntl();
  const apolloClient = useApolloClient();

  const { loading, data } = useQuery(QueryPersonalizationConfig, {
    variables: {
      profileType: ProfileType.QuickLinkDisableConfig,
      resourceType: "LeftNav",
    },
  });

  const result = data?.queryPersonalizationConfig;
  const disableConfig = useMemo(() => {
    return JSON.parse(result?.value || "{}");
  }, [result]);

  const [updateDisableConfig] = useMutation(UpdatePersonalizationConfig);

  const handleSettingChange = useCallback(
    (key: string, checked: boolean) => {
      const disabled = !checked;
      const value = JSON.stringify({ ...disableConfig, [key]: disabled });
      apolloClient.writeQuery({
        query: QueryPersonalizationConfig,
        variables: {
          profileType: ProfileType.QuickLinkDisableConfig,
          resourceType: "LeftNav",
        },
        data: {
          queryPersonalizationConfig: { ...result, value },
        },
      });
      updateDisableConfig({
        variables: {
          input: {
            payload: {
              profileType: ProfileType.QuickLinkDisableConfig,
              resourceType: "LeftNav",
              value,
            },
            action: {
              actionId: genUuid(),
              total: 1,
            },
          },
        },
      });
    },
    [disableConfig, result, apolloClient, updateDisableConfig],
  );

  const items = useMemo<IQuickLinkItem[]>(
    () => [
      {
        key: "recycle",
        name: intl.formatMessage({
          id: "recycle.bin",
          defaultMessage: "Recycle Bin",
        }),
        link: {
          path: "/virtualization-resource/root-node/detail?uuid=-1&leftnav=%(leftNav)s&navView=%(navView)s",
          tab: { contentId: "main-tab", key: "recycle" },
        },
        setting: {
          disabled: true,
        },
      },
      {
        key: "export",
        name: intl.formatMessage({
          id: "virtual.export.record",
          defaultMessage: "Export List",
        }),
        link: {
          path: "/virtualization-resource/root-node/detail?uuid=-1&leftnav=%(leftNav)s&navView=%(navView)s",
          tab: { contentId: "main-tab", key: "export" },
        },
      },
    ],
    [intl],
  );

  if (loading) {
    return null;
  }

  return (
    <div className={style.quickLinkWrapper}>
      <Tabs
        className={style.tabs}
        activeKey=""
        items={items
          .filter((item) => !disableConfig[item.key])
          .map((item) => ({
            key: item.key,
            label: <QuickLinkItem item={item} />,
          }))}
      />
      <Popover
        placement="topRight"
        overlayClassName={style.quickLinkSettingPopover}
        getPopupContainer={(triggerNode) => triggerNode}
        autoAdjustOverflow={false}
        content={
          <div className={style.quickLinkSettingList}>
            {items.map((item) => (
              <div className={style.quickLinkSettingItem} key={item.key}>
                <div className="flex items-center">
                  <Checkbox
                    checked={!disableConfig[item.key]}
                    disabled={item.setting?.disabled}
                    onCheckedChange={(val) => {
                      handleSettingChange(item.key, val === true);
                    }}
                  />
                  <label className="cursor-pointer pl-2 text-sm">
                    {item.name}
                  </label>
                </div>
              </div>
            ))}
          </div>
        }
      >
        <div className={style.quickLinkSetting}>
          <Icon type="settings" />
        </div>
      </Popover>
    </div>
  );
}

const QuickLinkItem = React.memo(function QuickLinkItem({
  item,
}: {
  item: IQuickLinkItem;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const setTabMemo = usePageStateStore((state) => state.setTabMemo);

  const cmdInfo = useCommandInfo(`navigate.${item.key}`);

  const handleLinkJump = useCallback(() => {
    const search = new URLSearchParams(location.search);
    const leftNav = search.get("leftnav") ?? LeftNavType.ClusterHost;
    const navView = search.get("navView") ?? NavView.Resource;
    const path = sprintf(item.link.path, { leftNav, navView });
    if (item.link.tab) {
      const { contentId, key } = item.link.tab;
      const pathname = path.split("?")[0];
      setTabMemo(
        produce(usePageStateStore.getState().tabMemo, (draft) => {
          draft[pathname] = draft[pathname] ?? {};
          draft[pathname][contentId] = key;
        }),
      );
    }
    if (location.pathname + location.search !== path) {
      navigate(path, { state: location.state });
    }
  }, [item, location, navigate, setTabMemo]);

  return (
    <Tooltip title={cmdInfo ? `${item.name} (${cmdInfo.keyLabel})` : ""}>
      <a onClick={handleLinkJump}>{item.name}</a>
    </Tooltip>
  );
});
QuickLinkItem.displayName = "QuickLinkItem";

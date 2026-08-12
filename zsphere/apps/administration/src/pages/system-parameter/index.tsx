import { gql } from "@apollo/client";
import { Button } from "@zstack/design";
import { Header, Auth, useAuth } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { UpdateGlobalConfigPayload } from "@zstack/zsphere-types/graphql";
import cls from "classnames";
import { isUndefined as _isUndefined } from "lodash-es";
import React, { useCallback, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import ResetGlobalConfig from "./action/reset-global-config";
import GlobalConfigAutoComplete from "./components/global-config-auto-complete";
import { useVirtualizationGlobalConfig } from "./hooks/useVirtualizationGlobalConfig";
import GlobalConfigList from "./list/global-config-list";

import style from "./style.module.less";

const _updateGlobalConfig = gql`
  mutation updateGlobalConfig($input: UpdateGlobalConfigInput!) {
    updateGlobalConfig(input: $input) {
      actionId
    }
  }
`;

const STYLE_MARGIN_LEFT_4 = { marginLeft: 4 } as const;

const GlobalConfig: React.FC = () => {
  const intl = useIntl();
  const [visible, setVisible] = useState<boolean>(false);
  const doAction = useAction();
  const { hasAuth } = useAuth();
  const canEdit = hasAuth({
    type: "action",
    authKey: "edit",
    resource: "system.parameter",
  });
  const { globalConfigValueMap, allGlobalConfig, refetchGlobalConfig } =
    useVirtualizationGlobalConfig();
  const [_targetTab, _setTargetTab] = useState<string>("basic.setting");

  const onOk = useCallback(
    (payloadList: UpdateGlobalConfigPayload[], configName?: string) => {
      const payload: UpdateGlobalConfigPayload[] = payloadList;
      doAction({
        mutation: _updateGlobalConfig,
        payload,
        name: intl.formatMessage(
          {
            id: "update.global.config",
            defaultMessage: "Modify Global Setting: {name}",
          },
          {
            name: configName,
          },
        ),
        total: payload?.length || 1,
        onProgress: () => {},
        onFinish: () => {},
      });
    },
    [intl, doAction],
  );

  const layout = (pageList: any[]) => {
    const order = [
      "virtualization.platform.strategy",
      "virtualization.operations.management",
      "virtualization.hosts.and.vms",
      "virtualization.image.storage",
      "virtualization.globalConfig.dataStorage",
      "virtualization.network.resources",
    ];

    const orderMap = order.reduce((obj, key, index) => {
      obj[key] = index;
      return obj;
    }, {} as any);

    const _pageList = Array.from({ length: order.length });
    const notInOrderPageList: any[] = [];

    pageList.forEach((item) => {
      const index = orderMap[item.key];

      if (!_isUndefined(index)) {
        _pageList[index] = item;
      } else {
        notInOrderPageList.push(item);
      }
    });

    return [..._pageList, ...notInOrderPageList];
  };

  const headerTitle = useMemo(
    () =>
      intl.formatMessage({
        id: "system.parameter",
        defaultMessage: "System Parameters",
      }),
    [intl],
  );
  const searchPlaceholder = useMemo(
    () =>
      intl.formatMessage({
        id: "system.parameter.search.placeholder",
        defaultMessage: "Search",
      }),
    [intl],
  );
  const resetButtonText = useMemo(
    () =>
      intl.formatMessage({
        id: "reset.global.config",
        defaultMessage: "Reset to Default Settings",
      }),
    [intl],
  );

  const handleResetClick = useCallback(() => {
    setVisible(true);
  }, [setVisible]);

  return (
    <>
      <div
        className={cls("main-list-header-tabs-container", style.globalConfig)}
      >
        <Header.List
          className="main-list-header"
          title={headerTitle}
          extra={
            <div className={style.extra}>
              <GlobalConfigAutoComplete
                dataResources={allGlobalConfig}
                setTargetTab={_setTargetTab}
                placeholder={searchPlaceholder}
              />
              <Auth
                authKey="reset.global.config"
                type="action"
                resource="global.config"
              >
                <Button
                  variant="secondary"
                  onClick={handleResetClick}
                  style={STYLE_MARGIN_LEFT_4}
                >
                  {resetButtonText}
                </Button>
              </Auth>
            </div>
          }
        />
        <GlobalConfigList
          key="all.setting"
          globalConfigList={allGlobalConfig}
          globalConfigValueMap={globalConfigValueMap}
          ok={onOk}
          layout={layout}
          readOnly={!canEdit}
        />
      </div>
      {/*Reset里面有个耗时网络请求，而且恢复默认是个不常用的操作，直接等要用了再创建DOM和请求*/}
      <ResetGlobalConfig
        visible={visible}
        setVisible={setVisible}
        view="Basic"
        refetch={refetchGlobalConfig}
      />
    </>
  );
};

export default React.memo(GlobalConfig);

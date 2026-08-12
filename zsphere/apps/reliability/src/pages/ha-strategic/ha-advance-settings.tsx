import { gql, useQuery } from "@apollo/client";
import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { List, useAuth } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import type { IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  GlobalConfigList,
  GlobalConfig as IGlobalConfig,
} from "@zstack/zsphere-types/graphql";
import cls from "classnames";
import {
  cloneDeep,
  concat,
  flatten,
  get,
  includes,
  keyBy,
  map,
  replace,
  set,
} from "lodash-es";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import useHAConfig from "../ha-strategic/useHAconfig";
import { useFormatFunction } from "../ha-strategic/utils/useFormatFunction";
import { useTranslateValue } from "../ha-strategic/utils/useTranslateValue";
import { useValidator } from "../ha-strategic/utils/useValidator";
import ModifyHaAdvanceSettings from "./action/modify-ha-advance-settings";

import style from "./style.module.less";

interface IProps {
  vmConfigs: string[];
  hostConfigs: string[];
}

const GET_GLOBAL_CONFIG_LIST = gql`
  query globalConfigList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $extraConditions: [Condition!]
    $type: GlobalConfigQueryType
    $sortBy: String
  ) {
    globalConfigList(
      start: $start
      limit: $limit
      replyWithCount: true
      conditions: $conditions
      extraConditions: $extraConditions
      type: $type
      sortBy: $sortBy
    ) {
      total
      list {
        category
        defaultValue
        description
        name
        value
        uuid
        isValid
      }
    }
  }
`;

const HACONFIGS = {
  VM: [
    // 'ha.vm.ha.level',
    // 'ha.allow.slibing.cross.clusters',
    "ha.notification.timeliness",
    "ha.neverStopVm.gc.maxRetryIntervalTime",
    "ha.neverStopVm.retry.delay",
    "ha.neverStopVm.scan.interval",
  ],
  HOST: [
    "ha.host.selfFencer.storageChecker.timeout",
    "ha.host.check.interval",
    "ha.host.check.maxAttempts",
    "ha.host.check.successInterval",
    "ha.host.check.successRatio",
    "ha.host.check.successTimes",
  ],
};

const HAAdvanceSettings: React.FC<IProps> = () => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  const [visible, setVisible] = useState<boolean>(false);
  const canEdit = hasAuth({
    authKey: "edit.advance.settings",
    resource: "ha.strategic",
    type: "action",
  });
  const genTranslateFn = useTranslateValue();
  const genFormatFn = useFormatFunction();
  const genValidatorFn = useValidator();
  const haConfigs = useHAConfig();
  const vmConfigs = get(HACONFIGS, "VM");
  const hostConfigs = get(HACONFIGS, "HOST");

  const {
    data,
    loading: globalConfigLoading,
    refetch,
  } = useQuery<
    {
      globalConfigList: GlobalConfigList;
    },
    IQuery
  >(GET_GLOBAL_CONFIG_LIST, {
    variables: {
      conditions: [
        {
          key: "category",
          op: Op.eq,
          value: "ha",
        },
        {
          key: "name",
          op: Op.in,
          values: flatten([
            map(vmConfigs, (it) => replace(it, "ha.", "")),
            map(hostConfigs, (it) => replace(it, "ha.", "")),
          ]),
        },
      ],
    },
  });

  const haConfigMap = useMemo(() => {
    const _haConfigMap = {} as { [key: string]: any };
    for (const haConfig of haConfigs) {
      const formItem = cloneDeep(haConfig.formItem);

      if (formItem?.formatFunction) {
        formItem.formatFunction = get(genFormatFn, formItem?.formatFunction);
      }
      if (formItem?.translateValue) {
        formItem.translateValue = get(genTranslateFn, formItem?.translateValue);
      }
      if (formItem?.validatorName) {
        set(formItem, "rules", [
          {
            validator: get(genValidatorFn, formItem?.validatorName),
          },
        ]);
      }

      _haConfigMap[`${haConfig.key}`] = {
        ...haConfig,
        formItem,
      };
    }

    return _haConfigMap;
  }, [haConfigs]);

  const globalConfigValueMap = useMemo(
    () =>
      keyBy(
        data?.globalConfigList?.list,
        (item: IGlobalConfig) => `${item.category}.${item.name}`,
      ),
    [data],
  );

  const { vmList, hostList } = useMemo(() => {
    const _vmList = [];
    const _hostList = [];

    const configs = concat(vmConfigs, hostConfigs);

    for (const key of configs) {
      const globalConfig = get(haConfigMap, key);
      const translateValue = get(globalConfig, ["formItem", "translateValue"]);
      // 选择列表
      const selectList = get(globalConfig, ["formItem", "selectList"], []);
      // 下拉列表
      const unitList = get(globalConfig, ["formItem", "unitList"], []);

      let globalConfigValue = get(globalConfigValueMap, [key, "value"]);

      if (
        translateValue &&
        !includes(["ha.vm.ha.level", "ha.allow.slibing.cross.clusters"], key)
      ) {
        globalConfigValue = translateValue(
          get(globalConfigValueMap, [key, "value"]),
          {
            selectList,
            unitList,
          },
        );
      } else if (includes(["ha.vm.ha.level"], key)) {
        globalConfigValue =
          globalConfigValue === "NeverStop"
            ? intl.formatMessage({
                id: "On",
                defaultMessage: "Open",
              })
            : intl.formatMessage({
                id: "Off",
                defaultMessage: "Close",
              });
      } else if (includes(["ha.allow.slibing.cross.clusters"], key)) {
        globalConfigValue =
          globalConfigValue === "true"
            ? intl.formatMessage({
                id: "On",
                defaultMessage: "Open",
              })
            : intl.formatMessage({
                id: "Off",
                defaultMessage: "Close",
              });
      }

      if (includes(vmConfigs, key)) {
        _vmList.push({
          label: globalConfig?.name,
          icon: "info",
          iconTooltip: (
            <ReactMarkdown>{globalConfig?.description ?? 0}</ReactMarkdown>
          ),
          value: globalConfigValue,
        });
      } else {
        _hostList.push({
          label: globalConfig?.name,
          icon: "info",
          iconTooltip: (
            <ReactMarkdown>{globalConfig?.description ?? 0}</ReactMarkdown>
          ),
          value: globalConfigValue,
        });
      }
    }

    return {
      vmList: _vmList,
      hostList: _hostList,
    };
  }, [globalConfigValueMap]);

  return (
    <AutoSkeleton name="ha-advance-settings" loading={globalConfigLoading}>
      <>
        {canEdit && (
          <Button
            icon={<Icon type="edit" />}
            onClick={() => {
              setVisible(true);
            }}
            style={{ marginBottom: "12px" }}
            className={style.actionButton}
          >
            {intl.formatMessage({
              id: "virtualization.ha.Modify.Settings",
              defaultMessage: "Modify Settings",
            })}
          </Button>
        )}

        <div className={cls(style.card, style.indented)}>
          <div className={`flex justify-between gap-2 ${style.titleBar}`}>
            <div>
              <div className={`flex items-center gap-2 ${style.title}`}>
                <div className={style.rect} />
                <div>
                  {intl.formatMessage({
                    id: "Advanced.VM.Settings",
                    defaultMessage: "Virtual Machine",
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className={style.content}>
            <List list={vmList} />
          </div>
        </div>

        <div className={cls(style.card, style.indented)}>
          <div className={`flex justify-between gap-2 ${style.titleBar}`}>
            <div>
              <div className={`flex items-center gap-2 ${style.title}`}>
                <div className={style.rect} />
                <div>
                  {intl.formatMessage({
                    id: "Advanced.Host.Settings",
                    defaultMessage: "Host",
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className={style.content}>
            <List list={hostList} />
          </div>
        </div>

        <ModifyHaAdvanceSettings
          position="header"
          view="main"
          selectedList={[]}
          visible={visible}
          setVisible={setVisible}
          refetch={refetch}
          haConfigMap={haConfigMap}
          globalConfigValueMap={globalConfigValueMap}
        />
      </>
    </AutoSkeleton>
  );
};

export default HAAdvanceSettings;

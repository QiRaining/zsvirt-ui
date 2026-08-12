import { gql, useQuery } from "@apollo/client";
import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { List, useAuth } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import type { IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  GlobalConfigList,
  HAStrategic,
  GlobalConfig as IGlobalConfig,
} from "@zstack/zsphere-types/graphql";
import cls from "classnames";
import * as _ from "lodash-es";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import useHAConfig from "../ha-strategic/useHAconfig";
import { useFormatFunction } from "../ha-strategic/utils/useFormatFunction";
import { useTranslateValue } from "../ha-strategic/utils/useTranslateValue";
import { useValidator } from "../ha-strategic/utils/useValidator";
import ModifyMigrationStrategy from "./action/modify-migration-strategy";
import HighAvailabilityScenario from "./components/high-availability-scenario";

import style from "./style.module.less";

interface IProps {}

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

const HA_STRATEGIC = gql`
  query haStrategic($conditions: [Condition!]) {
    haStrategic(conditions: $conditions) {
      haStrategic {
        fencerName
        state
        uuid
      }
    }
  }
`;
const MigrationStrategy: React.FC<IProps> = () => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  const [visible, setVisible] = useState<boolean>(false);
  const canEdit = hasAuth({
    authKey: "edit.migration.strategy",
    resource: "ha.strategic",
    type: "action",
  });
  const genTranslateFn = useTranslateValue();
  const genFormatFn = useFormatFunction();
  const genValidatorFn = useValidator();
  const haConfigs = useHAConfig();

  const {
    data: strategicData,
    loading,
    refetch: haRefetch,
  } = useQuery<{ haStrategic: HAStrategic }>(HA_STRATEGIC, {
    variables: {
      conditions: [
        {
          key: "fencerName",
          op: Op.in,
          values: ["hostStorageState", "hostBusinessNic"],
        },
      ],
    },
  });

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
          values: ["host.selfFencer.maxAttempts", "host.selfFencer.interval"],
        },
      ],
    },
  });

  const globalConfigValueMap = useMemo(
    () =>
      _.keyBy(
        data?.globalConfigList?.list,
        (item: IGlobalConfig) => `${item.category}.${item.name}`,
      ),
    [data],
  );

  const haConfigMap = useMemo(() => {
    const _haConfigMap = {} as { [key: string]: any };
    for (const haConfig of haConfigs) {
      const formItem = _.cloneDeep(haConfig.formItem);

      if (formItem?.formatFunction) {
        formItem.formatFunction = _.get(genFormatFn, formItem?.formatFunction);
      }
      if (formItem?.translateValue) {
        formItem.translateValue = _.get(
          genTranslateFn,
          formItem?.translateValue,
        );
      }
      if (formItem?.validatorName) {
        _.set(formItem, "rules", [
          {
            validator: _.get(genValidatorFn, formItem?.validatorName),
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

  const list = useMemo(() => {
    const haInterval = _.find(
      haConfigs,
      ({ key }) => key === "ha.host.selfFencer.interval",
    );
    const haMaxAttempts = _.find(
      haConfigs,
      ({ key }) => key === "ha.host.selfFencer.maxAttempts",
    );

    let haIntervalValue = _.get(globalConfigValueMap, [
      "ha.host.selfFencer.interval",
      "value",
    ]);
    let haMaxAttemptsValue = _.get(globalConfigValueMap, [
      "ha.host.selfFencer.maxAttempts",
      "value",
    ]);
    const _haIntervalTranslateValue = _.get(haInterval, [
      "formItem",
      "translateValue",
    ]);
    const _haMaxAttemptsTranslateValue = _.get(haMaxAttempts, [
      "formItem",
      "translateValue",
    ]);

    if (_haIntervalTranslateValue) {
      const translateValue = _.get(genTranslateFn, _haIntervalTranslateValue);
      // 选择列表
      const selectList = _.get(haInterval, ["formItem", "selectList"], []);
      // 下拉列表
      const unitList = _.get(haInterval, ["formItem", "unitList"], []);

      haIntervalValue = translateValue(
        _.get(globalConfigValueMap, ["ha.host.selfFencer.interval", "value"]),
        {
          selectList,
          unitList,
        },
      );
    }

    if (_haMaxAttemptsTranslateValue) {
      const translateValue = _.get(
        genTranslateFn,
        _haMaxAttemptsTranslateValue,
      );
      // 选择列表
      const selectList = _.get(haMaxAttempts, ["formItem", "selectList"], []);
      // 下拉列表
      const unitList = _.get(haMaxAttempts, ["formItem", "unitList"], []);

      haMaxAttemptsValue = translateValue(
        _.get(globalConfigValueMap, [
          "ha.host.selfFencer.maxAttempts",
          "value",
        ]),
        {
          selectList,
          unitList,
        },
      );
    }

    const _list = [
      {
        label: haInterval?.name,
        icon: "info",
        iconTooltip: (
          <ReactMarkdown>{haInterval?.description ?? 0}</ReactMarkdown>
        ),
        value: haIntervalValue,
      },
      {
        label: haMaxAttempts?.name,
        icon: "info",
        iconTooltip: (
          <ReactMarkdown>{haMaxAttempts?.description ?? 0}</ReactMarkdown>
        ),
        value: haMaxAttemptsValue,
      },
    ];

    return _list;
  }, [globalConfigValueMap]);

  return (
    <AutoSkeleton
      name="ha-migration-strategy"
      loading={loading || globalConfigLoading}
    >
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
              id: "virtualization.ha.Modify.Strategy",
              defaultMessage: "Modify Policy",
            })}
          </Button>
        )}

        <div className={cls(style.card, style.indented)}>
          <div className={`flex justify-between gap-3 ${style.titleBar}`}>
            <div>
              <div className={`flex items-center gap-2 ${style.title}`}>
                <div className={style.rect} />
                <div>
                  {intl.formatMessage({
                    id: "current.vm.Failure.Migration.Strategy",
                    defaultMessage: "VM Failover Policy",
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className={style.content}>
            <HighAvailabilityScenario
              strategicData={strategicData?.haStrategic?.haStrategic}
            />
          </div>
        </div>

        <div className={cls(style.card, style.indented)}>
          <div className={`flex justify-between gap-2 ${style.titleBar}`}>
            <div>
              <div className={`flex items-center gap-2 ${style.title}`}>
                <div className={style.rect} />
                <div>
                  {intl.formatMessage({
                    id: "Host.Failure.Determination.Strategy",
                    defaultMessage: "Host Error Detection",
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className={style.content}>
            <List list={list} />
          </div>
        </div>

        <ModifyMigrationStrategy
          source={strategicData?.haStrategic?.haStrategic}
          visible={visible}
          setVisible={setVisible}
          refetch={() => {
            refetch();
            haRefetch();
          }}
          selectedList={[]}
          view="main"
          position="header"
          haConfigMap={haConfigMap}
          globalConfigValueMap={globalConfigValueMap}
        />
      </>
    </AutoSkeleton>
  );
};

export default MigrationStrategy;

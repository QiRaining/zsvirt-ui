import { gql, useQuery } from "@apollo/client";
import {
  Header as ZsvHeader,
  Switch,
  useAuth,
} from "@zstack/zsphere-components";
import { AutoSkeleton, DialogWeakP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  GlobalConfigList,
  GlobalConfig as IGlobalConfig,
  UpdateGlobalConfigPayload,
} from "@zstack/zsphere-types/graphql";
import * as _ from "lodash-es";
import React, { useCallback, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import useHAConfig from "../ha-strategic/useHAconfig";
import { useFormatFunction } from "../ha-strategic/utils/useFormatFunction";
import { useTranslateValue } from "../ha-strategic/utils/useTranslateValue";
import { useValidator } from "../ha-strategic/utils/useValidator";
import ModifyHaStrategic from "./action/enable-ha";

import style from "./style.module.less";

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

const _updateGlobalConfig = gql`
  mutation updateGlobalConfig($input: UpdateGlobalConfigInput!) {
    updateGlobalConfig(input: $input) {
      actionId
    }
  }
`;

interface IProps {
  haEnabled: boolean;
}

const HACONFIGS = [
  "ha.enable",

  "ha.host.selfFencer.maxAttempts",
  "ha.host.selfFencer.interval",

  "ha.vm.ha.level",
  "ha.allow.slibing.cross.clusters",
  "ha.notification.timeliness",
  "ha.neverStopVm.gc.maxRetryIntervalTime",
  "ha.neverStopVm.retry.delay",
  "ha.neverStopVm.scan.interval",

  "ha.host.selfFencer.storageChecker.timeout",
  "ha.host.check.interval",
  "ha.host.check.maxAttempts",
  "ha.host.check.successInterval",
  "ha.host.check.successRatio",
  "ha.host.check.successTimes",
];

const Disable: React.FC<{
  visible: boolean;
  setVisible: (visible: boolean) => void;
  doAction: Function;
}> = ({ visible, setVisible, doAction }) => {
  const intl = useIntl();

  const onOk = () => {
    doAction();
  };

  return (
    <DialogWeakP1
      title={intl.formatMessage({
        id: "ha.disable.modal.confirm",
        defaultMessage: "Disable HA Policy",
      })}
      type="warning"
      visible={visible}
      setVisible={setVisible}
      onConfirm={() => onOk?.()}
      description={intl.formatMessage({
        id: "ha.disable.modal.confirm.desc",
        defaultMessage:
          "If you disable HA Policy, virtual machines will not be automatically restarted if they are stopped. This may cause business interruptions. Proceed with caution.",
      })}
    />
  );
};

const Header: React.FC<IProps> = ({ haEnabled }) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  const doAction = useAction();
  const [visible, setVisible] = useState(false);
  const [haVisible, setHaVisible] = useState(false);
  const canToggle = hasAuth({
    authKey: "toggle",
    resource: "ha.strategic",
    type: "action",
  });

  const genTranslateFn = useTranslateValue();
  const genFormatFn = useFormatFunction();
  const genValidatorFn = useValidator();
  const haConfigs = useHAConfig();

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
          values: _.map(HACONFIGS, (it) => _.replace(it, "ha.", "")),
        },
      ],
    },
  });

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

  const globalConfigValueMap = useMemo(
    () =>
      _.keyBy(
        data?.globalConfigList?.list,
        (item: IGlobalConfig) => `${item.category}.${item.name}`,
      ),
    [data],
  );

  const disableDoAction = useCallback(() => {
    const payload: UpdateGlobalConfigPayload[] = [
      {
        name: "enable",
        category: "ha",
        value: "false",
      },
    ];
    doAction({
      mutation: _updateGlobalConfig,
      payload,
      name: intl.formatMessage({
        id: "ha.disable.HAStrategic",
        defaultMessage: "Disable VM HA",
      }),
      total: 1,
      type: "HAStrategic",
    });
  }, [doAction, intl]);

  return (
    <AutoSkeleton name="ha-strategic-header" loading={globalConfigLoading}>
      <>
        <ZsvHeader.List
          className={haEnabled ? "main-list-header-tabs" : "main-list-header"}
          title={
            <div className={style.header}>
              {intl.formatMessage({
                id: "virtualization.high.availability.strategy",
                defaultMessage: "HA Policy",
              })}
              {canToggle && (
                <Switch
                  checked={haEnabled}
                  onChange={(val) => {
                    if (val) {
                      setHaVisible(true);
                    } else {
                      setVisible(true);
                    }
                  }}
                />
              )}
            </div>
          }
        />
        <Disable
          visible={visible}
          setVisible={setVisible}
          doAction={disableDoAction}
        />
        <ModifyHaStrategic
          selectedList={[]}
          position="header"
          view="main"
          visible={haVisible}
          setVisible={setHaVisible}
          refetch={refetch}
          haConfigMap={haConfigMap}
          globalConfigValueMap={globalConfigValueMap}
        />
      </>
    </AutoSkeleton>
  );
};

export default Header;

import { useQuery } from "@apollo/client";
import { Text } from "@zstack/design";
import { queryClusterList } from "@zstack/virtualization-resource/src/gql/cluster.gql";
import SelectTag from "@zstack/virtualization-resource/src/pages/tag/components/select-tag/index";
import {
  ZSVForm,
  TextArea,
  Form,
  Input,
  Select,
} from "@zstack/zsphere-components";
import { IIsRequiredType, useValidator } from "@zstack/zsphere-hooks";
import { ClusterQueryType, Op, ResourceQueryType } from "@zstack/zsphere-types";
import type {
  Zone as IZone,
  Cluster as ICluster,
  Host as IHost,
} from "@zstack/zsphere-types/graphql";
import { get } from "lodash-es";
import type { FC } from "react";
import React, { useMemo, useContext, useCallback } from "react";
import { useIntl } from "react-intl";

import FormContext from "./context";

import style from "./style.module.less";

const { Card } = ZSVForm;
const { Item } = Form;
export interface IProps {
  isCreate?: boolean;
  cluster?: ICluster;
  host?: IHost;
  zone?: IZone;
}

const ClusterSelect: FC<{
  zone: IZone;
}> = ({ zone }) => {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);
  const { setEptVisible } = useContext(FormContext);

  const clusterDefaultQuery = {
    type: ClusterQueryType.Normal,
    conditions: [
      {
        key: "hypervisorType",
        op: Op.notIn,
        values: ["ESX", "baremetal", "baremetal2"],
      },
      {
        key: "zoneUuid",
        op: Op.eq,
        value: zone?.uuid,
      },
    ],
  };

  const { loading, data } = useQuery(queryClusterList, {
    variables: clusterDefaultQuery,
  });

  const clusterList = get(data, "clusterList.list", []) as ICluster[];

  const options = useMemo(() => {
    const _options = clusterList.map((item) => ({
      label: item.name,
      value: item.uuid,
    }));
    return _options;
  }, [clusterList]);

  const handleChange = useCallback(
    (value: string) => {
      const selectedCluster = clusterList.find((item) => item.uuid === value);
      if (selectedCluster) {
        const supportEpt = selectedCluster.architecture === "x86_64";
        setEptVisible?.(supportEpt);
      }
    },
    [clusterList, setEptVisible],
  );

  return (
    <Item
      name="clusterUuid"
      label={intl.formatMessage({ id: "cluster", defaultMessage: "Cluster" })}
      required
      rules={[isRequired(IIsRequiredType.select)]}
    >
      <Select
        allowClear
        width="l"
        loading={loading}
        options={options}
        onChange={handleChange}
      />
    </Item>
  );
};

const BasicConfig: FC<IProps> = ({ isCreate, cluster, zone, host }) => {
  const intl = useIntl();

  const { validatorUniqName, commonNameRules, longDescriptionRules } =
    useValidator(intl);

  return (
    // TODO 这里要换为组件库的组件
    <Card
      title={intl.formatMessage({
        id: "basic.info",
        defaultMessage: "Basic Info",
      })}
    >
      <Item
        shouldUpdate={true}
        label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
        name="name"
        rules={[
          ...commonNameRules,
          validatorUniqName(
            ResourceQueryType.Host,
            host?.name,
            intl.formatMessage({
              id: "host.field.name.validator.duplicate",
              defaultMessage: "This name is already in use. Enter a different name.",
            }),
            true,
          ),
        ]}
      >
        <Input className={style["width-400"]} />
      </Item>
      <Item
        name="description"
        rules={longDescriptionRules}
        label={intl.formatMessage({
          id: "introduction",
          defaultMessage: "Description",
        })}
      >
        <TextArea
          limit={2000}
          rows={4}
          isShowLimit
          className={style["width-400"]}
        />
      </Item>

      {isCreate && (
        <>
          {cluster && (
            <Item
              name="clusterUuid"
              label={intl.formatMessage({
                id: "cluster",
                defaultMessage: "Cluster",
              })}
              required
              className={style["cluster-name"]}
            >
              <span>
                <Text>{cluster.name}</Text>
              </span>
            </Item>
          )}
          {zone && <ClusterSelect zone={zone} />}
          <Item
            name="tags"
            label={intl.formatMessage({ id: "tag", defaultMessage: "Tag" })}
          >
            <SelectTag className={style["width-400"]} />
          </Item>
        </>
      )}
    </Card>
  );
};

export default BasicConfig;

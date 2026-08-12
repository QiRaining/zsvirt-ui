import ZoneSelector from "@zstack/virtualization-resource/src/pages/zone/hooks/select-zone";
import { Form, Select } from "@zstack/zsphere-components";
import { SUPPORTED_CLUSTER_ARCHITECTURE_OPTIONS } from "@zstack/zsphere-constant";
import { IIsRequiredType, useValidator } from "@zstack/zsphere-hooks";
import { ResourceQueryType } from "@zstack/zsphere-types";
import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import type { FormInstance } from "antd/es/form";
import React, { useEffect } from "react";
import { useIntl } from "react-intl";

import { BasicInfo, Title } from "../../components";

import style from "./style.module.less";

const zoneFormItemStyle = {
  height: "32px",
  display: "flex",
  alignItems: "center",
} as const;

export interface IProps {
  form: FormInstance;
  zone?: IZone;
}

const BasicConfig: React.FC<IProps> = ({ form, zone }) => {
  const intl = useIntl();
  const { isRequired, validatorUniqName } = useValidator(intl);
  const currentZone = React.useMemo(() => zone, [zone]);

  useEffect(() => {
    if (currentZone?.uuid) {
      form.setFieldsValue({
        zoneUuid: currentZone.uuid,
      });
    }
  }, [currentZone, form]);

  return (
    <div className={style.card}>
      <Title
        title={intl.formatMessage({
          id: "basic.info",
          defaultMessage: "Basic Info",
        })}
      />
      <BasicInfo
        nameRules={[
          validatorUniqName(
            ResourceQueryType.Cluster,
            undefined,
            intl.formatMessage({
              id: "cluster.field.name.validator.duplicate",
              defaultMessage:
                "This name is already in use. Enter a different name.",
            }),
            true,
          ),
        ]}
      />

      {currentZone?.uuid ? (
        <Form.Item
          label={intl.formatMessage({
            id: "position.cluster",
            defaultMessage: "Data Center",
          })}
          textFormItem
          name="zoneUuid"
          style={{ ...zoneFormItemStyle, lineHeight: "32px" }}
        >
          {currentZone.name}
        </Form.Item>
      ) : (
        <Form.Item
          label={intl.formatMessage({
            id: "position.cluster",
            defaultMessage: "Data Center",
          })}
          name="zoneUuid"
          required
          rules={[isRequired(IIsRequiredType.select)]}
        >
          <ZoneSelector className={style["width-400"]} />
        </Form.Item>
      )}

      <Form.Item
        label={intl.formatMessage({
          id: "cpuArchitecture",
          defaultMessage: "CPU Architecture",
        })}
        name="architecture"
      >
        <Select className={style["width-400"]}>
          {SUPPORTED_CLUSTER_ARCHITECTURE_OPTIONS.map((it) => (
            <Select.Option key={it.value} value={it.value}>
              {it.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </div>
  );
};

export default BasicConfig;

import { useValidator } from "@zstack/zsphere-hooks";
import { ResourceQueryType } from "@zstack/zsphere-types";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import type { FormInstance } from "antd/es/form";
import React from "react";
import { useIntl } from "react-intl";

import { Title, BasicInfo } from "../../components";

import style from "./style.module.less";

export interface IProps {
  form: FormInstance;
  selectedList?: ICluster[];
}

const BasicConfig: React.FC<IProps> = ({ selectedList }) => {
  const intl = useIntl();
  const { validatorUniqName } = useValidator(intl);

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
            selectedList?.[0]?.name,
            intl.formatMessage({
              id: "cluster.field.name.validator.duplicate",
              defaultMessage: "This name is already in use. Enter a different name.",
            }),
            true,
          ),
        ]}
      />
    </div>
  );
};

export default BasicConfig;

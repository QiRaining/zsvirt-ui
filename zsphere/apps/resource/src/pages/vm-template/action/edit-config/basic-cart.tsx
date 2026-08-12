import { ZSVForm } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import { ResourceQueryType } from "@zstack/zsphere-types";
import type {
  Cluster as ICluster,
  Host as IHost,
  VmTemplate as IVMTemplate,
} from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import React from "react";
import { useIntl } from "react-intl";

const { Card, NameAndDesc } = ZSVForm;

export interface IProps {
  isCreate?: boolean;
  cluster?: ICluster;
  host?: IHost;
  vmTemplate?: IVMTemplate;
}

const BasicConfig: FC<IProps> = ({ vmTemplate }) => {
  const intl = useIntl();
  const { validatorUniqName } = useValidator(intl);

  return (
    <Card
      title={intl.formatMessage({
        id: "basic.info",
        defaultMessage: "Basic Info",
      })}
    >
      <NameAndDesc
        nameRules={[
          validatorUniqName(
            ResourceQueryType.VmInstance,
            vmTemplate?.name,
            intl.formatMessage({
              id: "vm.template.field.name.validator.duplicate",
              defaultMessage: "This name is already in use. Enter a different name.",
            }),
            true,
          ),
        ]}
      />
    </Card>
  );
};

export default BasicConfig;

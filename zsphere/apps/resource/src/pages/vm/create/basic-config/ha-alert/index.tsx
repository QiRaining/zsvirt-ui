import { gql, useQuery } from "@apollo/client";
import { Alert } from "@zstack/design";
import { Form } from "@zstack/zsphere-components";
import cls from "classnames";
import React from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

const GLOBAL_CONFIG = gql`
  query globalConfig($category: String!, $name: String!) {
    globalConfig(category: $category, name: $name) {
      category
      defaultValue
      description
      name
      value
      uuid
      isValid
    }
  }
`;

function HaAlert() {
  const intl = useIntl();

  const { data, loading } = useQuery(GLOBAL_CONFIG, {
    variables: {
      category: "ha",
      name: "enable",
    },
  });
  const globalHaEnabled = loading || data?.globalConfig?.value === "true";

  return !globalHaEnabled ? (
    <Alert display="weak" variant="warning">
      {intl.formatMessage({
        id: "vm.field.ha.alert.global.policy.disabled",
        defaultMessage:
          "The HA policy is not enabled on the platform. VM HA will take effect after HA policy is enabled.",
      })}
    </Alert>
  ) : null;
}

export interface IProps {
  isEdit?: boolean;
}

export default function HaAlertItem({ isEdit }: IProps) {
  return (
    <Form.Item noStyle shouldUpdate={(prev, curr) => prev.ha !== curr.ha}>
      {({ getFieldValue }) => {
        const ha = getFieldValue("ha");
        return ha ? (
          <div className={cls(style.wrapper, { [style.isEdit]: !!isEdit })}>
            <HaAlert />
          </div>
        ) : null;
      }}
    </Form.Item>
  );
}

import { gql, useQuery } from "@apollo/client";
import { Alert } from "@zstack/design";
import { Form } from "@zstack/zsphere-components";
import { useIntl } from "react-intl";

import style from "./style.module.less";

const GET_GLOBAL_CONFIG = gql`
  query getGlobalConfig($category: String!, $name: String!) {
    globalConfig(category: $category, name: $name) {
      category
      defaultValue
      description
      name
      value
    }
  }
`;

function HaAlert() {
  const intl = useIntl();

  const { data, loading } = useQuery(GET_GLOBAL_CONFIG, {
    fetchPolicy: "no-cache",
    variables: {
      category: "ha",
      name: "enable",
    },
  });

  return !loading && data?.globalConfig?.value !== "true" ? (
    <Alert display="weak" variant="warning">
      {intl.formatMessage({
        id: "vm.field.ha.alert.global.policy.disabled",
        defaultMessage:
          "The HA policy is not enabled on the platform. VM HA will take effect after HA policy is enabled.",
      })}
    </Alert>
  ) : null;
}

export default function HaAlertItem() {
  return (
    <Form.Item noStyle shouldUpdate={(prev, curr) => prev.ha !== curr.ha}>
      {({ getFieldValue }) => {
        const ha = getFieldValue("ha");
        return ha ? (
          <div className={style.wrapper}>
            <HaAlert />
          </div>
        ) : null;
      }}
    </Form.Item>
  );
}

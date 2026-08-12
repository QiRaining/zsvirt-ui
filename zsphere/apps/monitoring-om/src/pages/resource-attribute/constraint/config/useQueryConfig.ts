import { useQueryConfig } from "@zstack/zsphere-engine/src/resource-attribute-constraint";
import { useIntl } from "react-intl";

export default (defaultQuery?: any) => {
  const intl = useIntl();

  return useQueryConfig(
    [
      {
        key: "parameter",
        placeholder: intl.formatMessage({
          id: "search",
          defaultMessage: "Search",
        }),
      },
    ],
    {
      defaultQuery,
      resourceType: "ResourceAttributeConstraint",
      needFuzzyQuery: false,
    },
  );
};

import { useQueryConfig } from "@zstack/zsphere-engine/src/free-hard-disk";
import { useIntl } from "react-intl";

export default (defaultQuery?: any) => {
  const intl = useIntl();
  return useQueryConfig(
    [
      {
        key: "device",
        searchKey: "name",
        placeholder: intl.formatMessage({
          id: "search.device",
          defaultMessage: "Search Device",
        }),
      },
    ],
    {
      resourceType: "FreeHardDisk",
      needFuzzyQuery: false,
      defaultQuery,
    },
  );
};

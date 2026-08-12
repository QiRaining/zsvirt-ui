import useQueryConfig from "@zstack/zsphere-engine/src/guest-os/useQueryConfig";
import { useIntl } from "react-intl";

export default (defaultQuery?: any) => {
  const intl = useIntl();
  return useQueryConfig(
    [
      {
        key: "name",
        placeholder: intl.formatMessage({
          id: "searchName",
          defaultMessage: "Search by name",
        }),
      },
    ],
    {
      defaultQuery,
      needFuzzyQuery: false,
      resourceType: "GuestOsCpuMemHotAddInfo",
    },
  );
};

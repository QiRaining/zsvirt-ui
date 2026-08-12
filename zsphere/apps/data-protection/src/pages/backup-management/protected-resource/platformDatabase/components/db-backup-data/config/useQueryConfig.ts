import { useQueryConfig } from "@zstack/zsphere-engine/src/db-backup-data";
import { useIntl } from "react-intl";

export default (defaultQuery?: any) => {
  const intl = useIntl();
  return useQueryConfig(
    [
      {
        key: "name",
        searchKey: "name",
        placeholder: intl.formatMessage({
          id: "search.name",
          defaultMessage: "Search by name",
        }),
      },
    ],
    {
      resourceType: "DatabaseBackupFromImageStore",
      needFuzzyQuery: false,
      defaultQuery,
    },
  );
};

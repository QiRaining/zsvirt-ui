import { useColumnConfig } from "@zstack/zsphere-engine/src/shared-block";
import type { CandidateSharedBlock as ICandidateSharedBlock } from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";
import { useIntl } from "react-intl";

export default () => {
  const intl = useIntl();

  return useColumnConfig<ICandidateSharedBlock>([
    {
      title: intl.formatMessage({ id: "capacity", defaultMessage: "Capacity" }),
      dataIndex: "size",
      key: "size",
      width: 120,
      render: (value) => formatStorage(value),
    },
  ]);
};

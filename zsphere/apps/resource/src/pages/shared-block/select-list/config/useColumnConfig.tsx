import { useColumnConfig } from "@zstack/zsphere-engine/src/lun-device";
import type { CandidateSharedBlock as ICandidateSharedBlock } from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";

export default () => {
  return useColumnConfig<ICandidateSharedBlock>([
    {
      key: "size",
      render: (value) => formatStorage(value.size || 0),
    },
  ]);
};

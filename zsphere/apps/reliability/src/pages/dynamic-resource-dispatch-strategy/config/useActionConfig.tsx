import { gql } from "@apollo/client";
import { useActionConfig } from "@zstack/zsphere-engine/src/dynamic-resource-ispatch-strategy";
import type { IOption } from "@zstack/zsphere-engine/src/dynamic-resource-ispatch-strategy/useActionConfig";
import { useAction } from "@zstack/zsphere-hooks";
import type {
  ExecuteDRSSchedulingPayload,
  DRS as IDRS,
} from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";

import CloseDynamic from "../action/close-dynamic-resource-ispatch";
import EnableOrModifyDRSModal from "../action/modify-drs";
import { validateDisabled, validateEnabled } from "../action/validator";

const executeDRSScheduling = gql`
  mutation executeDRSScheduling($input: ExecuteDRSSchedulingInput!) {
    executeDRSScheduling(input: $input) {
      actionId
    }
  }
`;

export default () => {
  const doAction = useAction();
  const intl = useIntl();

  const options: IOption<IDRS> = [
    {
      key: "stateScan",
      onClick: (params) => {
        const { selectedList, setSelectedList, refetch } = params;

        const payload: ExecuteDRSSchedulingPayload[] = selectedList.map(
          (item) => {
            return { uuid: item.uuid };
          },
        );

        doAction({
          mutation: executeDRSScheduling,
          payload,
          name: intl.formatMessage({
            id: "drs.state.refresh",
            defaultMessage: "Scan Status",
          }),
          type: "ClusterDRS",
          total: 1,
          onFinish: () => {
            setSelectedList?.([]);
            refetch?.();
          },
        });
      },
    },
    {
      key: "change.strategy",
      autoInjectPreValidator: false,
      ActionWrapper: (props) => {
        return <EnableOrModifyDRSModal createType="edit" {...props} />;
      },
    },
    {
      key: "virtualization.closed",
      validators: [validateDisabled],
      ActionWrapper: CloseDynamic,
    },
    {
      key: "virtualization.enabled",
      validators: [validateEnabled],
      ActionWrapper: (props) => {
        return <EnableOrModifyDRSModal createType="enable" {...props} />;
      },
    },
  ];

  return useActionConfig(options);
};

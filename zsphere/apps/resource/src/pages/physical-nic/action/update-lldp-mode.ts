import { gql } from "@apollo/client";
import { useAction } from "@zstack/zsphere-hooks";
import type { ELLDPMode } from "@zstack/zsphere-types";
import { useIntl } from "react-intl";

export interface UpdateLLDPModepayload {
  interfaceUuids: string[];
  mode: ELLDPMode;
}

const updateLldpModeInterface = gql`
  mutation updateLLDPMode($input: UpdateHostNetworkInterfaceLLDPModeInput!) {
    updateLLDPMode(input: $input) {
      actionId
    }
  }
`;

export const useUpdateLldpModeAction = (onFinish?: () => void) => {
  const doAction = useAction();
  const intl = useIntl();

  return (payload: UpdateLLDPModepayload) =>
    doAction({
      mutation: updateLldpModeInterface,
      payload,
      name: intl.formatMessage({
        id: "physicalNic.action.modal.lldp.title",
        defaultMessage: "Modify LLDP Mode",
      }),
      total: 1,
      onFinish,
    });
};

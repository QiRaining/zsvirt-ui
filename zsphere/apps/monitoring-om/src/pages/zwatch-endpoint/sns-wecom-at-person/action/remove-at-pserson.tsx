import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  RemoveSNSWeComAtPersonPayload,
  SNSWeComAtPerson,
  WeComEndPoint,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const removeSNSWeComAtPerson = gql`
  mutation removeSNSWeComAtPerson($input: RemoveSNSWeComAtPersonInput!) {
    removeSNSWeComAtPerson(input: $input) {
      actionId
    }
  }
`;

const RemoveAtPersonAction: React.FC<
  IActionWrapperProps<SNSWeComAtPerson, WeComEndPoint>
> = ({ visible, setVisible, selectedList, source }) => {
  const intl = useIntl();
  const doAction = useAction();

  const getPayloadList =
    React.useCallback((): RemoveSNSWeComAtPersonPayload[] => {
      if (source?.uuid && selectedList) {
        return selectedList.map((item) => {
          return {
            userId: encodeURIComponent(item.userId),
            endpointUuid: source.uuid,
          };
        });
      }

      return [];
    }, [source, selectedList]);

  const onOk = async () => {
    const payloadList = getPayloadList();

    doAction<RemoveSNSWeComAtPersonPayload[]>({
      mutation: removeSNSWeComAtPerson,
      payload: payloadList,
      name: intl.formatMessage({
        id: "delete.atPerson",
        defaultMessage: "Remove Member",
      }),
      total: payloadList.length,
      type: "SNSWeComAtPerson",
    });
  };

  const bannerMessage = React.useMemo(() => {
    if (source?.atPersonList?.length === selectedList.length) {
      return intl.formatMessage({
        id: "zwtach.endpoint.deleteAllAtPerson.note",
        defaultMessage: "After you delete all members, the parameter, Mention Member, of the endpoint is changed to N/A automatically.",
      });
    }

    return;
  }, [source?.atPersonList, selectedList, intl]);

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "zwatchEndpoint.modal.title.confirm.delete.atPersonPhoneNumber",
        defaultMessage: "Delete Member?",
      })}
      resourceNames={selectedList.map((item) => item.userId ?? item.uuid)}
      visible={visible}
      setVisible={setVisible}
      bannerMessage={bannerMessage}
      onConfirm={onOk}
    />
  );
};

export default RemoveAtPersonAction;

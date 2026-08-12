import { gql, useLazyQuery } from "@apollo/client";
import { DialogP0Smart } from "@zstack/zsphere-design-biz";
import { useAction, useSensitiveJudge } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, Item } from "@zstack/zsphere-types";
import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const deleteKmsProvider = gql`
  mutation deleteKmsProvider($input: DeleteKmsProviderInput!) {
    deleteKmsProvider(input: $input) {
      actionId
    }
  }
`;

const countEncryptedResourceKeyRef = gql`
  query countEncryptedResourceKeyRef($uuids: [String!]!) {
    countEncryptedResourceKeyRef(uuids: $uuids)
  }
`;

const Delete: React.FC<IActionWrapperProps<Item & { uuid: string }>> = ({
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const needValidate = useSensitiveJudge();
  const hasNKP = selectedList.some((item) => item.type === "NKP");
  const bannerMessage = hasNKP ? (
    <ReactMarkdown>
      {intl.formatMessage({
        id: "delete.kmsProvider.modal.alert.message.builtin",
        defaultMessage:
          "Deleting the key provider will result in the following:\n\n- All resources encrypted with this key provider (such as TPM-enabled VMs, encrypted VMs, encrypted disks) will enter a locked state and become inaccessible.\n- The key provider will be permanently removed from the platform and cannot be recovered.\n\nRecommendations:\n\n- To retain the key provider for future use, perform a backup before deletion.\n- To preserve encrypted resources, perform a \"Rekey\" operation on affected VMs to re-encrypt them with the current default key provider.",
      })}
    </ReactMarkdown>
  ) : (
    <ReactMarkdown>
      {intl.formatMessage({
        id: "delete.kmsProvider.modal.alert.message.kms",
        defaultMessage:
          "- After deleting the key provider, all resources encrypted with this key provider (such as TPM-enabled VMs, encrypted VMs, encrypted disks) will enter a locked state and become inaccessible.\n- To preserve encrypted resources, perform a \"Rekey\" operation on affected VMs to re-encrypt them with the current default key provider.",
      })}
    </ReactMarkdown>
  );

  const [query, { data }] = useLazyQuery(countEncryptedResourceKeyRef, {
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (visible) {
      query({
        variables: {
          uuids: selectedList.map((item) => item.uuid),
        },
      });
    }
  }, [visible]);

  const linkedResourceName = intl.formatMessage({
    id: "delete.kmsProvider.linkedResourceName",
    defaultMessage: "Virtual Machine",
  });
  const linkedCount = (data?.countEncryptedResourceKeyRef as number) ?? 0;

  return (
    <DialogP0Smart
      title={intl.formatMessage({
        id: "delete.kmsProvider.modal.title",
        defaultMessage: "Delete Key Provider?",
      })}
      resourceType={intl.formatMessage({
        id: "kmsProvider",
        defaultMessage: "Key Providers",
      })}
      resourceNames={selectedList.map((item) => item.name)}
      visible={visible}
      setVisible={setVisible}
      onConfirm={() => {
        const payload = selectedList.map((item) => ({
          uuid: item.uuid,
          type: item.type,
        }));
        doAction({
          mutation: deleteKmsProvider,
          payload,
          name: intl.formatMessage({
            id: "delete.kmsProvider",
            defaultMessage: "Delete Key Provider",
          }),
          total: selectedList.length,
          type: "KmsProvider",
        });
      }}
      needValidate={needValidate}
      guide={intl.formatMessage({
        id: "delete",
        defaultMessage: "Delete",
      })}
      bannerMessage={bannerMessage}
      relatedResources={[{ name: linkedResourceName, count: linkedCount }]}
    />
  );
};

export default Delete;

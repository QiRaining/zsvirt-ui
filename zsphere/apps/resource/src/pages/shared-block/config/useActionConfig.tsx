import { gql } from "@apollo/client";
import { useActionConfig } from "@zstack/zsphere-engine/src/shared-block";
import { useAction } from "@zstack/zsphere-hooks";
import type { SharedBlock as ISharedBlock } from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";

import { verifyMulti } from "../action/validator";

const refreshSharedblockDeviceCapacity = gql`
  mutation refreshSharedblockDeviceCapacity(
    $input: RefreshSharedblockDeviceCapacityInput!
  ) {
    refreshSharedblockDeviceCapacity(input: $input) {
      actionId
    }
  }
`;

export default () => {
  const intl = useIntl();
  const doAction = useAction();

  // 刷新容量
  const refreshAction = async ({
    selectedList: sharedBlockDataSelectedList,
    setSelectList,
  }: any) => {
    const sharedBlockGroupUuid =
      sharedBlockDataSelectedList?.[0]?.sharedBlockGroupUuid;
    const uuids = sharedBlockDataSelectedList.map(
      (item: ISharedBlock) => item.uuid,
    );

    const payload = uuids?.map((uuid: string) => {
      return {
        sharedBlockGroupUuid,
        uuid,
      };
    });
    doAction({
      mutation: refreshSharedblockDeviceCapacity,
      payload,
      name: intl.formatMessage({
        id: "refresh.capacity",
        defaultMessage: "Refresh Capacity",
      }),
      type: "SharedBlock",
      total: sharedBlockDataSelectedList.length,
      onFinish: () => {
        // refetch?.()
      },
    });
    setSelectList?.([]);
  };

  return useActionConfig<ISharedBlock>([
    {
      autoInjectPreValidator: false,
      key: "add.virtualization.sharedBlock.lun",
      ActionWrapper: require("../action/virtualization-add-shared-block-modal")
        .default,
    },
    {
      preValidators: [verifyMulti],
      key: "refresh",
      onClick: refreshAction,
    },
  ]);
};

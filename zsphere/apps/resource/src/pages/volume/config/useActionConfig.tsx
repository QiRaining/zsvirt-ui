import { useQuery, gql } from "@apollo/client";
import { useActionConfig } from "@zstack/zsphere-engine/src/volume";
import type { IOption } from "@zstack/zsphere-engine/src/volume/useActionConfig";
import type {
  Volume as IVolume,
  VmInstance,
} from "@zstack/zsphere-types/graphql";
import { filter as _filter } from "lodash-es";
import { useMemo } from "react";
import { useIntl } from "react-intl";

import DeleteAction from "../action/delete";
import Expunge from "../action/expunge";
import Recover from "../action/recover";
import {
  verifyExpungeDataVolume,
  verifyMoveToRecycleBin,
  verifyMultiSelect,
} from "../action/validator";

const GLOBAL_CONFIG = gql`
  query globalConfig($category: String!, $name: String!) {
    globalConfig(category: $category, name: $name) {
      category
      defaultValue
      description
      name
      value
      uuid
      isValid
    }
  }
`;

export default (_source?: VmInstance | IVolume) => {
  const intl = useIntl();
  const { data: deletionPolicyData, loading: deletionPolicyLoading } = useQuery(
    GLOBAL_CONFIG,
    {
      variables: {
        category: "volume",
        name: "deletionPolicy",
      },
    },
  );

  const isDelay = useMemo(() => {
    if (deletionPolicyLoading) {
      return true;
    }
    return deletionPolicyData?.globalConfig?.value !== "Direct";
  }, [deletionPolicyData, deletionPolicyLoading]);

  const option: IOption<IVolume> = useMemo(
    () => [
      {
        key: "move.to.recycle.bin",
        name: isDelay
          ? intl.formatMessage({
              id: "move.to.trash",
              defaultMessage: "Move to Recycle Bin",
            })
          : intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
        preValidators: [verifyMultiSelect],
        validators: [verifyMoveToRecycleBin],
        autoInjectPreValidator: false,
        tooltip: ({ selectedList = [] }) => {
          const selectedVolume = selectedList?.[0];
          if (!selectedVolume) {
            return "";
          }

          const { isHaveSnapshot, vmInstanceUuid, lastVmInstanceUuid } =
            selectedVolume;
          if (isHaveSnapshot && !vmInstanceUuid && lastVmInstanceUuid) {
            return isDelay
              ? intl.formatMessage({
                  id: "edit.vm.remove.have.snapshot.volume.tip",
                  defaultMessage: "The current disk has a snapshot and cannot be moved to the recycle bin.",
                })
              : intl.formatMessage({
                  id: "edit.vm.delete.have.snapshot.volume.tooltip",
                  defaultMessage: "The current disk has a snapshot and cannot be deleted.",
                });
          }
          if (vmInstanceUuid) {
            return isDelay
              ? intl.formatMessage({
                  id: "edit.vm.remove.associated.volume.tip",
                  defaultMessage:
                    "The selected disks have been associated with objects. Disassociate them before moving the disks to recycle bin.",
                })
              : intl.formatMessage({
                  id: "edit.vm.delete.associated.volume.tooltip",
                  defaultMessage:
                    "The selected disks have been associated with objects. Disassociate them before deleting the disks.",
                });
          }
        },
        ActionWrapper: DeleteAction,
        notSupportedModal: {
          title: intl.formatMessage({
            id: "volume.modal.title.confirm.delete.snap.memory.volume",
            defaultMessage: "Cannot Delete Disk",
          }),
        },
      },
      {
        key: "recover",
        icon: "redo-fill",
        iconStyle: {
          color: "#5ACA49",
          width: "14px",
        },
        ActionWrapper: Recover,
      },
      {
        key: "expunge",
        icon: "trash-fill",
        iconStyle: {
          color: "#F4454C",
          width: "14px",
        },
        preValidators: [verifyMultiSelect],
        validators: [verifyExpungeDataVolume],
        ActionWrapper: Expunge,
      },
    ],
    [intl, isDelay],
  );

  const config = useActionConfig<IVolume>(option);

  if (_source?.type === `Root`) {
    config.list = _filter(config.list, (it: any) => {
      return (
        it?.key !== "delete" &&
        it?.key !== "volume.attach" &&
        it?.key !== "volume.detach"
      );
    });
  }
  return config;
};

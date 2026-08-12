import { gql } from "@apollo/client";
import { Button } from "@zstack/design";
import { Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { useActionConfig } from "@zstack/zsphere-engine/src/snapshot";
import type { IOption } from "@zstack/zsphere-engine/src/snapshot/useActionConfig";
import { useAction } from "@zstack/zsphere-hooks";
import { VmInstanceState } from "@zstack/zsphere-types";
import type {
  VmInstance as IVM,
  VolumeSnapshot as IVolumeSnapshot,
  VolumeSnapshotGroup as IVolumeSnapshotGroup,
} from "@zstack/zsphere-types/graphql";
import { isEmpty } from "lodash-es";
import { useMemo } from "react";
import { useIntl } from "react-intl";
import {
  StopVmInstanceAction,
  CreateVmBySnapshot,
} from "zsv_resource_shared/vm/mf-index";

import CreateAction from "../action/create";
import DeleteAction from "../action/delete-modal";
import RevertAction from "../action/revert";
import EditAction from "../action/update-modal";
import {
  verifyDelete,
  verifyIsShareable,
  verifyMemorySnapshot,
  verifyStart,
  verifyStop,
} from "../action/validator";

import styles from "./style.module.less";

const startVmInstance = gql`
  mutation startVmInstance($input: StartVmInstanceInput!) {
    startVmInstance(input: $input) {
      actionId
    }
  }
`;

const queryVolumeSnapshotGroup = gql`
  query queryVolumeSnapshotGroup(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    volumeSnapshotGroupList(
      start: $start
      limit: $limit
      conditions: $conditions
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      list {
        uuid
        name
        description
        snapshotCount
        totalSize
        vmInstanceUuid
        vmInstance {
          uuid
          name
          state
          type
          rootVolumeUuid
          attachedShareableVolumeUuidList
          haveScsiLun
          zoneUuid
          architecture
          tpmList {
            uuid
            vmInstanceUuid
          }
          allVolumes {
            uuid
            lastAttachDate
            isShareable
          }
          primaryStorage {
            type
          }
          host {
            uuid
            name
            state
            status
            clusterUuid
          }
        }
        volumeSnapshotRefs {
          volumeName
          volumeUuid
          volumeType
          volumeLastAttachDate
          volumeSnapshotUuid
        }
        snapshotType
        createDate
        lastOpDate
      }
    }
  }
`;

export default () => {
  const intl = useIntl();
  const doAction = useAction();

  const option: IOption<IVolumeSnapshot | IVolumeSnapshotGroup, any> =
    useMemo(() => {
      return [
        {
          key: "create.snapshot",
          autoInjectPreValidator: false,
          preValidators: [verifyIsShareable],
          ActionWrapper: CreateAction,
          extraRender: (params) => {
            const { onClick, selectedList, source } = params;
            const {
              attachedShareableVolumeUuidList = [],
              state = "",
              haveScsiLun = false,
            } = (selectedList?.[0] as any)?.vmInstance ||
            source ||
            source?.vmInstance ||
            {};
            /**
             * 1.存在共享盘
             * 2.虚拟机状态为Destroyed
             * 3.存在RDM(ScsiLun)盘
             */
            if (isEmpty(source) || state === VmInstanceState.Destroyed) {
              return (
                <Button
                  icon={<Icon type="plus" />}
                  id="create-snapshot"
                  disabled
                  variant="secondary"
                >
                  {intl.formatMessage({
                    id: "create.snapshot",
                    defaultMessage: "Create Snapshot",
                  })}
                </Button>
              );
            }

            if (attachedShareableVolumeUuidList?.length > 0) {
              return (
                <Tooltip
                  title={intl.formatMessage({
                    id: "virtualization.vm.have.shareable.tips",
                    defaultMessage: "The current virtual machine has shared disks attached and cannot create a snapshot.",
                  })}
                >
                  <Button
                    icon={<Icon type="plus" />}
                    id="create-snapshot"
                    disabled
                    variant="secondary"
                  >
                    {intl.formatMessage({
                      id: "create.snapshot",
                      defaultMessage: "Create Snapshot",
                    })}
                  </Button>
                </Tooltip>
              );
            }

            if (haveScsiLun) {
              return (
                <Tooltip
                  title={intl.formatMessage({
                    id: "vm.action.create.snapshot.with.rdm.volume",
                    defaultMessage: "The virtual machine exists on RDM disk, and cannot create a snapshot.",
                  })}
                >
                  <Button
                    disabled
                    icon={<Icon type="plus" />}
                    id="create-snapshot"
                    variant="secondary"
                  >
                    {intl.formatMessage({
                      id: "create.snapshot",
                      defaultMessage: "Create Snapshot",
                    })}
                  </Button>
                </Tooltip>
              );
            }

            return (
              <Button
                icon={<Icon type="plus" />}
                id="create-snapshot"
                variant="secondary"
                onClick={() => {
                  onClick?.();
                }}
              >
                {intl.formatMessage({
                  id: "create.snapshot",
                  defaultMessage: "Create Snapshot",
                })}
              </Button>
            );
          },
        },
        // 启动 停用 todo
        {
          key: "start",
          name: intl.formatMessage({
            id: "power.start",
            defaultMessage: "Power On",
          }),
          autoInjectPreValidator: false,
          onClick: ({ source, refetch }) => {
            doAction({
              mutation: startVmInstance,
              payload: {
                uuid: source?.key,
              },
              name: intl.formatMessage({
                id: "start.vm",
                defaultMessage: "Power On VM",
              }),
              total: 1,
              type: "VmInstance",
              onFinish: () => {
                refetch?.();
              },
            });
          },
          notSupportedModal: {
            title: intl.formatMessage({
              id: "vm.modal.title.cannot.start.vm",
              defaultMessage: "Cannot Power On VM",
            }),
          },
          extraRender: ({ onClick, source }) => {
            const sourceDisabled = verifyStart(source, source);
            return (
              <Button
                onClick={() => onClick?.()}
                variant="secondary"
                icon={
                  <Icon
                    type="play-circle-fill"
                    className={styles["power-start"]}
                  />
                }
                disabled={!sourceDisabled}
              >
                {intl.formatMessage({
                  id: "power.start",
                  defaultMessage: "Power On",
                })}
              </Button>
            );
          },
        },
        {
          key: "stop",
          autoInjectPreValidator: false,
          name: intl.formatMessage({
            id: "power.stop",
            defaultMessage: "Shut Down",
          }),
          ActionWrapper: (props) => {
            const { setVisible, visible, refetch, source } = props;
            const _selectedList = [source].map((it) => ({
              uuid: it?.key,
              name: it?.title,
            }));
            return (
              <StopVmInstanceAction
                setVisible={setVisible}
                visible={visible}
                position="toolbar"
                view="main.virtualization"
                refetch={refetch}
                selectedList={_selectedList as IVM[]}
                source={source}
              />
            );
          },
          notSupportedModal: {
            title: intl.formatMessage({
              id: "vm.modal.title.cannot.stop.vm",
              defaultMessage: "Cannot Shut Down VM",
            }),
          },
          extraRender: ({ onClick, source }) => {
            const sourceDisabled = verifyStop(source, source);
            return (
              <Button
                onClick={() => onClick?.()}
                variant="secondary"
                icon={
                  <Icon
                    type="stop-circle-fill"
                    className={styles["power-off"]}
                  />
                }
                disabled={!sourceDisabled}
              >
                {intl.formatMessage({
                  id: "power.stop",
                  defaultMessage: "Shut Down",
                })}
              </Button>
            );
          },
        },
        {
          key: "revert",
          ActionWrapper: RevertAction,
          icon: "undo",
          tooltip: ({ selectedList, source }) => {
            const item =
              (selectedList?.[0] as any)?.vmInstance ||
              source ||
              (source as any)?.vmInstance;
            const {
              attachedShareableVolumeUuidList = [],
              haveScsiLun = false,
            } = item || {};
            if (attachedShareableVolumeUuidList?.length > 0) {
              return intl.formatMessage({
                id: "virtualization.vm.have.shareable.tips",
                defaultMessage: "The current virtual machine has shared disks attached and cannot create a snapshot.",
              });
            }
            if (haveScsiLun) {
              return intl.formatMessage({
                id: "vm.action.revert.snapshot.with.rdm.volume",
                defaultMessage: "The virtual machine exists with RDM disk, and cannot be restored from snapshot.",
              });
            }
          },
          preValidators: [verifyIsShareable],
        },
        {
          key: "edit.name.description",
          ActionWrapper: EditAction,
        },
        {
          key: "delete",
          ActionWrapper: DeleteAction,

          preValidators: [
            async (selectedList, source) => {
              const { deleteAble = false } = await verifyDelete(
                selectedList,
                source,
                intl,
              );
              return deleteAble;
            },
          ],
        },
        {
          key: "create.vm",
          icon: "plus",
          validators: [verifyMemorySnapshot],
          tooltip: (
            <div>
              {intl.formatMessage({
                id: "snapShot.action.create.vm.tooltip",
                defaultMessage: "The current snapshot contains a memory snapshot. You cannot create new virtual machines.",
              })}
            </div>
          ),
          ActionWrapper: CreateVmBySnapshot,
        },
      ];
    }, [doAction, intl]);

  const actions = useActionConfig<
    IVolumeSnapshot | IVolumeSnapshotGroup | IVM,
    any
  >(option);

  return { ...actions, gql: queryVolumeSnapshotGroup };
};

import { gql, useSubscription } from "@apollo/client";
import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { List, ListItem } from "@zstack/zsphere-components";
import { DialogBase, DialogWeak } from "@zstack/zsphere-design-biz";
import { ActionTaskResult } from "@zstack/zsphere-types/graphql";
import { cidrPrefix2Netmask } from "@zstack/zsphere-utils";
import { useLocalStorageState, usePersistFn, useUpdateEffect } from "ahooks";
import dayjs from "dayjs";
import { produce } from "immer";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useIntl } from "react-intl";

import {
  useAddBackupStorage,
  useAddHost,
  useAddImage,
  useAddPrimaryStorage,
  useCreateCluster,
  useCreateL2Network,
  useCreateL3Network,
  useCreateZone,
} from "./actions";
import {
  applyActionResultToDeploySteps,
  failDeployStep,
  type IAutoInitActionResult,
} from "./deploy-state";
import ProcessModal from "./process-modal";
import { IDeployState, IDeploySteps, IStepState, IStepType } from "./types";

import style from "./style.module.less";

const CreateVmInstance = React.lazy(() => import("zsv_resource/vm/create"));

const CreateL3Network = React.lazy(
  () => import("zsv_resource/l3-network/create"),
);

export type IInitWay = "bootstrap" | "basicEnv" | "backupRestore";

const LISTEN_ACTION_RESP = gql`
  subscription listenActionResp($sessionId: String!) {
    listenActionResp(sessionId: $sessionId) {
      sessionId
      actionId
      state
      type
      listenerType
      id
      fields
      inventory
      error
      listenerType
    }
  }
`;

const AutoInitModal: React.FC<{
  visible: boolean;
  setVisible: (visible: boolean) => void;
  dataSet: any;
  refetchZoneList?: Function;
}> = ({ visible, setVisible, dataSet, refetchZoneList }) => {
  const intl = useIntl();

  const [createdCluster, setCreatedCluster] = useState({
    uuid: "",
    name: "",
    zone: {
      uuid: "",
      name: "",
    },
    __typename: "Cluster",
  });

  const [createVmInstanceVisible, setCreateVmInstanceVisible] = useState(false);
  const [createL3NetworkVisible, setCreateL3NetworkVisible] = useState(false);

  // 监听回调
  const { data: actionResp } = useSubscription<{
    listenActionResp: ActionTaskResult;
  }>(LISTEN_ACTION_RESP, {
    variables: { sessionId: localStorage.getItem("sessionId") },
  });

  const [cancelModalVisible, setCancelModalVisible] = useState<boolean>(false);
  const [successModalVisible, setSuccessModalVisible] =
    useState<boolean>(false);
  const [deployState, setDeployState] = useLocalStorageState<IDeployState>(
    "deployState",
    "init",
  );
  const [deploySteps, setDeploySteps] = useLocalStorageState<IDeploySteps>(
    "deploySteps",
    [],
  );
  const [showProcessModal, setShowProcessModal] = useState<boolean>(false);
  const deployStepsRef = useRef<IDeploySteps>(deploySteps || []);
  const showProcessModalRef = useRef<boolean>(showProcessModal);

  useEffect(() => {
    deployStepsRef.current = deploySteps || [];
  }, [deploySteps]);

  useEffect(() => {
    showProcessModalRef.current = showProcessModal;
  }, [showProcessModal]);

  const updateDeploySteps = useCallback(
    (steps: IDeploySteps) => {
      deployStepsRef.current = steps;
      setDeploySteps(steps);
    },
    [setDeploySteps],
  );

  const updateShowProcessModal = useCallback((nextVisible: boolean) => {
    showProcessModalRef.current = nextVisible;
    setShowProcessModal(nextVisible);
  }, []);

  const withNetwork = useMemo(() => {
    return dataSet?.tenantNetwork?.start_ip;
  }, [dataSet]);

  const { submit: submitZone } = useCreateZone();
  const { submit: submitCluster } = useCreateCluster();
  const { submit: submitHost } = useAddHost();
  const { submit: submitBackupStorage } = useAddBackupStorage();
  const { submit: submitPrimaryStorage } = useAddPrimaryStorage();
  const { submit: submitImage } = useAddImage();
  const { submit: submitL2Network } = useCreateL2Network();
  const { submit: submitL3Network } = useCreateL3Network();

  const typeList = useMemo(() => {
    const list = [
      "Zone",
      "Cluster",
      "HostVO",
      "BackupStorage",
      "PrimaryStorageVO",
      "Image",
    ] as IStepType[];

    if (withNetwork) {
      list.push("L2Network" as IStepType);
      list.push("L3Network" as IStepType);
    }

    return list;
  }, [withNetwork]);

  const stepNameMap = new Map<IStepType, string>([
    [
      "Zone",
      intl.formatMessage({
        id: "virtualization.zone",
        defaultMessage: "Data Center",
      }),
    ],
    [
      "Cluster",
      intl.formatMessage({
        id: "virtualization.cluster",
        defaultMessage: "Cluster",
      }),
    ],
    [
      "HostVO",
      intl.formatMessage({ id: "virtualization.host", defaultMessage: "Host" }),
    ],
    [
      "PrimaryStorageVO",
      intl.formatMessage({
        id: "virtualization.data.storage",
        defaultMessage: "Data Storage",
      }),
    ],
    [
      "BackupStorage",
      intl.formatMessage({
        id: "virtualization.image.storage",
        defaultMessage: "Image Storage",
      }),
    ],
    [
      "Image",
      intl.formatMessage({
        id: "virtualization.image",
        defaultMessage: "Image",
      }),
    ],
    [
      "L2Network",
      intl.formatMessage({
        id: "virtualization.l2.network",
        defaultMessage: "Distributed Switch",
      }),
    ],
    [
      "L3Network",
      intl.formatMessage({
        id: "virtualization.l3.network",
        defaultMessage: "Distributed Port Group",
      }),
    ],
  ]);

  const stepTaskMap = new Map<IStepType, Function>([
    ["Zone", submitZone],
    ["Cluster", submitCluster],
    ["HostVO", submitHost],
    ["BackupStorage", submitBackupStorage],
    ["PrimaryStorageVO", submitPrimaryStorage],
    ["Image", submitImage],
    ["L2Network", submitL2Network],
    ["L3Network", submitL3Network],
  ]);

  const markStepFailed = useCallback(
    (stepType: IStepType, error: unknown) => {
      console.error("[auto-init] step submit failed", {
        stepType,
        error,
      });
      const failedSteps = failDeployStep(deployStepsRef.current, stepType);
      updateDeploySteps(failedSteps);
      setDeployState("fail");
    },
    [setDeployState, updateDeploySteps],
  );

  const handleRunningTask = (steps: IDeploySteps) => {
    const currentStepIndex = steps.findIndex(
      (item) => item.state === "waiting",
    );
    const currentStep = steps.find((item) => item.state === "waiting");
    const prevStep =
      currentStepIndex > 1 ? steps[currentStepIndex - 1] : undefined;
    if (currentStep) {
      let flag = true;
      if (prevStep) {
        // 上一步未完成，或者失败，都不再进行下一步
        if (prevStep.state !== "finish" || prevStep.fail === prevStep.total) {
          flag = false;
        }
      }
      if (flag) {
        const newDeploySteps = produce(steps, (draft) => {
          draft.forEach((item) => {
            if (item.type === currentStep.type) {
              item.state = "running";
              item.startTime = dayjs().toString();
              item.success = 0;
              item.fail = 0;
            }
          });
        });
        updateDeploySteps(newDeploySteps);
        const task = stepTaskMap.get(currentStep.type)!;
        const runStepTask = (...args: unknown[]) => {
          let taskResult: unknown;
          try {
            taskResult = task(...args);
          } catch (error) {
            markStepFailed(currentStep.type, error);
            return;
          }

          if (
            !taskResult ||
            typeof (taskResult as Promise<unknown>).then !== "function"
          ) {
            markStepFailed(
              currentStep.type,
              new Error(`submit returned no promise for ${currentStep.type}`),
            );
            return;
          }

          (taskResult as Promise<unknown>).catch((error) => {
            markStepFailed(currentStep.type, error);
          });
        };

        console.log("[auto-init] run step", {
          type: currentStep.type,
          total: currentStep.total,
          prevStep,
        });

        switch (currentStep.type) {
          case "Cluster":
            {
              const zoneStep = steps.find((item) => item.type === "Zone");
              const zoneUuid = zoneStep?.inventory?.uuid;

              runStepTask(zoneUuid);
            }
            break;
          case "HostVO":
            {
              const clusterStep = steps.find((item) => item.type === "Cluster");
              const zoneStep = steps.find((item) => item.type === "Zone");
              const zoneUuid = zoneStep?.inventory?.uuid;
              const clusterUuid = clusterStep?.inventory?.uuid;
              setCreatedCluster({
                uuid: clusterUuid,
                name: clusterStep?.inventory?.name,
                zone: {
                  uuid: zoneUuid,
                  name: zoneStep?.inventory?.name,
                },
                __typename: "Cluster",
              });
              runStepTask(clusterUuid, dataSet);
            }
            break;
          case "BackupStorage":
            {
              const zoneStep = steps.find((item) => item.type === "Zone");
              const zoneUuid = zoneStep?.inventory?.uuid;
              runStepTask(zoneUuid, dataSet);
            }
            break;
          case "PrimaryStorageVO":
            {
              const zoneStep = steps.find((item) => item.type === "Zone");
              const zoneUuid = zoneStep?.inventory?.uuid;
              const clusterStep = steps.find((item) => item.type === "Cluster");
              const clusterUuid = clusterStep?.inventory?.uuid;
              runStepTask(zoneUuid, clusterUuid, dataSet);
            }
            break;
          case "Image": {
            const backupStorageStep = steps.find(
              (item) => item.type === "BackupStorage",
            );
            const backupStorageUuids = [backupStorageStep?.inventory?.uuid];
            runStepTask(backupStorageUuids);
            break;
          }
          case "L2Network": {
            const zoneStep = steps.find((item) => item.type === "Zone");
            const zoneUuid = zoneStep?.inventory?.uuid;
            const clusterStep = steps.find((item) => item.type === "Cluster");
            const clusterUuid = clusterStep?.inventory?.uuid;
            runStepTask(zoneUuid, clusterUuid, dataSet);
            break;
          }
          case "L3Network": {
            const l2NetworkStep = steps.find(
              (item) => item.type === "L2Network",
            );
            const l2NetworkUuid = l2NetworkStep?.inventory?.uuid;
            runStepTask(l2NetworkUuid, dataSet);
            break;
          }
          default:
            runStepTask();
            break;
        }
      }
    }
  };

  const handleStartDeploy = usePersistFn(() => {
    const steps: IDeploySteps = typeList.map((type) => {
      const state: IStepState = "waiting";
      let total = 1;
      if (type === "HostVO" && dataSet) {
        total = dataSet.hostList.length;
      }
      if (type === "L2Network") {
        total = 1;
      }
      if (type === "L3Network") {
        total = 1;
      }
      return {
        type,
        state,
        total,
        success: 0,
        fail: 0,
      };
    });
    console.log("[auto-init] start deploy", {
      typeList,
      hostCount: dataSet?.hostList?.length || 0,
      hosts: dataSet?.hostList?.map((host: any) => ({
        name: host.hostname || host.sn,
        ip: host.ip,
        isManagementNode: host.isManagementNode,
      })),
    });
    updateDeploySteps(steps);
    setDeployState("running");
    handleRunningTask(steps);
  });

  const handleRetryDeploy = usePersistFn(() => {
    const newDeploySteps = produce(deploySteps, (draft) => {
      draft.forEach((item) => {
        if (item.state === "finish" && item.fail === item.total) {
          item.state = "waiting";
        }
      });
    });
    updateDeploySteps(newDeploySteps);
    setDeployState("running");
    handleRunningTask(newDeploySteps);
  });

  const handleActionResult = usePersistFn((result: IAutoInitActionResult) => {
    const { type, state, actionId, error, id, inventory, listenerType } =
      result;
    console.log("[auto-init] action result", {
      type,
      state,
      actionId,
      id,
      listenerType,
      hasInventory: Boolean(inventory),
      hasError: Boolean(error),
      processModalVisible: showProcessModalRef.current,
    });
    if (
      !type ||
      !typeList.includes(type as IStepType) ||
      !showProcessModalRef.current
    ) {
      return;
    }
    const currentSteps = deployStepsRef.current;
    const applyResult = applyActionResultToDeploySteps(currentSteps, result);
    if (!applyResult.changed) {
      console.log("[auto-init] ignore action result", {
        type,
        state,
        actionId,
        ignoredReason: applyResult.ignoredReason,
      });
      return;
    }

    const newDeploySteps = applyResult.steps;
    updateDeploySteps(newDeploySteps);
    if (applyResult.completedType) {
      const completedStep = newDeploySteps.find(
        (item) => item.type === applyResult.completedType,
      );
      console.log("[auto-init] step completed", {
        type: applyResult.completedType,
        success: completedStep?.success,
        fail: completedStep?.fail,
        total: completedStep?.total,
        duration: completedStep?.duration,
      });
    }
    const hasFail = newDeploySteps.some((item) => item.fail === item.total);
    if (hasFail) {
      setDeployState("fail");
    } else {
      const allFinish = newDeploySteps.every((item) => item.state === "finish");
      if (allFinish) {
        setDeployState("success");
        setSuccessModalVisible(true);
        updateShowProcessModal(false);
        setVisible(false);
      } else {
        handleRunningTask(newDeploySteps);
      }
    }
  });

  useUpdateEffect(() => {
    if (actionResp) {
      const actionResult = actionResp.listenActionResp;
      console.log(actionResp, "actionResult");
      handleActionResult(actionResult);
    }
  }, [actionResp]);

  const resourceList: ListItem[] = useMemo(() => {
    const result = [
      {
        label: (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Icon
              style={{ marginRight: 4, width: 16, height: 16, flexShrink: 0 }} type="building"
            />
            {intl.formatMessage({
              id: "auto.init.dataCenter",
              defaultMessage: "Data Center",
            })}
          </div>
        ),
        value: 1,
        children: [
          {
            label: intl.formatMessage({
              id: "auto.init.dataCenter.name",
              defaultMessage: "Data Center Name",
            }),
            value: "DataCenter-1",
          },
        ],
      },
      {
        label: (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Icon
              style={{ marginRight: 4, width: 16, height: 16, flexShrink: 0 }} type="server-1"
            />
            {intl.formatMessage({
              id: "auto.init.cluster",
              defaultMessage: "Cluster",
            })}
          </div>
        ),
        value: 1,
        children: [
          {
            label: intl.formatMessage({
              id: "auto.init.cluster.name",
              defaultMessage: "Cluster Name",
            }),
            value: "Cluster-1",
          },
        ],
      },
      {
        label: (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Icon
              style={{ marginRight: 4, width: 16, height: 16, flexShrink: 0 }} type="disk-2"
            />
            {intl.formatMessage({
              id: "auto.init.host",
              defaultMessage: "Host",
            })}
          </div>
        ),
        value: dataSet?.hostList?.length || 0,
        children: dataSet?.hostList?.reduce((acc: any[], t: any) => {
          acc.push(
            {
              label: intl.formatMessage({
                id: "auto.init.host.name",
                defaultMessage: "Host Name",
              }),
              value: t.hostname,
            },
            {
              label: intl.formatMessage({
                id: "auto.init.host.ip",
                defaultMessage: "IP Address",
              }),
              value: t.ip,
            },
          );
          return acc;
        }, []),
      },
      {
        label: (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Icon
              style={{ marginRight: 4, width: 16, height: 16, flexShrink: 0 }} type="storage"
            />
            {intl.formatMessage({
              id: "auto.init.dataStorage",
              defaultMessage: "Data Storage",
            })}
          </div>
        ),
        value: dataSet ? 1 : 0,
        children: [
          {
            label: intl.formatMessage({
              id: "auto.init.dataStorage.name",
              defaultMessage: "Storage Name",
            }),
            value: "PS-1",
          },
          {
            label: intl.formatMessage({
              id: "auto.init.dataStorage.pool",
              defaultMessage: "Storage Pool",
            }),
            value: dataSet?.storageInfo?.poolName,
          },
        ],
      },
      {
        label: (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Icon
              style={{ marginRight: 4, width: 16, height: 16, flexShrink: 0 }} type="server"
            />
            {intl.formatMessage({
              id: "auto.init.imageStorage",
              defaultMessage: "Image Storage",
            })}
          </div>
        ),
        value: dataSet ? 1 : 0,
        children: [
          {
            label: intl.formatMessage({
              id: "auto.init.imageStorage.name",
              defaultMessage: "Storage Name",
            }),
            value: "BS-1",
          },
          {
            label: intl.formatMessage({
              id: "auto.init.imageStorage.pool",
              defaultMessage: "Storage Pool",
            }),
            value: dataSet?.storageInfo?.poolName,
          },
        ],
      },
      {
        label: (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Icon
              style={{ marginRight: 4, width: 16, height: 16, flexShrink: 0 }} type="cd"
            />
            {intl.formatMessage({
              id: "auto.init.image",
              defaultMessage: "Image",
            })}
          </div>
        ),
        value: dataSet ? 1 : 0,
        children: [
          {
            label: intl.formatMessage({
              id: "auto.init.image.name",
              defaultMessage: "Image Name",
            }),
            value: `Image-1`,
          },
          {
            key: "url",
            label: intl.formatMessage({
              id: "image.url",
              defaultMessage: "Image Path",
            }),
            value: "/dvd/image-1.qcow2",
          },
        ],
      },
    ];

    if (dataSet?.tenantNetwork?.start_ip) {
      result.push(
        {
          label: (
            <div style={{ display: "flex", alignItems: "center" }}>
              <Icon
                style={{ marginRight: 4, width: 16, height: 16, flexShrink: 0 }} type="server"
              />
              {intl.formatMessage({
                id: "auto.init.distributedSwitch",
                defaultMessage: "Distributed Switch",
              })}
            </div>
          ),
          value: 1,
          children: [
            {
              label: intl.formatMessage({
                id: "auto.init.distributedSwitch.name",
                defaultMessage: "Switch Name",
              }),
              value:
                Number(dataSet?.tenantNetwork?.vlan_id) === -1
                  ? "L2NoVlanNetwork-1"
                  : "L2VlanNetwork-1",
            },
            {
              label: intl.formatMessage({
                id: "auto.init.distributedSwitch.nic.name",
                defaultMessage: "NIC Name",
              }),
              value: "bond1",
            },
          ],
        },
        {
          label: (
            <div style={{ display: "flex", alignItems: "center" }}>
              <Icon
                style={{ marginRight: 4, width: 16, height: 16, flexShrink: 0 }} type="dportgroup"
              />
              {intl.formatMessage({
                id: "auto.init.distributedVirtualPortgroup",
                defaultMessage: "Distributed Port Group",
              })}
            </div>
          ),
          value: 1,
          children: [
            {
              label: intl.formatMessage({
                id: "auto.init.distributedVirtualPortgroup.name",
                defaultMessage: "Port Group Name",
              }),
              value: "L3FlatNetwork-1",
            },
            {
              label: intl.formatMessage({
                id: "auto.init.distributedVirtualPortgroup.vlanId",
                defaultMessage: "VLAN ID",
              }),
              value: dataSet?.distributedVirtualPortgroup?.map(
                (t: any) => t.vlanId,
              ),
            },
            {
              label: intl.formatMessage({
                id: "auto.init.distributedVirtualPortgroup.ipRange",
                defaultMessage: "IP Range",
              }),
              value: `${dataSet?.tenantNetwork?.start_ip} - ${dataSet?.tenantNetwork?.end_ip}`,
            },
            {
              label: intl.formatMessage({
                id: "auto.init.distributedVirtualPortgroup.mask",
                defaultMessage: "Netmask",
              }),
              value: cidrPrefix2Netmask(
                Number(dataSet?.tenantNetwork?.netmask),
              ),
            },
            {
              label: intl.formatMessage({
                id: "auto.init.distributedVirtualPortgroup.gateway",
                defaultMessage: "Gateway",
              }),
              value: dataSet?.tenantNetwork?.gateway,
            },
          ],
        },
      );
    }
    return result;
  }, [intl, dataSet]);

  const onNextButton = useCallback(() => {
    setVisible(false);
    updateShowProcessModal(true);
    handleStartDeploy();
  }, [setVisible, updateShowProcessModal, handleStartDeploy]);

  const handleBackToHome = () => {
    updateShowProcessModal(false);
  };

  return (
    <>
      <DialogBase
        title={intl.formatMessage({
          id: "welcome.modal.title",
          defaultMessage: "Welcome to Initialization Wizard",
        })}
        visible={visible}
        setVisible={setVisible}
        widthClassName="w-[600px]"
        footer={
          <>
            <Button
              id="modal-cancel"
              key="cancel"
              variant="link"
              onClick={() => {
                setCancelModalVisible(true);
              }}
              disabled={!visible}
            >
              {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
            </Button>
            <Button
              id="modal-ok"
              key="confirm"
              variant="primary"
              onClick={onNextButton}
              disabled={!visible}
            >
              <div style={{ display: "contents" }}>
                <span>
                  {intl.formatMessage({
                    id: "start.init",
                    defaultMessage: "Initialize",
                  })}
                </span>
              </div>
            </Button>
          </>
        }
      >
        <div className={style.modalContent}>
          <div className={style.initDesc}>
            {intl.formatMessage({
              id: "auto.init.confirm.title",
              defaultMessage:
                "The platform will be initialized with the following resource configurations. Check and proceed.",
            })}
          </div>
          <List list={resourceList} bordered={true} />
        </div>
      </DialogBase>
      <DialogWeak
        type="warning"
        title={intl.formatMessage({
          id: "cancel.auto.init.confirm.title",
          defaultMessage: "Exit Automatic Initialization?",
        })}
        visible={cancelModalVisible}
        setVisible={setCancelModalVisible}
        onConfirm={() => {
          setCancelModalVisible(false);
          setVisible(false);
        }}
        onCancel={() => {
          setCancelModalVisible(false);
          refetchZoneList?.();
          // setVisible(false)
        }}
        description={intl.formatMessage({
          id: "cancel.auto.init.confirm.content",
          defaultMessage:
            "Exiting will cancel all automated resource creation. If the platform has no resources, you can restart initialization using the wizard later.",
        })}
      />
      <DialogBase
        title={intl.formatMessage({
          id: "auto.init.success.title",
          defaultMessage: "Automatic Initialization Complete",
        })}
        visible={successModalVisible}
        setVisible={setSuccessModalVisible}
        footer={
          <>
            <Button
              variant="link"
              onClick={() => {
                setSuccessModalVisible(false);
                setVisible(false);
                refetchZoneList?.();
                window.location.href = "/virtualization-dashboard";
              }}
            >
              {intl.formatMessage({
                id: "operation.cancel",
                defaultMessage: "Cancel",
              })}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setSuccessModalVisible(false);
                setVisible(false);
                refetchZoneList?.();
                if (withNetwork) {
                  setCreateVmInstanceVisible(true);
                } else {
                  setCreateL3NetworkVisible(true);
                }
              }}
            >
              {withNetwork
                ? intl.formatMessage({
                    id: "auto.init.success.onOkText.with.network",
                    defaultMessage: "New Virtual Machine",
                  })
                : intl.formatMessage({
                    id: "wizard.create.l3.network",
                    defaultMessage: "New Distributed Port Group",
                  })}
            </Button>
          </>
        }
      >
        {/*TODO: 这里需要判断是否新建了网络资源， */}
        {withNetwork
          ? intl.formatMessage({
              id: "auto.init.success.content",
              defaultMessage:
                "You have completed the necessary resource creations for environment initialization. You may now start using the platform.",
            })
          : intl.formatMessage({
              id: "auto.init.success.content.without.network",
              defaultMessage:
                "Manual network resource configuration is required before using the platform.",
            })}
      </DialogBase>
      <ProcessModal
        visible={showProcessModal}
        setVisible={updateShowProcessModal}
        onCancel={() => {
          updateShowProcessModal(false);
        }}
        setAutoInitModalVisible={setVisible}
        deployState={deployState}
        deploySteps={deploySteps}
        stepNameMap={stepNameMap}
        onStart={handleStartDeploy}
        onBack={handleBackToHome}
        refetchZoneList={refetchZoneList}
        onRetry={handleRetryDeploy}
      />
      <CreateVmInstance
        visible={createVmInstanceVisible}
        setVisible={setCreateVmInstanceVisible}
        view="create"
        selectedList={[]}
        position="header"
        source={createdCluster}
      />
      <CreateL3Network
        visible={createL3NetworkVisible}
        setVisible={setCreateL3NetworkVisible}
        view="create"
        selectedList={[]}
        position="header"
        source={createdCluster}
      />
    </>
  );
};

export default AutoInitModal;

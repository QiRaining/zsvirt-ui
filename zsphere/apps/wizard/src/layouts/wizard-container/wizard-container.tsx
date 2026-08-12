import { gql, useQuery } from "@apollo/client";
import { Button } from "@zstack/design";
import { Icon, type IconTypes } from "@zstack/icon";
import { Spin } from "@zstack/zsphere-components";
import { Alert, DialogWeak } from "@zstack/zsphere-design-biz";
import type { IActionResult } from "@zstack/zsphere-hooks";
import type { FC } from "react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";
import OperationDetail from "zsv_shared/operation-log/detail";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { BackupStorageCreator } from "../../components/backup-storage-creator/backup-storage-creator";
import { ClusterCreator } from "../../components/cluster-creator/cluster-creator";
import { HostCreator } from "../../components/host-creator/host-creator";
import { ImageCreator } from "../../components/image-creator/image-creator";
import type { IWizardFormHandler } from "../../components/interface";
import { L3NetworkCreator } from "../../components/l2-network-creator/l3-network-creator";
import { PrimaryStorageCreatorWrapper } from "../../components/primary-storage-creator/primary-storage-creator";
import RootNodeCreator from "../../components/root-node-creator/root-node-creator";
import { useGetWizardInfo } from "../../hooks/use-get-wizard-info";
import type { IStep } from "./hooks/use-steps";
import { useSteps } from "./hooks/use-steps";

import style from "./style.module.less";

interface IWizardContainerProps {}

const GET_ZONE_TOTAL = gql`
  query zoneList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $start: Int
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    zoneList(
      conditions: $conditions
      extraConditions: $extraConditions
      start: $start
      limit: $limit
      replyWithCount: true
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
    }
  }
`;

// 全局Store状态
interface IWizardStore {
  steps: IStep[];
  setSteps: (steps: IStep[]) => void;
  currentStep: number;
  goToNextStep: () => void;
  setCurrentStep: (step: number) => void;
  visible: boolean;
  setVisible: () => void;
  wizardInfo: any;
  setWizardInfo: (wizardInfo: any) => void;
  zoneUuid: string;
  setZoneUuid: (zoneUuid: string) => void;
  zoneName: string;
  setZoneName: (zoneName: string) => void;
  clusterUuid: string;
  setClusterUuid: (clusterUuid: string) => void;
  clusterName: string;
  setClusterName: (clusterName: string) => void;
  loading: boolean;
  setLoading: () => void;
  quitModalVisible: boolean;
  setQuitModalVisible: () => void;
  backupStorageName: string;
  setBackupStorageName: (backupStorageName: string) => void;
  backupStorageUuid: string;
  setBackupStorageUuid: (backupStorageUuid: string) => void;
  reset: () => void;
}

const initialState = {
  steps: [],
  wizardInfo: {},
  currentStep: 0,
  visible: true,
  zoneUuid: "",
  zoneName: "",
  clusterUuid: "",
  clusterName: "",
  loading: false,
  quitModalVisible: false,
  backupStorageName: "",
  backupStorageUuid: "",
};

// 声明Wizard子应用全局store
export const useWizardStore = create<IWizardStore>((set) => ({
  ...initialState,
  setSteps: (steps) => set({ steps }),
  goToNextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  setCurrentStep: (step) => set({ currentStep: step }),
  setVisible: () => set((state) => ({ visible: !state.visible })),
  setZoneUuid: (zoneUuid: string) => set({ zoneUuid }),
  setZoneName: (zoneName: string) => set({ zoneName }),
  setClusterUuid: (clusterUuid: string) => set({ clusterUuid }),
  setClusterName: (clusterName: string) => set({ clusterName }),
  setLoading: () => set((state) => ({ loading: !state.loading })),
  setQuitModalVisible: () =>
    set((state) => ({ quitModalVisible: !state.quitModalVisible })),
  setBackupStorageName: (backupStorageName: string) =>
    set({ backupStorageName }),
  setBackupStorageUuid: (backupStorageUuid: string) =>
    set({ backupStorageUuid }),
  reset: () => {
    set(initialState);
  },
  setWizardInfo: (wizardInfo: any) => set({ wizardInfo }),
}));

export const WizardContainer: FC<IWizardContainerProps> = () => {
  const originalSteps = useSteps();
  const intl = useIntl();
  const navigate = useNavigate();
  const [
    steps,
    setSteps,
    currentStep,
    setCurrentStep,
    goToNextStep,
    loading,
    setLoading,
    quitModalVisible,
    setQuitModalVisible,
    setZoneName,
    setZoneUuid,
    setClusterName,
    setClusterUuid,
    setBackupStorageName,
    setBackupStorageUuid,
    setWizardInfo,
    wizardInfo,
    _clusterUuid,
    _zoneUuid,
    reset,
  ] = useWizardStore(
    useShallow((state) => [
      state.steps,
      state.setSteps,
      state.currentStep,
      state.setCurrentStep,
      state.goToNextStep,
      state.loading,
      state.setLoading,
      state.quitModalVisible,
      state.setQuitModalVisible,
      state.setZoneName,
      state.setZoneUuid,
      state.setClusterName,
      state.setClusterUuid,
      state.setBackupStorageName,
      state.setBackupStorageUuid,
      state.setWizardInfo,
      state.wizardInfo,
      state.clusterUuid,
      state.zoneUuid,
      state.reset,
    ]),
  );

  const { data: zoneListData } = useQuery(GET_ZONE_TOTAL, {
    fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
    variables: {
      sortBy: "createDate",
      sortDirection: "asc",
    },
    errorPolicy: "ignore",
    onCompleted(data) {
      const total = data?.zoneList?.total ?? 0;
      if (total > 0) {
        navigate("/virtualization-dashboard");
      }
    },
  });

  const { data: wizardInfoData } = useGetWizardInfo();

  useEffect(() => {
    if (wizardInfoData) {
      setWizardInfo(wizardInfoData);
    }
  }, [wizardInfoData, setWizardInfo]);

  useEffect(() => {
    if (zoneListData !== undefined) {
      const total = zoneListData?.zoneList?.total ?? 0;
      if (total === 0) {
        // 没有数据中心，重置所有状态
        reset();
        setCurrentStep(0);
      }
    }
  }, [zoneListData, reset, setCurrentStep]);

  useEffect(() => {
    const prevSteps = useWizardStore.getState().steps;
    const hasZone = zoneListData?.zoneList?.total > 0;

    const updatedSteps = originalSteps?.map((step, index) => ({
      ...step,
      done: hasZone ? prevSteps[index]?.done || false : false,
    }));

    setSteps(updatedSteps);
  }, [intl, zoneListData, setSteps]);

  const handleSubmit = useCallback(() => {
    formRef.current!.submit().then(() => {
      console.log("formRef.current", formRef.current);
      setLoading();
    });
  }, [setLoading]);

  const handleTaskFinished = useCallback(
    async (actionResult: IActionResult) => {
      setLoading();
      console.log("actionResult in task finished", actionResult);
      if (actionResult.current === actionResult.success) {
        setShowAlert(false);
        // 下面的其实都可以做成配置来代替硬编码，但考虑到ROI不高，先不管
        // 创建完区域后保存区域uuid和name
        if (currentStep === 0) {
          setZoneUuid(actionResult.inventory.uuid);
          setZoneName(actionResult.inventory.name);
        }
        // 创建完集群后保存集群uuid和name
        if (currentStep === 1) {
          setClusterUuid(actionResult.inventory.uuid);
          setClusterName(actionResult.inventory.name);
        }
        // 创建完镜像存储后保存镜像存储uuid和name
        if (currentStep === 4) {
          setBackupStorageUuid(actionResult.inventory.uuid);
          setBackupStorageName(actionResult.inventory.name);
        }

        const tempSteps = [...steps];
        tempSteps[currentStep].done = true;
        setSteps(tempSteps);
        // Wizard所有步骤完成退出
        if (currentStep + 1 === steps.length) {
          sessionStorage.setItem("showWizardSuccessModal", "true");
          navigate("/virtualization-dashboard");
        } else {
          goToNextStep();
        }
      } else {
        // in this case, the action id should always have a value
        setActionId(actionResult.actionId!);
        setShowAlert(true);
      }
    },
    [
      steps,
      currentStep,
      setZoneUuid,
      setZoneName,
      setClusterUuid,
      setClusterName,
      setBackupStorageUuid,
      setBackupStorageName,
      setSteps,
      goToNextStep,
      setLoading,
    ],
  );

  const formRef = useRef<IWizardFormHandler>(null);

  const [showOperationDetail, setShowOperationDetail] = useState(false);
  const [actionId, setActionId] = useState<string>("");
  const [showAlert, setShowAlert] = useState(false);
  // 状态管理Hook
  const useAddModeState = (list?: any[]) => {
    const initialMode = list && list.length > 0 ? "auto" : "manual";
    const [mode, setMode] = useState<string>(initialMode);
    const [hasSelected, setHasSelected] = useState<boolean>(false);

    return {
      mode,
      setMode,
      hasSelected,
      setHasSelected,
    };
  };

  const hostState = useAddModeState(wizardInfo?.hostList);
  const psState = useAddModeState(wizardInfo?.storageInfo?.monList);
  const bsState = useAddModeState(wizardInfo?.storageInfo?.monList);

  // 解构获取需要的状态
  const {
    mode: hostAddMode,
    setMode: setHostAddMode,
    hasSelected: hasSelectedHosts,
    setHasSelected: setHasSelectedHosts,
  } = hostState;
  const {
    mode: psAddMode,
    setMode: setPsAddMode,
    hasSelected: hasSelectedMons,
    setHasSelected: setHasSelectedMons,
  } = psState;
  const {
    mode: bsAddMode,
    setMode: setBsAddMode,
    hasSelected: hasSelectedBs,
    setHasSelected: setHasSelectedBs,
  } = bsState;

  const [isArchLicenseConflict, setIsArchLicenseConflict] = useState(false);
  // 判断确定按钮是否应该禁用
  const isSubmitDisabled = useMemo(() => {
    if (currentStep === 1 && isArchLicenseConflict) {
      return true;
    }
    const stepValidationMap = {
      2: hostAddMode === "auto" && !hasSelectedHosts,
      3: psAddMode === "auto" && !hasSelectedMons,
      4: bsAddMode === "auto" && !hasSelectedBs,
    } as Record<number, boolean>;

    return stepValidationMap[currentStep] ?? false;
  }, [
    currentStep,
    hasSelectedHosts,
    hostAddMode,
    hasSelectedMons,
    psAddMode,
    hasSelectedBs,
    bsAddMode,
    isArchLicenseConflict,
  ]);

  const handleHostAddModeChange = useCallback((mode: string) => {
    setHostAddMode(mode);
  }, []);

  const handleHostSelectionChange = useCallback((hasSelected: boolean) => {
    setHasSelectedHosts(hasSelected);
  }, []);

  const handlePsAddModeChange = useCallback((mode: string) => {
    setPsAddMode(mode);
  }, []);

  const handleMonSelectionChange = useCallback((hasSelected: boolean) => {
    setHasSelectedMons(hasSelected);
  }, []);

  const handleBsAddModeChange = useCallback((mode: string) => {
    setBsAddMode(mode);
  }, []);

  const handleBsSelectionChange = useCallback((hasSelected: boolean) => {
    setHasSelectedBs(hasSelected);
  }, []);

  const isFirstStep = currentStep === 0;
  const getQuitModalMessage = useMemo(() => {
    return isFirstStep
      ? intl.formatMessage({
          id: "wizard.quit.modal.confirm.detail.first.step",
          defaultMessage:
            "Exiting will cancel all resource creation. If the platform has no resources, you can restart initialization using the wizard later.",
        })
      : intl.formatMessage({
          id: "wizard.quit.modal.confirm.detail",
          defaultMessage:
            "Exiting will cancel all resource creation. If the platform has no resources, you can restart initialization using the wizard later.",
        });
  }, [isFirstStep, intl]);

  return (
    <div className={style["wizard-container"]}>
      <div className={style["nav-bar"]}>
        <div className={style["nav-header-container"]}>
          <img
            alt="wizard"
            style={{ width: 32 }}
            src={require("../../assets/wizard.svg")}
            className={style["wizard-title-img"]}
          />
          <div className={style["wizard-title"]}>
            {intl.formatMessage({
              id: "init.guide",
              defaultMessage: "Initialize Manually",
            })}
          </div>
        </div>
        <div style={{ padding: "0 12px 0 12px" }}>
          {steps.map((step, index) => (
            <div
              key={`step-${index}-${step.label}`}
              onClick={() => {}}
              className={style["step-tile-container"]}
              style={{
                backgroundColor: index === currentStep ? "#DBDDE0" : "inherit",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <div
                  style={{
                    width: "16px",
                    marginLeft: "8px",
                    marginRight: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {steps[index].done && (
                    <Icon type="checkmark-circle-fill" color="positive" />
                  )}
                  {loading && currentStep === index && (
                    <Icon
                      type="loader"
                      color="info"
                      className={style.loadingIcon}
                    />
                  )}
                </div>
                {index + 1}.{step.label}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={style["main-container"]}>
        <div className={style["header-container"]}>
          <div className={style["header-label"]}>
            {steps[currentStep]?.label}
          </div>
        </div>
        <div className={style["form-wrapper"]}>
          <div className={style["form-container"]}>
            <div className={style["form-inner-container"]}>
              {showAlert && (
                <Alert
                  variant="danger"
                  closable
                  style={{ margin: "0 0 24px 0" }}
                  guideAction={{
                    text: intl.formatMessage({
                      id: "view.detail",
                      defaultMessage: "View Details",
                    }),
                    onClick: () => setShowOperationDetail(true),
                  }}
                >
                  {steps[currentStep]?.errorMessage}
                </Alert>
              )}
              {/*总共7步，可以做成配置，但ROI不高，先不管*/}
              {currentStep === 0 && (
                <RootNodeCreator
                  ref={formRef}
                  handleTaskFinished={handleTaskFinished}
                />
              )}
              {currentStep === 1 && (
                <ClusterCreator
                  ref={formRef}
                  handleTaskFinished={handleTaskFinished}
                  onArchLicenseConflictChange={setIsArchLicenseConflict}
                />
              )}
              {currentStep === 2 && (
                <HostCreator
                  ref={formRef}
                  handleTaskFinished={handleTaskFinished}
                  onHostSelectionChange={handleHostSelectionChange}
                  onHostAddModeChange={handleHostAddModeChange}
                />
              )}
              {currentStep === 3 && (
                <PrimaryStorageCreatorWrapper
                  ref={formRef}
                  handleTaskFinished={handleTaskFinished}
                  onMonSelectionChange={handleMonSelectionChange}
                  onPsAddModeChange={handlePsAddModeChange}
                />
              )}
              {currentStep === 4 && (
                <BackupStorageCreator
                  ref={formRef}
                  handleTaskFinished={handleTaskFinished}
                  onBsSelectionChange={handleBsSelectionChange}
                  onBsAddModeChange={handleBsAddModeChange}
                />
              )}
              {currentStep === 5 && (
                <ImageCreator
                  ref={formRef}
                  handleTaskFinished={handleTaskFinished}
                />
              )}
              {currentStep === 6 && (
                <L3NetworkCreator
                  ref={formRef}
                  handleTaskFinished={handleTaskFinished}
                />
              )}
            </div>

            <div className={style.footer}>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
              >
                {intl.formatMessage({
                  id: "ok",
                  defaultMessage: "OK",
                })}
              </Button>
              <Button
                variant="link"
                style={{ marginLeft: "8px" }}
                onClick={setQuitModalVisible}
              >
                {intl.formatMessage({
                  id: "cancel",
                  defaultMessage: "Cancel",
                })}
              </Button>
            </div>
            {loading && (
              <div className={style["loading-overlay"]}>
                <Spin />
              </div>
            )}
          </div>
          <div className={style["guide-container"]}>
            <div className={style["guide-header"]}>
              <div
                style={{
                  paddingLeft: "24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Icon
                  type={steps[currentStep]?.icon as IconTypes}
                  style={{
                    marginRight: "2px",
                    top: 0.5,
                    width: "16px",
                    height: "16px",
                  }}
                />
                {steps[currentStep]?.guideTitle}
              </div>
            </div>
            <div className={style["guide-detail"]}>
              <div style={{ color: "#707275" }}>
                <p>{steps[currentStep]?.guideDetail}</p>
                <p>
                  {intl.formatMessage({
                    id: "wizard.guide.detail.sub",
                    defaultMessage: "   ",
                  })}
                </p>
                <img src={steps[currentStep]?.guideImage} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <DialogWeak
        title={intl.formatMessage({
          id: "wizard.quit.confirm",
          defaultMessage: "Exit Manual Initialization?",
        })}
        type="warning"
        onConfirm={() => {
          reset();
          setQuitModalVisible();
          navigate("/virtualization-dashboard");
        }}
        visible={quitModalVisible}
        setVisible={setQuitModalVisible}
        description={getQuitModalMessage}
      />
      <OperationDetail
        visible={showOperationDetail}
        setVisible={setShowOperationDetail}
        actionId={actionId}
      />
    </div>
  );
};

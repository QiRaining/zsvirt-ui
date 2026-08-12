import { useQuery, gql } from "@apollo/client";
import { Checkbox, Button, Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Select } from "@zstack/zsphere-components";
import { Alert, DialogBase } from "@zstack/zsphere-design-biz";
import { useUserIdentity } from "@zstack/zsphere-hooks";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import type {
  Zone,
  ManagementNodesStatus,
} from "@zstack/zsphere-types/graphql";
import { bus, isIP } from "@zstack/zsphere-utils";
import type { FC } from "react";
import { useState, useMemo, useCallback, useEffect, memo } from "react";
import { useIntl } from "react-intl";
import WelcomeModal from "zsv_wizard/components/welcome-modal/index";
import { useShallow } from "zustand/react/shallow";

import { useDashboardStore } from "../store/use-dashboard-store";
import useCheckCurrentLogin from "../widgets/useCheckCurrentLogin";

import style from "../pages/style.module.less";

// 提取为模块级常量，避免每次渲染创建新对象
const ZONE_LIST_VARIABLES = {
  sortBy: "createDate",
  sortDirection: "asc",
} as const;

const TELEMETRY_CONSENT_BLOCKING_EVENT = "telemetry:consent-gate:blocking";
const TELEMETRY_CONSENT_BLOCKING_KEY = "zsv.telemetry.consent-gate.blocking";

const GET_ZONE_LIST = gql`
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
      list {
        clusterCount
        hostCount
        primaryStorageCount
        l2NetworkCount
        vmInstanceCount
        volumeCount
        backupStorageCount
        uuid
        name
        description
        state
        isDefault
        createDate
        lastOpDate
      }
    }
  }
`;

const GET_MANAGEMENT_NODES_STATUS = gql`
  query getManagementNodesStatus {
    getManagementNodesStatus {
      nodes {
        ip
        managementsNodeStatus
        databaseStatus
        gatewayIp
        gatewayReachable
        haMonitorStatus
        keepalivedStatus
        ownsVip
        peerReachable
        slaveIoRunning
        slaveSqlRunning
        uiStatus
        vipReachable
      }
      vip
      uiHttpPath
    }
  }
`;

interface IHeaderProps {}

export const Header: FC<IHeaderProps> = memo(() => {
  const intl = useIntl();
  const { isAccount } = useCheckCurrentLogin();
  const { isSystemAdmin } = useUserIdentity();
  const { managementNode } = usePlatformStore();
  const [zoneList, setZoneList] = useState<Zone[]>([]);
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [showVipTipModal, setShowVipTipModal] = useState(false);
  const [showSingleNodeGuideModal, setShowSingleNodeGuideModal] =
    useState(false);
  const [shouldHandleFirstLogin, setShouldHandleFirstLogin] = useState(false);
  const [suppressVipTip, setSuppressVipTip] = useState(
    () => localStorage.getItem("vip-tip-suppress") === "true",
  );
  const [vipTipDraft, setVipTipDraft] = useState(suppressVipTip);
  const [telemetryConsentBlocking, setTelemetryConsentBlocking] =
    useState(isSystemAdmin);
  const [selectedZoneUuid, setSelectedZoneUuid] = useDashboardStore(
    useShallow((state) => [state.zoneUuid, state.setZoneUuid]),
  );

  useEffect(() => {
    const handleTelemetryConsentBlocking = (blocking: boolean) => {
      setTelemetryConsentBlocking(isSystemAdmin && Boolean(blocking));
    };

    bus.addListener(
      TELEMETRY_CONSENT_BLOCKING_EVENT,
      handleTelemetryConsentBlocking,
    );
    handleTelemetryConsentBlocking(
      sessionStorage.getItem(TELEMETRY_CONSENT_BLOCKING_KEY) !== "false",
    );

    return () => {
      bus.removeListener(
        TELEMETRY_CONSENT_BLOCKING_EVENT,
        handleTelemetryConsentBlocking,
      );
    };
  }, [isSystemAdmin]);

  const isDoubleManagementNode = managementNode?.isDoubleManagementNode;
  const isSingleNode = !managementNode?.isDoubleManagementNode;

  // 查询管理节点状态
  const { data: managementNodesStatusData, loading: managementNodesLoading } =
    useQuery<{
      getManagementNodesStatus: ManagementNodesStatus;
    }>(GET_MANAGEMENT_NODES_STATUS, {
      onCompleted(data) {
        const ifFirstLoginVip = localStorage.getItem("first-login-vip");
        if (
          ifFirstLoginVip &&
          isDoubleManagementNode &&
          data?.getManagementNodesStatus?.nodes
        ) {
          const vipAddress = data.getManagementNodesStatus.vip;
          const currentHostname = window.location.hostname;
          const isVipAccess = currentHostname === vipAddress;
          if (!isVipAccess && isIP(currentHostname) && !suppressVipTip) {
            setShowVipTipModal(true);
          }
        }
        // VIP 检查完成后清除 VIP 提示标记
        localStorage.removeItem("first-login-vip");
      },
    });

  // 获取VIP信息
  const vipInfo = useMemo(() => {
    const managementNodesStatus =
      managementNodesStatusData?.getManagementNodesStatus;
    const managementNodes = managementNodesStatus?.nodes || [];
    const primaryNode = managementNodes.find((node) => node.ownsVip);
    return {
      vipAddress: managementNodesStatus?.vip,
      primaryNode,
    };
  }, [managementNodesStatusData]);

  const {
    data: zoneListData,
    error,
    loading: zoneListLoading,
    refetch: refetchZoneList,
  } = useQuery(GET_ZONE_LIST, {
    fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
    variables: ZONE_LIST_VARIABLES,
    onCompleted(data) {
      const list = data?.zoneList?.list ?? [];
      setZoneList(list);
      setSelectedZoneUuid(list?.[0]?.uuid);
      // 检查是否需要处理首次登录逻辑
      const ifFirstLogin = localStorage.getItem("first-login");
      if (ifFirstLogin === "true" && !isAccount) {
        const hasNoResource = list.length === 0;
        const hasResource = list.length > 0;

        if (hasNoResource) {
          setShouldHandleFirstLogin(true);
        } else if (hasResource && isDoubleManagementNode) {
          setShouldHandleFirstLogin(true);
        }
      }
      localStorage.removeItem("first-login");
    },
  });
  const handleCloseVipTip = useCallback(() => {
    if (vipTipDraft) {
      localStorage.setItem("vip-tip-suppress", "true");
      setSuppressVipTip(true);
    } else {
      localStorage.removeItem("vip-tip-suppress");
      setSuppressVipTip(false);
    }
    setShowVipTipModal(false);
    const hasNoResource = zoneListData?.zoneList?.list?.length === 0;
    if (hasNoResource) {
      setShowWizardModal(true);
    }
  }, [zoneListData, vipTipDraft]);

  const handleGoToVip = useCallback(() => {
    if (vipTipDraft) {
      localStorage.setItem("vip-tip-suppress", "true");
      setSuppressVipTip(true);
    } else {
      localStorage.removeItem("vip-tip-suppress");
      setSuppressVipTip(false);
    }
    if (vipInfo.vipAddress) {
      const protocol = window.location.protocol;
      window.open(
        `${protocol}//${vipInfo.vipAddress}`,
        "_blank",
        "noopener,noreferrer",
      );
    }
    setShowVipTipModal(false);
    const hasNoResource = zoneListData?.zoneList?.list?.length === 0;
    if (hasNoResource) {
      setShowWizardModal(true);
    }
  }, [vipInfo, zoneListData, vipTipDraft]);

  // 弹窗打开时同步草稿勾选状态
  useEffect(() => {
    if (showVipTipModal) {
      setVipTipDraft(suppressVipTip);
    }
  }, [showVipTipModal, suppressVipTip]);

  useEffect(() => {
    if (
      shouldHandleFirstLogin &&
      !telemetryConsentBlocking &&
      !zoneListLoading &&
      !managementNodesLoading
    ) {
      const hasNoResource = zoneListData?.zoneList?.list?.length === 0;
      const hasResource = (zoneListData?.zoneList?.list?.length ?? 0) > 0;

      // 无资源 + 单管环境
      if (hasNoResource && isSingleNode) {
        setShowSingleNodeGuideModal(true);
        setShouldHandleFirstLogin(false);
      }
      // 无资源 + 双管环境
      else if (hasNoResource && isDoubleManagementNode) {
        const managementNodesStatus =
          managementNodesStatusData?.getManagementNodesStatus;
        const vipAddress = managementNodesStatus?.vip;
        const currentHostname = window.location.hostname;
        const isVipAccess = currentHostname === vipAddress;

        if (isVipAccess) {
          setShowWizardModal(true);
          setShouldHandleFirstLogin(false);
        } else if (isIP(currentHostname) && !suppressVipTip) {
          setShowVipTipModal(true);
          setShouldHandleFirstLogin(false);
        }
      }
      //有资源 + 双管环境
      else if (hasResource && isDoubleManagementNode) {
        const managementNodesStatus =
          managementNodesStatusData?.getManagementNodesStatus;
        const vipAddress = managementNodesStatus?.vip;
        const currentHostname = window.location.hostname;
        const isVipAccess = currentHostname === vipAddress;
        if (!isVipAccess && isIP(currentHostname) && !suppressVipTip) {
          setShowVipTipModal(true);
          setShouldHandleFirstLogin(false);
        } else {
          setShouldHandleFirstLogin(false);
        }
      }
    }
  }, [
    shouldHandleFirstLogin,
    zoneListLoading,
    managementNodesLoading,
    zoneListData,
    isSingleNode,
    isDoubleManagementNode,
    managementNodesStatusData,
    suppressVipTip,
    telemetryConsentBlocking,
  ]);

  const handleGoToMnOps = useCallback(() => {
    window.open(
      `http://${window.location.hostname}:14300`,
      "_blank",
      "noopener,noreferrer",
    );
    setShowSingleNodeGuideModal(false);
  }, []);

  // 单管环境：直接初始化
  const handleDirectInitFromSingleNode = useCallback(() => {
    setShowSingleNodeGuideModal(false);
    setShowWizardModal(true);
  }, []);

  // 稳定化内联样式对象
  const alertStyle = useMemo(() => ({ margin: "15px 25px 0 25px" }), []);
  const footerStyle = useMemo(
    () => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      flexWrap: "nowrap" as const,
      width: "100%",
      gap: 8,
    }),
    [],
  );
  const goMnOpsButtonStyle = useMemo(
    () => ({ display: "flex", alignItems: "center" }),
    [],
  );
  const iconStyle = useMemo(() => ({ marginRight: 6 }), []);
  const tipMessageStyle = useMemo(() => ({ marginBottom: 12 }), []);
  const checkboxContainerStyle = useMemo(() => ({ marginTop: 4 }), []);

  return (
    <>
      {!isAccount &&
        !zoneListLoading &&
        zoneListData?.zoneList?.list?.length === 0 &&
        !error && (
          <Alert
            variant="info"
            closable
            style={alertStyle}
            guideAction={{
              text: intl.formatMessage({
                id: "wizard.alert.start.init",
                defaultMessage: "Start Initialization",
              }),
              onClick: () => setShowWizardModal(true),
            }}
          >
            {intl.formatMessage({
              id: "wizard.alert.no.resource",
              defaultMessage:
                "On your first login, you can quickly set up an initial environment or restore the environment from a platform database backup through the initialization wizard.",
            })}
          </Alert>
        )}
      <div className={style.toolbar}>
        {!isAccount && (
          <>
            <span className={style.leftLabel}>
              {intl.formatMessage({
                id: "zone",
                defaultMessage: "Data Center",
              })}
              ：
            </span>
            {zoneList && zoneList?.length > 0 && (
              <Select
                key={selectedZoneUuid}
                defaultValue={selectedZoneUuid}
                bordered={false}
                onChange={(uuid) => setSelectedZoneUuid(uuid)}
                size="small"
                dropdownMatchSelectWidth={false}
                dropdownClassName={style.zoneDropdown}
              >
                {zoneList?.map((zone) => (
                  <Select.Option value={zone?.uuid} key={zone?.uuid}>
                    <Text>
                      {intl.formatMessage(
                        {
                          id: "dashboard.zone",
                          defaultMessage: "{zone}",
                        },
                        { zone: zone?.name },
                      )}
                    </Text>
                  </Select.Option>
                ))}
              </Select>
            )}
          </>
        )}
      </div>
      <WelcomeModal
        visible={showWizardModal}
        setVisible={setShowWizardModal}
        refetchZoneList={refetchZoneList}
      />

      {/* 单管环境引导弹窗 */}
      <DialogBase
        title={intl.formatMessage({
          id: "welcome.modal.single.node.guide.title",
          defaultMessage: "Set Up MN HA",
        })}
        visible={showSingleNodeGuideModal}
        setVisible={setShowSingleNodeGuideModal}
        footer={
          <span style={footerStyle}>
            <Button
              variant="link"
              onClick={() => setShowSingleNodeGuideModal(false)}
            >
              {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
            </Button>
            <Button
              variant="secondary"
              onClick={handleDirectInitFromSingleNode}
            >
              {intl.formatMessage({
                id: "welcome.modal.direct.init.button",
                defaultMessage: "Initialize",
              })}
            </Button>
            <Button
              variant="primary"
              onClick={handleGoToMnOps}
              style={goMnOpsButtonStyle}
              icon={<Icon style={iconStyle} type="external-link" />}
            >
              {intl.formatMessage({
                id: "welcome.modal.go.mn.ops",
                defaultMessage: "Go to MN Ops",
              })}
            </Button>
          </span>
        }
      >
        {intl.formatMessage({
          id: "welcome.modal.single.node.guide.content",
          defaultMessage:
            "To ensure high availability of management services and avoid service disruption due to a single point of failure, we recommend setting up management node HA in MN Ops before initialization.",
        })}
      </DialogBase>

      {/* 双管环境VIP引导弹窗 */}
      <DialogBase
        title={intl.formatMessage({
          id: "double.mn.vip.tip.title",
          defaultMessage: "Log in Using VIP",
        })}
        visible={showVipTipModal}
        setVisible={setShowVipTipModal}
        onCancel={handleCloseVipTip}
        footer={
          <>
            <Button variant="link" onClick={handleCloseVipTip}>
              {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
            </Button>
            <Button variant="primary" onClick={handleGoToVip}>
              {intl.formatMessage({
                id: "go.vip",
                defaultMessage: "Go to VIP",
              })}
            </Button>
          </>
        }
      >
        <div style={tipMessageStyle}>
          {intl.formatMessage({
            id: "double.mn.vip.tip.message",
            defaultMessage:
              "The current environment is configured with management node HA. Continuing to use active or standby MN IP for access may cause database desynchronization. Always use the VIP to access the management interface.",
          })}
        </div>
        <div style={checkboxContainerStyle} className="flex items-center gap-2">
          <Checkbox
            checked={vipTipDraft}
            onCheckedChange={(val) => {
              const checked = val === true;
              setVipTipDraft(checked);
              // 如果勾选了"不再提示"，无论点击取消还是前往VIP都要保存状态
            }}
            id="vip-tip-suppress"
          />
          <label htmlFor="vip-tip-suppress" className="cursor-pointer text-sm">
            {intl.formatMessage({
              id: "double.mn.vip.tip.suppress",
              defaultMessage: "Do not show this again",
            })}
          </label>
        </div>
      </DialogBase>
    </>
  );
});

import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { ZSVForm, State, Table } from "@zstack/zsphere-components";
import { DialogBase, DialogWeak } from "@zstack/zsphere-design-biz";
import type { FC } from "react";
import { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import OperationDetail from "zsv_shared/operation-log/detail";

import StatusBar from "./status-bar";
import type { IDeployState, IDeploySteps, IStepType } from "./types";

import style from "./style.module.less";

interface IProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  deployState: IDeployState;
  deploySteps: IDeploySteps;
  stepNameMap: Map<IStepType, string>;
  onStart?: Function;
  onBack?: Function;
  setAutoInitModalVisible?: Function;
  onCancel?: Function;
  onRetry?: Function;
  refetchZoneList?: Function;
}

const ProcessModal: FC<IProps> = ({
  visible,
  setVisible,
  deployState,
  deploySteps,
  stepNameMap,
  onStart,
  onBack,
  setAutoInitModalVisible,
  onCancel,
  onRetry,
  refetchZoneList,
}) => {
  const intl = useIntl();
  const [cancelModalVisible, setCancelModalVisible] = useState<boolean>(false);
  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [actionId, setActionId] = useState<string>("");

  // 关闭进度弹窗
  const handleClose = () => {
    // 只有在初始状态或完成状态才允许关闭
    if (
      deployState === "init" ||
      deployState === "success" ||
      deployState === "fail"
    ) {
      setVisible(false);
      setAutoInitModalVisible?.(false);
      refetchZoneList?.();
    } else if (deployState === "running") {
      setCancelModalVisible(true);
      refetchZoneList?.();
    }
  };

  // 资源表格数据
  const tableData = useMemo(() => {
    if (!deploySteps || !deploySteps.length) {
      return [];
    }

    return deploySteps.map((step) => {
      let icon = null;

      const typeName = stepNameMap.get(step.type) || step.type;

      // 根据资源类型设置图标
      switch (step.type) {
        case "Zone":
          icon = (
            <Icon
              style={{ marginRight: 4, width: 16, height: 16, flexShrink: 0 }} type="pin"
            />
          );
          break;
        case "Cluster":
          icon = (
            <Icon
              style={{ marginRight: 4, width: 16, height: 16, flexShrink: 0 }} type="server-1"
            />
          );
          break;
        case "HostVO":
          icon = (
            <Icon
              style={{ marginRight: 4, width: 16, height: 16, flexShrink: 0 }} type="hard-drive"
            />
          );
          break;
        case "PrimaryStorageVO":
          icon = (
            <Icon
              style={{ marginRight: 4, width: 16, height: 16, flexShrink: 0 }} type="storage"
            />
          );
          break;
        case "BackupStorage":
          icon = (
            <Icon
              style={{ marginRight: 4, width: 16, height: 16, flexShrink: 0 }} type="server"
            />
          );
          break;
        case "Image":
          icon = (
            <Icon
              style={{ marginRight: 4, width: 16, height: 16, flexShrink: 0 }} type="cd"
            />
          );
          break;
        case "L2Network":
          icon = (
            <Icon
              style={{ marginRight: 4, width: 16, height: 16, flexShrink: 0 }} type="chain-4"
            />
          );
          break;
        case "L3Network":
          icon = (
            <Icon
              style={{ marginRight: 4, width: 16, height: 16, flexShrink: 0 }} type="encircle"
            />
          );
          break;
        default:
          icon = null;
      }

      // 根据状态设置状态图标和文本
      let status = null;

      switch (step.state) {
        case "finish":
          if (step.fail === step.total) {
            // 全部失败
            status = (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <State
                  icon="close-circle-fill"
                  color={{ color: "danger", number: 500 }}
                  name={intl.formatMessage({
                    id: "status.fail",
                    defaultMessage: "Failed",
                  })}
                />
              </div>
            );
          } else if (step.fail > 0 && step.success > 0) {
            // 部分成功部分失败，例如：成功2，失败1
            status = (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <State
                  type="warning"
                  name={intl.formatMessage(
                    {
                      id: "status.partial",
                      defaultMessage: "{success} succeeded, {fail} failed",
                    },
                    {
                      success: step.success,
                      fail: step.fail,
                    },
                  )}
                />
              </div>
            );
          } else {
            // 全部成功
            status = (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <State
                  icon="checkmark-circle-fill"
                  color={{ color: "positive", number: 500 }}
                  name={intl.formatMessage({
                    id: "status.success",
                    defaultMessage: "Succeeded",
                  })}
                />
              </div>
            );
          }
          break;
        case "running":
          status = (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <State
                icon="loader"
                color={{ color: "info", number: 500 }}
                name={intl.formatMessage({
                  id: "status.initializing",
                  defaultMessage: "Initializing",
                })}
              />
            </div>
          );
          break;
        case "waiting":
          status = (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <State
                icon="clock-fill"
                color={{ color: "neutral", number: 500 }}
                name={intl.formatMessage({
                  id: "status.pending",
                  defaultMessage: "Pending",
                })}
              />
            </div>
          );
          break;
        default:
          status = (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <State
                icon="clock-fill"
                color={{ color: "neutral", number: 500 }}
                name={intl.formatMessage({
                  id: "status.pending",
                  defaultMessage: "Pending",
                })}
              />
            </div>
          );
      }

      return {
        key: step.type,
        actionId: step.actionId,
        type: (
          <div style={{ display: "flex", alignItems: "center" }}>
            {icon}
            {typeName}
          </div>
        ),
        count: step.total,
        status,
      };
    });
  }, [deploySteps, intl, stepNameMap]);

  // 表格列定义
  const columns = [
    {
      title: intl.formatMessage({
        id: "resource.type",
        defaultMessage: "Resource Type",
      }),
      dataIndex: "type",
      key: "type",
      width: "35%",
    },
    {
      title: intl.formatMessage({
        id: "resource.count",
        defaultMessage: "Resources",
      }),
      dataIndex: "count",
      key: "count",
      width: "30%",
    },
    {
      title: intl.formatMessage({
        id: "resource.status",
        defaultMessage: "Status",
      }),
      dataIndex: "status",
      key: "status",
      width: "35%",
    },
    {
      title: intl.formatMessage({ id: "operation", defaultMessage: "Actions" }),
      dataIndex: "actionId",
      key: "actionId",
      width: "35%",
      render: (rowData: string) => {
        return rowData ? (
          <Icon
            className={style["log-enabled"]}
            onClick={() => {
              setActionId(rowData);
              setDetailVisible(true);
            }} type="history"
          />
        ) : (
          <Icon className={style["log-disabled"]} type="history" />
        );
      },
    },
  ];

  const footerEle = useMemo(() => {
    if (deployState === "running" || deployState === "success") {
      return null; // 运行中状态不显示底部按钮
    }
    return (
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ display: "flex" }}>
          <Button
            variant="link"
            onClick={() => {
              onCancel?.();
              setAutoInitModalVisible?.(false);
              refetchZoneList?.();
            }}
          >
            {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
          </Button>
          {deployState === "fail" && (
            <Button variant="primary" onClick={() => onRetry?.()}>
              {intl.formatMessage({ id: "retry", defaultMessage: "Retry" })}
            </Button>
          )}
        </div>
      </div>
    );
  }, [deployState, onRetry, intl, onCancel]);

  return (
    <>
      <DialogBase
        title={intl.formatMessage({
          id: "auto.init",
          defaultMessage: "Auto Initialization ",
        })}
        visible={visible}
        setVisible={handleClose}
        widthClassName="w-[600px]"
        footer={footerEle}
      >
        <div className={style["process-modal-content"]}>
          <StatusBar
            state={deployState}
            steps={deploySteps}
            stepNameMap={stepNameMap}
            onStart={onStart}
            onBack={onBack}
            onRetry={onRetry}
          />
          <ZSVForm.Card
            title={intl.formatMessage({
              id: "init.resource.details",
              defaultMessage: "Initialization Details",
            })}
          />
          <Table
            dataSource={tableData}
            columns={columns}
            pagination={false}
            size="middle"
            bordered={false}
            rowKey="key"
            style={{
              borderRadius: "2px",
              overflow: "hidden",
              border: "1px solid #DBDDE0",
            }}
          />
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
          setAutoInitModalVisible?.(false);
          setVisible(false);
          refetchZoneList?.();
        }}
        onCancel={() => {
          setCancelModalVisible(false);
          refetchZoneList?.();
        }}
        description={intl.formatMessage({
          id: "cancel.auto.init.process.modal.confirm.content",
          defaultMessage:
            "Exiting will preserve only the automatically created or added resources. You may need to manually configure remaining necessary resources. Proceed with caution.",
        })}
      />
      <OperationDetail
        visible={detailVisible}
        setVisible={setDetailVisible}
        actionId={actionId}
      />
    </>
  );
};

export default ProcessModal;

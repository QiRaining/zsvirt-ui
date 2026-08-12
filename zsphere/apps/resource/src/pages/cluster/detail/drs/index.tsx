import { gql, useLazyQuery } from "@apollo/client";
import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { queryClusterDRS } from "@zstack/virtualization-resource/src/gql/cluster.gql";
import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { Alert, Auth, DraggableCard } from "@zstack/zsphere-components";
import { DialogWeak, Empty } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import { ProfileType } from "@zstack/zsphere-types";
import type {
  ExecuteDRSSchedulingPayload,
  Cluster as ICluster,
} from "@zstack/zsphere-types/graphql";
import { usePersistFn } from "ahooks";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import DrsTableInfo from "./drs-table-info";
import CreateOrModifyDRSModal from "./modify-drs";
import SchedulingInformationInfo from "./scheduling-information-info";
import TriggerConditionsInfo from "./trigger-conditions-info";

import style from "./style.module.less";

export interface IProps {
  current: ICluster;
  refetch: () => void;
}

const marginBottomStyle = { marginBottom: "8px" } as const;
const marginBottomNegativeStyle = { marginBottom: "-12px" } as const;

const executeDRSScheduling = gql`
  mutation executeDRSScheduling($input: ExecuteDRSSchedulingInput!) {
    executeDRSScheduling(input: $input) {
      actionId
    }
  }
`;

const updateClusterDRSState = gql`
  mutation updateClusterDRSState($input: UpdateClusterDRSStateInput!) {
    updateClusterDRSState(input: $input) {
      actionId
    }
  }
`;

const DRS: React.FC<IProps> = ({ current, refetch }) => {
  const intl = useIntl();

  const doAction = useAction();
  const [createType, setCreateType] = React.useState<
    "create" | "edit" | "enable"
  >("edit");
  const [drsVisible, setDrsVisible] = React.useState<boolean>(false);

  const [disableDrsVisible, setDisableDrsVisiable] =
    React.useState<boolean>(false);

  const [queryClusterDrs, { refetch: drsRefetch, data: clusterDRSList }] =
    useLazyQuery(queryClusterDRS);

  const clusterDRS = React.useMemo(
    () => clusterDRSList?.queryClusterDRS?.list?.[0] ?? {},
    [clusterDRSList],
  );

  React.useEffect(() => {
    if (current?.uuid) {
      queryClusterDrs({
        variables: {
          clusterUuid: current?.uuid,
        },
      });
    }
  }, [current?.uuid, queryClusterDrs]);

  const clusterDRSObj = React.useMemo(
    () => ({
      // drsSchedulingInterval: resourceData?.resourceConfigList?.list?.[0]?.value,
      clusterUuid: current?.uuid,
      ...clusterDRS,
    }),
    [clusterDRS, current],
  );

  const dataSet = React.useMemo(() => {
    return {
      schedulingInformationInfo: {
        resourceKey: "schedulingInformationInfo",
        x: 0,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <SchedulingInformationInfo
            detail={current}
            refetch={refetch}
            drs={{
              detail: clusterDRSObj,
              isSupported: current?.isSupported,
              refetch: drsRefetch,
            }}
            {...props}
          />
        ),
      },
      triggerConditionsInfo: {
        resourceKey: "triggerConditionsInfo",
        x: 1,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <TriggerConditionsInfo
            detail={current}
            refetch={refetch}
            drs={{
              detail: clusterDRSObj,
              isSupported: current?.isSupported,
              refetch: drsRefetch,
            }}
            {...props}
          />
        ),
      },
    };
  }, [clusterDRSObj, current]);

  const memoizedSelectedList = useMemo(() => [clusterDRSObj], [clusterDRSObj]);
  const isEnableDrsActionDisabled = current?.isSupported === false;

  const balanceScanFn = usePersistFn(() => {
    const payload: ExecuteDRSSchedulingPayload[] = [clusterDRS].map((item) => {
      return { uuid: item.uuid };
    });

    doAction({
      mutation: executeDRSScheduling,
      payload,
      name: intl.formatMessage({
        id: "balanceStateScan",
        defaultMessage: "Scan Balance Status",
      }),
      total: 1,
      onProgress: () => {
        drsRefetch?.();
      },
    });
  });

  const disableDrsFn = usePersistFn(() => {
    doAction({
      mutation: updateClusterDRSState,
      payload: {
        uuid: clusterDRS.uuid,
        state: "Disabled",
      },
      name: intl.formatMessage({
        id: "disable.drs",
        defaultMessage: "Disable DRS",
      }),
      total: 1,
      onProgress: () => {
        drsRefetch?.();
        refetch?.();
      },
    });
  });

  const getDRSActions = usePersistFn(() => {
    return (
      <div className="flex items-center gap-1">
        <Auth
          type="action"
          authKey="change.strategy"
          resource="dynamic.resource.ispatch.strategy"
        >
          <Button
            key="edit"
            icon={<Icon type="edit" />}
            onClick={() => {
              setCreateType("edit");
              setDrsVisible(true);
            }}
          >
            {intl.formatMessage({
              id: "virtualization.cluster.detail.drs.modify.dynamicResourceDispatchStrategy",
              defaultMessage: "Modify Policy",
            })}
          </Button>
        </Auth>
        <Auth
          type="action"
          authKey="stateScan"
          resource="dynamic.resource.ispatch.strategy"
        >
          <Button
            key="refresh"
            icon={<Icon type="sync" />}
            onClick={balanceScanFn}
          >
            {intl.formatMessage({
              id: "drs.state.refresh",
              defaultMessage: "Scan Status",
            })}
          </Button>
        </Auth>
        <Auth
          type="action"
          authKey="close.dynamic.resource.ispatch"
          resource="dynamic.resource.ispatch.strategy"
        >
          <Button
            key="slash"
            icon={<Icon type="stop-circle" />}
            onClick={() => setDisableDrsVisiable(true)}
          >
            {intl.formatMessage({
              id: "virtualization.cluster.detail.drs.close",
              defaultMessage: "Disable",
            })}
          </Button>
        </Auth>
      </div>
    );
  });

  return (
    <div className={style.drsWrapper}>
      {!current?.isSupported && (
        <Alert
          style={marginBottomStyle}
          type="warning"
          message={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "drs.alert.danger.cannotWork",
                defaultMessage: `The DRS might fail to work properly due to the following reasons:

1. There are data storage other than ZCE distributed storage and SAN storage in this cluster.
2. The CPU models of the hosts in this cluster are not consistent.
`,
              })}
            </ReactMarkdown>
          }
          display="blockStrong"
          closable
        />
      )}
      <>
        <div className={`flex flex-col gap-5 ${style.space}`}>
          {current?.isShowDrsTab ? (
            <>
              <div style={marginBottomNegativeStyle}>{getDRSActions()}</div>
              <ResponsiveDndCardsLayout
                profileType={ProfileType.CustomColumns}
                resourceType="virtualization-resource-cluster-drs"
                cols={2}
                dataSet={dataSet}
              />
            </>
          ) : (
            <DraggableCard
              title={intl.formatMessage({
                id: "dynamicResourceDispatchStrategy",
                defaultMessage: "DRS Policy",
              })}
            >
              <Empty
                description={
                  <div className="flex items-center gap-1">
                    <span>
                      {!current?.isShowDrsTab && clusterDRS.uuid
                        ? intl.formatMessage({
                            id: "virtualization.cluster.detail.drs.disable.descripiton",
                            defaultMessage: "DRS Policy is not enabled currently.",
                          })
                        : intl.formatMessage({
                            id: "virtualization.cluster.detail.drs.empty.descripiton",
                            defaultMessage: "DRS Policy is not enabled currently.",
                          })}
                    </span>
                    <Auth
                      type="action"
                      authKey="virtualization.enabled"
                      resource="dynamic.resource.ispatch.strategy"
                    >
                      <Button
                        className={style.btn}
                        disabled={isEnableDrsActionDisabled}
                        variant="link"
                        onClick={() => {
                          if (isEnableDrsActionDisabled) {
                            return;
                          }
                          if (clusterDRS?.uuid) {
                            setCreateType("enable");
                          } else {
                            setCreateType("create");
                          }
                          setDrsVisible(true);
                        }}
                      >
                        {intl.formatMessage({
                          id: "virtualization.cluster.detail.drs.go.enable",
                          defaultMessage: "Enable",
                        })}
                      </Button>
                    </Auth>
                  </div>
                }
              />
            </DraggableCard>
          )}

          {current?.isShowDrsTab && clusterDRS.uuid && (
            <DrsTableInfo detail={clusterDRS} />
          )}
        </div>

        <DialogWeak
          visible={disableDrsVisible}
          setVisible={setDisableDrsVisiable}
          type="warning"
          title={String(
            intl.formatMessage({
              id: "virtualization.cluster.detail.drs.disable.confirm.alertMessage",
              defaultMessage: "Disable DRS?",
            }),
          )}
          onConfirm={() => {
            disableDrsFn();
          }}
          description={intl.formatMessage({
            id: "virtualization.cluster.detail.drs.disable.confirm.text",
            defaultMessage:
              "Disabling DRS may lead to an inability to balance host loads under high-load scenarios, potentially impacting business performance.",
          })}
        />

        <CreateOrModifyDRSModal
          createType={createType}
          refetch={() => {
            drsRefetch?.();
            refetch?.();
          }}
          selectedList={memoizedSelectedList}
          visible={drsVisible}
          setVisible={setDrsVisible}
          source={current}
          view=""
          position="header"
        />
      </>
    </div>
  );
};

export default DRS;

import { useQuery, useMutation } from "@apollo/client";
import { Button } from "@zstack/design";
import { DialogWeak, Spinner } from "@zstack/zsphere-design-biz";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import type { SnmpAgentActionResp } from "@zstack/zsphere-types/graphql";
import { isEmpty as _isEmpty } from "lodash-es";
import React, { useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  getSnmpAgentConfig,
  getMibDeprecatedNotification,
  disableMibDeprecatedNotification,
} from "../../gql/snmp-management.gql";
import Detail from "./detail";
import Empty from "./empty";
import Header from "./header";

import style from "./style.module.less";

interface IProps {}

const SnmpManagement: React.FC<IProps> = () => {
  const intl = useIntl();
  const [mibModalVisible, setMibModalVisible] = useState(false);

  const {
    data: snmpAgentData,
    loading: snmpAgentLoading,
    refetch: refetchSnmpAgent,
  } = useQuery<{ getSnmpAgentConfig: SnmpAgentActionResp }>(getSnmpAgentConfig);

  const current = snmpAgentData?.getSnmpAgentConfig?.result || ({} as any);

  useQuery(getMibDeprecatedNotification, {
    fetchPolicy: "no-cache",
    onCompleted: (data) => {
      if (data?.zsKv?.value === "true") {
        setMibModalVisible(true);
      }
    },
  });

  const [disableMibDeprecatedNotificationMutation] = useMutation(
    disableMibDeprecatedNotification,
  );

  const refetch = React.useCallback(() => {
    refetchSnmpAgent?.();
  }, [refetchSnmpAgent]);

  useActionSubscribe({
    resourceTypeList: ["SnmpAgent"],
    onFinish: () => {
      refetchSnmpAgent?.();
    },
  });

  const isEmptyOrDisabled = React.useMemo(
    () => _isEmpty(current) || current.status === "Disable",
    [current],
  );

  if (snmpAgentLoading) {
    return <Spinner />;
  }

  return (
    <div className="main-list-header-tabs-container">
      <Header
        className={
          isEmptyOrDisabled ? "main-list-header" : "main-list-header-tabs"
        }
      />

      {isEmptyOrDisabled ? (
        <Empty current={current} refetch={refetch} />
      ) : (
        <Detail current={current} refetch={refetch} />
      )}

      <DialogWeak
        visible={mibModalVisible}
        setVisible={setMibModalVisible}
        type="warning"
        title={intl.formatMessage({
          id: "mib.file.deprecated.notification.title",
          defaultMessage: "MIB File Update Required",
        })}
        onConfirm={() => {
          disableMibDeprecatedNotificationMutation();
          setMibModalVisible(false);
        }}
        description={
          <div className={style.mibNotificationContent}>
            <ReactMarkdown>
              {intl.formatMessage({
                id: "mib.file.deprecated.notification.content",
                defaultMessage:
                  "The SNMP component has been updated. If you have upgraded from a previous version and integrated with an external monitoring platform, you must:\n\n1. Download the new MIB file.\n2. Update the new MIB file to your external monitoring platform.\n\nNote: Failure to update may result in missing or abnormal monitoring data, affecting business monitoring continuity.",
              })}
            </ReactMarkdown>
          </div>
        }
        footer={
          <Button
            variant="primary"
            onClick={() => {
              disableMibDeprecatedNotificationMutation();
              setMibModalVisible(false);
            }}
          >
            {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
          </Button>
        }
      />
    </div>
  );
};

export default SnmpManagement;

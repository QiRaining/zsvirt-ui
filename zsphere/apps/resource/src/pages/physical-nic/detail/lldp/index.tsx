import { Divider } from "@zstack/design";
import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { useAuth } from "@zstack/zsphere-components";
import type { IResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import { ELLDPMode, ProfileType } from "@zstack/zsphere-types";
import type { PhysicalNic } from "@zstack/zsphere-types/graphql";
import { usePersistFn } from "ahooks";
import type { FC } from "react";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import { useUpdateLldpModeAction } from "../../action/update-lldp-mode";
import LLDPModeModal from "../../components/lldp-mode-modal";
import DeviceInfo from "./device-info";
import LldpInfo from "./lldp-info";

import styles from "../style.module.less";

const buttonStyle = { marginBottom: 8 } as const;

interface ILLDPInfo {
  canEdit?: boolean;
  current: PhysicalNic;
}

const LLDPInfo: FC<ILLDPInfo> = ({ canEdit = true, current: detail }) => {
  const [visible, setVisible] = useState<boolean>(false);
  const intl = useIntl();
  const { hasAuth } = useAuth();

  const updateModeAct = useUpdateLldpModeAction();

  const onOk = usePersistFn(async (data) => {
    updateModeAct({
      interfaceUuids: [detail.uuid],
      ...data,
    });
    setVisible(false);
  });

  const isShowDeviceInfo = useMemo(
    () =>
      ![ELLDPMode.tx_only, ELLDPMode.disable].includes(
        // 如果为空，默认为接收并发送
        detail?.lLDPMode?.mode ?? ELLDPMode.rx_only,
      ),
    [detail?.lLDPMode?.mode],
  );

  const dataSet = useMemo(() => {
    let result: IResponsiveDndCardsLayout["dataSet"] = {
      lldpInfo: {
        resourceKey: "lldpInfo",
        x: 0,
        y: 0,
        node: (props: any) => <LldpInfo current={detail} {...props} />,
      },
    };
    if (isShowDeviceInfo) {
      result = {
        ...result,
        deviceInfo: {
          resourceKey: "deviceInfo",
          x: 0,
          y: 1,
          node: (props: any) => <DeviceInfo current={detail} {...props} />,
        },
      };
    }
    return result;
  }, [detail, isShowDeviceInfo]);

  return (
    <>
      {canEdit &&
        hasAuth({
          authKey: "edit.lldpMode",
          resource: "host",
          type: "action",
        }) && (
          <Button
            style={buttonStyle}
            icon={<Icon type="edit" />}
            onClick={() => setVisible(true)}
          >
            {intl.formatMessage({ id: "modify", defaultMessage: "Edit" })}
          </Button>
        )}
      <ResponsiveDndCardsLayout
        profileType={ProfileType.OverviewLayoutConfig}
        resourceType="virtualization-resource-host-physical-nic-lldp"
        cols={1}
        dataSet={dataSet}
      />
      <LLDPModeModal
        visible={visible}
        detail={detail}
        setVisible={setVisible}
        onOk={onOk}
        title={
          <>
            {intl.formatMessage({
              id: "physicalNic.action.modal.lldp.title",
              defaultMessage: "Modify LLDP Mode",
            })}
            <span className={styles.title}>
              <Divider type="vertical" className={styles.divider} />
              {detail?.interfaceName}
            </span>
          </>
        }
      />
    </>
  );
};

export default LLDPInfo;

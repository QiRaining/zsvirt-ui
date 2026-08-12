import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { ZoneStateEvent } from "@zstack/zsphere-types";
import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { changeZoneState } from "../../../gql/zone.gql";

const Action: React.FC<IActionWrapperProps<IZone>> = ({
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const needStopList = useMemo(() => {
    return selectedList?.filter((cv) => cv.state === "Enabled") || [];
  }, [selectedList]);
  const changeState = async () => {
    doAction({
      mutation: changeZoneState,
      payload: needStopList.map((cv) => ({
        uuid: cv.uuid,
        stateEvent: ZoneStateEvent.disable,
      })),
      name: intl.formatMessage({ id: "stop.zone", defaultMessage: "Disable Data Center" }),
      total: needStopList.length,
      onFinish: () => {
        setSelectedList?.([]);
      },
    });
  };

  const onOk = () => {
    setVisible(false);
    changeState();
  };

  return (
    <DialogP3
      onConfirm={onOk}
      visible={visible}
      setVisible={setVisible}
      bannerMessage={intl.formatMessage({
        id: "zone.modal.stop.alert.danger",
        defaultMessage: "Disabling zones will disable cluster, hosts, and other associated resources. Exercise caution when performing this operation.",
      })}
      title={intl.formatMessage({
        id: "zone.modal.title.confirm.disable.zone",
        defaultMessage: "Disable Data Center?",
      })}
      resourceNames={needStopList.map((r) => r.name ?? r.uuid)}
    />
  );
};

export default Action;

import { gql } from "@apollo/client";
import { DialogP1 } from "@zstack/zsphere-design-biz";
import { useAction, useSensitiveJudge } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  Volume as IVolume,
  ExpungeDataVolumePayload,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { useNavigate, useLocation } from "react-router";

import style from "./style.module.less";

const _expungeDataVolume = gql`
  mutation expungeDataVolume($input: ExpungeDataVolumeInput!) {
    expungeDataVolume(input: $input) {
      actionId
    }
  }
`;

const ExpungeDataVolume: React.FC<IActionWrapperProps<IVolume>> = ({
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
  refetch,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const navigate = useNavigate();
  const location = useLocation();
  const needValidate = useSensitiveJudge(); //***处理敏感操作***
  const isInDetil =
    location.pathname?.includes("volume") && location.search?.includes("uuid=");

  const onOk = () => {
    const payload: ExpungeDataVolumePayload[] = selectedList?.map((volume) => {
      return {
        uuid: volume.uuid,
      };
    });
    doAction({
      mutation: _expungeDataVolume,
      payload,
      name: intl.formatMessage({
        id: "expunge.volume",
        defaultMessage: "Expunge Volume",
      }),
      total: selectedList?.length ?? 1,
      type: "Volume",
      onFinish: () => {
        setSelectedList?.([]);
        refetch?.();
        if (isInDetil) {
          navigate(-1);
        }
      },
    });
  };

  return (
    <DialogP1
      visible={visible}
      setVisible={setVisible}
      bannerMessage={
        <span>
          {intl.formatMessage(
            {
              id: "volume.modal.expunge.volume.alert.warning.danger",
              defaultMessage:
                "After expunged, the disks will be {warningText}. Proceed with caution.",
            },
            {
              warningText: (
                <span className={style.warningText}>
                  {intl.formatMessage({
                    id: "volume.modal.expunge.volume.alert.warning.danger.text",
                    defaultMessage: "completely deleted and cannot be recovered",
                  })}
                </span>
              ),
            },
          )}
        </span>
      }
      title={intl.formatMessage({
        id: "volume.modal.title.confirm.expunge.volume",
        defaultMessage: "Expunge Disk?",
      })}
      resourceType={intl.formatMessage({
        id: "volume",
        defaultMessage: "Disk",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      onConfirm={onOk}
    />
  );
};

export default ExpungeDataVolume;

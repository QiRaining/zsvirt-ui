import { gql } from "@apollo/client";
import { DialogP0 } from "@zstack/zsphere-design-biz";
import type { IActionResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  Image as IImage,
  ExpungeImagePayload as IExpungeImagePayload,
} from "@zstack/zsphere-types/graphql";
import { map as _map } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";
import { useNavigate, useLocation } from "react-router";

import style from "./style.module.less";

const ExpungeAction: React.FC<IActionWrapperProps<IImage>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const navigate = useNavigate();
  const location = useLocation();

  const expungeImage = gql`
    mutation expungeImage($input: ExpungeImageInput!) {
      expungeImage(input: $input) {
        actionId
      }
    }
  `;
  const onOk = async () => {
    setSelectedList?.([]);
    const payload: IExpungeImagePayload[] = selectedList.map((item) => {
      return {
        imageUuid: item?.uuid,
        backupStorageUuids: _map(item?.backupStorageRefs, "backupStorageUuid"),
      };
    });

    doAction({
      mutation: expungeImage,
      payload,
      name: intl.formatMessage({
        id: "expunge.image",
        defaultMessage: "Expunge Image",
      }),
      total: selectedList.length,
      type: "Image",
      onFinish: (_result: IActionResult) => {
        if (location.pathname?.includes("image/detail")) {
          navigate(-1);
        }
      },
    });
  };

  return (
    <DialogP0
      title={intl.formatMessage({
        id: "image.modal.title.confirm.expunge.image",
        defaultMessage: "Expunge Image?",
      })}
      bannerMessage={
        <span>
          {intl.formatMessage(
            {
              id: "image.action.direct.delete.alert.error",
              defaultMessage: `This action will immediately and completely delete the image, and the image {warningText}. Proceed with caution.`,
            },
            {
              warningText: (
                <span className={style.warningText}>
                  {intl.formatMessage({
                    id: "image.action.direct.delete.warningText",
                    defaultMessage: "cannot be recovered",
                  })}
                </span>
              ),
            },
          )}
        </span>
      }
      resourceType={intl.formatMessage({
        id: "image",
        defaultMessage: "Image",
      })}
      resourceNames={(selectedList || []).map((item) => item.name ?? item.uuid)}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
    />
  );
};

export default ExpungeAction;

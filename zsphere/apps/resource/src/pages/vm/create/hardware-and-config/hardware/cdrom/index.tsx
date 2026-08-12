import { imageListForZSVCreateInstance } from "@zstack/virtualization-resource/src/gql/image.gql";
import ImageList from "@zstack/virtualization-resource/src/pages/image/list";
import { ModalSelect } from "@zstack/zsphere-components";
import { Form } from "@zstack/zsphere-components";
import type { FormCreateType } from "@zstack/zsphere-types";
import { Op, ImageState, ImageStatus } from "@zstack/zsphere-types";
import type { CdRom } from "@zstack/zsphere-types/graphql";
import _ from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

import styles from "./style.module.less";

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  formCreateType?: FormCreateType;
  form: any;
  index: number;
  source?: any;
  isEdit?: boolean;
  zoneUuid?: string;
  originValue?: CdRom;
}

const { Item } = Form;

const CdRomCard: React.FC<IProps> = ({
  form,
  index,
  _isEdit = false,
  zoneUuid = "",
  _originValue,
}) => {
  const intl = useIntl();

  return (
    <div className={styles.content}>
      <Item
        noStyle
        shouldUpdate={(pre, cur) => {
          return pre !== cur;
        }}
      >
        {() => {
          const values = form.getFieldsValue(true);
          const imageUuids = _.keys(values)
            .filter(
              (key) =>
                key.indexOf("cdRomList-") > -1 &&
                values?.[key]?.length &&
                key !== `cdRomList-${index}`,
            )
            .map((key) => values?.[key]?.[0]?.uuid);

          const extraConditions: any[] = [
            {
              key: "uuid",
              op: Op.notIn,
              values: imageUuids,
            },
          ];

          //，镜像非必填
          return (
            <Item
              label={intl.formatMessage({
                id: "virtualization.create.instance.hardware.cdrom.image",
                defaultMessage: "Image File",
              })}
              name={`cdRomList-${index}`}
            >
              <ModalSelect
                title={intl.formatMessage({
                  id: "virtualization.create.instance.hardware.network.card.select.cdrom.image",
                  defaultMessage: "Select Image",
                })}
                className={styles.cdrom}
                alertMessage={intl.formatMessage({
                  id: "virtualization.create.instance.hardware.network.card.select.cdrom.image.alert.message",
                  defaultMessage:
                    "You can select iso-formatted system images for the VM drive. Available images have been filtered and displayed for your selection.",
                })}
                alertType="info"
                modalWidth={800}
              >
                <ImageList
                  view="select.virtualization.cdrom"
                  gql={imageListForZSVCreateInstance}
                  defaultQuery={{
                    conditions: [
                      {
                        key: "__mediaType__",
                        values: ["RootVolumeTemplate"],
                        op: Op.in,
                      },
                      { key: "format", value: "iso", op: Op.eq },
                      { key: "state", op: Op.eq, value: ImageState.Enabled },
                      { key: "status", op: Op.eq, value: ImageStatus.Ready },
                      {
                        key: "backupStorage.zone.uuid",
                        op: Op.eq,
                        value: zoneUuid,
                      },
                      {
                        key: "backupStorage.status",
                        op: Op.eq,
                        value: "Connected",
                      },
                      { key: "__systemTag__", op: Op.ne, value: "remote" },
                      ...extraConditions,
                    ],
                  }}
                />
              </ModalSelect>
            </Item>
          );
        }}
      </Item>
    </div>
  );
};

export default React.memo(CdRomCard);

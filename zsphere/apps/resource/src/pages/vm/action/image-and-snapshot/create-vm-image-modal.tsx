import { useLazyQuery, gql } from "@apollo/client";
import { Input, RadioGroup, Textarea } from "@zstack/design";
import { volumeList as _volumeList } from "@zstack/virtualization-resource/src/gql/volume.gql";
import BackupStorageList from "@zstack/virtualization-resource/src/pages/backup-storage/list";
import { Form, ModalSelect, Select } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import {
  IIsRequiredType,
  useAction,
  useValidator,
} from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, IQuery } from "@zstack/zsphere-types";
import { Op, VolumeQueryType } from "@zstack/zsphere-types";
import type {
  VmInstance as IVM,
  BackupStorage as IBackupStorage,
} from "@zstack/zsphere-types/graphql";
import { formatStorage, formatResourceName } from "@zstack/zsphere-utils";
import type { FormInstance } from "antd/lib/form";
import _ from "lodash-es";
import React, { useState, useMemo, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import style from "../style.module.less";

const { Item } = Form;

const createVolumeTemplate = gql`
  mutation createVolumeTemplate($input: CreateVolumeTemplateInput!) {
    createVolumeTemplate(input: $input) {
      actionId
    }
  }
`;

const CreateVmImage: React.FC<IActionWrapperProps<IVM>> = ({
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const { commonNameRules, isRequired } = useValidator(intl);
  const [imageType, setImageType] = useState<string>("system");
  const doAction = useAction();
  const [form] = Form.useForm();
  const formRef = React.createRef<FormInstance>();
  const [queryVolumne, { data: volumeData, loading }] =
    useLazyQuery(_volumeList);

  const typeChange = (val: string) => {
    setImageType(val);
  };

  const defaultQueryForBSList: IQuery = useMemo(
    () => ({
      type: "CreateImageCandidate",
      extraConditions: [
        {
          key: "volumeUuid",
          op: Op.eq,
          value: selectedList?.[0]?.rootVolumeUuid,
        },
      ],
    }),
    [selectedList],
  );

  const imageTypeOptions = [
    {
      label: intl.formatMessage({
        id: "systemImage",
        defaultMessage: "System Image",
      }),
      value: "system",
    },
    {
      label: intl.formatMessage({
        id: "volumeImage",
        defaultMessage: "Disk Image",
      }),
      value: "volume",
    },
  ];

  const onFinish = ({
    imageType: type,
    backupStorageUuids,
    ...values
  }: {
    name: string;
    imageType: string;
    backupStorageUuids: Array<IBackupStorage>;
    description?: string;
    volumeUuid?: string;
  }) => {
    const payload = {
      vmUuid: selectedList?.[0]?.uuid,
      volumeUuid:
        type === "system"
          ? selectedList?.[0]?.rootVolumeUuid
          : values?.volumeUuid,
      isSystem: type === "system",
      backupStorageUuids: backupStorageUuids.map((bs) => bs.uuid),
      platform: selectedList?.[0]?.platform,
      guestOsType: selectedList?.[0]?.guestOsType,
      ...values,
    };
    doAction({
      mutation: createVolumeTemplate,
      payload,
      name: intl.formatMessage({
        id: "create.image",
        defaultMessage: "Create Image",
      }),
      total: 1,
    });
  };

  const onClose = () => {
    setVisible(false);
  };

  const volumeList = useMemo(() => {
    if (!visible || !selectedList?.length || loading) {
      return [];
    }
    return (
      _.sortBy(volumeData?.volumeList?.list ?? [], [
        (volume) => new Date(volume.lastAttachDate).valueOf(),
        "deviceId",
      ]) ?? []
    );
  }, [visible, volumeData]);

  useEffect(() => {
    if (!visible) {
      form.resetFields();
    } else if (selectedList?.[0]) {
      queryVolumne({
        variables: {
          type: VolumeQueryType.GET_VOLUME_BY_VMINSTANCE_UUID,
          extraConditions: [
            { key: "vmInstanceUuid", op: Op.eq, value: selectedList?.[0].uuid },
          ],
          vmInstanceUuid: selectedList?.[0].uuid,
          limit: 100,
        },
      });
      form.setFieldsValue({
        name: `${selectedList?.[0]?.name}-${intl.formatMessage({
          id: "iamge",
          defaultMessage: "Image",
        })}`,
      });
    }
  }, [form, visible]);

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "create.image",
        defaultMessage: "Create Image",
      })}
      form={form}
      widthClassName="w-150"
      visible={visible}
      setVisible={setVisible}
      onOk={(values) => onFinish(values as any)}
      onCancel={onClose}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form
        form={form}
        ref={formRef}
        initialValues={{
          name: "",
          description: "",
          imageType: "system",
          backupStorageUuids: [],
        }}
      >
        <Item
          label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
          name="name"
          rules={commonNameRules}
        >
          <Input className={style["width-320"]} />
        </Item>
        <Item
          name="description"
          label={intl.formatMessage({ id: "glossary", defaultMessage: "Description" })}
        >
          <Textarea className={style["width-320"]} rows={4} />
        </Item>
        <Item
          name="imageType"
          label={intl.formatMessage({
            id: "imageType",
            defaultMessage: "Image Type",
          })}
          icon="info"
          iconTooltip={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "vm.modal.createImage.field.imageType.tooltip",
                defaultMessage: `### Image Type

1. A system image is used to create VMs. A system image can be of the ISO or Image type.
2. A disk image is used to create disks. A disk image can only be of the Image type.
3. Image-type images can be in raw, qcow2, and vmdk format.
4. Images are stored on image storage. When an image is used to create a VM or disk, the image is downloaded to a data storage and cached there.

`,
              })}
            </ReactMarkdown>
          }
        >
          <RadioGroup
            value={imageType}
            onValueChange={typeChange}
            options={imageTypeOptions}
          />
        </Item>
        <Item
          noStyle
          shouldUpdate={(prev, cur) => prev.imageType !== cur.imageType}
        >
          {({ getFieldValue }) => {
            return (
              getFieldValue("imageType") === "volume" && (
                <Item
                  label={intl.formatMessage({
                    id: "hard.disk",
                    defaultMessage: "Disk",
                  })}
                  required
                  rules={[isRequired(IIsRequiredType.select)]}
                  name="volumeUuid"
                >
                  <Select className="width-320">
                    {volumeList?.map((volume, index) => (
                      <Select.Option value={volume.uuid} key={volume.uuid}>
                        <div
                          className={style.volumeSelectName}
                        >{`${intl.formatMessage({
                          id: "hard.disk",
                          defaultMessage: "Disk",
                        })}${index + 1}`}</div>
                        <div className={style.volumeSelectSize}>
                          <span>
                            {intl.formatMessage({
                              id: "capacity",
                              defaultMessage: "Capacity",
                            })}
                            {intl.formatMessage({
                              id: "colon",
                              defaultMessage: "：",
                            })}
                          </span>
                          <span>{formatStorage(volume?.size ?? 0)}</span>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </Item>
              )
            );
          }}
        </Item>
        <Item
          name="backupStorageUuids"
          label={intl.formatMessage({
            id: "backupStorage",
            defaultMessage: "Image Storage",
          })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: "image.field.backupStorage.validator.required",
                defaultMessage: "Select a backup storage.",
              }),
            },
          ]}
        >
          <ModalSelect
            title={intl.formatMessage({
              id: "select.backupStorage",
              defaultMessage: "Select Image Storage",
            })}
            className={style["width-320"]}
            modalWidth={800}
          >
            <BackupStorageList
              view="select"
              defaultQuery={defaultQueryForBSList}
            />
          </ModalSelect>
        </Item>
      </Form>
    </DialogForm>
  );
};

export default CreateVmImage;

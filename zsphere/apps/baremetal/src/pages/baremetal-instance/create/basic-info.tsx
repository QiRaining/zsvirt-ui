import { Button, Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Form, Input, TextArea } from "@zstack/zsphere-components";
import { ZSVForm, ModalSelect, Switch } from "@zstack/zsphere-components";
import { IIsRequiredType, useValidator } from "@zstack/zsphere-hooks";
import { ImageState, ImageStatus, Op } from "@zstack/zsphere-types";
import type { FormInstance } from "antd";
import type { FC } from "react";
import { useContext, useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import ImageList from "zsv_resource/image/list";

import PreconfigurationTemplateList from "../../baremetal-pre-config-template/list";
import type { IResource } from "./components/BaremetalChassisTreeSelector";
import BaremetalChassisTreeSelector from "./components/BaremetalChassisTreeSelector";
import BaremetalInstanceCreateContext from "./context";

import style from "./style.module.less";

const { Card } = ZSVForm;

const countContainerMarginStyle: React.CSSProperties = { marginTop: 8 };

export interface IProps {
  form: FormInstance;
}

const BasicConfig: FC<IProps> = ({ form }) => {
  const intl = useIntl();
  const { source } = useContext(BaremetalInstanceCreateContext);
  const baremetalChassisFlag: boolean = useMemo(
    () => source?.__typename === "BaremetalChassis",
    [source],
  );
  const { isRequired, commonNameRules, commonDescriptionRules } =
    useValidator(intl);

  const [bmVisible, setBmVisible] = useState(false);

  const imageCondtion = useMemo(
    () => ({
      conditions: [
        { key: "backupStorage.status", op: Op.eq, value: "Connected" },
        {
          key: "backupStorage.type",
          op: Op.eq,
          value: "ImageStoreBackupStorage",
        },
        { key: "format", op: Op.eq, value: "iso" },
        { key: "state", op: Op.eq, value: ImageState.Enabled },
        { key: "status", op: Op.eq, value: ImageStatus.Ready },
      ],
    }),
    [],
  );

  useEffect(() => {
    if (baremetalChassisFlag && source) {
      form?.setFieldsValue({
        baremetalChassis: [source],
      });
    }
  }, [baremetalChassisFlag, form, source]);

  return (
    <Card
      title={intl.formatMessage({
        id: "basic.info",
        defaultMessage: "Basic Info",
      })}
    >
      <Form.Item
        name="name"
        label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
        rules={commonNameRules}
      >
        <Input className={style["width-400"]} />
      </Form.Item>
      <Form.Item
        name="description"
        label={intl.formatMessage({
          id: "introduction",
          defaultMessage: "Description",
        })}
        rules={commonDescriptionRules}
      >
        <TextArea
          rows={3}
          className={style["width-400"]}
          isShowLimit
          limit={256}
        />
      </Form.Item>
      {baremetalChassisFlag ? (
        <Form.Item
          name="baremetalChassis"
          label={intl.formatMessage({
            id: "baremetalChassis",
            defaultMessage: "Bare Metal Chassis",
          })}
          required
          rules={[isRequired(IIsRequiredType.select)]}
          icon="info"
          iconTooltip={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "barematlInstance.field.baremetalChassis.tooltip",
                defaultMessage: `### Bare Metal Chassis

1. You can only create one bare metal instance from a bare metal chassis.
2. You can batch create a maximum of 50 bare metal instances at a time.`,
              })}
            </ReactMarkdown>
          }
        >
          {source?.name}
        </Form.Item>
      ) : (
        <>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.baremetalChassis !== currentValues.baremetalChassis
            }
          >
            {({ getFieldValue }) => {
              const baremetalChassis = getFieldValue("baremetalChassis") || [];
              if (baremetalChassis.length === 0) {
                return (
                  <Form.Item
                    name="baremetalChassis"
                    label={intl.formatMessage({
                      id: "baremetalChassis",
                      defaultMessage: "Bare Metal Chassis",
                    })}
                    required
                    rules={[isRequired(IIsRequiredType.select)]}
                    icon="info"
                    iconTooltip={
                      <ReactMarkdown>
                        {intl.formatMessage({
                          id: "barematlInstance.field.baremetalChassis.tooltip",
                          defaultMessage: `### Bare Metal Chassis

1. You can only create one bare metal instance from a bare metal chassis.
2. You can batch create a maximum of 50 bare metal instances at a time.`,
                        })}
                      </ReactMarkdown>
                    }
                  >
                    <div className={style.countContainer}>
                      <Button
                        className={style.addBtn}
                        variant="link"
                        icon={<Icon type="plus" />}
                        onClick={() => {
                          setBmVisible(true);
                        }}
                      >
                        {intl.formatMessage({
                          id: "add.baremetalChassis",
                          defaultMessage: "Add Bare Metal Chassis",
                        })}
                      </Button>
                      <span className={style.count}>
                        ({baremetalChassis.length}/50)
                      </span>
                    </div>
                  </Form.Item>
                );
              }
              return (
                <Form.Item
                  name="baremetalChassis"
                  className={style.resourceForm}
                  label={intl.formatMessage({
                    id: "baremetalChassis",
                    defaultMessage: "Bare Metal Chassis",
                  })}
                  required
                  rules={[isRequired(IIsRequiredType.select)]}
                  icon="info"
                  iconTooltip={
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "barematlInstance.field.baremetalChassis.tooltip",
                        defaultMessage: `### Bare Metal Chassis

1. You can only create one bare metal instance from a bare metal chassis.
2. You can batch create a maximum of 50 bare metal instances at a time.`,
                      })}
                    </ReactMarkdown>
                  }
                  description={
                    <div
                      className={style.countContainer}
                      style={countContainerMarginStyle}
                    >
                      <Button
                        className={style.addBtn}
                        variant="link"
                        icon={<Icon type="plus" />}
                        onClick={() => {
                          setBmVisible(true);
                        }}
                      >
                        {intl.formatMessage({
                          id: "add.baremetalChassis",
                          defaultMessage: "Add Bare Metal Chassis",
                        })}
                      </Button>
                      <span className={style.count}>
                        ({baremetalChassis.length}/50)
                      </span>
                    </div>
                  }
                >
                  <>
                    <Form.List name="baremetalChassis">
                      {(fields, { remove }) => {
                        return (
                          <>
                            {fields?.map((field, index) => {
                              return (
                                <div key={field.key} className={style.content}>
                                  <div className="flex gap-2">
                                    <div className="w-[83.33%]">
                                      <Text>
                                        {getFieldValue([
                                          "baremetalChassis",
                                          index,
                                          "name",
                                        ])}
                                      </Text>
                                    </div>
                                    <div className="w-[16.67%]">
                                      <div className={style.action}>
                                        <span onClick={() => remove(index)}>
                                          <Icon type="trash" />
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </>
                        );
                      }}
                    </Form.List>
                  </>
                </Form.Item>
              );
            }}
          </Form.Item>
          <BaremetalChassisTreeSelector
            visible={bmVisible}
            setVisible={setBmVisible}
            onOk={(resourceList: IResource[]) => {
              form.setFieldsValue({ baremetalChassis: resourceList });
            }}
            getCurrentSelected={() =>
              form.getFieldValue("baremetalChassis") || []
            }
          />
        </>
      )}
      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) => prev.platform !== curr.platform}
      >
        {({ getFieldValue }) => (
          <Form.Item
            label={intl.formatMessage({
              id: "platform",
              defaultMessage: "Platform",
            })}
          >
            <Text>{getFieldValue("platform")}</Text>
          </Form.Item>
        )}
      </Form.Item>
      <Form.Item
        name="image"
        label={intl.formatMessage({
          id: "image",
          defaultMessage: "Image",
        })}
        required
        description={intl.formatMessage({
          id: "baremetalInstance.field.image.tips",
          defaultMessage: "ISO format only.",
        })}
        rules={[isRequired(IIsRequiredType.select)]}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "barematlInstance.field.image.tooltip",
              defaultMessage: `### Image

Select an image to install the operating system.

1. ISO format only.
2. You need to upload the image to the standalone image storage in advance.
3. Supported operating systems:
    - Custom platform-optimized OS.
    - Major Linux distributions, such as RHEL/CentOS series, Debian/Ubuntu series, and SUSE/openSUSE series.`,
            })}
          </ReactMarkdown>
        }
      >
        <ModalSelect
          className={style["width-400"]}
          title={intl.formatMessage({
            id: "select.image",
            defaultMessage: "Select Image",
          })}
          selectType="radio"
          alertMessage={intl.formatMessage({
            id: "create.bm.instance.select.image.alert",
            defaultMessage: "Currently, the bare metal instance only supports Linux system. Proceed with caution.",
          })}
          alertType="warning"
        >
          <ImageList
            view="select.virtualization"
            defaultQuery={imageCondtion}
          />
        </ModalSelect>
      </Form.Item>
      <Form.Item
        name="preconfigurationTemplate"
        label={intl.formatMessage({
          id: "preconfigurationTemplate",
          defaultMessage: "Bare Metal Template",
        })}
        required
        description={intl.formatMessage({
          id: "baremetalInstance.field.preconfigurationTemplate.tips",
          defaultMessage: "The selected template's operating system must match the selected image.",
        })}
        rules={[isRequired(IIsRequiredType.select)]}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "barematlInstance.field.preconfigurationTemplate.tooltip",
              defaultMessage: `### Bare Metal Template

Select a bare metal template to quickly generate pre-configured files for unattended batch OS installation on bare metal instances.

1. Prepare the bare metal template in advance. Supported types:
    - System template: Provided by default. Contains basic system variables. Ideal for simple unattended deployments.
    - Custom template: Supports user-loaded templates (UTF-8 encoded). Includes basic system variables and customized variables. Ideal for complex unattended deployments.
2. The selected template's operating system must match the selected image.`,
            })}
          </ReactMarkdown>
        }
      >
        <ModalSelect
          className={style["width-400"]}
          title={intl.formatMessage({
            id: "drawerTitle.select.preconfigurationTemplate",
            defaultMessage: "Select Bare Metal Template",
          })}
          selectType="radio"
        >
          <PreconfigurationTemplateList view="select" />
        </ModalSelect>
      </Form.Item>
      <Form.Item
        name="forceInstall"
        label={intl.formatMessage({
          id: "auto.cover.data",
          defaultMessage: "Auto Overwrite Data",
        })}
        valuePropName="checked"
        description={
          <div className="flex gap-2">
            <div>
              <Icon type="alert-triangle-fill" color="danger" />
            </div>
            <div>
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "baremetalInstance.field.autoCoverData.tips",
                  defaultMessage: `1. If selected, the original data will be automatically overwritten when baremetal instances are deployed.
2. If not selected, the installation of operating systems may pause. At this time, you need to access the console to manually configure disks.`,
                })}
              </ReactMarkdown>
            </div>
          </div>
        }
      >
        <Switch />
      </Form.Item>
    </Card>
  );
};

export default BasicConfig;

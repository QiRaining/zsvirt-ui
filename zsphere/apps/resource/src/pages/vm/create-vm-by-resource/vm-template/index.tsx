import { createVMFromTemplate } from "@zstack/virtualization-resource/src/gql/instance.gql";
import VMTemplateList from "@zstack/virtualization-resource/src/pages/vm-template/list";
import ModalZSV from "@zstack/virtualization-resource/src/pages/vm/create/components/modal-zsv";
import { CreateInstanceContext } from "@zstack/virtualization-resource/src/pages/vm/create/context";
import { getZoneUuidBySource } from "@zstack/virtualization-resource/src/pages/vm/create/hooks/get-zoneuuid";
import { Alert, Form, ModalSelect, ZSVForm } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { VmQueryType } from "@zstack/zsphere-types";
import type {
  CreateVMFromTemplatePayload,
  VmInstance as IVM,
  VmTemplate as IVMTemplate,
} from "@zstack/zsphere-types/graphql";
import { cloneDeep } from "lodash-es";
import React, { useCallback, useContext, useMemo, useEffect } from "react";
import { flushSync } from "react-dom";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import AdvancedCard from "./advance-card";
import BasicCard from "./basic-card";
import { getBasicInfo, getCpuAndMem, transformParams } from "./utils";

import styles from "./style.module.less";

const { Item } = Form;

/**
 * 基于某种资源创建虚拟机需要变更的点在于资源相关的vm配置的回显
 */
export interface IProps extends IActionWrapperProps<IVMTemplate | IVM> {
  setTemplateSelectVisible?: (visible: boolean) => void;
  templateSelectVisible?: boolean;
}

const CreateInstanceBaseOnTemplate: React.FC<IProps> = ({
  setTemplateSelectVisible,
  templateSelectVisible,
  visible,
  source, //来源，判断是从哪里创建的
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();

  const realSource =
    selectedList.length !== 0 ? selectedList[0] : (source as any);

  const { setRealSource } = useContext(CreateInstanceContext);

  const zoneUuid = useMemo(() => {
    return getZoneUuidBySource(realSource);
  }, [realSource]);

  //处理真实数据源
  useEffect(() => {
    if (visible) {
      setRealSource?.((pre: any) => ({
        ...pre,
        zoneUuid,
        realSource,
      }));

      //如果是模版，则设置模版
      if (realSource?.isTemplate) {
        form.setFieldsValue({ vmTemplate: [realSource] });
      }
    }
    if (visible === false) {
      form.resetFields();
    }
  }, [realSource, zoneUuid, setRealSource, selectedList, visible]);

  // 监听模板变化并设置表单值
  const templateValue = Form.useWatch("vmTemplate", form);

  useEffect(() => {
    if (templateValue && templateValue.length !== 0) {
      const fieldsValue = {
        ...getBasicInfo(templateValue[0], intl),
        ...getCpuAndMem(templateValue[0]),
      };

      console.log(fieldsValue, "fieldsValue");
      form.setFieldsValue(fieldsValue);
    }
  }, [templateValue, form, intl]);

  const vmTemplateDefaultQuery = useMemo(() => {
    //
    if (source?.__typename === "Cluster") {
      return {
        conditions: [
          {
            key: "zoneUuid",
            value: zoneUuid,
          },
          {
            key: "clusterUuid",
            value: source?.uuid,
          },
        ],
        type: VmQueryType.GetVmInstanceTemplate,
      };
    }
    if (source?.__typename === "HostVO" || source?.__typename === "Host") {
      return {
        conditions: [
          {
            key: "zoneUuid",
            value: zoneUuid,
          },
          {
            key: "clusterUuid",
            value: source?.cluster?.uuid,
          },
        ],
        type: VmQueryType.GetVmInstanceTemplate,
      };
    }

    return {
      conditions: [{ key: "zoneUuid", value: zoneUuid }],
      type: VmQueryType.GetVmInstanceTemplate,
    };
  }, [source, zoneUuid]);

  //发送请求
  const submitHandle = useCallback(
    async (e: any) => {
      const params = cloneDeep(e);
      const createInstancePayload: CreateVMFromTemplatePayload =
        transformParams(params, zoneUuid, realSource);

      doAction({
        mutation: createVMFromTemplate,
        payload: JSON.parse(JSON.stringify(createInstancePayload)),
        name: intl.formatMessage({
          id: "virtualization.create.instance.by.vm.template",
          defaultMessage: "Create Virtual Machine from Template",
        }),
        total: params?.count,
        type: "VmInstance",
      });
    },
    [doAction, intl, realSource, zoneUuid],
  );

  return (
    <CreateInstanceContext.Provider
      value={{
        zoneUuid,
        realSource,
      }}
    >
      <ModalZSV
        title={intl.formatMessage({
          id: "instance.modal.title.create.by.vm.template",
          defaultMessage: "Create Virtual Machine from Template",
        })}
        className={styles["create-vm-modal"]} //先改云主机，后续若全局，直接改组件
        form={form}
        width={800}
        visible={visible}
        setVisible={setVisible}
        onOk={submitHandle}
        destroyOnClose
        onCancel={() => {
          setVisible(false);
          setTemplateSelectVisible?.(false);
        }}
        centered
        getContainer={document.body}
      >
        <Form form={form} className={styles.form}>
          <ZSVForm.Card
            title={intl.formatMessage({
              id: "instance.modal.create.instance.by.template.part.card.title",
              defaultMessage: "Template Information",
            })}
          >
            {!realSource?.isTemplate ? (
              <Item
                name="vmTemplate"
                label={intl.formatMessage({
                  id: "template",
                  defaultMessage: "Template",
                })}
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: "please.select.vm.template",
                      defaultMessage: "Select a virtual machine template.",
                    }),
                  },
                ]}
                style={{ marginBottom: 20 }}
                description={
                  <Item noStyle name="hasPcieDevice">
                    <PcieAlert />
                  </Item>
                }
                icon="info"
                iconTooltip={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "create.vm.by.template.field.template.tooltip",
                      defaultMessage:
                        "### Template\n\nWhen a template contains GPU, USB, or PCIe devices, these devices will be excluded when creating new virtual machines from the template. If needed, you can add new devices during the creation or convert the template to a virtual machine.\n\nIf a template contains PCIe devices that are automatically attached by the SR-IOV NICs, new PCIe devices will be automatically attached after the virtual machine is created.",
                    })}
                  </ReactMarkdown>
                }
              >
                <ModalSelect
                  title={intl.formatMessage(
                    {
                      id: "create.vm.select.resource.type.title",
                      defaultMessage: "Select {itemName}",
                    },
                    {
                      itemName: intl.formatMessage({
                        id: "vmTemplate",
                        defaultMessage: "Virtual Machine Template",
                      }),
                    },
                  )}
                  style={{ width: 400 }} //选择框框度，看后续是否有必要放开
                  width={600}
                  autoDispatch={false}
                  visible={templateSelectVisible}
                  setVisible={setTemplateSelectVisible}
                  onCancel={({ onClose }) => {
                    if (!form.isFieldTouched("vmTemplate")) {
                      // 避免 antd modal 闪现
                      flushSync(() => {
                        onClose();
                      });
                      setVisible(false);
                    } else {
                      onClose();
                    }
                  }}
                >
                  <VMTemplateList
                    view="select"
                    defaultQuery={vmTemplateDefaultQuery}
                  />
                </ModalSelect>
              </Item>
            ) : (
              <Item
                name="vmTemplate"
                label={intl.formatMessage({
                  id: "template",
                  defaultMessage: "Template",
                })}
                style={{ marginBottom: 20 }}
                description={
                  <Item noStyle name="hasPcieDevice">
                    <PcieAlert />
                  </Item>
                }
                icon="info"
                iconTooltip={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "create.vm.by.template.field.template.tooltip",
                      defaultMessage:
                        "### Template\n\nWhen a template contains GPU, USB, or PCIe devices, these devices will be excluded when creating new virtual machines from the template. If needed, you can add new devices during the creation or convert the template to a virtual machine.\n\nIf a template contains PCIe devices that are automatically attached by the SR-IOV NICs, new PCIe devices will be automatically attached after the virtual machine is created.",
                    })}
                  </ReactMarkdown>
                }
              >
                {realSource?.name}
              </Item>
            )}
          </ZSVForm.Card>
          <Form.Item
            noStyle
            shouldUpdate={(prev: any, cur: any) =>
              prev.vmTemplate !== cur.vmTemplate
            }
          >
            {() => {
              const template = form.getFieldValue("vmTemplate");
              return (
                template &&
                template.length !== 0 && (
                  <>
                    <BasicCard
                      form={form}
                      source={realSource}
                      template={template}
                    />
                    <AdvancedCard
                      form={form}
                      visible={visible}
                      template={template}
                    />
                  </>
                )
              );
            }}
          </Form.Item>
        </Form>
      </ModalZSV>
    </CreateInstanceContext.Provider>
  );
};

export default CreateInstanceBaseOnTemplate;

function PcieAlert(props: { value?: boolean }) {
  const hasPcieDevice = props.value;
  const intl = useIntl();
  if (!hasPcieDevice) {
    return null;
  }
  return (
    <Alert
      style={{ margin: "-12px 0 -8px" }}
      display="weak"
      type="warning"
      message={intl.formatMessage({
        id: "vm.template.has.pcie.device.warning",
        defaultMessage:
          "The template contains GPU, USB, or PCIe devices, these devices will be excluded when creating new virtual machines from the template.",
      })}
    />
  );
}

import { Button, DialogFooter } from "@zstack/design";
import { getHostResourceAllocation } from "@zstack/virtualization-resource/src/gql/vm.gql";
import PcpuSelect, {
  getSelectValueFromCheckedKeys,
  useTreeData,
} from "@zstack/virtualization-resource/src/pages/vm/components/pcpu-select";
import type { CpuBindListByVCpuItem } from "@zstack/virtualization-resource/src/pages/vm/utils";
import { formatCpuBindListToStructure } from "@zstack/virtualization-resource/src/pages/vm/utils";
import { Form, ListCollect, Switch } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useThrottleFn } from "ahooks";
import { Typography } from "antd";
import { produce } from "immer";
import { uniq } from "lodash-es";
import React, { useCallback, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import styles from "./style.module.less";

// Static style constants
const STYLE_PADDING_0 = { padding: 0 } as const;
const STYLE_PADDING_LEFT_12 = { paddingLeft: 12 } as const;
const STYLE_INLINE_BLOCK_120 = { width: 120, display: "inline-block" } as const;

interface IProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  source: any;
  form: any;
  hostUuid: string;
  cpuNum: number;
  setDidClickBindNumaCancel: (didClickCancel: boolean) => void;
  isEdit: boolean;
}

const { apolloClient } = window.g_main;

const BindCPUModal: React.FC<IProps> = ({
  visible,
  setVisible,
  source = {},
  form,
  hostUuid,
  cpuNum, //vm cpu 核数
  _setDidClickBindNumaCancel,
  isEdit = false,
}) => {
  const intl = useIntl();
  let uuid = "";

  if (hostUuid) {
    uuid = hostUuid;
  } else if (source?.__typename === "HostVO") {
    uuid = source?.uuid;
  } else if (source?.__typename === "VmInstance") {
    uuid = source?.host?.uuid || source?.lastHost?.uuid;
  }

  const { treeData, hostNUMANodeObj, queryHostNUMANode } = useTreeData(
    uuid,
    "host",
  );
  const cpuBindListByVCpu: any[] = form?.getFieldValue("cpuBindListByVCpu");
  const haveCpuBindListByVCpu = cpuBindListByVCpu?.every(
    (it: any) => it.pCPUList.length !== 0,
  );
  useEffect(() => {
    const value = formatCpuBindListToStructure(cpuNum, []);
    if (visible) {
      if (cpuBindListByVCpu?.length) {
        form.setFields([{ name: "cpuBindListByVCpu", cpuBindListByVCpu }]);
      } else {
        form.setFields([{ name: "cpuBindListByVCpu", value }]);
      }
      if (uuid) {
        queryHostNUMANode();
      }
    }
  }, [cpuBindListByVCpu, cpuNum, uuid, visible]);

  const handleIntelligentBind = useCallback(async () => {
    const { data: hostResourceAllocationData } = await apolloClient.query({
      query: getHostResourceAllocation,
      variables: { uuid, uuidType: "host", vcpu: cpuNum },
    });
    const { vCPUPin: _vCPUPin = [] } =
      hostResourceAllocationData?.getHostResourceAllocation ?? {};
    const intelligenceCpuBind = formatCpuBindListToStructure(cpuNum!, _vCPUPin);
    const currentCpuBindListByVCpu: CpuBindListByVCpuItem[] =
      form.getFieldValue?.("cpuBindListByVCpu") ?? [];
    const newCpuBindListByVCpu = produce(currentCpuBindListByVCpu, (draft) => {
      draft.forEach((bindTtem) => {
        const findItem = intelligenceCpuBind.find(
          (item) => bindTtem.vCPU === item.vCPU,
        );
        if (findItem) {
          bindTtem.pCPUList = findItem.pCPUList;
        }
      });
    });
    form.setFields([
      { name: "cpuBindListByVCpu", value: newCpuBindListByVCpu },
    ]);
    form.validateFields?.();
  }, [cpuNum, form, uuid]);

  const { run: handleIntelligentBindThrottle } = useThrottleFn(
    handleIntelligentBind,
    {
      trailing: false,
      wait: 500,
    },
  );

  const validatePCPUList = useCallback(
    (pCPUList: string[]) => {
      if (pCPUList.length === 0) {
        return Promise.reject(
          intl.formatMessage({
            id: "vm.field.vnuma.pcpu.validator.required",
            defaultMessage: "Select pCPUs to bind.",
          }),
        );
      }

      const selectedNumaList = uniq(
        getSelectValueFromCheckedKeys(pCPUList).map(
          (_cpuNum) => hostNUMANodeObj[_cpuNum],
        ),
      );
      if (selectedNumaList.length > 1) {
        return Promise.reject(
          intl.formatMessage({
            id: "vm.field.vnuma.pcpu.validator.numabounds",
            defaultMessage: "The pCPUs pinned by the vCPU must belong to the same pNUMA node.",
          }),
        );
      }
      return Promise.resolve();
    },
    [hostNUMANodeObj, intl],
  );

  const onCancel = () => {
    if (haveCpuBindListByVCpu && !isEdit) {
      form.setFields([
        {
          name: "cpuBindListByVCpu",
          value: formatCpuBindListToStructure(cpuNum, []),
        },
      ]);
      form.resetFields(["cpuBindListByVCpu"]);
      form.setFields([{ name: "vnumaEnabled", value: false }]);
    }

    setVisible(false);
  };

  const onOk = () => {
    if (!form.getFieldValue("vnumaEnabled")) {
      form.setFields([{ name: "cpuBindListByVCpu", value: [] }]);
      form.setFields([{ name: "vnumaEnabled", value: false }]);
      setVisible(false);
      return;
    }
    form
      .validateFields?.()
      .then((_result: any) => {
        setVisible(false);
      })
      .catch(({ errorFields = [] }) => {
        const hasField = errorFields.some((entry: any) => {
          return (
            Array.isArray(entry.name) &&
            entry.name.includes("cpuBindListByVCpu")
          );
        });
        if (!hasField) {
          setVisible(false);
        }
      });
  };

  return (
    <DialogForm
      visible={visible}
      setVisible={setVisible}
      className={styles.modal}
      title={intl.formatMessage({
        id: "bind.cpu.numa",
        defaultMessage: "CPU NUMA Binding",
      })}
      form={form}
      footer={
        <DialogFooter className="gap-2">
          <div className="flex gap-2">
            <Button onClick={onCancel} variant="subtle">
              {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
            </Button>
            <Button onClick={onOk} variant="primary">
              {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
            </Button>
          </div>
        </DialogFooter>
      }
    >
      <Form form={form}>
        <Form.Item
          label={intl.formatMessage({
            id: "cpu.numa",
            defaultMessage: "CPU NUMA",
          })}
          name="vnumaEnabled"
          valuePropName="checked"
          icon="info"
          iconTooltip={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "vm.field.cpu.numa.tooltip",
                defaultMessage: `todo`,
              })}
            </ReactMarkdown>
          }
        >
          <Switch />
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prev, curr) => prev.vnumaEnabled !== curr.vnumaEnabled}
        >
          {({ getFieldValue }) => {
            return getFieldValue("vnumaEnabled") ? (
              <Form.Item
                label={intl.formatMessage({
                  id: "bind",
                  defaultMessage: "Associate",
                })}
                icon="info"
                iconTooltip={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "zsv.one.click.intelligentBinding.tooltip",
                      defaultMessage: `### Smart Binding

Smart binding assigns a vCPU of a VM to a pCPU on a host pNUMA node by descending order of the pNUMA node ID. If all pCPUs on the pNUMA node are bound, a pCPU on the next pNUMA node is to be bound. If all pCPUs of the host are bound but some vCPUs are not assigned to pCPUs, each vCPU is assigned to a pCPU starting again from the pNUMA node with the maximum node ID.
                  `,
                    })}
                  </ReactMarkdown>
                }
              >
                <>
                  <Button
                    variant="link"
                    style={STYLE_PADDING_0}
                    onClick={handleIntelligentBindThrottle}
                  >
                    {intl.formatMessage({
                      id: "one.click.intelligent.binding",
                      defaultMessage: "Smart Binding",
                    })}
                  </Button>
                  <Form.List name="cpuBindListByVCpu">
                    {(fields) => {
                      return (
                        <div className={styles["list-collect"]}>
                          <div className="flex">
                            <div className="w-1/3">
                              <div className={styles.vCPU}>
                                {intl.formatMessage({
                                  id: "vcpu",
                                  defaultMessage: "vCPU",
                                })}
                                <span> </span>
                              </div>
                            </div>
                            <div className="w-2/3">
                              <div className={styles.pCPU}>
                                {intl.formatMessage({
                                  id: "pcpu",
                                  defaultMessage: "pCPU",
                                })}
                                <span
                                  className={`form-item-label-container-required`}
                                >
                                  *
                                </span>
                              </div>
                            </div>
                          </div>
                          <ListCollect dataSource={fields} readonly>
                            {(field, index) => (
                              <div className="flex">
                                <div className="w-1/3">
                                  <Form.Item
                                    name={[field.name, "vCPU"]}
                                    key="vCPU"
                                    style={STYLE_PADDING_LEFT_12}
                                    className={styles.formItem}
                                    valuePropName="children"
                                  >
                                    <Typography.Text
                                      style={STYLE_INLINE_BLOCK_120}
                                    />
                                  </Form.Item>
                                </div>
                                <div className="w-2/3">
                                  <Form.Item
                                    name={[field.name, "pCPUList"]}
                                    key="pCPU"
                                    className={styles.formItem}
                                    validateTrigger={["onChange", "onBlur"]}
                                    rules={[
                                      {
                                        validator() {
                                          return validatePCPUList(
                                            getFieldValue([
                                              "cpuBindListByVCpu",
                                              index,
                                              "pCPUList",
                                            ]),
                                          );
                                        },
                                      },
                                    ]}
                                  >
                                    <PcpuSelect
                                      allowClear
                                      placeholder={intl.formatMessage({
                                        id: "pCPU.select",
                                        defaultMessage: "Select pCPU",
                                      })}
                                      width={240}
                                      treeData={treeData}
                                      hostNUMANodeObj={hostNUMANodeObj}
                                    />
                                  </Form.Item>
                                </div>
                              </div>
                            )}
                          </ListCollect>
                        </div>
                      );
                    }}
                  </Form.List>
                </>
              </Form.Item>
            ) : null;
          }}
        </Form.Item>
      </Form>
    </DialogForm>
  );
};

export default BindCPUModal;

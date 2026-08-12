import { createInstance } from "@zstack/virtualization-resource/src/gql/instance.gql";
import { Form } from "@zstack/zsphere-components";
import { DialogWeakP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  CreateInstancePayload,
  VmInstance as IVM,
} from "@zstack/zsphere-types/graphql";
import { cloneDeep } from "lodash-es";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import BasicCard from "./basic-config";
import ModalZSV from "./components/modal-zsv";
import { CreateInstanceContext } from "./context";
import AdvancedCard from "./hardware-and-config";
import { getZoneUuidBySource } from "./hooks/get-zoneuuid";
import { transformParams } from "./hooks/transform-params";
import { initialBasicValues } from "./utils";

import style from "./style.module.less";

/**
 * TODO:
 * 1. 需要全局配置决定一些参数的默认值，比如硬盘数量，待PM整理(Version:4.1.6 ;  Date: 2024/1/22)
 * 2. 新增
 */

const CreateInstance: React.FC<IActionWrapperProps<IVM>> = ({
  visible,
  source,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();
  const [tpmModalVisible, setTpmModalVisible] = useState(false);
  const realSource =
    selectedList.length !== 0 &&
    (selectedList[0] as { __typename?: string })?.__typename !== "VmInstance"
      ? selectedList[0]
      : (source as any);

  const { setRealSource } = React.useContext(CreateInstanceContext);

  const zoneUuid = useMemo(() => {
    return getZoneUuidBySource(realSource);
  }, [realSource]);

  useEffect(() => {
    setRealSource?.((pre: any) => ({
      ...pre,
      zoneUuid,
      realSource,
    }));
  }, [realSource, zoneUuid, setRealSource]);

  const initValues = useMemo(() => {
    const values: any = cloneDeep(initialBasicValues);
    values[`cdRomList-0`] = [];
    if (realSource?.__typename === "Image") {
      const imageFormat = realSource?.format;
      const imageType = realSource?.mediaType;
      //imageType !== 'DataVolumeTemplate' 不是数据盘镜像就是系统镜像，沿用cloud逻辑
      if (imageFormat === "iso" && imageType !== "DataVolumeTemplate") {
        //实际上只有raw qcow2和disk有关
        //只有根盘走这个逻辑
        values[`cdRomList-0`] = [realSource];
      }
    }
    //cdRomName 仅作为cdrom传参处理的标志量
    values[`cdRomName-0`] = `cdRomName-0`;
    return values;
  }, [realSource]);

  // ZSV-11479: Form initialValues only applies on first mount.
  // When realSource changes (user selects a different image), explicitly update cdRomList-0.
  useEffect(() => {
    if (realSource?.__typename === "Image") {
      const imageFormat = realSource?.format;
      const imageType = realSource?.mediaType;
      if (imageFormat === "iso" && imageType !== "DataVolumeTemplate") {
        form.setFieldsValue({ "cdRomList-0": [realSource] });
      } else {
        form.setFieldsValue({ "cdRomList-0": [] });
      }
    } else {
      form.setFieldsValue({ "cdRomList-0": [] });
    }
  }, [realSource, form]);

  const submitHandle = useCallback(
    async (e: any) => {
      const params = cloneDeep(e);

      // Windows 11 版本强制要求添加 TPM 和启用 Secure Boot：若未满足则在点击确定时弹出错误提示并中断提交
      const { guest, os, tpmEnabled, secureBoot } = params as {
        guest?: string;
        os?: string;
        tpmEnabled?: boolean;
        secureBoot?: boolean;
      };
      const isWin11 = guest === "Windows" && os === "Windows 11";

      const hasTpm = Boolean(tpmEnabled);
      const isSecureBootEnabled = Boolean(secureBoot);

      const isArm =
        params.runPath?.[0]?.architecture === "aarch64" ||
        realSource?.architecture === "aarch64";
      if (isWin11 && !isArm && (!hasTpm || !isSecureBootEnabled)) {
        setTpmModalVisible(true);
        return;
      }

      const createInstancePayload: CreateInstancePayload = transformParams(
        params,
        zoneUuid,
        realSource,
      );
      // console.log('表单内容', JSON.parse(JSON.stringify(createInstancePayload)))
      doAction({
        mutation: createInstance,
        payload: JSON.parse(JSON.stringify(createInstancePayload)),
        name: intl.formatMessage({
          id: "virtualization.create.instance",
          defaultMessage: "New Virtual Machine",
        }),
        total: params?.count,
        type: "VmInstance",
      });

      setVisible(false);
    },
    [doAction, zoneUuid, intl, realSource, setVisible],
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
          id: "instance.modal.title.create",
          defaultMessage: "New Virtual Machine",
        })}
        className={style["create-vm-modal"]} //先改云主机，后续若全局，直接改组件
        form={form}
        width={800}
        visible={visible}
        setVisible={setVisible}
        onOk={submitHandle}
        controlledVisible
        destroyOnClose
        resetAfterClose
        onCancel={() => setVisible(false)}
        getContainer={document.body}
      >
        <Form form={form} className={style.form} initialValues={initValues}>
          <BasicCard form={form} source={realSource} isEdit={false} />
          <AdvancedCard form={form} visible={visible} />
        </Form>
      </ModalZSV>
      <DialogWeakP1
        visible={tpmModalVisible}
        setVisible={setTpmModalVisible}
        type="warning"
        title={intl.formatMessage({
          id: "vm.create.win11.tpm.required.title",
          defaultMessage: "Cannot Create Virtual Machine",
        })}
        description={
          <div>
            {intl.formatMessage({
              id: "vm.create.win11.tpm.required.description",
              defaultMessage:
                "The following requirements must be met when creating a Windows 11 virtual machine:",
            })}
            <ol style={{ paddingLeft: 20 }}>
              <li>
                {intl.formatMessage({
                  id: "vm.create.win11.tpm.required.condition1",
                  defaultMessage: "1. Add a TPM device under the Hardware tab.",
                })}
              </li>
              <li>
                {intl.formatMessage({
                  id: "vm.create.win11.tpm.required.condition2",
                  defaultMessage: "2. Enable Secure Boot under Advanced Settings > Boot Options.",
                })}
              </li>
            </ol>
          </div>
        }
        onConfirm={() => setTpmModalVisible(false)}
      />
    </CreateInstanceContext.Provider>
  );
};

export default CreateInstance;

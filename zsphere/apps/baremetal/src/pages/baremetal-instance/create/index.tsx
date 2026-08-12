import { gql } from "@apollo/client";
import { Button, Steps } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { CreateBaremetalInstancePayload } from "@zstack/zsphere-types/graphql";
import { genUuid } from "@zstack/zsphere-utils";
import { cloneDeep } from "lodash-es";
import type { FC } from "react";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useIntl } from "react-intl";

import { IDeviceType } from "../type";
import BasicConfig from "./basic-info";
import ConfigInfo from "./config-info";
import BaremetalInstanceCreateContext from "./context";

import styles from "./style.module.less";

const createBaremetalInstance = gql`
  mutation createBaremetalInstance($input: CreateBaremetalInstanceInput!) {
    createBaremetalInstance(input: $input) {
      actionId
    }
  }
`;

const initialValues = {
  platform: "Linux",
};

const Create: FC<IActionWrapperProps<any>> = ({
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [disabledFlag, setDisabledFlag] = useState<boolean>(true);
  const [source, setSource] = useState<any>({});
  const [form] = Form.useForm();
  const doAction = useAction();

  useEffect(() => {
    if (!visible) {
      setCurrentStep(0);
      form.resetFields();
    }
  }, [visible, form]);

  const submitHandle = useCallback(async () => {
    const params = cloneDeep(form.getFieldsValue());
    const uuidList: string[] = [];

    const payload: CreateBaremetalInstancePayload[] =
      params?.instanceConfigs?.map((item: any, index: number) => {
        const resourceUuid = genUuid();
        uuidList.push(resourceUuid);
        return {
          resourceUuid,
          name:
            params?.instanceConfigs.length > 1
              ? `${params?.name}-${index}`
              : params?.name,
          description: params?.description,
          chassisUuid: params?.baremetalChassis[index].uuid,
          imageUuid: params?.image?.[0]?.uuid,
          platform: params?.platform || initialValues.platform,
          templateUuid: params?.preconfigurationTemplate?.[0].uuid,
          username: item?.username || "",
          password: item?.password || "",
          nicCfgs:
            item?.networkConfigs
              ?.filter(
                (networkConfig: any) => networkConfig.type === IDeviceType.Nic,
              )
              ?.map((networkConfig: any) => ({
                mac: JSON.parse(networkConfig.nicConfig.nic).mac,
                l3NetworkUuid: networkConfig.nicConfig.l3Network?.[0].uuid,
                ip: networkConfig.nicConfig.ip,
              })) || [],
          bondingCfgs:
            item?.networkConfigs
              ?.filter(
                (networkConfig: any) =>
                  networkConfig.type === IDeviceType.NicBond,
              )
              ?.map((networkConfig: any) => ({
                name: networkConfig?.bondConfig?.name,
                mode: networkConfig?.bondConfig?.mode,
                slaves: networkConfig.bondConfig.nic.map(
                  (nic: any) => JSON.parse(nic).mac,
                ),
                l3NetworkUuid: networkConfig.bondConfig.l3Network?.[0].uuid,
                ip: networkConfig.bondConfig.ip,
              })) || [],
          customConfigurations: params?.customConfigurations?.length
            ? item.customConfigurations.map((customConfig: any) => ({
                key: customConfig.key,
                value: customConfig.value,
              }))
            : [],
          systemTags: params?.forceInstall ? ["forceInstall"] : [],
        } as CreateBaremetalInstancePayload;
      });

    try {
      doAction({
        mutation: createBaremetalInstance,
        payload,
        name: intl.formatMessage({
          id: "instance.migrate.action.title.create.baremetal.instance",
          defaultMessage: "New Bare Metal Instance",
        }),
        total: 1,
        type: "BaremetalInstance",
      });
    } catch (e) {
      console.log("创建失败", e);
    }
    setVisible(false);
  }, [form]);

  const onNext = async () => {
    form
      .validateFields([
        "name",
        "baremetalChassis",
        "image",
        "preconfigurationTemplate",
      ])
      .then(() => {
        setCurrentStep((value) => value + 1);
      });
  };

  useEffect(() => {
    if (visible && selectedList?.length) {
      setSource(selectedList?.[0]);
    }
  }, [selectedList, visible]);

  const stepItems = useMemo(
    () => [
      {
        title: intl.formatMessage({
          id: "basic.info",
          defaultMessage: "Basic Info",
        }),
      },
      {
        title: intl.formatMessage({
          id: "config.info",
          defaultMessage: "Configurations",
        }),
      },
    ],
    [intl],
  );

  const footer = (
    <div className="flex gap-2">
      <Button
        variant="subtle"
        onClick={() => {
          setVisible(false);
        }}
      >
        {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
      </Button>
      {currentStep > 0 && (
        <Button
          variant="secondary"
          icon={<Icon type="arrow-ios-left" />}
          onClick={() => setCurrentStep((value) => value - 1)}
        >
          {intl.formatMessage({ id: "previous", defaultMessage: "Back" })}
        </Button>
      )}
      {currentStep < 1 ? (
        <Button variant="primary" onClick={() => onNext()}>
          {intl.formatMessage({ id: "next", defaultMessage: "Next" })}
          <Icon type="arrow-ios-right" style={{ marginLeft: 4 }} />
        </Button>
      ) : (
        <Button
          variant="primary"
          disabled={disabledFlag}
          onClick={submitHandle}
        >
          {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
        </Button>
      )}
    </div>
  );

  return (
    <DialogForm
      form={form}
      title={intl.formatMessage({
        id: "add.baremetal.instance",
        defaultMessage: "New Bare Metal Instance",
      })}
      visible={visible}
      setVisible={setVisible}
      widthClassName="w-200"
      onCancel={() => setVisible(false)}
      className={styles.createBmInstance}
      bodyClassName="p-0"
      onOk={submitHandle}
      footer={footer}
    >
      <BaremetalInstanceCreateContext.Provider
        value={{ source, setSource, disabledFlag, setDisabledFlag }}
      >
        <div className={styles.stepsWrapper}>
          <Steps
            direction="horizontal"
            current={currentStep}
            items={stepItems}
          />
        </div>
        <Form form={form} initialValues={initialValues}>
          <div className={styles.formWrapper}>
            <div style={{ display: currentStep === 1 ? "none" : "block" }}>
              <BasicConfig form={form} />
            </div>
            <div style={{ display: currentStep === 1 ? "block" : "none" }}>
              <ConfigInfo form={form} />
            </div>
          </div>
        </Form>
      </BaremetalInstanceCreateContext.Provider>
    </DialogForm>
  );
};

export default Create;

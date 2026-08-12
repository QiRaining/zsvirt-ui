import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Steps, Form } from "@zstack/zsphere-components";
import type { FormInstance } from "antd";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

const { Step } = Steps;

export interface IStepFormProps {
  form: FormInstance;
  onOk: () => void;
  onCancel: () => void;
  initialValues?: any;
  onValuesChange?: (changedValues: any, values: any) => void;
  steps: Array<{ title: string; content: React.ReactNode }>;
  onError?: (err: any) => void;
  onFooterChange?: (footer: React.ReactNode) => void;
}

export default function StepForm({
  form,
  onOk,
  onCancel,
  initialValues,
  onValuesChange,
  steps,
  onError,
  onFooterChange,
}: IStepFormProps) {
  const intl = useIntl();
  const [currentStep, setCurrentStep] = useState(0);

  const footerContent = (
    <>
      <Button variant="subtle" onClick={onCancel}>
        {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
      </Button>
      {currentStep > 0 && (
        <Button
          variant="secondary"
          icon={<Icon type="arrow-ios-left" />}
          onClick={() => setCurrentStep(currentStep - 1)}
        >
          {intl.formatMessage({ id: "previous", defaultMessage: "Back" })}
        </Button>
      )}
      {currentStep < steps.length - 1 ? (
        <Button
          key="next"
          variant="primary"
          onClick={() => {
            form
              .validateFields()
              .then(() => setCurrentStep(currentStep + 1))
              .catch((err) => {
                onError?.(err);
              });
          }}
        >
          {intl.formatMessage({ id: "next", defaultMessage: "Next" })}
          <Icon type="arrow-ios-right" style={{ marginLeft: 4 }} />
        </Button>
      ) : (
        <Button
          key="ok"
          variant="primary"
          onClick={() => {
            form
              .validateFields()
              .then(() => {
                onOk();
              })
              .catch((err) => {
                onError?.(err);
              });
          }}
        >
          {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
        </Button>
      )}
    </>
  );

  React.useEffect(() => {
    onFooterChange?.(footerContent);
  });

  return (
    <div>
      <div className={style.stepsWrapper}>
        <Steps direction="horizontal" current={currentStep}>
          {steps.map(({ title }) => (
            <Step key={title} title={title} />
          ))}
        </Steps>
      </div>
      <Form
        form={form}
        initialValues={initialValues}
        preserve={false}
        onValuesChange={onValuesChange}
      >
        {steps.slice(0, currentStep + 1).map(({ title, content }, index) => {
          return (
            <div
              key={title}
              style={{ display: currentStep === index ? "block" : "none" }}
            >
              {content}
            </div>
          );
        })}
      </Form>
    </div>
  );
}

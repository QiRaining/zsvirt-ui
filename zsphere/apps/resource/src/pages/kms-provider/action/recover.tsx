import { gql, useLazyQuery } from "@apollo/client";
import { Button } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { Icon } from "@zstack/icon";
import { Form, Input, Steps, Upload, Text } from "@zstack/zsphere-components";
import { DialogBase } from "@zstack/zsphere-design-biz";
import { useAction, useValidator } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, Item } from "@zstack/zsphere-types";
import React, { useEffect, useState, useRef } from "react";
import { useIntl } from "react-intl";

import style from "../style.module.less";

const parseNkpRestore = gql`
  query parseNkpRestore($contentBase64: String!, $password: String) {
    parseNkpRestore(contentBase64: $contentBase64, password: $password) {
      restoreInfo {
        name
        backupTime
      }
      code
      reason
    }
  }
`;

const restoreNkp = gql`
  mutation restoreNkp($input: RestoreNkpInput!) {
    restoreNkp(input: $input) {
      actionId
    }
  }
`;

const { Step } = Steps;

const Recover: React.FC<IActionWrapperProps<Item>> = ({
  visible,
  setVisible,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const { lengthRange } = useValidator(intl);
  const [queryParseNkpRestore, { data: parsedData }] =
    useLazyQuery(parseNkpRestore);
  const [form] = Form.useForm();
  const { getServerTime } = useTime();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const contentRef = useRef("");

  useEffect(() => {
    if (visible) {
      setLoading(false);
      setCurrentStep(0);
      form.resetFields();
    }
  }, [form, visible]);

  const readFile = () => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(String(reader.result));
      };
      reader.onerror = () => {
        reject(reader.error);
      };
      reader.readAsText(form.getFieldValue("backupFile"));
    });
  };

  const onNext = async () => {
    await form.validateFields();
    let code = "";
    setLoading(true);
    try {
      const text = await readFile();
      contentRef.current = text;
      const payload: Record<string, string> = {
        contentBase64: text,
      };
      const password = form.getFieldValue("password");
      if (password) {
        payload.password = password;
      }
      const result = await queryParseNkpRestore({
        variables: payload,
        fetchPolicy: "no-cache",
      });
      code = result?.data?.parseNkpRestore?.code as string;
    } catch {
      code = "KP.1001";
    }
    setLoading(false);
    if (code === "KP.1000") {
      setCurrentStep(1);
      form.setFields([
        { name: "backupFile", errors: [] },
        { name: "password", errors: [] },
      ]);
    } else if (code === "KP.1604") {
      form.setFields([
        {
          name: "password",
          errors: [
            intl.formatMessage({
              id: "restore.nkp.validator.wrong.password",
              defaultMessage: "Password verification failed.",
            }),
          ],
        },
        { name: "backupFile", errors: [] },
      ]);
    } else if (code === "KP.1900") {
      form.setFields([
        {
          name: "backupFile",
          errors: [
            intl.formatMessage({
              id: "restore.nkp.validator.name.duplicate",
              defaultMessage: "A key provider with the same name already exists on the platform.",
            }),
          ],
        },
        { name: "password", errors: [] },
      ]);
    } else {
      form.setFields([
        {
          name: "backupFile",
          errors: [
            intl.formatMessage({
              id: "restore.nkp.validator.parse.error",
              defaultMessage: "The selected file cannot be parsed.",
            }),
          ],
        },
        { name: "password", errors: [] },
      ]);
    }
  };

  const onOk = () => {
    setVisible(false);
    const payload: Record<string, string> = {
      contentBase64: contentRef.current,
    };
    const password = form.getFieldValue("password");
    if (password) {
      payload.password = password;
    }
    doAction({
      mutation: restoreNkp,
      payload,
      name: intl.formatMessage({
        id: "recover.kmsProvider",
        defaultMessage: "Restore Key Provider",
      }),
      total: 1,
      type: "KmsProvider",
    });
  };

  const footer = (
    <div style={{ display: "flex", alignItems: "center" }} className="gap-2">
      <Button variant="subtle" onClick={() => setVisible(false)}>
        {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
      </Button>
      {currentStep > 0 && (
        <Button
          variant="secondary"
          onClick={() => setCurrentStep((value) => value - 1)}
        >
          <Icon style={{ marginRight: 4 }} type="arrow-ios-left" />
          {intl.formatMessage({ id: "previous", defaultMessage: "Back" })}
        </Button>
      )}
      {currentStep < 1 ? (
        <Button
          variant="primary"
          onClick={onNext}
          loading={loading}
          disabled={loading}
        >
          {intl.formatMessage({ id: "next", defaultMessage: "Next" })}
          <Icon style={{ marginLeft: 4 }} type="arrow-ios-right" />
        </Button>
      ) : (
        <Button variant="primary" onClick={onOk}>
          {intl.formatMessage({ id: "confirm", defaultMessage: "OK" })}
        </Button>
      )}
    </div>
  );

  return (
    <DialogBase
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "recover.kmsProvider",
        defaultMessage: "Restore Key Provider",
      })}
      footer={footer}
      widthClassName="w-160"
    >
      <>
        <div className={style.stepsWrapper}>
          <Steps current={currentStep} progressDot direction="horizontal">
            <Step
              title={intl.formatMessage({
                id: "recover.upload.step",
                defaultMessage: "Upload Backup File",
              })}
            />
            <Step
              title={intl.formatMessage({
                id: "recover.confirm.step",
                defaultMessage: "Restore",
              })}
            />
          </Steps>
        </div>
        <Form form={form} className={style.formSection}>
          <div style={{ display: currentStep === 0 ? "block" : "none" }}>
            <Form.Item
              name="backupFile"
              label={intl.formatMessage({
                id: "upload.file",
                defaultMessage: "Upload File",
              })}
              required
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: "restore.nkp.validator.file.required",
                    defaultMessage: "Upload a file to restore the key provider from.",
                  }),
                },
              ]}
            >
              <Upload.Select className="width-320" accept=".bak" />
            </Form.Item>
            <Form.Item
              name="password"
              label={intl.formatMessage({
                id: "password",
                defaultMessage: "Password",
              })}
              description={intl.formatMessage({
                id: "restore.nkp.field.password.description",
                defaultMessage:
                  "If the backup file is password-protected, enter the password. Incorrect password will cause restoration to fail.",
              })}
              rules={[lengthRange(0, 255)]}
            >
              <Input.Password className="width-320" />
            </Form.Item>
          </div>
          <div style={{ display: currentStep === 1 ? "block" : "none" }}>
            <Form.Item
              label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
            >
              <Text
                value={parsedData?.parseNkpRestore?.restoreInfo?.name || "-"}
              />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({
                id: "nkp.backup.time",
                defaultMessage: "Backup Time",
              })}
            >
              <Text
                value={
                  parsedData?.parseNkpRestore?.restoreInfo?.backupTime
                    ? getServerTime(
                        parsedData.parseNkpRestore.restoreInfo.backupTime,
                      ).format("YYYY-MM-DD HH:mm:ss")
                    : "-"
                }
              />
            </Form.Item>
          </div>
        </Form>
      </>
    </DialogBase>
  );
};

export default Recover;

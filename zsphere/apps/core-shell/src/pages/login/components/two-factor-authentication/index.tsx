import type { ApolloError } from "@apollo/client";
import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Form } from "@zstack/design";
import { FieldStack, InputField } from "@zstack/form";
import { Icon } from "@zstack/icon";
import { Steps } from "@zstack/zsphere-components";
import { DialogBase } from "@zstack/zsphere-design-biz";
import { TwoFactorAuthenticationSecretStatus } from "@zstack/zsphere-types";
import type {
  GetTwoFactorAuthenticationSecretPayload,
  GetTwoFactorAuthenticationSecretResp,
} from "@zstack/zsphere-types/graphql";
import QRCode from "qrcode.react";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { getTwoFactorAuthenticationSecret } from "../../../../gql/user.gql";
import {
  createTwoFactorAuthenticationSchema,
  type TwoFactorAuthenticationFormValues,
} from "./schema";

import style from "./style.module.less";

interface IProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  payload: GetTwoFactorAuthenticationSecretPayload;
  onOk: (authcode: string) => void;
  onError?: (e: ApolloError) => void;
}

const TwoFactorAuthenticationModal: React.FC<IProps> = ({
  visible,
  setVisible,
  payload,
  onOk,
  onError,
}) => {
  const intl = useIntl();
  const [getSecret, { data, loading }] = useMutation<
    { getTwoFactorAuthenticationSecret: GetTwoFactorAuthenticationSecretResp },
    { input: GetTwoFactorAuthenticationSecretPayload }
  >(getTwoFactorAuthenticationSecret, {
    onError,
  });

  const secret = useMemo(() => {
    return data?.getTwoFactorAuthenticationSecret?.secret;
  }, [data]);

  const status = useMemo(() => {
    return data?.getTwoFactorAuthenticationSecret?.status;
  }, [data]);

  useEffect(() => {
    if (visible) {
      getSecret({
        variables: { input: payload },
      });
    }
  }, [getSecret, payload, visible]);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const defaultValues = useMemo<TwoFactorAuthenticationFormValues>(
    () => ({
      username: payload.name,
      authCode: "",
    }),
    [payload.name],
  );
  const formSchema = useMemo(
    () => createTwoFactorAuthenticationSchema(intl),
    [intl],
  );
  const form = useForm<TwoFactorAuthenticationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
      setCurrentStep(1);
    }
  }, [defaultValues, form, visible]);

  const download = useMemo(() => {
    return () => {
      const canvas = document.getElementById(
        "qrcode_canvas",
      ) as HTMLCanvasElement;
      const MIME_TYPE = "image/jpg";

      const imgURL = canvas.toDataURL(MIME_TYPE);

      const dlLink = document.createElement("a");
      dlLink.download = "qrcode";
      dlLink.href = imgURL;
      dlLink.dataset.downloadurl = [
        MIME_TYPE,
        dlLink.download,
        dlLink.href,
      ].join(":");

      document.body.appendChild(dlLink);
      dlLink.click();
      document.body.removeChild(dlLink);
    };
  }, []);

  const footer = useMemo(() => {
    const cancelBtn = (
      <Button
        variant="link"
        onClick={() => {
          setVisible(false);
        }}
      >
        {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
      </Button>
    );
    const confirmBtn = (
      <Button
        variant="primary"
        onClick={async () => {
          const isValid = await form.trigger("authCode");
          if (!isValid) {
            return;
          }
          onOk(form.getValues("authCode"));
          setVisible(false);
        }}
      >
        {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
      </Button>
    );
    const stepBtn =
      currentStep === 1 ? (
        <Button
          variant="primary"
          onClick={() => {
            form.setValue("username", payload.name);
            setCurrentStep(2);
            download();
          }}
        >
          {intl.formatMessage({
            id: "next.step.varify.safety.code",
            defaultMessage: "Save and Contiune",
          })}
        </Button>
      ) : (
        <Button
          variant="link"
          className={style.prevBtn}
          onClick={() => setCurrentStep(1)}
        >
          {intl.formatMessage({
            id: "prev.step.set.indentity.authentication",
            defaultMessage: "Previous: Set Up Authenticator",
          })}
        </Button>
      );
    if (status === TwoFactorAuthenticationSecretStatus.NewCreated) {
      return (
        <div className="flex items-center gap-2">
          {cancelBtn}
          {stepBtn}
          {currentStep === 2 && confirmBtn}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        {cancelBtn}
        {confirmBtn}
      </div>
    );
  }, [
    currentStep,
    download,
    form,
    intl,
    onOk,
    payload.name,
    setVisible,
    status,
  ]);

  if (loading) {
    return null;
  }
  return (
    <DialogBase
      footer={footer}
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "indentity.varify",
        defaultMessage: "Identity Authentication",
      })}
    >
      <div className={style.twoFactorContainer}>
        {status === TwoFactorAuthenticationSecretStatus.NewCreated && (
          <Steps
            current={currentStep - 1}
            direction="horizontal"
            className={style.steps}
          >
            <Steps.Step
              key="step-auth-setup"
              title={intl.formatMessage({
                id: "set.indentity.authentication",
                defaultMessage: "Set Up Authenticator",
              })}
            />
            <Steps.Step
              key="step-verify-code"
              title={intl.formatMessage({
                id: "varify.safety.code",
                defaultMessage: "Verify Authentication Code",
              })}
            />
          </Steps>
        )}
        {status === TwoFactorAuthenticationSecretStatus.NewCreated &&
          currentStep === 1 && (
            <>
              <div className={style.tipContainer}>
                <div className={style.dot} />
                <div>
                  <div>
                    {intl.formatMessage({
                      id: "download.indentity.authentication.application",
                      defaultMessage: "Download and install authenticator.",
                    })}
                  </div>
                  <div className={style.tip}>
                    {intl.formatMessage({
                      id: "download.indentity.authentication.application.recommond",
                      defaultMessage:
                        "Recommended authenticator: Authy, Microsoft Authenticator, and Google Authenticator.",
                    })}
                  </div>
                </div>
              </div>
              <div className={style.tipContainer}>
                <div className={style.dot} />
                <div>
                  {intl.formatMessage({
                    id: "varify.safety.code.method",
                    defaultMessage:
                      "Use your authenticator app to scan the QR code and obtain a 6-digit authentication code.",
                  })}
                </div>
              </div>
              {secret && (
                <div className={style.qrcode}>
                  <div className={style.downloadBtn} onClick={download}>
                    <Icon type="download" />
                  </div>
                  <QRCode
                    id="qrcode_canvas"
                    value={`otpauth://totp/${encodeURIComponent(
                      payload.name,
                    )}?secret=${secret}`}
                    size={120}
                  />
                </div>
              )}
              <Alert className={style.alert} variant="warning">
                {intl.formatMessage({
                  id: "indentity.authentication.qrcode.alert",
                  defaultMessage:
                    "The QR code is displayed only once. Please save it for later use. If you lost your QR code, contact the technical support.",
                })}
              </Alert>
            </>
          )}
        {(status === TwoFactorAuthenticationSecretStatus.Logined ||
          currentStep === 2) && (
          <>
            <Form {...form}>
              <FieldStack>
                <InputField
                  form={form}
                  name="username"
                  required
                  disabled
                  readOnly
                  size="m"
                  label={intl.formatMessage({
                    id: "currentUser",
                    defaultMessage: "Current User",
                  })}
                />
                <InputField
                  form={form}
                  name="authCode"
                  required
                  size="m"
                  label={intl.formatMessage({
                    id: "authCode",
                    defaultMessage: "Authentication Code",
                  })}
                  hint={
                    <div className={style.authCodeTip}>
                      {status === TwoFactorAuthenticationSecretStatus.Logined &&
                        intl.formatMessage({
                          id: "indentity.authentication.auth.code.input",
                          defaultMessage:
                            "Enter the 6-digit authentication code provided by your authenticator.",
                        })}
                      {intl.formatMessage({
                        id: "indentity.authentication.authCode.alert.info",
                        defaultMessage:
                          "If you lost your QR code, contact the technical support to obtain a new one.",
                      })}
                    </div>
                  }
                />
              </FieldStack>
            </Form>
          </>
        )}
      </div>
    </DialogBase>
  );
};

export default TwoFactorAuthenticationModal;

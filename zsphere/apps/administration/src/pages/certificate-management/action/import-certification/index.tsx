import { Alert, RadioGroup } from "@zstack/design";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { CertInfo } from "@zstack/zsphere-types/graphql";
import { usePersistFn } from "ahooks";
import React, { useCallback, useEffect } from "react";
import { useIntl } from "react-intl";

import { genNewCert, turnCert } from "../../gql/cert.gql";
import SelfSigned from "./self-signed";
import ThirdParty from "./third-party";

import style from "../style.module.less";

const initialValues = {
  importMode: "thirdParty",
  httpRedirect: true,
  validTime: 1095,
  commonName: "localhost",
  organization: "localhost",
  country: "CN",
};

export default function ImportCertification({
  visible,
  setVisible,
}: IActionWrapperProps<CertInfo>) {
  const intl = useIntl();
  const [form] = Form.useForm();
  const doAction = useAction();

  const handleModalVisible = usePersistFn(() => {
    form.resetFields();
  });

  useEffect(() => {
    if (visible) {
      handleModalVisible();
    }
  }, [visible, handleModalVisible]);

  const submitHandle = useCallback(
    (data) => {
      const payload =
        data.importMode === "thirdParty"
          ? {
              pub: data.certFile,
              pri: data.certPrivatekey,
              chain: data.certChain,
              redirect: data.httpRedirect,
            }
          : {
              duration: String(data.validTime),
              redirect: data.httpRedirect,
              CN: data.customizeCertInfo
                ? data.commonName
                : initialValues.commonName,
              O: data.customizeCertInfo
                ? data.organization
                : initialValues.organization,
              OU: data.department,
              C: "CN",
              ST: data.province,
              L: data.city,
              emailAddress: data.email,
            };
      const mutation = data.importMode === "thirdParty" ? turnCert : genNewCert;
      doAction({
        mutation,
        payload,
        name: intl.formatMessage({
          id: "cert.import.actionName",
          defaultMessage: "Certificate of Entry",
        }),
        total: 1,
        type: "https.certificate",
        onFinish: (result) => {
          if (result.success === result.total) {
            setTimeout(() => {
              const url = new URL(window.location.href);
              const currentPath = url.pathname;
              url.protocol = "https:";
              const port =
                typeof result.inventory?.port === "number"
                  ? `${result.inventory.port}`
                  : "";
              url.port = port === "443" ? "" : port;
              url.pathname = "/login";
              url.search = "";
              url.searchParams.set("lang", intl.locale);
              url.searchParams.set("redirect", currentPath);
              window.location.replace(url);
            }, 1000);
          }
        },
      });
    },
    [intl, doAction],
  );

  return (
    <DialogForm
      form={form}
      visible={visible}
      setVisible={setVisible}
      onOk={submitHandle}
      title={intl.formatMessage({
        id: "cert.import.title",
        defaultMessage: "Import Certificate",
      })}
    >
      <Form form={form} initialValues={initialValues}>
        <Alert variant="warning">
          {intl.formatMessage({
            id: "cert.import.alert",
            defaultMessage: "The session is reestablished after you configure the certificate. You need to log in to the UI again.",
          })}
        </Alert>
        <div className={style.section}>
          <div className={style.sectionTitle}>
            {intl.formatMessage({
              id: "cert.importMode",
              defaultMessage: "Import Mode",
            })}
          </div>
          <Form.Item
            required
            name="importMode"
            label={intl.formatMessage({
              id: "cert.importMode",
              defaultMessage: "Import Mode",
            })}
          >
            <RadioGroup
              options={[
                {
                  value: "thirdParty",
                  label: intl.formatMessage({
                    id: "cert.importMode.thirdParty",
                    defaultMessage: "Third-Party Certificate",
                  }),
                },
                {
                  value: "selfSigned",
                  label: intl.formatMessage({
                    id: "cert.importMode.selfSigned",
                    defaultMessage: "System Self-Signed Certificate",
                  }),
                },
              ]}
            />
          </Form.Item>
        </div>
        <div className={style.section}>
          <div className={style.sectionTitle}>
            {intl.formatMessage({
              id: "cert.import.info",
              defaultMessage: "Certificate Information",
            })}
          </div>
          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.importMode !== curr.importMode}
          >
            {({ getFieldValue }) => {
              return getFieldValue("importMode") === "thirdParty" ? (
                <ThirdParty form={form} />
              ) : (
                <SelfSigned />
              );
            }}
          </Form.Item>
        </div>
      </Form>
    </DialogForm>
  );
}

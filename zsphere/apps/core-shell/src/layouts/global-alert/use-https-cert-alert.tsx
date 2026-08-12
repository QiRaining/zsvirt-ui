import { useQuery, gql } from "@apollo/client";
import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { useAuth } from "@zstack/zsphere-components";
import type { CertInfo } from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";

import type { Message } from "./alert-switch";

import style from "./style.module.less";

const queryCertInfo = gql`
  query queryCertInfo {
    queryCertInfo {
      issueTime
      duration
      https
      validating
      expireTime
      uploadTime
      issueCN
      O
      OU
      C
      ST
      L
      emailAddress
      subCN
      subO
      subOU
      subC
      subST
      subL
      subEmailAddress
      signatureAlgorithm
      version
      keyAlgorithm
      fingerprint
      serial
      bits
    }
  }
`;

export interface IResp {
  queryCertInfo?: CertInfo;
}

export interface IReturnType {
  certAlerts: Message[];
}

export default function useHttpsCertAlert(): IReturnType {
  const intl = useIntl();
  const { data } = useQuery<IResp>(queryCertInfo, {
    fetchPolicy: "no-cache",
  });
  const isValid = data?.queryCertInfo?.validating;
  if (typeof isValid === "boolean" && !isValid) {
    return {
      certAlerts: [
        {
          id: "https-certificate-expired",
          type: "error",
          closable: true,
          message: (
            <CertMessage
              value={intl.formatMessage({
                id: "global.alert.cert.expired.message",
                defaultMessage:
                  "Your SSL certificate has expired. To avoid any impact on your normal use, please import a new certificate as soon as possible.",
              })}
            />
          ),
        },
      ],
    };
  }
  const remainingTime = data?.queryCertInfo?.duration;
  if (
    (typeof remainingTime === "string" || typeof remainingTime === "number") &&
    Number(remainingTime) <= 30
  ) {
    return {
      certAlerts: [
        {
          id: "https-certificate-expiring",
          type: "warning",
          closable: true,
          message: (
            <CertMessage
              value={intl.formatMessage(
                {
                  id: "global.alert.cert.expiring.message",
                  defaultMessage:
                    "The SSL certificate will expire in {day} days, and we recommend you update it as soon as possible to avoid any impact on your normal use.",
                },
                { day: Number(remainingTime) },
              )}
            />
          ),
        },
      ],
    };
  }
  return { certAlerts: [] };
}

interface ICertMessageProps {
  value: string;
}

function CertMessage({ value }: ICertMessageProps) {
  const intl = useIntl();
  const navigate = useNavigate();
  const { hasAuth } = useAuth();
  return (
    <div className={style.certMessage}>
      <Icon
        size={14}
        type="alert-triangle-fill"
        className={style.certMessageIcon}
      />
      <span>{value}</span>
      {hasAuth({
        resource: "virtualization.certificate.management",
        type: "view",
        authKey: "list",
      }) && (
        <Button
          className={style.certMessageGuide}
          variant="secondary"
          size="sm"
          onClick={() => {
            navigate("/virtualization-administration/certificate-management");
          }}
        >
          {intl.formatMessage({
            id: "global.alert.cert.expired.guideAction",
            defaultMessage: "Go import",
          })}
        </Button>
      )}
    </div>
  );
}

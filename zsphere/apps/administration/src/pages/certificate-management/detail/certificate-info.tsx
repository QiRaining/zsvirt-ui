import type { ListItem, IDraggableCardProps } from "@zstack/zsphere-components";
import { List, DraggableCard, State } from "@zstack/zsphere-components";
import type { CertInfo } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import type { IntlShape } from "react-intl";

export interface IProps extends IDraggableCardProps {
  current?: CertInfo;
}

export default function CertificateInfo({ current, ...props }: IProps) {
  const intl = useIntl();

  const list = useMemo<ListItem[]>(
    () => [
      {
        label: intl.formatMessage({
          id: "cert.info.state",
          defaultMessage: "Certificate Status",
        }),
        value:
          typeof current?.validating === "boolean" ? (
            <State
              prefix="dot"
              type={current.validating ? "success" : "unknown"}
              name={
                current.validating
                  ? intl.formatMessage({
                      id: "valid",
                      defaultMessage: "Valid",
                    })
                  : intl.formatMessage({
                      id: "invalid",
                      defaultMessage: "Invalid",
                    })
              }
            />
          ) : null,
      },
      {
        label: intl.formatMessage({
          id: "cert.info.commonName",
          defaultMessage: "Common Name",
        }),
        value: current?.subCN,
      },
      {
        label: intl.formatMessage({
          id: "cert.info.companyName",
          defaultMessage: "Organization",
        }),
        value: current?.subO,
      },
      {
        label: intl.formatMessage({
          id: "cert.info.department",
          defaultMessage: "Organizational Unit",
        }),
        value: current?.subOU,
      },
      {
        label: intl.formatMessage({
          id: "cert.info.country",
          defaultMessage: "Country/Region",
        }),
        value: current?.subC,
      },
      {
        label: intl.formatMessage({
          id: "cert.info.issueDate",
          defaultMessage: "Issued on",
        }),
        value: current?.issueTime,
      },
      {
        label: intl.formatMessage({
          id: "cert.info.expireDate",
          defaultMessage: "Expires on",
        }),
        value: current?.expireTime,
      },
      {
        label: intl.formatMessage({
          id: "cert.info.remainingValidTime",
          defaultMessage: "Validity Period",
        }),
        value: current?.duration
          ? formatValidTime(Number(current.duration), intl)
          : null,
      },
      {
        label: intl.formatMessage({
          id: "cert.info.signature.algorithm",
          defaultMessage: "Signature Algorithm",
        }),
        value: current?.signatureAlgorithm,
      },
      {
        label: intl.formatMessage({
          id: "cert.info.encryption.algorithm",
          defaultMessage: "Encryption Algorithm",
        }),
        value: current?.keyAlgorithm
          ? formatEncryptionAlgorithm(current.keyAlgorithm, current.bits)
          : null,
      },
      {
        label: intl.formatMessage({
          id: "cert.info.fingerprint",
          defaultMessage: "Thumbprint",
        }),
        copyable: true,
        value: current?.fingerprint
          ? formatFingerprint(current.fingerprint)
          : null,
      },
    ],
    [current, intl],
  );

  return (
    <DraggableCard
      {...props}
      title={intl.formatMessage({
        id: "cert.info.ssl",
        defaultMessage: "SSL Certificate Information",
      })}
      isList
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
}

function formatValidTime(days: number, intl: IntlShape) {
  if (days <= 0) {
    return intl.formatMessage({
      id: "cert.expired",
      defaultMessage: "Expired",
    });
  }
  const years = Math.floor(days / 365);
  const remainder = days % 365;
  const result: Array<string | number> = [];
  if (years) {
    result.push(
      years,
      intl.formatMessage({ id: "year", defaultMessage: "years" }),
    );
  }
  if (remainder) {
    result.push(
      remainder,
      intl.formatMessage({ id: "day", defaultMessage: "days" }),
    );
  }
  return result.join(" ");
}

function formatEncryptionAlgorithm(algo: string, bits?: number) {
  if (algo === "rsaEncryption" && bits) {
    return `RSA ${bits}`;
  }
  return algo;
}

function formatFingerprint(value: string) {
  return value.replace(/:/g, "");
}

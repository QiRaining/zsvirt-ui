import type { ListItem, IDraggableCardProps } from "@zstack/zsphere-components";
import { List, DraggableCard } from "@zstack/zsphere-components";
import type { CertInfo } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

interface IProps extends IDraggableCardProps {
  current?: CertInfo;
}

export default function IssuerInfo({ current, ...props }: IProps) {
  const intl = useIntl();

  const list = useMemo<ListItem[]>(
    () => [
      {
        label: intl.formatMessage({
          id: "cert.info.issuer.name",
          defaultMessage: "Issuer Name",
        }),
        value: current?.issueCN,
      },
      {
        label: intl.formatMessage({
          id: "cert.info.organization",
          defaultMessage: "Organization",
        }),
        value: current?.O,
      },
      {
        label: intl.formatMessage({
          id: "cert.info.organizationUnit",
          defaultMessage: "Organizational Unit",
        }),
        value: current?.OU,
      },
      {
        label: intl.formatMessage({
          id: "cert.info.province",
          defaultMessage: "State/Province",
        }),
        value: current?.ST,
      },
      {
        label: intl.formatMessage({
          id: "cert.info.country",
          defaultMessage: "Country/Region",
        }),
        value: current?.C,
      },
      {
        label: intl.formatMessage({
          id: "cert.info.city",
          defaultMessage: "Locality",
        }),
        value: current?.L,
      },
      {
        label: intl.formatMessage({
          id: "cert.info.email",
          defaultMessage: "Email Address",
        }),
        value: current?.emailAddress,
      },
      {
        label: intl.formatMessage({
          id: "cert.info.serial",
          defaultMessage: "Serial Number",
        }),
        copyable: true,
        value: current?.serial,
      },
      {
        label: intl.formatMessage({
          id: "version",
          defaultMessage: "Version",
        }),
        value: current?.version?.split(" ")[0],
      },
    ],
    [current, intl],
  );

  return (
    <DraggableCard
      {...props}
      title={intl.formatMessage({
        id: "cert.info.issuer",
        defaultMessage: "Issuer Information",
      })}
      isList
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
}

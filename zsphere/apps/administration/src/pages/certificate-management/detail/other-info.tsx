import type { ListItem, IDraggableCardProps } from "@zstack/zsphere-components";
import { List, DraggableCard } from "@zstack/zsphere-components";
import type { CertInfo } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

interface IProps extends IDraggableCardProps {
  current?: CertInfo;
}

export default function CertificateInfo({ current, ...props }: IProps) {
  const intl = useIntl();

  const list = useMemo<ListItem[]>(
    () => [
      {
        label: intl.formatMessage({
          id: "cert.info.importTime",
          defaultMessage: "Import Time",
        }),
        value: current?.uploadTime ?? "-",
      },
    ],
    [current, intl],
  );

  return (
    <DraggableCard
      {...props}
      title={intl.formatMessage({
        id: "cert.info.other",
        defaultMessage: "Other Information",
      })}
      isList
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
}

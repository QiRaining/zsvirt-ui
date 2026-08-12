import type { ListItem } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import { DraggableCard } from "@zstack/zsphere-components";
import { DomainMode } from "@zstack/zsphere-types";
import type { VmCustomSpecification } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

export interface IProps {
  current?: VmCustomSpecification;
}

export default function ConfigInfo({ current, ...props }: IProps) {
  const intl = useIntl();

  const list = useMemo(() => {
    const result: ListItem[] = [
      {
        label: intl.formatMessage({
          id: "vm.spec.hostname.config.type",
          defaultMessage: "Specify Hostname",
        }),
        value: current?.hostname
          ? intl.formatMessage({
              id: "vm.spec.hostname.config.type.manual",
              defaultMessage: "Enter a Name",
            })
          : intl.formatMessage({
              id: "vm.spec.hostname.config.type.from.vm.name",
              defaultMessage: "Use the VM Name",
            }),
      },
      {
        label: intl.formatMessage({
          id: "vm.spec.hostname",
          defaultMessage: "Hostname",
        }),
        show: !!current?.hostname,
        value: current?.hostname,
      },
    ];
    if (current?.platform === "Windows") {
      result.push(
        {
          label: intl.formatMessage({
            id: "vm.spec.workgroup.or.domain",
            defaultMessage: "Workgroup or Domain",
          }),
          value:
            current?.domainMode &&
            (current.domainMode === DomainMode.Domain
              ? intl.formatMessage({
                  id: "vm.spec.windows.domain.server",
                  defaultMessage: "Windows Domain Server",
                })
              : intl.formatMessage({
                  id: "vm.spec.workgroup",
                  defaultMessage: "Workgroup",
                })),
        },
        {
          label:
            current?.domainMode === DomainMode.Domain
              ? intl.formatMessage({
                  id: "vm.spec.domain.name",
                  defaultMessage: "Domain",
                })
              : intl.formatMessage({
                  id: "vm.spec.workgroup.name",
                  defaultMessage: "Workgroup Name",
                }),
          value: current?.domainName,
        },
        {
          label: intl.formatMessage({
            id: "vm.spec.domain.username",
            defaultMessage: "Domain Username",
          }),
          show: current?.domainMode === DomainMode.Domain,
          value: current?.domainUsername,
        },
        {
          label: intl.formatMessage({
            id: "vm.spec.organization",
            defaultMessage: "OU",
          }),
          show: current?.domainMode === DomainMode.Domain,
          value: current?.organization,
        },
        {
          label: intl.formatMessage({
            id: "vm.spec.generate.new.sid",
            defaultMessage: "Generate New SID",
          }),
          value: current?.generateSID
            ? intl.formatMessage({ id: "open", defaultMessage: "Enabled" })
            : intl.formatMessage({ id: "close", defaultMessage: "Disabled" }),
        },
      );
    }
    return result;
  }, [current, intl]);

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "config.info",
        defaultMessage: "Configurations",
      })}
      isList
      {...props}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
}

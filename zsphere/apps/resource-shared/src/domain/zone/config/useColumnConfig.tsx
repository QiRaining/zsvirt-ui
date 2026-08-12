import { ResourceName } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/zone";
import type { IOption } from "@zstack/zsphere-engine/src/zone/useColumnConfig";
import { mergeOptions } from "@zstack/zsphere-engine/utils";
import type { LeftNavType } from "@zstack/zsphere-types";
import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import qs from "qs";
import React from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

export enum ZoneState {
  Enabled = "Enabled",
  Disabled = "Disabled",
}

export default ({ options }: { options: IOption<IZone> } = { options: [] }) => {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const searchObj = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  });
  const navView = (searchObj?.navView as string) || "notGroup";
  const leftNav = searchParams.get("leftnav") || "";
  const columnConfig: IOption<IZone> = React.useMemo(
    () =>
      mergeOptions(
        [
          {
            key: "name",
            render: (row: IZone) => {
              return (
                <ResourceName
                  value={row?.name}
                  link={{
                    to: `/zone`,
                    microAppName: "virtualization-resource",
                    uuid: row?.uuid,
                    leftnav: leftNav as LeftNavType,
                    navView,
                    keepState: false,
                  }}
                />
              );
            },
          },
          {
            key: "state",
            filterOptions: ZoneState,
          },
          {
            key: "virtualization.vm.num",
            render: (current: IZone) => current.vmInstanceCount,
          },
          {
            key: "virtualization.host.num",
            render: (current: IZone) => current.hostCount,
          },
        ],
        options,
      ),
    [intl, options],
  );

  return useColumnConfig<IZone>(columnConfig);
};

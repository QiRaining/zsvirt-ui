import { useQuery } from "@apollo/client";
import { cdromList } from "@zstack/virtualization-resource/src/gql/cdrom.gql";
import { ResourceName } from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { Illustration } from "@zstack/zsphere-illustration";
import { Op } from "@zstack/zsphere-types";
import { LeftNavType } from "@zstack/zsphere-types";
import type {
  CdRom as ICdRom,
  VmInstance as IVM,
} from "@zstack/zsphere-types/graphql";
import _ from "lodash-es";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

export const useCdRomList = (vm: IVM) => {
  const intl = useIntl();

  const { data, refetch } = useQuery(cdromList, {
    variables: {
      conditions: [{ key: "vmInstanceUuid", op: Op.eq, value: vm?.uuid }],
    },
  });

  useActionSubscribe({
    resourceTypeList: ["GuestToolsIso"],
    onProgress() {
      refetch();
    },
  });

  const list: any = useMemo(() => {
    if (!data?.cdromList?.list?.length) {
      return [];
    }

    const _list = _.sortBy(data?.cdromList?.list, "deviceId");

    return _list.map((cdRom: ICdRom, index: number) => {
      return {
        label: (
          <>
            <Illustration type="cddrive" size={16} />
            {intl.formatMessage({
              id: "virtualization.hardware.cdrom",
              defaultMessage: "CD/DVD Drive",
            })}{" "}
            {index + 1}
          </>
        ),
        value: (
          <ResourceName
            canModify
            value={
              cdRom.occupant === "GuestTools"
                ? intl.formatMessage({
                    id: "vm.cdrom.vmtools.iso.name",
                    defaultMessage: "VMTools ISO",
                  })
                : cdRom.isoName
            }
            link={{
              leftnav: LeftNavType.TemplateVm,
              uuid: cdRom.isoUuid,
              to: "/image",
              microAppName: "virtualization-resource",
            }}
          />
        ),
        children: [
          {
            label: intl.formatMessage({
              id: "deviceId",
              defaultMessage: "Serial Number",
            }),
            value: <ResourceName value={`${cdRom.deviceId}`} />,
          },
          {
            label: intl.formatMessage({
              id: "iamge.name",
              defaultMessage: "Image Name",
            }),
            value: (
              <ResourceName
                canModify
                value={
                  cdRom.occupant === "GuestTools"
                    ? intl.formatMessage({
                        id: "vm.cdrom.vmtools.iso.name",
                        defaultMessage: "VMTools ISO",
                      })
                    : cdRom.isoName
                }
                link={{
                  leftnav: LeftNavType.TemplateVm,
                  uuid: cdRom.isoUuid,
                  to: "/image",
                  microAppName: "virtualization-resource",
                }}
              />
            ),
          },
          {
            label: intl.formatMessage({
              id: "device.uuid",
              defaultMessage: "Device UUID",
            }),
            value: <CopyableText>{cdRom.uuid}</CopyableText>,
          },
        ],
      };
    });
  }, [data, intl]);

  return [list, refetch];
};

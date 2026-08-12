import { useQuery } from "@apollo/client";
import { RadioGroup } from "@zstack/design";
import { AuthCheck } from "@zstack/virtualization-resource/src/components/no-permission-page/context";
import { imageCount } from "@zstack/virtualization-resource/src/gql/image.gql";
import { ovfExportCount } from "@zstack/virtualization-resource/src/gql/vm.gql";
import ImageList from "@zstack/virtualization-resource/src/pages/image/list";
import ExportVmList from "@zstack/virtualization-resource/src/pages/vm/export-list";
import { useAuth, usePersistTabState } from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import type { IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

const MARGIN_BOTTOM_12_STYLE = { marginBottom: 12 } as const;

interface IProps {
  current?: IZone;
}

const Export: React.FC<IProps> = ({ current }) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();

  const hasVmAuth = hasAuth({
    type: "view",
    authKey: "list",
    resource: "virtualization.vm",
  });

  const { activeKey, onChange } = usePersistTabState(
    "export",
    hasVmAuth ? ["vm", "image"] : ["image"],
  );

  const ovfExportDefaultQuery = useMemo<IQuery>(() => {
    const baseQuery: IQuery = {
      conditions: [
        { key: "exportUrl", op: Op.ne, value: "null" },
        ...(current?.uuid
          ? [{ key: "__zoneUuid__", value: current.uuid, op: Op.eq }]
          : []),
      ],
    };
    return baseQuery;
  }, [current]);

  const imageDefaultQuery = useMemo<IQuery>(() => {
    const baseQuery: IQuery = {
      conditions: [
        ...(current?.uuid
          ? [{ key: "backupStorage.zone.uuid", op: Op.eq, value: current.uuid }]
          : []),
        { key: "format", op: Op.ne, value: "vmtx" },
        { key: "system", op: Op.eq, value: "false" },
        { key: "backupStorageRefs.exportUrl", op: Op.ne, value: "null" },
      ],
    };
    return baseQuery;
  }, [current]);

  const { data: ovfExportData, refetch: refetchVm } = useQuery(ovfExportCount, {
    variables: ovfExportDefaultQuery,
  });

  const { data: imageData, refetch: refetchImageCount } = useQuery(imageCount, {
    variables: imageDefaultQuery,
  });

  useActionSubscribe({
    resourceTypeList: ["VmInstance"],
    onFinish: () => {
      refetchVm?.();
    },
  });

  useActionSubscribe({
    resourceTypeList: ["Image"],
    onFinish: () => {
      refetchImageCount?.();
    },
  });

  return (
    <AuthCheck resourceTypes={["virtualization.vm", "virtualization.image"]}>
      <div className={style.container}>
        <RadioGroup
          variant="outline"
          value={activeKey}
          style={MARGIN_BOTTOM_12_STYLE}
          onValueChange={onChange}
          options={[
            ...(hasVmAuth
              ? [
                  {
                    value: "vm",
                    label: intl.formatMessage(
                      {
                        id: "virtualization.zone.detail.export.instance.tab.n",
                        defaultMessage: "Virtual Machine ({n})",
                      },
                      {
                        n: ovfExportData?.ovfExportList?.total || 0,
                      },
                    ),
                  },
                ]
              : []),
            ...(hasAuth({
              resource: "virtualization.image",
              type: "view",
              authKey: "list",
            })
              ? [
                  {
                    value: "image",
                    label: intl.formatMessage(
                      {
                        id: "virtualization.zone.detail.export.image.tab.n",
                        defaultMessage: "Image ({n})",
                      },
                      { n: imageData?.imageList?.total ?? 0 },
                    ),
                  },
                ]
              : []),
          ]}
        />

        {activeKey === "vm" && (
          <ExportVmList
            view="sub.virtualization.vm.export"
            defaultQuery={ovfExportDefaultQuery}
          />
        )}
        {activeKey === "image" && (
          <ImageList
            view="sub.virtualization.zone.detail.exported"
            defaultQuery={imageDefaultQuery}
          />
        )}
      </div>
    </AuthCheck>
  );
};

export default Export;

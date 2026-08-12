import { useLazyQuery } from "@apollo/client";
import { RadioGroup } from "@zstack/design";
import { AuthCheck } from "@zstack/virtualization-resource/src/components/no-permission-page/context";
import { imageCount } from "@zstack/virtualization-resource/src/gql/image.gql";
import { ovfExportCount } from "@zstack/virtualization-resource/src/gql/vm.gql";
import ImageList from "@zstack/virtualization-resource/src/pages/image/list";
import ExportVmList from "@zstack/virtualization-resource/src/pages/vm/export-list";
import {
  useAuth,
  usePersistTabState,
  useSetTab,
} from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import type { IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { BackupStorage as IBackupStorage } from "@zstack/zsphere-types/graphql";
import { useMount } from "ahooks";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";
import { useLocation } from "react-router";

import style from "./style.module.less";

interface IProps {
  current: IBackupStorage;
}

const radioGroupStyle: React.CSSProperties = { marginBottom: 12 };

const Export: React.FC<IProps> = ({ current }) => {
  const intl = useIntl();
  const location = useLocation();
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

  const { setTab } = useSetTab();

  useEffect(() => {
    const { state } = location;
    const tabType = (state as any)?.tabType;
    if (tabType) {
      setTab("export", tabType);
    }
  }, [location, location.state]);

  const ovfExportDefaultQuery = useMemo<IQuery>(() => {
    const baseQuery: IQuery = {
      conditions: [
        { key: "exportUrl", op: Op.ne, value: "null" },
        { key: "__zoneUuid__", value: current?.zone?.uuid, op: Op.eq },
        { key: "backupStorageUuid", value: current?.uuid, op: Op.eq },
      ],
    };
    return baseQuery;
  }, [current]);

  const imageDefaultQuery = useMemo<IQuery>(() => {
    const baseQuery: IQuery = {
      conditions: [
        {
          key: "backupStorage.zone.uuid",
          op: Op.eq,
          value: current?.zone?.uuid,
        },
        { key: "format", op: Op.ne, value: "vmtx" },
        { key: "system", op: Op.eq, value: "false" },
        { key: "backupStorageRefs.exportUrl", op: Op.ne, value: "null" },
        { key: "backupStorage.uuid", value: current?.uuid, op: Op.eq },
      ],
    };
    return baseQuery;
  }, [current]);

  const [getExportCount, { data: ovfExportData, refetch: refetchVm }] =
    useLazyQuery(ovfExportCount, {
      variables: ovfExportDefaultQuery,
    });

  const [getImageCount, { data: imageData, refetch: refetchImageCount }] =
    useLazyQuery(imageCount, {
      variables: imageDefaultQuery,
    });
  useMount(() => {
    getExportCount();
    getImageCount();
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
          style={radioGroupStyle}
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
            view="sub.virtualization.backup-storage.detail.exported"
            defaultQuery={ovfExportDefaultQuery}
          />
        )}
        {activeKey === "image" && (
          <ImageList
            view="sub.virtualization.backup-storage.detail.exported"
            defaultQuery={imageDefaultQuery}
          />
        )}
      </div>
    </AuthCheck>
  );
};

export default Export;

import { DraggableCard } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import { useHandleHttpsDownload } from "@zstack/zsphere-hooks";
import type { Image as IImage } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { downloadImageFile } from "zsv_resource_shared/image/utils";

interface IProps {
  detail: IImage;
  refetch?: any;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const ExportInfo: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed = false,
}) => {
  const intl = useIntl();

  const { handleHttpsDownload } = useHandleHttpsDownload();

  const list = useMemo(() => {
    const { backupStorageRefs } = detail;

    return [
      {
        label: intl.formatMessage({
          id: "exported.imageUrl",
          defaultMessage: "Exported Image URL",
        }),
        value: <CopyableText>{backupStorageRefs?.[0]?.exportUrl}</CopyableText>,
        show: !!backupStorageRefs?.[0]?.exportUrl,
      },
    ];
  }, [detail, intl]);

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "export.info",
        defaultMessage: "Export Information",
      })}
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
      titleActions={[
        {
          icon: "download",
          tooltip: intl.formatMessage({
            id: "download",
            defaultMessage: "Download",
          }),
          onClick: () =>
            window.location.protocol === "https:"
              ? handleHttpsDownload(detail?.backupStorageRefs?.[0]?.exportUrl)
              : downloadImageFile([detail]),
        },
      ]}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default ExportInfo;

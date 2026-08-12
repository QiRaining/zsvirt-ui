import { DetailBreadcrumb, Header, useShare } from "@zstack/zsphere-components";
import { Action, Tag } from "@zstack/zsphere-components";
import { ImageMediaType } from "@zstack/zsphere-types";
import type { Image as IImage } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import useActionConfig from "../config/useActionConfig";

const TAG_STYLE = { verticalAlign: "text-bottom" } as const;

interface IProps {
  current: IImage;
  refetch: any;
}

const DetailHeader: React.FC<IProps> = ({ current, refetch }) => {
  const intl = useIntl();
  const { name = "", mediaType } = current;
  const selectedListCurrent = useMemo(() => [current], [current]);

  const { list: menuList, viewMap } = useActionConfig();

  const { isShareResource } = useShare();

  return (
    <>
      <DetailBreadcrumb breadcrumbItems={[{ name }]} />
      <Header.Detail
        icon={
          mediaType === ImageMediaType.DataVolumeTemplate
            ? "hard-disk-image"
            : "cd"
        }
        title={
          <div className="flex items-center gap-2">
            {name}
            {isShareResource([current]) ? (
              <Tag round size="small" level="weak" style={TAG_STYLE}>
                {intl.formatMessage({
                  id: "sharedResource",
                  defaultMessage: "Share Resource",
                })}
              </Tag>
            ) : null}
          </div>
        }
        actions={
          <Action
            view="virtualization.template.image.main"
            viewMap={viewMap}
            menuList={menuList}
            position="header"
            refetch={refetch}
            source={current}
            selectedList={selectedListCurrent}
          />
        }
      />
    </>
  );
};

export default DetailHeader;

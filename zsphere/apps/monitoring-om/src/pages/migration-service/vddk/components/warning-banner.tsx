import { Button } from "@zstack/design";
import { Alert } from "@zstack/zsphere-design-biz";
import React from "react";
import { useIntl } from "react-intl";

import { VDDK_DOWNLOAD_URL } from "../constants";

interface VddkWarningBannerProps {
  onUpload?: () => void;
  uploadDisabled?: boolean;
}

const VddkWarningBanner: React.FC<VddkWarningBannerProps> = ({
  onUpload,
  uploadDisabled = false,
}) => {
  const intl = useIntl();

  return (
    <Alert variant="warning" closable className="mb-3">
      <div>
        <div
          className="flex flex-wrap items-center gap-1"
          data-testid="vddk-banner-title-row"
        >
          {intl.formatMessage({
            id: "migration.vddk.banner.description",
            defaultMessage:
              "VMware licensing requires users to obtain and upload the VDDK component. Upload it to use the migration service.",
          })}
          {!uploadDisabled && onUpload && (
            <Button
              type="button"
              variant="link"
              className="text-alert-500 hover:text-alert-600 h-min p-0"
              onClick={onUpload}
            >
              {intl.formatMessage({
                id: "migration.vddk.go.upload",
                defaultMessage: "Go to Upload",
              })}
            </Button>
          )}
        </div>
        <div className="text-xs text-neutral-600">
          {intl.formatMessage({
            id: "migration.vddk.banner.recommended",
            defaultMessage:
              "Recommended version: VMware Virtual Disk Development Kit (VDDK) 8.0.3 for Linux.",
          })}
          <a
            className="text-theme-600 ml-1"
            href={VDDK_DOWNLOAD_URL}
            target="_blank"
            rel="noreferrer"
          >
            {intl.formatMessage({
              id: "migration.vddk.download",
              defaultMessage: "Go to Download",
            })}
          </a>
        </div>
      </div>
    </Alert>
  );
};

export default VddkWarningBanner;

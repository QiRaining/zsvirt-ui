import { Button } from "@zstack/design";
import { Empty } from "@zstack/zsphere-design-biz";
import React from "react";
import { useIntl } from "react-intl";

import vddkRequiredImage from "../images/vddk-required.webp";

interface VddkRequiredProps {
  state: "missing" | "error";
  onUpload: () => void;
  onRetry: () => void;
}

const VddkRequired: React.FC<VddkRequiredProps> = ({
  state,
  onUpload,
  onRetry,
}) => {
  const intl = useIntl();

  const description =
    state === "missing"
      ? intl.formatMessage({
          id: "zmigrate.vddk.required.description",
          defaultMessage:
            "VDDK is missing or unavailable on the current platform. Upload VDDK before using the migration service.",
        })
      : intl.formatMessage({
          id: "zmigrate.vddk.status.error",
          defaultMessage: "Failed to query VDDK status. Try again.",
        });

  const actionText =
    state === "missing"
      ? intl.formatMessage({
          id: "zmigrate.vddk.go.upload",
          defaultMessage: "Go to Upload",
        })
      : intl.formatMessage({
          id: "zmigrate.exception.retry",
          defaultMessage: "Retry",
        });

  return (
    <Empty
      className="bg-neutral-0 h-full w-full py-0"
      description={description}
      image={
        state === "missing" ? (
          <img
            src={vddkRequiredImage}
            alt="VDDK"
            className="h-25 w-30 object-contain"
          />
        ) : undefined
      }
    >
      <div className="mt-1">
        <Button
          variant="link"
          onClick={state === "missing" ? onUpload : onRetry}
        >
          {actionText}
        </Button>
      </div>
    </Empty>
  );
};

export default VddkRequired;

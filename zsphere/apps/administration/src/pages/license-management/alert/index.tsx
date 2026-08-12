import { Alert } from "@zstack/design";
import { useSessionStorageState } from "ahooks";
import React, { useCallback, useEffect } from "react";

import { useLicenseEqualToClusterAlertText } from "./license-type-equal-to-cluster";

import "./style.module.less";

const noop = () => null;

interface IProps {
  currentUser: any;
}

const typeToVariant = {
  error: "danger",
  info: "info",
  warning: "warning",
  success: "positive",
} as const;

const LicenseAlert: React.FC<IProps> = ({ currentUser }) => {
  const [licenseEquelToClusterAlert, setLicenseEqualToClusterAlert] =
    useSessionStorageState<{
      hideLicenseAlert?: boolean;
    }>("licenseType-equal-to-cluster");

  const onLinkClick = useCallback(() => {
    setLicenseEqualToClusterAlert({
      hideLicenseAlert: true,
    });
  }, [setLicenseEqualToClusterAlert]);

  const { licenseAlert } = useLicenseEqualToClusterAlertText(
    setLicenseEqualToClusterAlert,
  );

  useEffect(() => {
    if (!currentUser?.sessionId) {
      setLicenseEqualToClusterAlert();
    }
  }, [currentUser?.sessionId, setLicenseEqualToClusterAlert]);

  const messageList = [
    !licenseEquelToClusterAlert?.hideLicenseAlert
      ? {
          messageContent: licenseAlert,
          isAfterClose: true,
          isClosable: true,
          type: "warning",
        }
      : null,
  ].filter((it) => it?.messageContent);

  const alerts = messageList?.map((it, index) => {
    return (
      <Alert
        key={`alert-${it?.type}-${index}`}
        closable={it?.isClosable ?? false}
        variant={
          typeToVariant[it?.type as keyof typeof typeToVariant] ?? "info"
        }
        className="globalAlert"
        onClose={it?.isAfterClose ? onLinkClick : noop}
      >
        {it?.messageContent}
      </Alert>
    );
  });

  return <>{alerts}</>;
};

export default LicenseAlert;

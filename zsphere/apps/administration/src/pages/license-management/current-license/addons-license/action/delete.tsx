import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { LicenseAddOn as ILicenseAddOn } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import type { LicenseModuleNameType } from "../../../translate";
import { translateLicenseModuleName } from "../../../translate";

const deleteLicenseAction = gql`
  mutation deleteLicense($input: DeleteLicenseInput!) {
    deleteLicense(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<ILicenseAddOn>> = ({
  visible,
  setVisible,
  refetch,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = async () => {
    if (selectedList?.length) {
      const payload = selectedList.map((item) => {
        return {
          managementNodeUuid: item.managementNodeUuid,
          module: item?.modules?.[0],
        };
      });
      doAction({
        mutation: deleteLicenseAction,
        payload,
        name: intl.formatMessage({
          id: "delete.license",
          defaultMessage: "Delete License",
        }),
        total: selectedList.length,
        onFinish: () => {
          refetch?.();
          setSelectedList?.([]);
        },
      });
    }
  };

  const resourceNames =
    selectedList?.map((it) =>
      translateLicenseModuleName(
        intl,
        it?.modules?.[0] as LicenseModuleNameType,
      ),
    ) ?? [];

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "license.modal.title.confirm.delete.license",
        defaultMessage: "Delete License?",
      })}
      visible={visible}
      setVisible={setVisible}
      bannerMessage={intl.formatMessage({
        id: "about.modal.delete.alert.danger",
        defaultMessage:
          "After a license is deleted, features authorized by the license will be unavailable. Please exercise caution.",
      })}
      resourceType={intl.formatMessage({
        id: "license",
        defaultMessage: "Licenses",
      })}
      resourceNames={resourceNames}
      onConfirm={onOk}
    />
  );
};

export default Action;

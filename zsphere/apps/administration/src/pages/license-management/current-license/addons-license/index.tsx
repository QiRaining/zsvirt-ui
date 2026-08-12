import { ProdInfo, UIExtendedLicenseType } from "@zstack/zsphere-types";
import type { LicenseAddOn } from "@zstack/zsphere-types/graphql";
import _ from "lodash-es";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import { handleAddonLicenses } from "../../helper";
import { LicenseModuleNameType } from "../../translate";
import DeleteModal from "./action/delete";
import AddonsCard from "./card";

import style from "./style.module.less";

interface IProps {
  addOnsData: any;
  licenseInfo: any;
  loading: boolean;
  refetch: any;
}

const AddonsLicense: React.FC<IProps> = ({
  addOnsData,
  licenseInfo,
  loading,
  refetch,
}) => {
  const intl = useIntl();

  const [delVisible, setDelVisible] = useState(false);
  const [delSelectedList, setDelSelectedList] = useState<LicenseAddOn[]>([]);

  const addOnsList = useMemo(() => {
    const _list = handleAddonLicenses(addOnsData, licenseInfo) ?? [];
    // 隐藏未激活的license card
    _.remove(_list, (it) => it?.disable);

    // 基础版和标准版只保留Technical Support
    const supportModules = [
      LicenseModuleNameType.Service,
      LicenseModuleNameType.Service5x8,
      LicenseModuleNameType.Service7x24,
    ];

    const restrictedModules = [
      "sriov-ui",
      "gpu-ui",
      "billing-ui",
      "cloud-formation-ui",
      "auto-scaling-ui",
      "smart-nic-ui",
      "security-element-ui",
    ];

    if (_.includes([], licenseInfo.licenseType)) {
      _.remove(
        _list,
        (it) => !_.includes(supportModules, _.get(it, ["modules", "0"])),
      );
    }

    if (licenseInfo?.licenseType === UIExtendedLicenseType.Paid) {
      if ([ProdInfo.Basic, ProdInfo.Standard].includes(licenseInfo?.prodInfo)) {
        return _list;
      }
      return _list.filter((t) => !restrictedModules.includes(t.modules[0]));
    }

    return _list;
  }, [addOnsData, licenseInfo]);

  const renderModuleCard = () => {
    // 根据余数计算需要填充的空位数量
    const emptyCount = (3 - (addOnsList.length % 3)) % 3;
    const paddedList = [...addOnsList, ...Array(emptyCount).fill({})];

    return paddedList
      ?.filter((t) => t)
      .map((it, index) => (
        <AddonsCard
          props={it}
          loading={loading}
          deleteCallback={(selectedList: any) =>
            handleDeleteModel(selectedList)
          }
          key={it?.uuid ?? `empty-${index}`}
        />
      ));
  };

  const handleDeleteModel = (selectedList: any) => {
    setDelVisible(true);
    setDelSelectedList(selectedList);
  };

  return (
    <>
      {addOnsList.length > 0 && (
        <div className={style["dividing-title"]}>
          {`${intl.formatMessage({ id: "moduleLicense", defaultMessage: "Plus License" })} (${
            addOnsList.length
          })`}
        </div>
      )}
      <div className={style["card-container"]}>
        <div className={style["card-content"]}>{renderModuleCard()}</div>
      </div>

      <DeleteModal
        visible={delVisible}
        setVisible={setDelVisible}
        selectedList={delSelectedList}
        setSelectedList={setDelSelectedList}
        refetch={refetch}
        position="header"
        view=""
      />
    </>
  );
};

export default AddonsLicense;

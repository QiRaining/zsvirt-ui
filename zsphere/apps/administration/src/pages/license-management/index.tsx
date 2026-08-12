import { useQuery } from "@apollo/client";
import { Spin } from "@zstack/design";
import { Header, TabPane, Tabs } from "@zstack/zsphere-components";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { LicenseQuotaType } from "@zstack/zsphere-types";
import type { LicenseAddition } from "@zstack/zsphere-types/graphql";
import cls from "classnames";
import React, { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";

import {
  getAboutLicenseAddOns,
  getAboutLicenseExtensionInfo,
  getAboutLicenseInfo,
  getUSBKeyStatus,
} from "../../gql/lincense-management.gql";
import CurrentLicense from "./current-license";

import style from "./style.module.less";

const License: React.FC = () => {
  const intl = useIntl();
  const themeConfig = usePlatformStore((state) => state.themeConfig);
  const isOem = themeConfig?.oem ?? false;

  const {
    data: licenseData,
    refetch: licenseRefetch,
    loading: licenseLoading,
  } = useQuery(getAboutLicenseInfo, {
    fetchPolicy: "no-cache",
  });

  const primaryLicenseInfo = licenseData?.getAboutLicenseInfo;
  const hasPrimaryLicenseInfo = Boolean(
    primaryLicenseInfo?.licenseType ||
    primaryLicenseInfo?.prodInfo ||
    primaryLicenseInfo?.versionOnUI ||
    primaryLicenseInfo?.issuedDate,
  );

  const { data: licenseExtensionData, refetch: licenseExtensionRefetch } =
    useQuery(getAboutLicenseExtensionInfo, {
      fetchPolicy: "no-cache",
      skip: !hasPrimaryLicenseInfo,
    });

  const licenseInfo = useMemo(
    () => ({
      ...primaryLicenseInfo,
      ...licenseExtensionData?.getAboutLicenseExtensionInfo,
    }),
    [primaryLicenseInfo, licenseExtensionData?.getAboutLicenseExtensionInfo],
  );
  const mergedLicenseData = useMemo(
    () => ({ getAboutLicenseInfo: licenseInfo }),
    [licenseInfo],
  );
  const isZMigrate =
    licenseInfo?.additions?.some(
      (item: LicenseAddition) => item?.type === "zmigrate",
    ) ?? false;
  const {
    data: licenseAddOnsData,
    loading: addOnsLoading,
    refetch: addOnsRefetch,
  } = useQuery(getAboutLicenseAddOns, {
    fetchPolicy: "no-cache",
  });
  const rawAddOnsData = useMemo(
    () => licenseAddOnsData?.getLicenseAddOns ?? [],
    [licenseAddOnsData?.getLicenseAddOns],
  );

  //Ukey查询
  const { data: usbKeyData, refetch: uKeyRefetch } = useQuery(getUSBKeyStatus, {
    fetchPolicy: "no-cache",
  });

  const usbData = useMemo(
    () => usbKeyData?.getUSBKeyStatus || [],
    [usbKeyData?.getUSBKeyStatus],
  );

  const addOnsData = useMemo(() => {
    const zmigrateAdditions = licenseInfo?.additions?.filter(
      (addition: LicenseAddition) => addition?.type === "zmigrate",
    );

    const baseAddOns = rawAddOnsData;

    if (!zmigrateAdditions?.length) {
      return baseAddOns;
    }

    const generatedAddOns: any[] = [];

    // 解析 zmigrate additions，构造许可证卡片数据
    // 设计规则：
    //   - 授权数量：合并多条金钥数量，容量授权(type=7)不外面展示
    //   - 签发/到期时间：
    //     · 单个授权时，展示该授权的时间
    //     · 多个授权时，展示当前服务中、到期时间最近的授权数据
    //     · 当前授权过期后，自动展示下一个授权的时间
    //   - 许可状态也根据上述逻辑展示
    if (zmigrateAdditions?.length) {
      const zmigrateInfo = zmigrateAdditions[0]?.info;
      if (zmigrateInfo) {
        try {
          const parsed = JSON.parse(zmigrateInfo);
          const allLicenses = parsed?.licenses ?? [];

          // 没有有效的 license 数据则不展示卡片
          if (allLicenses.length > 0) {
            // 排除容量授权(type=7)，仅用于 count/consumed 聚合和时间展示
            const nonCapacityLicenses = allLicenses.filter(
              (lic: any) => lic.type !== 7,
            );

            // 只有容量授权时不展示卡片
            if (nonCapacityLicenses.length > 0) {
              const nowTs = Date.now();

              // 聚合非容量授权的 count 和 consumed，排除已过期的授权
              let totalCount = 0;
              let totalConsumed = 0;
              for (const lic of nonCapacityLicenses) {
                // 跳过已过期的授权，其额度不应计入总数
                const expiredTs = new Date(lic?.expired_date ?? 0).getTime();
                if (expiredTs > 0 && expiredTs <= nowTs) {
                  continue;
                }

                totalCount += lic?.count ?? 0;
                totalConsumed += lic?.consumed ?? 0;
              }

              // 按到期时间升序排列
              const getExpiredTs = (lic: any) =>
                new Date(lic?.expired_date ?? 0).getTime();
              const isLicExpired = (lic: any) =>
                !(lic?.is_valid || lic?.is_active) ||
                getExpiredTs(lic) <= nowTs;

              const sortedLicenses = [...nonCapacityLicenses].sort(
                (a: any, b: any) => getExpiredTs(a) - getExpiredTs(b),
              );

              // 展示逻辑：第一条过期了顺延下一条，找到第一条未过期的展示
              // 全部过期时取最后过期的那条
              const displayLicense =
                sortedLicenses.find((lic: any) => !isLicExpired(lic)) ??
                sortedLicenses[sortedLicenses.length - 1];

              // 状态判断：全部过期才算过期
              const allExpired = sortedLicenses.every((lic: any) =>
                isLicExpired(lic),
              );

              generatedAddOns.push({
                modules: ["zmigrate"],
                licenseType: "AddOn",
                expired: allExpired,
                issuedDate: displayLicense?.activated ?? "",
                expiredDate: displayLicense?.expired_date ?? "",
                usage: {
                  available: Math.max(totalCount - totalConsumed, 0),
                  quota: totalCount,
                  used: totalConsumed,
                  quotaType: LicenseQuotaType.VM,
                },
              });
            }
          }
        } catch {
          // info 解析失败时不影响其他卡片
        }
      }
    }

    return baseAddOns?.concat(generatedAddOns) ?? generatedAddOns;
  }, [licenseInfo, rawAddOnsData]);

  const _refetch = useCallback(() => {
    licenseRefetch();
    if (hasPrimaryLicenseInfo) {
      licenseExtensionRefetch();
    }
    addOnsRefetch();
    uKeyRefetch();
  }, [
    addOnsRefetch,
    hasPrimaryLicenseInfo,
    licenseExtensionRefetch,
    licenseRefetch,
    uKeyRefetch,
  ]);
  if (licenseLoading && !hasPrimaryLicenseInfo) {
    return <Spin />;
  }

  return (
    <div className={cls("main-list-header-tabs-container", style.license)}>
      <Header.List
        className="main-list-header-tabs"
        title={intl.formatMessage({ id: "license", defaultMessage: "Licenses" })}
      />
      <Tabs className={style.tabs}>
        <TabPane
          className={style.currentLicenseTab}
          key="current"
          tab={intl.formatMessage({
            id: "current.license",
            defaultMessage: "Current Licenses",
          })}
          auth={{
            type: "block",
            authKey: "current.license",
            resource: "license",
            children: null,
          }}
        >
          <CurrentLicense
            licenseData={mergedLicenseData}
            usbData={usbData}
            isZMigrate={isZMigrate}
            isOem={isOem}
            themeConfig={themeConfig}
            addOnsData={addOnsData}
            licenseInfo={licenseInfo}
            refetch={_refetch}
            addOnsLoading={addOnsLoading}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default License;

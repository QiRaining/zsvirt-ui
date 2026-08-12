import { Header } from "@zstack/zsphere-components";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { bus, ZMIGRATE_RUNTIME_REFRESH_EVENT } from "@zstack/zsphere-utils";
import React, { useEffect, useRef } from "react";
import { useIntl } from "react-intl";

import {
  shouldEmitZMigrateRuntimeRefresh,
  syncCurrentZMigrateWithPackage,
} from "./current-zmigrate-sync";
import { useMigrationPackageStatus } from "./hooks";
import Init from "./init";
import Overview from "./overview";

const MigrationManagement: React.FC = () => {
  const intl = useIntl();
  const packageStatus = useMigrationPackageStatus();
  const { isServiceInstalled, initialLoading, packageData } = packageStatus;

  const setCurrentZMigrate = usePlatformStore((s) => s.setCurrentZMigrate);
  const packageRuntimeSignatureRef = useRef<string>();

  // 安装包变化时，同步更新 platformStore 的安装状态和镜像字段。
  // CleanSoftwarePackage 后 getMigrationServicePackage 会返回 null，
  // 此时必须清掉旧镜像 uuid，避免重新安装后 currentZMigrate 继续使用旧数据。
  //
  // ⚠️ 守卫链：
  // 1. initialLoading=true 时跳过：API 还没回来
  // 2. prev 没有核心数据时跳过：useGetZMigrate 还没把 GraphQL 数据写入 store，
  //    此时 prev 可能是 {}（micro-app 自身的 store 实例尚未 hydrate）。
  //    若直接写入安装包字段，会把 currentZMigrate 覆盖为只剩
  //    { installed } 一个字段，导致 core-shell 那侧的
  //    useMasterZMigrateConfig 永远拿不到 gatewayHostIp 等字段。
  // 3. helper 内部会在无变化时返回原对象，避免无意义的 set 触发 persist 写盘。
  useEffect(() => {
    if (initialLoading) {
      return;
    }

    const packageRuntimeSignature = [
      packageData?.status ?? "",
      packageData?.gatewayImageUuid ?? "",
      packageData?.linuxBootImageUuid ?? "",
      packageData?.windowsBootImageUuid ?? "",
    ].join("|");

    setCurrentZMigrate((prev) => {
      return syncCurrentZMigrateWithPackage({
        previous: prev,
        packageData,
        isServiceInstalled,
      });
    });

    const previousPackageRuntimeSignature = packageRuntimeSignatureRef.current;
    packageRuntimeSignatureRef.current = packageRuntimeSignature;

    if (
      shouldEmitZMigrateRuntimeRefresh({
        previousSignature: previousPackageRuntimeSignature,
        nextSignature: packageRuntimeSignature,
      })
    ) {
      bus.emit(
        ZMIGRATE_RUNTIME_REFRESH_EVENT,
        "migration-service-package-change",
      );
    }
  }, [isServiceInstalled, initialLoading, packageData, setCurrentZMigrate]);

  return (
    <div className="main-list-header-tabs-container main-list-header-tabs-detail">
      <Header.List
        title={intl.formatMessage({
          id: "virtualization.migration.service",
          defaultMessage: "Migration Service",
        })}
      />
      {initialLoading ? null : isServiceInstalled ? (
        <Overview />
      ) : (
        <Init packageStatus={packageStatus} />
      )}
    </div>
  );
};

export default MigrationManagement;

import { gql, useQuery } from "@apollo/client";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { useEffect } from "react";

const getCustomizedLicenseNameInfo = gql`
  query getCustomizedLicenseNameInfo {
    getCustomizedLicenseNameInfo
  }
`;

export const useGetCustomizedLicenseNameInfo = () => {
  const { data: customizedLicenseNameInfoData } = useQuery(
    getCustomizedLicenseNameInfo,
  );

  // 分开订阅，避免订阅整个 store
  const setCustomizedLicenseNameInfo = usePlatformStore(
    (state) => state.setCustomizedLicenseNameInfo,
  );
  useEffect(() => {
    try {
      const info = customizedLicenseNameInfoData?.getCustomizedLicenseNameInfo;
      if (!info) {
        return;
      }

      const parsed = JSON.parse(info);
      if (parsed && typeof parsed === "object") {
        setCustomizedLicenseNameInfo(parsed);
      }
    } catch {
      // 解析失败时保持之前的配置，不抛出错误
    }
  }, [customizedLicenseNameInfoData, setCustomizedLicenseNameInfo]);
};

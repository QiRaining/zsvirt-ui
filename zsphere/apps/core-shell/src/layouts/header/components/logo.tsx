import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { useUpdateEffect } from "ahooks";
import cls from "classnames";
import React, { useCallback, useState, memo, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router";

import {
  getCacheBustedAssetUrl,
  ZSVIRT_DEFAULT_BRANDING,
} from "../../../utils/zsvirt-brand";

import style from "../style.module.less";

const Logo: React.FC = () => {
  // 分开订阅，避免订阅整个 store
  const themeConfig = usePlatformStore((state) => state.themeConfig);
  const location = useLocation();
  // 减少无意义请求
  const [timeStamp, setTimeStamp] = useState<number>(Date.now());
  const [logoSrc, setLogoSrc] = useState<string>("");
  const [hasTriedWebp, setHasTriedWebp] = useState<boolean>(false);
  const isZSvirtBrand =
    themeConfig?.bannerLogo === ZSVIRT_DEFAULT_BRANDING.bannerLogo;

  useUpdateEffect(() => {
    setTimeStamp(Date.now());
    setHasTriedWebp(false);
  }, [themeConfig]);

  const logoUrl = useMemo(() => {
    if (!themeConfig?.bannerLogo) {
      return "";
    }
    const baseUrl = themeConfig.bannerLogo;
    // 如果已经尝试过 webp，使用 webp 版本
    if (
      hasTriedWebp &&
      baseUrl.includes("/public/theme/default/") &&
      baseUrl.endsWith(".svg")
    ) {
      const webpUrl = baseUrl.replace(/\.svg$/, ".webp");
      return getCacheBustedAssetUrl(webpUrl, timeStamp);
    }
    return getCacheBustedAssetUrl(baseUrl, timeStamp);
  }, [themeConfig?.bannerLogo, timeStamp, hasTriedWebp]);

  useEffect(() => {
    setLogoSrc(logoUrl);
  }, [logoUrl]);

  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      const target = e.target as HTMLImageElement;
      const currentSrc = target.src;

      // 如果加载失败且是 .svg 文件，尝试 .webp
      if (!hasTriedWebp && currentSrc.includes(".svg")) {
        const webpUrl = currentSrc.replace(/\.svg/, ".webp");
        setHasTriedWebp(true);
        setLogoSrc(webpUrl);
      }
    },
    [hasTriedWebp],
  );

  const LogoContent = useMemo(
    () => (
      <div className={style.left}>
        <div
          className={cls(style.imageBox, {
            [style.zsvirtImageBox]: isZSvirtBrand,
          })}
        >
          <img
            className={cls(style.logo, {
              [style.zsvirtLogo]: isZSvirtBrand,
            })}
            alt={isZSvirtBrand ? "ZSvirt" : "logo"}
            src={logoSrc || logoUrl}
            onError={handleImageError}
          />
        </div>
        {themeConfig?.bannerTitle && (
          <span style={{ fontSize: themeConfig.bannerFontSize }}>
            {themeConfig.bannerTitle}
          </span>
        )}
      </div>
    ),
    [themeConfig, logoUrl, logoSrc, isZSvirtBrand, handleImageError],
  );

  // 如果当前已经在目标页面,不需要链接
  if (location.pathname === "/virtualization-dashboard") {
    return LogoContent;
  }

  return <Link to="/virtualization-dashboard">{LogoContent}</Link>;
};

export default memo(Logo);

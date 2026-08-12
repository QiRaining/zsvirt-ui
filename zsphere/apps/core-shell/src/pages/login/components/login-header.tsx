import { useUpdateEffect } from "ahooks";
import React, { useState, useEffect, useMemo } from "react";

import ToggleLanguage from "../../../layouts/header/user/components/toggle-language";
import { getCacheBustedAssetUrl } from "../../../utils/zsvirt-brand";

import style from "../style.module.less";

interface LoginHeaderProps {
  loginLogo?: string;
}

const LoginHeader: React.FC<LoginHeaderProps> = ({ loginLogo }) => {
  const [timeStamp, setTimeStamp] = useState<number>(Date.now());
  const [logoSrc, setLogoSrc] = useState<string>("");
  const [hasTriedWebp, setHasTriedWebp] = useState<boolean>(false);

  useUpdateEffect(() => {
    setTimeStamp(Date.now());
    setHasTriedWebp(false);
  }, [loginLogo]);

  const logoUrl = useMemo(() => {
    if (!loginLogo) {
      return "";
    }
    const baseUrl = loginLogo;
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
  }, [loginLogo, timeStamp, hasTriedWebp]);

  useEffect(() => {
    setLogoSrc(logoUrl);
  }, [logoUrl]);

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    const target = e.target as HTMLImageElement;
    const currentSrc = target.src;

    // 如果加载失败且是 .svg 文件，尝试 .webp
    if (!hasTriedWebp && currentSrc.includes(".svg")) {
      const webpUrl = currentSrc.replace(/\.svg/, ".webp");
      setHasTriedWebp(true);
      setLogoSrc(webpUrl);
    }
  };

  return (
    <>
      <div className={style.logoContainer}>
        <img
          src={logoSrc || logoUrl}
          alt="Logo"
          className={style.logo}
          onError={handleImageError}
        />
      </div>
      <ToggleLanguage type="simple" className={style.header} />
    </>
  );
};

export default LoginHeader;

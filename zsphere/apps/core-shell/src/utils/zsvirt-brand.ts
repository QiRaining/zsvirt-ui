import type { ThemeConfig } from "@zstack/zsphere-platform-store";

// These built-in brand assets must stay inline. The dev server proxies `/static`
// to ui-server, so emitted image URLs would be fetched from the remote backend
// and render as broken images before the assets are packaged there.
import zsvirtBannerLogo from "../assets/images/zsvirt-logo-horizontal-monochrome.svg?inline";
import zsvirtFavicon from "../assets/images/zsvirt-logo-symbol-standard.svg?inline";
import zsvirtLoginLogo from "../assets/images/zsvirt-logo-vertical-standard.svg?inline";

export const ZSVIRT_PRODUCT_NAME = "ZSvirt";

export const ZSVIRT_DEFAULT_BRANDING = {
  browserTitle: ZSVIRT_PRODUCT_NAME,
  favicon: zsvirtFavicon,
  loginLogo: zsvirtLoginLogo,
  loginTitle: ZSVIRT_PRODUCT_NAME,
  bannerLogo: zsvirtBannerLogo,
  bannerTitle: "",
} satisfies ThemeConfig;

export const getCacheBustedAssetUrl = (
  assetUrl: string,
  cacheBuster = Date.now(),
) => {
  if (assetUrl.startsWith("data:")) {
    return assetUrl;
  }

  return `${assetUrl}${assetUrl.includes("?") ? "&" : "?"}current=${cacheBuster}`;
};

export const getFaviconLinkAttributes = (
  favicon: string,
  cacheBuster = Date.now(),
) => {
  const isSvg =
    favicon.startsWith("data:image/svg+xml") || /\.svg(?:$|[?#])/.test(favicon);

  return {
    href: getCacheBustedAssetUrl(favicon, cacheBuster),
    type: isSvg ? "image/svg+xml" : "image/x-icon",
  };
};

export const applyZSvirtDefaultBranding = (
  themeConfig: ThemeConfig,
): ThemeConfig => {
  if (themeConfig.oem) {
    return themeConfig;
  }

  return {
    ...themeConfig,
    ...ZSVIRT_DEFAULT_BRANDING,
  };
};

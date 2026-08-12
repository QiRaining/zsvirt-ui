declare const __ZSV_ENGLISH_ONLY__: boolean | undefined;

export const ZSV_ENGLISH_LOCALE = "en-US";
export const ZSV_DEFAULT_LOCALE = "zh-CN";

export const ZSV_ENGLISH_ONLY =
  typeof __ZSV_ENGLISH_ONLY__ === "boolean" ? __ZSV_ENGLISH_ONLY__ : false;

export const isZsvEnglishOnlyMode = () => {
  return typeof __ZSV_ENGLISH_ONLY__ === "boolean"
    ? __ZSV_ENGLISH_ONLY__
    : false;
};

export const getZsvEffectiveLocale = (locale: string = ZSV_DEFAULT_LOCALE) => {
  return isZsvEnglishOnlyMode() ? ZSV_ENGLISH_LOCALE : locale;
};

export const shouldRenderLanguageSwitcher = () => {
  return !isZsvEnglishOnlyMode();
};

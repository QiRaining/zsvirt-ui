import { Divider, Dropdown, type DropdownItem } from "@zstack/design";
import { Icon } from "@zstack/icon";
// import { createIntl } from 'react-intl'
import {
  usePlatformStore,
  platformStore,
} from "@zstack/zsphere-platform-store";
import { getLocaleFromStorage } from "@zstack/zsphere-utils";
import { usePersistFn } from "ahooks";
import classNames from "classnames";
import React, { useCallback, useEffect, useState } from "react";
import { useIntl } from "react-intl";

import { applyDefaultTheme } from "../../../../utils/default-theme";
import {
  getZsvEffectiveLocale,
  shouldRenderLanguageSwitcher,
  ZSV_DEFAULT_LOCALE,
  ZSV_ENGLISH_LOCALE,
  ZSV_ENGLISH_ONLY,
} from "../../../../utils/locale-mode";

import styles from "../../style.module.less";

const langConfigMap = ZSV_ENGLISH_ONLY
  ? {
      [ZSV_ENGLISH_LOCALE]: "English",
    }
  : {
      [ZSV_DEFAULT_LOCALE]: "简体中文",
      [ZSV_ENGLISH_LOCALE]: "English",
    };

const langToggleMap = ZSV_ENGLISH_ONLY
  ? {
      [ZSV_ENGLISH_LOCALE]: { next: ZSV_ENGLISH_LOCALE, text: "English" },
    }
  : {
      [ZSV_DEFAULT_LOCALE]: { next: ZSV_ENGLISH_LOCALE, text: "English" },
      [ZSV_ENGLISH_LOCALE]: { next: ZSV_DEFAULT_LOCALE, text: "简体中文" },
    };

const ToggleLanguage: React.FC<{
  type?: "normal" | "dropdown" | "simple";
  className?: string;
}> = ({ type = "normal", className }) => {
  const intl = useIntl();
  const setThemeConfig = usePlatformStore((state) => state.setThemeConfig);
  const [language, setLanguage] = useState(
    getZsvEffectiveLocale(intl.locale) as keyof typeof langConfigMap,
  );

  const setPlatformLocale = usePersistFn((locale: string) => {
    platformStore.setState({ locale });
  });

  useEffect(() => {
    if (ZSV_ENGLISH_ONLY) {
      setLanguage(ZSV_ENGLISH_LOCALE as keyof typeof langConfigMap);
      window.localStorage.setItem("umi_locale", ZSV_ENGLISH_LOCALE);
      setPlatformLocale(ZSV_ENGLISH_LOCALE);
      return;
    }

    // 获取浏览器语言
    const browserLang = navigator.language;
    // 从localStorage获取已保存的语言设置
    const savedLocale = getLocaleFromStorage();

    // http/https 切换
    const localeParam = new URLSearchParams(window.location.search).get("lang");

    // 如果没有保存的语言设置，则使用浏览器语言
    let locale = localeParam || savedLocale;
    if (!locale) {
      // 将浏览器语言映射到支持的语言
      locale = browserLang.startsWith("zh")
        ? ZSV_DEFAULT_LOCALE
        : ZSV_ENGLISH_LOCALE;
    }

    if (locale !== intl.locale) {
      setLanguage(locale as "zh-CN" | "en-US");
      window.localStorage.setItem("umi_locale", locale);
      setPlatformLocale(locale);
    }
  }, [intl.locale, setPlatformLocale, type]);

  const changeLocale = useCallback(
    (locale: string) => {
      setLanguage(locale as keyof typeof langConfigMap);
      window.localStorage.setItem("umi_locale", locale as string);
      setPlatformLocale(locale);
      applyDefaultTheme(
        getZsvEffectiveLocale(locale || ZSV_DEFAULT_LOCALE),
      ).then(setThemeConfig);

      window.localStorage.setItem("LOCALE", locale.substr(0, 2) as string);

      if (window.location.href.includes("/zmigrate")) {
        window.location.reload();
      }
    },
    [setPlatformLocale, setThemeConfig],
  );

  const handleChangeLocale = useCallback(
    (key: string) => {
      changeLocale(key);
    },
    [changeLocale],
  );

  if (!shouldRenderLanguageSwitcher()) {
    return null;
  }

  if (type === "simple") {
    // 只显示一个切换按钮
    const { next: nextLang, text: buttonText } = langToggleMap[language];

    return (
      <button
        type="button"
        className={classNames(styles.toggleLanguageBtn, className)}
        onClick={() => handleChangeLocale(nextLang)}
      >
        <Icon
          className={styles.translationIcon}
          style={{ marginRight: 6 }}
          type="system-translation"
        />

        <span>{buttonText}</span>
      </button>
    );
  }
  if (type === "normal") {
    return (
      <div className={classNames(styles.toggleLanguage, className)}>
        <div className="flex items-center gap-2">
          <div style={{ display: "flex", alignItems: "center" }}>
            <Icon
              className={styles.translationIcon}
              type="system-translation"
            />
            {intl.formatMessage({
              id: "toggle.language",
              defaultMessage: "Switch Language",
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {Object.entries(langConfigMap).map(([key, value], index) => (
            <React.Fragment key={key}>
              {index > 0 && <Divider type="vertical" />}
              <button
                type="button"
                className={classNames(styles.languageItem, {
                  [styles.active]: language === key,
                })}
                onClick={() => handleChangeLocale(key)}
              >
                {value}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  const langMenuItems = Object.entries(langConfigMap).map(([key, value]) => ({
    key,
    label: (
      <div className={styles.menuItem}>
        <span>{value}</span>
        {language === key ? (
          <Icon type="checkmark" color="info" colorNumber={600} />
        ) : null}
      </div>
    ),
  }));

  const handleMenuSelect = (item: DropdownItem) => {
    handleChangeLocale(String(item.key));
  };

  return (
    <Dropdown items={langMenuItems} onSelect={handleMenuSelect}>
      <div className={classNames(styles.dropdownToggleLanguage, className)}>
        <Icon type="globe-2" />
        <span className={styles.text}>{langConfigMap?.[language]}</span>
        <Icon type="arrow-ios-down" />
      </div>
    </Dropdown>
  );
};

export default ToggleLanguage;

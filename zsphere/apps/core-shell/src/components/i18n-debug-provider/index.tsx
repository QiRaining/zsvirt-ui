import { usePlatformStore } from "@zstack/zsphere-platform-store";
import React, { useMemo, useEffect } from "react";
import type { MessageFormatElement } from "react-intl";
import { IntlProvider } from "react-intl";

interface I18nDebugProviderProps {
  locale: string;
  messages: Record<string, string> | Record<string, MessageFormatElement[]>;
  children: React.ReactNode;
}

// 扩展 Window 接口，定义调试方法类型
declare global {
  interface Window {
    __toggleI18nDebug?: () => boolean;
    __enableI18nDebug?: () => boolean;
    __disableI18nDebug?: () => boolean;
    __i18nDebugStatus?: () => boolean;
    __searchI18nKey?: (
      keyword: string,
    ) => Array<{ key: string; value: string }>;
  }
}

/**
 * I18n 调试模式 Provider
 *
 * 当开启调试模式时，所有翻译文本会显示为 [key] 的格式，
 * 方便文档同学查看和配置翻译 key。
 *
 * 使用方法：
 * 1. 在浏览器控制台输入: window.__toggleI18nDebug() 开启/关闭调试模式
 * 2. 或者输入: window.__enableI18nDebug() 开启调试模式
 * 3. 或者输入: window.__disableI18nDebug() 关闭调试模式
 * 4. 查看当前状态: window.__i18nDebugStatus()
 */
const I18nDebugProvider: React.FC<I18nDebugProviderProps> = ({
  locale,
  messages,
  children,
}) => {
  const i18nDebugMode = usePlatformStore((state) => state.i18nDebugMode);
  const setI18nDebugMode = usePlatformStore((state) => state.setI18nDebugMode);

  // 在调试模式下，将所有 message 值替换为 key
  const debugMessages = useMemo(() => {
    if (!i18nDebugMode) {
      return messages;
    }

    const result: Record<string, string> = {};
    for (const key of Object.keys(messages)) {
      // 在调试模式下，显示 [key] 格式，方便识别
      result[key] = `[${key}]`;
    }
    return result;
  }, [messages, i18nDebugMode]);

  // 注册全局调试方法
  useEffect(() => {
    // 切换调试模式
    window.__toggleI18nDebug = () => {
      const newValue = !usePlatformStore.getState().i18nDebugMode;
      setI18nDebugMode(newValue);
      console.log(
        `%c🌐 i18n Debug Mode: ${newValue ? "ON" : "OFF"}`,
        `color: ${newValue ? "#22c55e" : "#ef4444"}; font-weight: bold; font-size: 14px;`,
      );
      if (newValue) {
        console.log(
          "%c提示: 所有翻译文本现在显示为 [key] 格式",
          "color: #3b82f6;",
        );
      }
      return newValue;
    };

    // 开启调试模式
    window.__enableI18nDebug = () => {
      setI18nDebugMode(true);
      console.log(
        "%c🌐 i18n Debug Mode: ON",
        "color: #22c55e; font-weight: bold; font-size: 14px;",
      );
      console.log(
        "%c提示: 所有翻译文本现在显示为 [key] 格式",
        "color: #3b82f6;",
      );
      return true;
    };

    // 关闭调试模式
    window.__disableI18nDebug = () => {
      setI18nDebugMode(false);
      console.log(
        "%c🌐 i18n Debug Mode: OFF",
        "color: #ef4444; font-weight: bold; font-size: 14px;",
      );
      return false;
    };

    // 查看当前状态
    window.__i18nDebugStatus = () => {
      const status = usePlatformStore.getState().i18nDebugMode;
      console.log(
        `%c🌐 i18n Debug Mode: ${status ? "ON" : "OFF"}`,
        `color: ${status ? "#22c55e" : "#ef4444"}; font-weight: bold; font-size: 14px;`,
      );
      return status;
    };

    // 搜索 key（可选功能）
    window.__searchI18nKey = (keyword: string) => {
      const allMessages = messages as Record<string, string>;
      const results: Array<{ key: string; value: string }> = [];

      for (const [key, value] of Object.entries(allMessages)) {
        if (
          key.toLowerCase().includes(keyword.toLowerCase()) ||
          (typeof value === "string" &&
            value.toLowerCase().includes(keyword.toLowerCase()))
        ) {
          results.push({ key, value: String(value) });
        }
      }

      if (results.length === 0) {
        console.log(`%c未找到包含 "${keyword}" 的 key`, "color: #f59e0b;");
      } else {
        console.log(
          `%c找到 ${results.length} 个匹配的 key:`,
          "color: #22c55e; font-weight: bold;",
        );
        console.table(results);
      }

      return results;
    };

    // 打印帮助信息
    if (process.env.NODE_ENV === "development") {
      console.log(
        "%c🌐 i18n Debug 工具已加载",
        "color: #8b5cf6; font-weight: bold;",
      );
      console.log("%c可用命令:", "color: #6b7280;");
      console.log("  window.__toggleI18nDebug()  - 切换调试模式");
      console.log("  window.__enableI18nDebug()  - 开启调试模式");
      console.log("  window.__disableI18nDebug() - 关闭调试模式");
      console.log("  window.__i18nDebugStatus()  - 查看当前状态");
      console.log('  window.__searchI18nKey("keyword") - 搜索包含关键词的 key');
    }

    return () => {
      delete window.__toggleI18nDebug;
      delete window.__enableI18nDebug;
      delete window.__disableI18nDebug;
      delete window.__i18nDebugStatus;
      delete window.__searchI18nKey;
    };
  }, [setI18nDebugMode, messages]);

  return (
    <IntlProvider locale={locale} messages={debugMessages}>
      {children}
    </IntlProvider>
  );
};

export default I18nDebugProvider;

import FingerprintJS from "@fingerprintjs/fingerprintjs";
import MD5 from "crypto-js/md5";
import { useEffect } from "react";

const getFp = async () => {
  const fp = await FingerprintJS.load({ monitoring: false });
  const { components } = await fp.get();
  // 移除官方注释中写明有不稳定情况的组件与我们测试中出现不稳定情况的组件
  const customComponents = {
    fonts: components.fonts,
    domBlockers: components.domBlockers,
    audio: components.audio,
    screenFrame: components.screenFrame,
    canvas: components.canvas,
    osCpu: components.osCpu,
    languages: components.languages,
    colorDepth: components.colorDepth,
    deviceMemory: components.deviceMemory,
    screenResolution: components.screenResolution,
    hardwareConcurrency: components.hardwareConcurrency,
    timezone: components.timezone,
    cpuClass: components.cpuClass,
    sessionStorage: components.sessionStorage,
    localStorage: components.localStorage,
    indexedDB: components.indexedDB,
    openDatabase: components.openDatabase,
    platform: components.platform,
    vendor: components.vendor,
    vendorFlavors: components.vendorFlavors,
    cookiesEnabled: components.cookiesEnabled,
    colorGamut: components.colorGamut,
    invertedColors: components.invertedColors,
    forcedColors: components.forcedColors,
    hdr: components.hdr,
    architecture: components.architecture,
  };
  return FingerprintJS.hashComponents(customComponents);
};

// 更稳一点可以把这个方法放到后台去，防止前端代码被逆向出来哈希函数
const genHash = async (sessionId: string, fp: string) => {
  return MD5(`${sessionId}${fp}`).toString();
};

export const useCheckFingerprint = (
  history: any,
  localKey: string,
  version: string,
  product: string,
) => {
  useEffect(() => {
    const check = async () => {
      try {
        const fp = await getFp();
        if (localStorage.getItem(localKey)) {
          const newHash = await genHash(localStorage.getItem("sessionId")!, fp);
          const oldHash = localStorage.getItem(localKey);
          if (oldHash !== newHash) {
            history.push("/login");
          }
        } else {
          const hash = await genHash(localStorage.getItem("sessionId")!, fp);
          localStorage.setItem(localKey, hash);
        }
      } catch (e) {
        // do nothing
      }
    };
    check();
  }, []);
};

import { UIExtendedLicenseType } from "@zstack/zsphere-types";
import {
  cloneDeep as _cloneDeep,
  difference as _difference,
  get as _get,
  includes as _includes,
} from "lodash-es";

import CONSTANT from "./constant";

const { addon_licenses_sort_temple, addon_licenses_temple } = CONSTANT;

const compare = (c: any, n: any) =>
  new Date(n.issuedDate).getTime() - new Date(c.issuedDate).getTime();

export const handleAddonLicenses = (
  _addonLicenses: any[] = [],
  license: any,
) => {
  let sort_temple = [];
  let addonLicenses = [];
  for (let i = 0; i < addon_licenses_sort_temple.length; ++i) {
    for (let j = 0; j < _addonLicenses.length; ++j) {
      if (addon_licenses_sort_temple[i] === _addonLicenses[j]?.modules?.[0]) {
        addonLicenses.push(_addonLicenses[j]);
        sort_temple.push(addon_licenses_sort_temple[i]);
      }
    }
  }

  sort_temple = _difference(addon_licenses_sort_temple, sort_temple);

  let serviceLicenseList = _addonLicenses?.filter((it) =>
    _includes(["service-5x8", "service-7x24"], _get(it, ["modules", "0"])),
  );
  if (serviceLicenseList && serviceLicenseList.length > 0) {
    serviceLicenseList = serviceLicenseList.sort(compare);
    addonLicenses.push(serviceLicenseList[0]);
  }

  const addonLicensesTemple = _cloneDeep(addon_licenses_temple) as any;

  if (sort_temple.length > 0) {
    sort_temple.forEach((it) => {
      if (license?.licenseType === "Trial") {
        addonLicensesTemple[it].disable = false;
        addonLicensesTemple[it].expired = false;
      }
      addonLicenses.push(addonLicensesTemple[it]);
    });
  }

  if (!serviceLicenseList || serviceLicenseList?.length === 0) {
    addonLicenses.push({
      disable: true,
      licenseType: "AddOn",
      modules: ["service"],
    });
  }

  if (_includes(["Trial"], _get(license, "licenseType"))) {
    addonLicenses = addonLicenses?.filter((it) => it.modules[0] !== "service");
    addonLicenses = addonLicenses.map((it) => {
      it.disable = false;
      it.expired = false;
      it.issuedDate = undefined;
      it.expiredDate = undefined;
      return it;
    });
  }

  return addonLicenses;
};

export const getLicenseTypeString = (license: any) => {
  const licenseType = license?.isOpensource
    ? UIExtendedLicenseType.Community
    : license?.licenseType;

  switch (licenseType) {
    case UIExtendedLicenseType.Trial:
    case UIExtendedLicenseType.TrialExt:
    case UIExtendedLicenseType.Paid:
    case UIExtendedLicenseType.Basic:
    case UIExtendedLicenseType.Standard:
      return "about.enterprise";
    case UIExtendedLicenseType.OEM:
      return "about.prepaid";
    case UIExtendedLicenseType.Hybrid:
      return "about.hybrid";
    case UIExtendedLicenseType.HybridTrialExt:
      return "about.hybrid.trialExt";
    case UIExtendedLicenseType.Community:
      return "about.community";
    default:
      return "";
  }
};

export const normalizeLicenceType = (nativeType: string) => {
  if (
    nativeType === "OEM" ||
    nativeType === "Paid" ||
    nativeType === "Prepaid"
  ) {
    return "prepaid";
  }
  if (nativeType === "Community" || nativeType === "OpenSource") {
    return "community";
  }
  if (nativeType === "Trial") {
    return "trial";
  }
  if (nativeType === "TrialExt") {
    return "trialext";
  }
  if (nativeType === "HybridTrialExt") {
    return "HybridTrialExt";
  }
};

export const isShowForever = (
  expiredDate: string,
  issuedDate: string,
  expired: boolean,
) => {
  return (
    (new Date(expiredDate)?.getTime() - new Date(issuedDate)?.getTime()) /
      (3600 * 24 * 1000) >=
      3650 && !expired
  );
};

export const isShowForeverForCube = (
  expiredDate: string,
  issuedDate: string,
) => {
  return (
    (new Date(expiredDate)?.getTime() - new Date(issuedDate)?.getTime()) /
      (3600 * 24 * 1000) >=
    3650
  );
};

export const getExpiredAndNowDayGap = (
  expiredDate: string,
  currentDate?: number,
) => {
  let gap = 0;
  const now = currentDate || new Date().getTime();
  if (expiredDate) {
    gap = (new Date(expiredDate)?.getTime() - now) / (3600 * 24 * 1000);
  }
  return gap;
};

export const base64ToArrayBuffer = (base64: string) => {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
};

import { useUpdate } from "ahooks";
import React, { useEffect } from "react";

export interface ILicense {
  modules?: [string];
  expiredDate?: string;
  issuedDate?: string;
  licenseType?: string;
}

export interface ILicenseActionConfig {
  pathname?: string;
}

export interface ILicenseActionConfigProviderProps extends ILicenseActionConfig {
  children: React.ReactNode;
}

export class License {
  mainLicense?: ILicense | null = null;

  subLicense?: Array<ILicense> = [];

  platformTimeMillionSeconds = 0;

  mainLicenseExpried = false;

  subLicenseExpriedPrefixPathnames: string[] = [];

  updateCb: Array<Function> = [];

  isExpried: (cfg?: ILicenseActionConfig | null) => boolean = () => false;

  subscribe(cb: Function) {
    const index = this.updateCb.findIndex((item) => item === cb);

    if (index !== -1) {
      return () => {};
    }

    this.updateCb.push(cb);

    return () => {
      const findIndex = this.updateCb.findIndex((item) => item === cb);

      if (findIndex === -1) {
        return;
      }

      this.updateCb.splice(findIndex, 1);
    };
  }

  setLicense = ({
    mainLicense,
    subLicense = [],
    platformTimeMillionSeconds = 0,
  }: {
    mainLicense: ILicense;
    subLicense?: Array<ILicense>;
    platformTimeMillionSeconds: number;
  }) => {
    this.mainLicense = mainLicense;
    this.subLicense = subLicense;
    this.platformTimeMillionSeconds = platformTimeMillionSeconds;
    this.mainLicenseExpried = false;
    this.subLicenseExpriedPrefixPathnames = [];
    this.isExpried = () => false;

    this.updateCb.forEach((cb) => cb?.());
  };

  setSubLicenseExpiredPrefixPathnames = () => {
    this.subLicenseExpriedPrefixPathnames = [];
  };

  setMainLicenseExpried = () => {
    this.mainLicenseExpried = false;
  };

  getWillBeExpiredLicenseDayDifference = () => Number.POSITIVE_INFINITY;

  clear = () => {
    this.mainLicense = null;
    this.subLicense = [];
    this.mainLicenseExpried = false;
    this.subLicenseExpriedPrefixPathnames = [];
    this.platformTimeMillionSeconds = 0;
    this.isExpried = () => false;
  };
}

export const license = new License();

export function useActionByLicense() {
  const update = useUpdate();

  useEffect(() => license.subscribe(update), [update]);

  return [license, license.setLicense] as const;
}

export const useLicenseAction = () => {
  return function (Children: React.ReactElement) {
    return Children;
  };
};

export const licenseActionConfigContext =
  React.createContext<ILicenseActionConfig | null>(null);

export const LicenseActionConfigProvider = ({
  children,
}: ILicenseActionConfigProviderProps) => <>{children}</>;

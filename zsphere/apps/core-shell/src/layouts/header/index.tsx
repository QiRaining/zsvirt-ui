import { Auth } from "@zstack/zsphere-components";
import React, { useEffect, useState } from "react";

import { useGetCustomColumnConfig } from "@/utils/use-get-custom-column-config";
import { useGetCustomizedLicenseNameInfo } from "@/utils/use-get-custome-license-name";

import { useGetManageMentNodeInfo } from "../../utils/use-get-management-node-info";
import { useGlobalConfigAuth } from "../hooks";
import ApiInspector from "./components/api-inspector";
import Logo from "./components/logo";
import Search from "./components/search";
import UpdateCheck from "./update-check";
import UploadResumeEntry from "./upload-resume-entry";
import User from "./user";

import style from "./style.module.less";

// 延迟挂载：等首屏请求完成后再触发非关键初始化查询
const DeferredInit: React.FC = () => {
  useGetCustomColumnConfig();
  useGetCustomizedLicenseNameInfo();
  useGetManageMentNodeInfo();
  return null;
};

const Header: React.FC = React.memo(() => {
  // 全局设置控制页面展示（影响菜单权限，保持即时）
  useGlobalConfigAuth();

  const [deferredReady, setDeferredReady] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setDeferredReady(true), 800);
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      {deferredReady && <DeferredInit />}
      <div className={style.container}>
        <div className={style.left}>
          <Logo />
        </div>
        <Search position="center" />
        <div className={style.right} id="main-nav-right">
          <div className="flex items-center gap-2">
            <UploadResumeEntry />
            <Auth resource="common" type="block" authKey="api.inspector">
              <div className={style.btnGhostWrapper}>
                <ApiInspector />
              </div>
            </Auth>
            <UpdateCheck />
            <User />
          </div>
        </div>
      </div>
    </>
  );
});

Header.displayName = "Header";

export default Header;

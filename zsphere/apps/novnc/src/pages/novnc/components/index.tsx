import { Layout } from "antd";
import React, { useContext, useMemo } from "react";

import NoVncContext from "../context";
import Content from "./Content";
import NoVncHeader from "./Header";
import NoVncSideBar from "./SideBar";

import style from "./style.module.less";

const NoVnc: React.FC = () => {
  const { store } = useContext(NoVncContext);
  const { options } = store ?? {};

  const noVncHeaderData = useMemo(() => {
    return {
      title: options?.desktopName,
      uuid: options?.uuid,
      ip: options?.ip,
      platform: options?.platform?.toLowerCase() ?? "file",
    };
  }, [options?.desktopName, options?.uuid, options?.ip, options?.platform]);

  return (
    <Layout className={style.layout}>
      <NoVncHeader {...noVncHeaderData} />
      <Layout>
        <NoVncSideBar />
        <Content />
      </Layout>
    </Layout>
  );
};

export default NoVnc;

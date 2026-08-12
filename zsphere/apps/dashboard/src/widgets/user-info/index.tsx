import { usePlatformStore } from "@zstack/zsphere-platform-store";
import React, { memo } from "react";

import userInfoHeaderLightBlueLeftSvg from "../../assets/images/user-info-header-light-blue-left.webp";
import userInfoHeaderLightBlueRightSvg from "../../assets/images/user-info-header-light-blue-right.webp";
import userInfoHeaderLightGreenLeftSvg from "../../assets/images/user-info-header-light-green-left.webp";
import userInfoHeaderLightGreenRightSvg from "../../assets/images/user-info-header-light-green-right.webp";
import userInfoHeaderLightPurpleLeftSvg from "../../assets/images/user-info-header-light-purple-left.webp";
import userInfoHeaderLightPurpleRightSvg from "../../assets/images/user-info-header-light-purple-right.webp";
import userInfoHeaderLightRedLeftSvg from "../../assets/images/user-info-header-light-red-left.webp";
import userInfoHeaderLightRedRightSvg from "../../assets/images/user-info-header-light-red-right.webp";
import userInfoHeaderLightTealLeftSvg from "../../assets/images/user-info-header-light-teal-left.webp";
import userInfoHeaderLightTealRightSvg from "../../assets/images/user-info-header-light-teal-right.webp";
import userInfoHeaderLightVioletLeftSvg from "../../assets/images/user-info-header-light-violet-left.webp";
import userInfoHeaderLightVioletRightSvg from "../../assets/images/user-info-header-light-violet-right.webp";
import userInfoHeaderLightYellowLeftSvg from "../../assets/images/user-info-header-light-yellow-left.webp";
import userInfoHeaderLightYellowRightSvg from "../../assets/images/user-info-header-light-yellow-right.webp";
import userInfoHeaderLightYellowgreenLeftSvg from "../../assets/images/user-info-header-light-yellowgreen-left.webp";
import userInfoHeaderLightYellowgreenRightSvg from "../../assets/images/user-info-header-light-yellowgreen-right.webp";
import useCheckCurrentLogin from "../useCheckCurrentLogin";
import { Account, Admin } from "./identity";

import style from "./style.module.less";

interface IProps {
  [key: string]: any;
}

const getPng = (themeColor?: string) => {
  switch (themeColor) {
    case "blue":
      return [userInfoHeaderLightBlueLeftSvg, userInfoHeaderLightBlueRightSvg];
    case "green":
      return [
        userInfoHeaderLightGreenLeftSvg,
        userInfoHeaderLightGreenRightSvg,
      ];
    case "purple":
      return [
        userInfoHeaderLightPurpleLeftSvg,
        userInfoHeaderLightPurpleRightSvg,
      ];
    case "red":
      return [userInfoHeaderLightRedLeftSvg, userInfoHeaderLightRedRightSvg];
    case "teal":
      return [userInfoHeaderLightTealLeftSvg, userInfoHeaderLightTealRightSvg];
    case "violet":
      return [
        userInfoHeaderLightVioletLeftSvg,
        userInfoHeaderLightVioletRightSvg,
      ];
    case "yellow":
      return [
        userInfoHeaderLightYellowLeftSvg,
        userInfoHeaderLightYellowRightSvg,
      ];
    case "yellow-green":
      return [
        userInfoHeaderLightYellowgreenLeftSvg,
        userInfoHeaderLightYellowgreenRightSvg,
      ];
    default:
      return [userInfoHeaderLightBlueLeftSvg, userInfoHeaderLightBlueRightSvg];
  }
};

const UserInfoInner: React.FC<IProps> = () => {
  const { currentUser, themeConfig = {} } = usePlatformStore();
  const { isAccount } = useCheckCurrentLogin();

  const { themeColor = "" } = themeConfig;

  const renderContent = () => {
    if (isAccount) {
      return <Account currentUser={currentUser} />;
    }

    return <Admin currentUser={currentUser} />;
  };

  return (
    <div className={style.container}>
      <div className={style.header}>
        <img src={getPng(themeColor)[0]} alt="" className={style.imgLeft} />
        <img src={getPng(themeColor)[1]} alt="" className={style.imgRight} />
      </div>
      <div className={style.content}>{renderContent()}</div>
    </div>
  );
};

const UserInfo = memo(UserInfoInner);

export default UserInfo;

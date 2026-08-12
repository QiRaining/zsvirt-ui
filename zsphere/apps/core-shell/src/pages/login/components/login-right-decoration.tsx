import React from "react";

import LoginIllus from "../../../assets/images/login_illus_combined.svg?react";

import style from "../style.module.less";

const LoginRightDecoration: React.FC = () => {
  return (
    <div className={style.pictureContainer}>
      <div className={style.picture}>
        <LoginIllus
          aria-hidden="true"
          className={style.bg}
          preserveAspectRatio="xMidYMid slice"
        />
      </div>
    </div>
  );
};

export default LoginRightDecoration;

import React from "react";
import { useIntl } from "react-intl";

import style from "../style.module.less";

const LoginFooter: React.FC = () => {
  const intl = useIntl();

  return (
    <div className={style.footer}>
      {intl.formatMessage({
        id: "login.footer.browser.recommend",
        defaultMessage:
          "For a better experience, use Chrome 88 or later.",
      })}
    </div>
  );
};

export default LoginFooter;

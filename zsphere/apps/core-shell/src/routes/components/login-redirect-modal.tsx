import { DialogWeak } from "@zstack/zsphere-design-biz";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";

import { useLoginRedirectStore } from "../../store/use-login-redirect-store";

export default function LoginRedirectModal() {
  const intl = useIntl();
  const navigate = useNavigate();
  const { visible, setVisible, forceLogout } = useLoginRedirectStore();

  return (
    <DialogWeak
      visible={visible}
      setVisible={setVisible}
      type="warning"
      title={
        forceLogout
          ? intl.formatMessage({
              id: "login.exception",
              defaultMessage: "Login Exception",
            })
          : intl.formatMessage({
              id: "session.timeout",
              defaultMessage: "Session Timeout",
            })
      }
      description={
        forceLogout
          ? intl.formatMessage({
              id: "login.exception.description",
              defaultMessage:
                "Your account is currently logged in to another device. Please pay attention to your account security.",
            })
          : intl.formatMessage({
              id: "session.timeout.description",
              defaultMessage: "Session timeout. Please log in again.",
            })
      }
      onConfirm={() => {
        const currentPath = window.location.pathname;
        const currentSearch = window.location.search || "";

        setVisible(false);
        localStorage.removeItem("currentUser");
        localStorage.removeItem("loginType");
        localStorage.removeItem("TOKEN");

        if (
          currentPath === "/" ||
          currentPath === "/login" ||
          currentPath.startsWith("/exception")
        ) {
          navigate("/login");
        } else {
          navigate(`/login?redirect=${currentPath}${currentSearch}`);
        }
      }}
    />
  );
}

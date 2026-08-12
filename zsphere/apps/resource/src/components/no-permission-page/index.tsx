import { useIntl } from "react-intl";

import NoRootSvg from "./images/no-root.webp";

import styles from "./style.module.less";

const NoPermissionPage = () => {
  const intl = useIntl();

  return (
    <div className={styles.noPermissionPage}>
      <div className={styles.noPermissionContent}>
        <img src={NoRootSvg} alt="401" />
        <div className={styles.noPermissionTitle}>
          {intl.formatMessage({
            id: "virtualization.no.authority",
            defaultMessage: "Permission Denied",
          })}
        </div>
        <div className={styles.noPermissionDesc}>
          {intl.formatMessage({
            id: "virtualization.no.authority.desc",
            defaultMessage: "You do not have permissions to view this page. Contact your administrator.",
          })}
        </div>
      </div>
    </div>
  );
};

export default NoPermissionPage;

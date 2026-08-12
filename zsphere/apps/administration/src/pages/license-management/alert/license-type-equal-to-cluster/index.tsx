import { useQuery } from "@apollo/client";
import { useMemo } from "react";
import { useIntl } from "react-intl";
import { useLocation, useNavigate } from "react-router";

import { isLicenseTypeEqualToCluster } from "../../../../gql/lincense-management.gql";

import style from "./style.module.less";

export function useLicenseEqualToClusterAlertText(
  setGlobalAlert: (value: { hideLicenseAlert: boolean }) => void,
) {
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();

  const { data } = useQuery(isLicenseTypeEqualToCluster, {
    fetchPolicy: "no-cache",
  });

  const showAlert = data?.isLicenseTypeEqualToCluster;

  const inAboutPage = location.pathname.indexOf("about") !== -1;

  const licenseAlert = useMemo(() => {
    return (
      showAlert && (
        <>
          <span
            className="outer-span"
            dangerouslySetInnerHTML={{
              __html: intl.formatMessage({
                id: "license.alert.warning.license.type.not.equal.to.cluster",
                defaultMessage:
                  "The platform has hosts with the arm architecture. To ensure your business continuity, update your license.",
              }),
            }}
          />
          {!inAboutPage && (
            <a
              className={style.danger}
              href="/about"
              onClick={(e) => {
                e.preventDefault();
                navigate("/about");
                setGlobalAlert({ hideLicenseAlert: true });
              }}
            >
              {intl.formatMessage({
                id: "update.license",
                defaultMessage: "Update License.",
              })}
            </a>
          )}
        </>
      )
    );
  }, [showAlert, intl, inAboutPage, setGlobalAlert]);

  return { licenseAlert };
}

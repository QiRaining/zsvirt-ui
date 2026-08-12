import { Icon } from "@zstack/icon";
import { getMenuList } from "@zstack/zsphere-config";
import { IMenu } from "@zstack/zsphere-types";
import { Breadcrumb, Divider } from "antd";
import classNames from "classnames";
import qs from "qs";
import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import { useNavigate, useLocation, useSearchParams } from "react-router";

import { getBaseCls } from "../_utils/common";
import Text from "../a-cloud-old-components/text";
import Link from "../link";

import "./style.less";

export function useDetailBreadcrumbWatch() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.has("lastResource")) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("lastResource");
      navigate({
        pathname: location.pathname,
        search: newSearchParams.toString(),
      });
    }
  }, []);
}

export function useGetLeftNav(intl: any) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const key = searchParams.get("leftnav");
  const pathname = location.pathname.split("/detail")[0].split("/").pop();
  const menuList = getMenuList();

  const getNameByPath = () => {
    const item = menuList.find((it: IMenu) => {
      const path = it.path?.split("?")[0].split("/").pop();
      return path === pathname;
    });
    return intl.formatMessage({
      id: item?.i18nKey,
      defaultMessage: item?.name,
    });
  };

  return {
    hasResourceTree: !!key,
    name: getNameByPath(),
  };
}

interface IProp {
  breadcrumbItems: Array<{
    name: string;
    pathname?: string;
    state?: any;
    leftnav?: string;
  }>;
  className?: string;
  style?: React.CSSProperties;
}

const baseCls = getBaseCls("detail-breadcrumb");

const DetailBreadcrumb: React.FC<IProp> = ({
  breadcrumbItems = [],
  className,
  style,
}) => {
  const intl = useIntl() as any;

  const [searchParams] = useSearchParams();

  const showLastPage = searchParams.has("lastResource");

  const navigate = useNavigate();

  const leftNav = useGetLeftNav(intl);

  return (
    <Breadcrumb
      style={style}
      className={classNames(baseCls, className)}
      separator=""
    >
      {showLastPage && (
        <>
          <Breadcrumb.Item dropdownProps={{ placement: "bottomLeft" } as any}>
            <span
              onClick={() => {
                navigate(-1);
              }}
              className={`${baseCls}-back`}
            >
              <Icon type="arrow-left" />

              {intl.formatMessage({
                id: "backup.prevPage",
                defaultMessage: "Go Back",
              })}
            </span>
          </Breadcrumb.Item>
          <Divider type="vertical" className={`${baseCls}-divider`} />
        </>
      )}

      <Breadcrumb.Item>{leftNav.name}</Breadcrumb.Item>
      {leftNav.name ? (
        <Breadcrumb.Separator>
          <Icon className={`${baseCls}-icon`} type="arrow-ios-right" />
        </Breadcrumb.Separator>
      ) : null}

      {breadcrumbItems.reduce<Array<React.ReactNode>>(
        (prev, item, i) => [
          ...prev,
          <Breadcrumb.Item key={`${i}-item`}>
            {item.pathname ? (
              item.state ? (
                <Link
                  to={item.pathname}
                  onClick={(e: any) => {
                    e.preventDefault();
                    navigate(item.pathname!, { state: item.state });
                  }}
                >
                  {item.name}
                </Link>
              ) : (
                <Link to={item.pathname}>{item.name}</Link>
              )
            ) : (
              <div className={`${baseCls}-tooltip`}>
                <Text value={item.name}>{item.name}</Text>
              </div>
            )}
          </Breadcrumb.Item>,
          i !== breadcrumbItems.length - 1 ? (
            <Breadcrumb.Separator key={`${i}-separator`}>
              <Icon className={`${baseCls}-icon`} type="arrow-ios-right" />
            </Breadcrumb.Separator>
          ) : null,
        ],
        [],
      )}
    </Breadcrumb>
  );
};

export default DetailBreadcrumb;

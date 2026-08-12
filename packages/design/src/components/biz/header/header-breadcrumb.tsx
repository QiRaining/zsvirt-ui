import { cn } from "@zstack/utils";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbBackLink,
  BreadcrumbDivider,
  BreadcrumbSeparator,
  BreadcrumbLink,
  BreadcrumbPage,
} from "../../primitive/breadcrumb";

interface HeaderBreadcrumbProps {
  className?: string;
  /** 资源名称，显示为面包屑的当前页面 */
  resourceName: string;
  /** 资源类型，显示为面包屑的上一级 */
  resourceType: string;
  /** 资源列表页的路径，点击资源类型时导航到此路径 */
  resourcePath: string;
}

/** 详情页头部导航栏 */
export const HeaderBreadcrumb = ({
  className,
  resourceName,
  resourceType,
  resourcePath,
}: HeaderBreadcrumbProps) => {
  const intl = useIntl();
  const navigate = useNavigate();
  return (
    <div
      className={cn(
        "mb-3 flex items-center text-xs text-neutral-700",
        className,
      )}
    >
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbBackLink
              onClick={() => {
                navigate(-1);
              }}
            >
              {intl.formatMessage({
                id: "backup.prevPage",
                defaultMessage: "返回上一页",
              })}
            </BreadcrumbBackLink>
          </BreadcrumbItem>
          <BreadcrumbDivider />
          <BreadcrumbItem>
            <BreadcrumbLink
              className="cursor-pointer"
              onClick={() => {
                navigate(resourcePath);
              }}
            >
              {resourceType}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{resourceName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

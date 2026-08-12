import cs from "classnames";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import Text from "../a-cloud-old-components/text";
import Link from "../link";
import { IResourceNameProps } from "./type";

import "./style.less";

const ResourceName: React.FC<IResourceNameProps> = ({
  value,
  canModify,
  icon,
  copyable,
  ellipsis,
  link,
  className,
  isRouterManaged,
}) => {
  const intl = useIntl() as any;
  let _value: any = value;
  let _className: any;

  const noneText = useMemo(() => {
    return intl.formatMessage({
      id: "NA",
      defaultMessage: "Empty",
    });
  }, [intl]);

  if (_value === undefined || _value === null || _value === "") {
    className = cs(className, canModify && "emptyResource");
    _value = canModify ? noneText : "-";
    if (link?.uuid) return <Text value={link?.uuid} />;
    return <Text value={_value} className={className} />;
  }

  if (typeof _value === "boolean") {
    const v = _value
      ? intl.formatMessage({ id: "open", defaultMessage: "Enabled" })
      : intl.formatMessage({ id: "close", defaultMessage: "Disabled" });
    return <Text value={v} className={cs(_className, className)} />;
  }

  const textDom = icon ? (
    <>
      {" "}
      <span className="icon">{icon}</span>
      {value}
    </>
  ) : (
    value?.toString()
  );

  if (link?.uuid) {
    return (
      <Text value={_value} ellipsis={ellipsis !== false}>
        <Link.Detail {...link} isRouterManaged={isRouterManaged}>
          {textDom}
        </Link.Detail>
      </Text>
    );
  }

  return (
    <Text
      value={_value}
      copyable={copyable}
      ellipsis={ellipsis !== false}
      className={className}
    >
      {textDom}
    </Text>
  );
};
export default ResourceName;

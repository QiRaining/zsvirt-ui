import React from "react";

import { getBaseCls } from "../_utils/common";

import "./style.less";

export interface IProps {
  title: string;
  resourceName?: string;
}

const baseCls = getBaseCls("title");

const Title: React.FC<IProps> = ({ title, resourceName }) => {
  return (
    <>
      {title}
      {resourceName ? (
        <span className="titleResourceName">{resourceName}</span>
      ) : null}
    </>
  );
};

export default Title;

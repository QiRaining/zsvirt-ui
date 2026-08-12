import React from "react";

import style from "./style.module.less";

export interface IProps {
  title: string;
}

const Title: React.FC<IProps> = ({ title }) => {
  return (
    <div className={style.title}>
      <div className={style.rect} />
      <div className={style.text}>{title}</div>
    </div>
  );
};

export default Title;

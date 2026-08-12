import type { FC, ReactNode } from "react";

import style from "./style.module.less";

interface IProps {
  title?: ReactNode;
  extra?: ReactNode;
  children?: ReactNode;
}

const Panel: FC<IProps> = ({ title, children }) => {
  return (
    <div className={style.panel}>
      <div className={`flex items-center justify-between ${style.header}`}>
        <div className={style.title}>
          <div className={style["blue-line"]}></div>
          {title}
        </div>
      </div>
      <div className={style.card}>{children}</div>
    </div>
  );
};

export default Panel;

import Header from "./header";
import Main from "./main";

import style from "./style.module.less";

export default () => {
  return (
    <div className={style.container}>
      <Header />
      <div className={style.main}>
        <Main />
      </div>
    </div>
  );
};

import Header from "./header";
import AccessKeyList from "./list";

import style from "./style.module.less";

export default () => {
  return (
    <div className="main-list-header-tabs-container">
      <Header />
      <div className={style.main}>
        <AccessKeyList view="main" />
      </div>
    </div>
  );
};

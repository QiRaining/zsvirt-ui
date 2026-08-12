export { HeaderList } from "./header-list";
export type { HeaderListProps } from "./header-list";

export { HeaderDetail } from "./header-detail";
export type { HeaderDetailProps } from "./header-detail";

// 兼容老 API 的默认导出
const Header = {
  List: HeaderList,
  Detail: HeaderDetail,
};

export default Header;

import { HeaderDetail } from "./header-detail";
// 重新导出组件引用
import { HeaderList } from "./header-list";

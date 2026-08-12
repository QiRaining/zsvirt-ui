export { DetailDrawer } from "./detail-drawer";
export type { DetailDrawerProps, DetailDrawerTabPane } from "./detail-drawer";

// 兼容老 API 的默认导出
const Detail = {
  Drawer: DetailDrawer,
  // Draggable 暂未实现
};

export default Detail;

// 重新导出组件引用
import { DetailDrawer } from "./detail-drawer";

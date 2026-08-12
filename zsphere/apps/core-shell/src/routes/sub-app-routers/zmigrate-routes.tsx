import { Route } from "react-router";

import { Zmigrate } from "@/pages/zmigrate";

import MonitoringOmWrapper from "../components/monitoring-om-wrapper";

/**
 * zmigrate 路由
 *
 * menu.json 中 zmigrate 菜单项（迁移资源 / 迁移任务）的 path 定义为
 * /zmigrate/migrate-resource、/zmigrate/migrate-task，
 * 但它们在菜单树中属于 "virtualization.monitoring.om" 节点。
 *
 * 使用 MonitoringOmWrapper 作为布局组件，确保 SubAppLayout
 * （含 customParentKey="virtualization.monitoring.om"）的左侧导航
 * 在 zmigrate 页面也始终可见，与 monitoring-om 下的其他页面保持一致。
 *
 * Zmigrate 组件通过 qiankun loadMicroApp 加载微应用，
 * 自己管理渲染，不依赖 Outlet。
 */
export const zmigrateRoutes = (
  <Route path="zmigrate" element={<MonitoringOmWrapper />}>
    <Route index element={<Zmigrate />} />
    <Route path="*" element={<Zmigrate />} />
  </Route>
);

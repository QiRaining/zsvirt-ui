/// <reference types="vite-plugin-svgr/client" />
// 声明 SVG 资源模块类型
declare module "*.svg" {
  const content: string;
  export default content;
}

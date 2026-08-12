// 是否是生产环境 — 由消费方的构建工具通过 define 替换
// 这里不能用 process.env.NODE_ENV，因为作为 rslib 产物会被提前替换
// 改为在运行时通过 location 判断：开发环境一般是 localhost
export const IS_PRODUCTION =
  typeof window !== "undefined"
    ? !["localhost", "127.0.0.1"].includes(window.location.hostname)
    : false;
// 开发环境的 fallback 服务器地址
export const PUBLIC_MF_FALLBACK_SERVER =
  process.env.ZSV_MF_FALLBACK_SERVER || "";

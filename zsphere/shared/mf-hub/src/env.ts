// 是否启用开发模式的模块联邦 fallback
export const DEV_MF = process.env.ZSV_DEV_MF === "true";
// 是否是生产环境
export const IS_PRODUCTION = process.env.NODE_ENV === "production";
// 开发环境的 fallback 服务器地址
export const PUBLIC_MF_FALLBACK_SERVER = process.env.ZSV_MF_FALLBACK_SERVER;

if (DEV_MF && !PUBLIC_MF_FALLBACK_SERVER) {
  throw new Error(
    "ZSV_MF_FALLBACK_SERVER is required when ZSV_DEV_MF=true",
  );
}

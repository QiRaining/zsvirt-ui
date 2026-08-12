import { publicPaths } from "./public-paths";

// 缓存上一次的查询结果
let lastPathname = "";
let lastResult = false;

// 标准化路径，确保其以斜杠开头
const normalizePath = (path: string) =>
  path.startsWith("/") ? path : `/${path}`;

export const isPublicPath = () => {
  const pathname = window.location.pathname;
  // 如果路径未变化，直接返回上一次的结果
  if (pathname === lastPathname) {
    return lastResult;
  }

  // 更新缓存的路径和结果
  lastPathname = pathname;
  lastResult = publicPaths.some((item) =>
    pathname.startsWith(normalizePath(item)),
  );

  return lastResult;
};

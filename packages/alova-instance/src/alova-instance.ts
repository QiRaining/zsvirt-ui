import { createAlova } from "alova";
import adapterFetch from "alova/fetch";
import ReactHook from "alova/react";
import { getBaseURL } from "./get-base-url";

export const alovaInstance = createAlova({
  baseURL: getBaseURL(),
  requestAdapter: adapterFetch(),
  statesHook: ReactHook,
  cacheLogger: process.env.NODE_ENV === "development",
  // 如需启用缓存，在指定的 method 实例中设置即可
  cacheFor: null,

  beforeRequest(method) {
    method.config.headers = {
      ...method.config.headers,
      "x-session-id": localStorage.getItem("sessionId"),
    };
  },

  // 根据Content-Type自动判断响应类型
  responded: async (response: Response) => {
    // 获取Content-Type头
    const contentType = response.headers.get("Content-Type") || "";

    // 检查是否为空响应
    if (
      response.status === 204 ||
      response.headers.get("Content-Length") === "0"
    ) {
      return null;
    }

    // 根据Content-Type判断响应类型
    if (contentType.includes("application/json")) {
      // JSON响应
      return response.json();
    } else if (
      contentType.includes("text/plain") ||
      contentType.includes("text/html") ||
      contentType.includes("text/xml") ||
      contentType.includes("application/xml") ||
      contentType.includes("text/javascript") ||
      contentType.includes("application/javascript") ||
      contentType.includes("application/x-javascript")
    ) {
      // 文本响应（包括JavaScript文件）
      return response.text();
    } else if (
      contentType.includes("application/octet-stream") ||
      contentType.includes("application/pdf") ||
      contentType.includes("image/")
    ) {
      // 二进制数据 (包括图片: image/png, image/jpeg, image/gif, image/webp 等)
      return response.blob();
    } else if (contentType.includes("multipart/form-data")) {
      // 表单数据
      return response.formData();
    } else {
      // 默认尝试解析为JSON，如果失败则返回文本
      try {
        return response.json();
      } catch {
        return response.text();
      }
    }
  },
});

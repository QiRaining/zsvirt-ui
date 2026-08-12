// 为了打包的需要,所以独立出来
// 压缩请求
const cacheMap: { [key: string]: { state: "pending" | "ready"; cbs: any[] } } =
  {};
function cacheFetch(url: string) {
  return new Promise<any>((resolve) => {
    if (!cacheMap[url]) {
      cacheMap[url] = {
        state: "ready",
        cbs: [resolve],
      };
    }
    if (cacheMap[url].state === "pending") {
      cacheMap[url].cbs.push(resolve);
    } else {
      cacheMap[url].state = "pending";
      fetch(url).then((res) => {
        const json = res.json();
        cacheMap[url].cbs.forEach((cb) => cb(json));
        delete cacheMap[url];
      });
    }
  });
}

const getConfigServer = () => {
  const configServer = process.env.ZSV_CONFIG_SERVER;
  if (!configServer) {
    throw new Error(
      "ZSV_CONFIG_SERVER is required when remote debug configuration is enabled",
    );
  }
  return configServer;
};

// 仅在浏览器端使用
export async function fetchData(
  type: "Field" | "Action" | "Constant" | "GlobalConfig",
  extraParams: { resourceKey?: string } = {},
) {
  const branch = localStorage.getItem("debug-branch")?.slice(1, -1); // 去掉引号
  const params: { [prop in string]: any } = {
    ...extraParams,
    branch,
    tableType: type,
  };
  const url = new URL("/api/configuration/all", getConfigServer());
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });
  const result = await cacheFetch(url.toString());
  return result;
}

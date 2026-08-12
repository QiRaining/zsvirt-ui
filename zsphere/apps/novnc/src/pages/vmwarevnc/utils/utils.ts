/**
 * 获取 url 参数
 */
export const readQueryVariable = (name: string, defaultValue: any) => {
  const re = new RegExp(`.*[?&]${name}=([^&#]*)`);
  const match = document.location.href.match(re);

  if (match) {
    return decodeURIComponent(match[1]);
  }

  return defaultValue;
};

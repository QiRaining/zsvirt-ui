/**
 * 处理 Vendor 菜单的 URL 拼接
 *
 * 根据菜单项的 tokenReg 规则，将 ssoToken 中的值拼接到 URL 中
 *
 * @example
 * // tokenReg: "accessToken=${accessToken}&idToken=${idToken}"
 * // ssoToken: { accessToken: "abc123", idToken: "xyz789" }
 * // url: "https://example.com"
 * // 结果: "https://example.com?accessToken=abc123&idToken=xyz789"
 */
export function buildVendorUrl(
  baseUrl: string,
  tokenReg?: string,
  ssoToken?: Record<string, unknown>,
): string {
  if (!tokenReg || !ssoToken) {
    return baseUrl;
  }

  try {
    // 使用正则替换 ${variableName} 为实际值
    const interpolatedTokenReg = tokenReg.replace(
      /\$\{(\w+)\}/g,
      (_match, varName) => {
        const value = ssoToken[varName];
        return value !== undefined ? String(value) : "";
      },
    );

    // 判断 baseUrl 是否已经有查询参数
    const connector = baseUrl.indexOf("?") > 0 ? "&" : "?";

    return `${baseUrl}${connector}${interpolatedTokenReg}`;
  } catch (error) {
    console.error("Failed to build vendor URL:", error);
    return baseUrl;
  }
}

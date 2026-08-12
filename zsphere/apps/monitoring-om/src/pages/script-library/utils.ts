export const decodeBase64 = (content: string | null | undefined): string => {
  if (!content) {
    return "";
  }

  try {
    const binary = atob(content);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  } catch {
    // 解码失败时返回原内容，不打印错误
    return content;
  }
};

// 安全的 Base64 编码函数
export const base64Encode = (str: string): string => {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    return btoa(String.fromCharCode(...data));
  } catch {
    // 编码失败时返回原字符串
    return str;
  }
};

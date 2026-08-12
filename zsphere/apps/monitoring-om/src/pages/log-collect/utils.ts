import { useHandleHttpsDownload } from "@zstack/zsphere-hooks";

const downloadLogFile = (url: string) => {
  try {
    if (!url) {
      throw new Error("Invalid URL");
    }

    // 创建临时a标签解析URL路径
    const tempLink = document.createElement("a");
    tempLink.href = url;

    // 获取路径并提取文件名
    const pathSegments = tempLink.pathname.split("/");
    const filename = pathSegments[pathSegments.length - 1];

    // 创建下载链接
    const aNode = document.createElement("a");
    try {
      aNode.style.display = "none";
      aNode.href = url;
      aNode.download = filename; // 使用提取的文件名
      document.body.appendChild(aNode);
      aNode.click();
    } finally {
      document.body.removeChild(aNode);
    }
  } catch {
    // Ignore download errors
  }
};

const useDownloadLogFile = () => {
  let handleDownloadFunc = null;
  const { handleHttpsDownload } = useHandleHttpsDownload();

  if (window?.location?.protocol === "https:") {
    handleDownloadFunc = handleHttpsDownload;
  } else {
    handleDownloadFunc = downloadLogFile;
  }

  return {
    handleDownloadFunc,
  };
};

export { useDownloadLogFile };

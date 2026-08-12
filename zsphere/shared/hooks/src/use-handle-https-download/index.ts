import { usePersistFn } from "ahooks";

export default function useHandleHttpsDownload() {
  const handleHttpsDownload = usePersistFn((url?: string) => {
    if (!url) {
      return;
    }
    const helperUrl = `http://${window.location.hostname}/download-helper?url=${encodeURIComponent(
      url,
    )}`;
    const link = document.createElement("a");
    link.href = helperUrl;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    link.remove();
  });

  return { handleHttpsDownload };
}

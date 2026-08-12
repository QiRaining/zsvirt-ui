export const VDDK_UPLOAD_ACTION = "upload-vddk";

export const shouldOpenUploadVddkDialog = (params: URLSearchParams) =>
  params.get("action") === VDDK_UPLOAD_ACTION;

export const consumeUploadVddkAction = (params: URLSearchParams) => {
  const next = new URLSearchParams(params);
  if (shouldOpenUploadVddkDialog(next)) {
    next.delete("action");
  }
  return next;
};

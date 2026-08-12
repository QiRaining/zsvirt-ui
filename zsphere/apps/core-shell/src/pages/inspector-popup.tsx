import React, { Suspense } from "react";

const PopupWindow = React.lazy(
  () => import("../layouts/header/components/api-inspector/popup-window"),
);

export default function InspectorPopup() {
  return (
    <Suspense fallback={null}>
      <PopupWindow />
    </Suspense>
  );
}

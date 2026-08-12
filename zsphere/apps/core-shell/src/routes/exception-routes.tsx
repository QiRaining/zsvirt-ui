import React from "react";
import { Route } from "react-router";

import { SuspenseWrapper } from "./components/suspense-wrapper.tsx";

// 401, 400, 404, 500 页面
export const Exception401 = React.lazy(
  () => import("../pages/exception/401.tsx"),
);
export const Exception400 = React.lazy(
  () => import("../pages/exception/400.tsx"),
);
export const Exception404 = React.lazy(
  () => import("../pages/exception/404.tsx"),
);
export const Exception500 = React.lazy(
  () => import("../pages/exception/500.tsx"),
);

export const exceptionRoutes = (
  <>
    <Route
      path="exception/401"
      element={
        <SuspenseWrapper>
          <Exception401 />
        </SuspenseWrapper>
      }
    />
    <Route
      path="exception/400"
      element={
        <SuspenseWrapper>
          <Exception400 />
        </SuspenseWrapper>
      }
    />
    <Route
      path="exception/404"
      element={
        <SuspenseWrapper>
          <Exception404 />
        </SuspenseWrapper>
      }
    />
    <Route
      path="exception/500"
      element={
        <SuspenseWrapper>
          <Exception500 />
        </SuspenseWrapper>
      }
    />
  </>
);

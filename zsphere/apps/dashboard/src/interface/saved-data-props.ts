import type { Layouts } from "react-grid-layout";

import type { WidgetsProps } from "./widgets-props";

export interface SavedDataProps {
  layouts: Layouts;
  widgets: WidgetsProps[];
}

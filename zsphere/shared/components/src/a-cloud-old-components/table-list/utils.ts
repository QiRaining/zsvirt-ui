import React from "react";

export function hasNestedClickable(event: React.MouseEvent) {
  for (const elem of event.nativeEvent.composedPath()) {
    if (elem === event.currentTarget) {
      break;
    }
    if (
      elem instanceof Element &&
      elem.matches("[role=button],[role=link],button,input,a")
    ) {
      return true;
    }
  }
  return false;
}

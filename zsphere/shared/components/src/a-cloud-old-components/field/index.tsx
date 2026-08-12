import React from "react";

import Group from "./group";
import Horizontal from "./horizontal";
import { IField } from "./type";
import Vertical from "./vertical";

const Field: IField = ({ type = "horizontal", ...props }) => {
  switch (type) {
    case "horizontal":
      return <Horizontal {...props} />;
    case "vertical":
      return <Vertical {...props} />;
    default:
      const _type: never = type;

      return _type;
  }
};

Field.displayName = "Field";

Field.Vertical = Vertical;
Field.Horizontal = Horizontal;
Field.Group = Group;

export type { IFieldProps } from "./type";
export default Field;

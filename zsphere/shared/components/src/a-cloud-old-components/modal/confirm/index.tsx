import React from "react";

import "./style.less";
import { IConfirmModalProps } from "./types";
import ZsvConfirm from "./zsv";

const Confirm: React.FC<IConfirmModalProps> = (props) => (
  <ZsvConfirm {...props} />
);

export default Confirm;

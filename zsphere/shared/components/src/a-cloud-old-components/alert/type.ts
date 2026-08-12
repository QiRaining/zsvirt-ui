import { AlertProps } from "antd/es/alert";
import React from "react";

export interface IAlertProps extends AlertProps {
  display: "strong" | "standard" | "weak" | "overall" | "blockStrong";
  guideAction?: {
    text: React.ReactNode;
    onClick?: () => void;
  };
  extraAction?: React.ReactNode;
}

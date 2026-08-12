import { ReactNode, isValidElement } from "react";

export const extractTextFromReactNode = (node: ReactNode): string => {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(extractTextFromReactNode).join("");
  }

  if (isValidElement(node)) {
    return extractTextFromReactNode(node.props.children);
  }

  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }

  return "";
};

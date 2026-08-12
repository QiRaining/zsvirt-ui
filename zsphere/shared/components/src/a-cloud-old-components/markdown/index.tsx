import React from "react";
import ReactMarkdown, { ReactMarkdownProps } from "react-markdown";
import ReactMarkdownWithHtml from "react-markdown/with-html";

import { getBaseCls } from "../../_utils/common";

import "./style.less";

const baseCls = getBaseCls("react-markdown");
const Markdown: React.FC<ReactMarkdownProps> = (props) => (
  <ReactMarkdown {...props} className={`${baseCls}`} />
);

const MarkdownWithHtml: React.FC<ReactMarkdownProps> = (props) => (
  <ReactMarkdownWithHtml {...props} className={`${baseCls}`} />
);

export { Markdown as default, MarkdownWithHtml };

"use client";
import { cn } from "@zstack/utils";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import "github-markdown-css/github-markdown-light.css";

const Markdown: typeof ReactMarkdown = (props) => {
  const { className, ...rest } = props;
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={cn(
        "[&>table]:my-4 [&>table]:w-full [&>table]:border-collapse [&>table>tbody>tr:nth-child(even)]:bg-neutral-100 [&>table>tbody>tr>td]:border [&>table>tbody>tr>td]:border-neutral-300 [&>table>tbody>tr>td]:p-2 [&>table>thead>tr>th]:border [&>table>thead>tr>th]:border-neutral-300 [&>table>thead>tr>th]:bg-neutral-100 [&>table>thead>tr>th]:p-2",
        className,
      )}
      {...rest}
    />
  );
};

const DocMarkdown: typeof ReactMarkdown = (props) => {
  const { className, ...rest } = props;
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={cn(
        "[&>h3]:!text-sm" +
          "[&>h1]:m-0 [&>h2]:m-0 [&>h3]:m-0 " +
          "[&>h4]:m-0 [&>h5]:m-0 [&>h6]:m-0 " +
          "[&>ol]:list-outside [&>ol]:list-decimal [&>ol]:ps-3.5 " +
          "[&>ul]:list-outside [&>ul]:list-disc [&>ul]:ps-3.5 " +
          // Nested lists
          "[&_li>ol]:list-outside [&_li>ol]:list-decimal [&_li>ol]:ps-3.5 " +
          "[&_li>ul]:list-outside [&_li>ul]:list-disc [&_li>ul]:ps-3.5 " +
          "[&>ol]:m-0 [&>p]:m-0 [&>ul]:m-0 " +
          "[&_li>p]:m-0",
        className,
      )}
      {...rest}
    />
  );
};

/**
 * MarkdownWithHtml - 支持渲染 HTML 标签的 Markdown 组件
 *
 * 使用 rehype-raw 插件来解析和渲染 Markdown 中内嵌的 HTML 标签。
 * 适用于需要渲染包含 HTML 内容的 Markdown 文本，如模型介绍等场景。
 *
 * ⚠️ 安全提示：此组件会渲染原始 HTML，请确保内容来源可信。
 */
const MarkdownWithHtml: typeof ReactMarkdown = (props) => {
  const { className, ...rest } = props;
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      className={cn(
        "[&>table]:my-4 [&>table]:w-full [&>table]:border-collapse [&>table>tbody>tr:nth-child(even)]:bg-neutral-100 [&>table>tbody>tr>td]:border [&>table>tbody>tr>td]:border-neutral-300 [&>table>tbody>tr>td]:p-2 [&>table>thead>tr>th]:border [&>table>thead>tr>th]:border-neutral-300 [&>table>thead>tr>th]:bg-neutral-100 [&>table>thead>tr>th]:p-2",
        className,
      )}
      {...rest}
    />
  );
};

/**
 * GithubMarkdown - GitHub 风格的 Markdown 渲染组件
 *
 * 使用 github-markdown-css 提供完整的 GitHub Markdown 样式，
 * 包括标题、列表、表格、代码块、引用等所有元素的样式。
 * 同时支持渲染 HTML 标签。
 *
 * 适用于模型介绍、文档展示等需要完整 Markdown 样式的场景。
 *
 * ⚠️ 安全提示：此组件会渲染原始 HTML，请确保内容来源可信。
 */
const GithubMarkdown: typeof ReactMarkdown = (props) => {
  const { className, ...rest } = props;
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      className={cn("markdown-body", className)}
      {...rest}
    />
  );
};

export { Markdown, DocMarkdown, MarkdownWithHtml, GithubMarkdown };

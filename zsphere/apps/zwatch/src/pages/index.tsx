import React from "react";

/**
 * 应用入口页面
 * 这个文件会被 Module Federation 暴露给其他应用使用
 */
const IndexPage: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-semibold">应用首页</h1>
      <p>这是应用的入口页面，可以通过 Module Federation 被其他应用加载。</p>
    </div>
  );
};

export default IndexPage;

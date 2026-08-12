import React from "react";

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="text-lg text-neutral-600">页面未找到</p>
      </div>
    </div>
  );
};

export default NotFoundPage;

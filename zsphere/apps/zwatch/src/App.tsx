import React from "react";

// import ExampleButton from "./components/ExampleButton";
import { useExample } from "./hooks/use-example";
import { useAppStore } from "./store/use-app-store";

const App: React.FC = () => {
  const { _count, _increment, _decrement, _reset } = useExample({
    initialValue: 0,
    min: 0,
    max: 10,
  });
  const { appName } = useAppStore();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="mb-4 text-3xl font-bold">{appName}</h1>
      <p className="mb-8 text-neutral-600">这是一个标准的 ZSV 微前端应用模板</p>

      <div className="mb-6 rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">示例：自定义 Hook</h2>
        <div className="mb-4 flex items-center gap-4">
          {/* <ExampleButton variant="secondary" onClick={decrement}>
            -
          </ExampleButton>
          <span className="text-2xl font-bold min-w-[3rem] text-center">
            {count}
          </span>
          <ExampleButton variant="primary" onClick={increment}>
            +
          </ExampleButton>
          <ExampleButton variant="danger" onClick={reset}>
            重置
          </ExampleButton> */}
        </div>
      </div>

      <div className="text-sm text-neutral-500">
        <p>查看 README.md 了解如何使用此模板</p>
      </div>
    </div>
  );
};

export default App;

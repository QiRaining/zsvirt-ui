import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, it, expect } from "vitest";

import { DialogWeak } from "../src";

// 测试工具函数：包装 IntlProvider
const renderWithIntl = (ui: React.ReactElement) => {
  return render(
    <IntlProvider locale="zh" messages={{}}>
      {ui}
    </IntlProvider>,
  );
};

describe("DialogWeak", () => {
  it("renders with title and description", () => {
    renderWithIntl(
      <DialogWeak
        visible={true}
        setVisible={() => {}}
        title="测试标题"
        description="测试描述"
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByText("测试标题")).toBeInTheDocument();
    expect(screen.getByText("测试描述")).toBeInTheDocument();
  });
});

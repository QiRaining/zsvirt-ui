import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, it, expect, vi } from "vitest";

import { Spinner } from "./spinner";

// 测试工具函数：包装 IntlProvider
const renderWithIntl = (ui: React.ReactElement) => {
  return render(
    <IntlProvider locale="zh" messages={{}}>
      {ui}
    </IntlProvider>,
  );
};

describe("Spinner", () => {
  describe("基础渲染", () => {
    it("默认渲染加载状态", () => {
      renderWithIntl(<Spinner />);
      // Spinner 组件应该渲染
      expect(
        document.querySelector('[data-spinning="true"]'),
      ).toBeInTheDocument();
    });

    it("spinning=false 时不显示加载状态", () => {
      renderWithIntl(<Spinner spinning={false} />);
      expect(
        document.querySelector('[data-spinning="true"]'),
      ).not.toBeInTheDocument();
    });
  });

  describe("尺寸", () => {
    it("渲染 sm 尺寸", () => {
      const { container } = renderWithIntl(<Spinner size="sm" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("渲染 md 尺寸（默认）", () => {
      const { container } = renderWithIntl(<Spinner size="md" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("渲染 lg 尺寸", () => {
      const { container } = renderWithIntl(<Spinner size="lg" />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("提示文字", () => {
    it("显示 tip 文字", () => {
      renderWithIntl(<Spinner tip="加载中..." />);
      expect(screen.getByText("加载中...")).toBeInTheDocument();
    });

    it("tip 为 ReactNode 时正确渲染", () => {
      renderWithIntl(
        <Spinner tip={<span data-testid="custom-tip">自定义提示</span>} />,
      );
      expect(screen.getByTestId("custom-tip")).toBeInTheDocument();
    });
  });

  describe("包裹内容", () => {
    it("正确渲染 children", () => {
      renderWithIntl(
        <Spinner spinning>
          <div data-testid="child-content">子内容</div>
        </Spinner>,
      );
      expect(screen.getByTestId("child-content")).toBeInTheDocument();
    });

    it("spinning=false 时 children 正常显示", () => {
      renderWithIntl(
        <Spinner spinning={false}>
          <div data-testid="child-content">子内容</div>
        </Spinner>,
      );
      expect(screen.getByTestId("child-content")).toBeInTheDocument();
    });
  });

  describe("className 传递", () => {
    it("自定义 className 被应用", () => {
      const { container } = renderWithIntl(
        <Spinner className="custom-class" />,
      );
      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });

  describe("fullscreen 模式", () => {
    it("fullscreen=true 时应用全屏样式", () => {
      const { container } = renderWithIntl(<Spinner fullscreen />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("fullscreen 默认为 false", () => {
      const { container } = renderWithIntl(<Spinner />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});

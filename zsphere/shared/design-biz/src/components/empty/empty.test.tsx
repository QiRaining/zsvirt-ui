import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, it, expect } from "vitest";

import {
  Empty,
  ConfigEmptyProvider,
  customRenderEmpty,
  useEmptyConfig,
} from "./empty";

// 测试工具函数：包装 IntlProvider
const renderWithIntl = (ui: React.ReactElement) => {
  return render(
    <IntlProvider locale="zh" messages={{}}>
      {ui}
    </IntlProvider>,
  );
};

describe("Empty", () => {
  describe("基础渲染", () => {
    it("默认渲染 Table 类型", () => {
      renderWithIntl(<Empty />);
      expect(screen.getByText("暂无数据")).toBeInTheDocument();
    });

    it("渲染 Select 类型", () => {
      renderWithIntl(<Empty type="Select" />);
      expect(screen.getByText("暂无数据")).toBeInTheDocument();
    });
  });

  describe("描述文字", () => {
    it("显示自定义描述", () => {
      renderWithIntl(<Empty description="没有找到数据" />);
      expect(screen.getByText("没有找到数据")).toBeInTheDocument();
    });

    it("description 为 ReactNode 时正确渲染", () => {
      renderWithIntl(
        <Empty
          description={<span data-testid="custom-desc">自定义描述</span>}
        />,
      );
      expect(screen.getByTestId("custom-desc")).toBeInTheDocument();
    });
  });

  describe("加载状态", () => {
    it("loading + isFirst 时不显示描述", () => {
      renderWithIntl(<Empty loading isFirst />);
      expect(screen.queryByText("暂无数据")).not.toBeInTheDocument();
    });

    it("loading 但非 isFirst 时显示描述", () => {
      renderWithIntl(<Empty loading isFirst={false} />);
      expect(screen.getByText("暂无数据")).toBeInTheDocument();
    });

    it("非 loading 时显示描述", () => {
      renderWithIntl(<Empty loading={false} />);
      expect(screen.getByText("暂无数据")).toBeInTheDocument();
    });
  });

  describe("自定义图片", () => {
    it("渲染自定义图片", () => {
      renderWithIntl(
        <Empty
          image={<img data-testid="custom-image" src="test.png" alt="test" />}
        />,
      );
      expect(screen.getByTestId("custom-image")).toBeInTheDocument();
    });
  });

  describe("className 和 style", () => {
    it("自定义 className 被应用", () => {
      const { container } = renderWithIntl(<Empty className="custom-empty" />);
      expect(container.querySelector(".custom-empty")).toBeInTheDocument();
    });

    it("自定义 style 被应用", () => {
      const { container } = renderWithIntl(
        <Empty style={{ backgroundColor: "red" }} />,
      );
      expect(container.firstChild).toHaveStyle({ backgroundColor: "red" });
    });
  });

  describe("children", () => {
    it("正确渲染 children", () => {
      renderWithIntl(
        <Empty>
          <button data-testid="action-btn">添加数据</button>
        </Empty>,
      );
      expect(screen.getByTestId("action-btn")).toBeInTheDocument();
    });
  });
});

describe("ConfigEmptyProvider", () => {
  it("提供默认配置", () => {
    const TestComponent = () => {
      const config = useEmptyConfig();
      return <div data-testid="config">{config.type || "no-type"}</div>;
    };

    renderWithIntl(
      <ConfigEmptyProvider type="Select">
        <TestComponent />
      </ConfigEmptyProvider>,
    );

    expect(screen.getByTestId("config")).toHaveTextContent("Select");
  });
});

describe("customRenderEmpty", () => {
  it("渲染 Table 类型空状态", () => {
    const { container } = renderWithIntl(
      <>{customRenderEmpty({ type: "Table" })}</>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it("渲染 Select 类型空状态", () => {
    const { container } = renderWithIntl(
      <>{customRenderEmpty({ type: "Select" })}</>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it("传递自定义描述", () => {
    renderWithIntl(<>{customRenderEmpty({ description: "自定义空状态" })}</>);
    expect(screen.getByText("自定义空状态")).toBeInTheDocument();
  });
});

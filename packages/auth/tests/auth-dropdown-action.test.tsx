import { render, screen, fireEvent } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { AuthDropdownAction } from "../src/components/auth-dropdown-action";
import { useAuth } from "../src/hooks/use-auth";

import "@testing-library/jest-dom";

// Mock useAuth hook
vi.mock("../src/hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

describe("AuthDropdownAction", () => {
  const mockActionConfig = {
    viewMap: [
      {
        view: "test-view",
        activeKeys: ["action1", "action2"],
        extraKeys: ["action3"],
      },
    ],
    actions: [
      {
        key: "action1",
        resource: "test",
        authKey: "test.action1",
        i18nKey: "action1.key",
        name: "Action 1",
        icon: "alarm",
        dividerKey: 0,
      },
      {
        key: "action2",
        resource: "test",
        authKey: "test.action2",
        i18nKey: "action2.key",
        name: "Action 2",
        icon: "all",
        dividerKey: 1,
      },
      {
        key: "action3",
        resource: "test",
        authKey: "test.action3",
        i18nKey: "action3.key",
        name: "Action 3",
        icon: "archive",
        dividerKey: 0,
        primary: true,
      },
    ],
  };

  const mockCustomActionConfig = [
    {
      key: "action1",
      onClick: vi.fn(),
    },
  ];

  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      hasAuth: () => true,
      hasLicenseExpired: () => false,
    });
  });

  const renderComponent = () => {
    return render(
      <IntlProvider messages={{}} locale="en">
        <AuthDropdownAction
          actionConfig={mockActionConfig}
          customActionConfig={mockCustomActionConfig}
          view="test-view"
          selectedList={[{ id: 1 }]}
          refetch={vi.fn()}
        />
      </IntlProvider>,
    );
  };

  it("应该正确渲染带有权限的动作按钮", () => {
    renderComponent();

    // 点击下拉按钮打开菜单
    const dropdownButton = screen.getByTestId("more-actions-dropdown-button");
    fireEvent.keyDown(dropdownButton, { key: "ArrowDown" });

    expect(screen.getByText("Action 1")).toBeInTheDocument();
    expect(screen.getByText("Action 2")).toBeInTheDocument();
    expect(screen.getByText("Action 3")).toBeInTheDocument();
  });

  it("许可证过期状态不应该禁用动作", () => {
    vi.mocked(useAuth).mockReturnValue({
      hasAuth: () => true,
      hasLicenseExpired: () => true,
    });

    renderComponent();

    const dropdownButton = screen.getByTestId("more-actions-dropdown-button");
    fireEvent.keyDown(dropdownButton, { key: "ArrowDown" });

    const buttons = screen.getAllByRole("menuitem");
    buttons.forEach((button) => {
      expect(button).not.toHaveAttribute("aria-disabled", "true");
    });
  });

  it("当没有选中项时应该禁用动作", () => {
    render(
      <IntlProvider messages={{}} locale="en">
        <AuthDropdownAction
          actionConfig={mockActionConfig}
          customActionConfig={mockCustomActionConfig}
          view="test-view"
          selectedList={[]}
          refetch={vi.fn()}
        />
      </IntlProvider>,
    );

    const dropdownButton = screen.getByTestId("more-actions-dropdown-button");
    fireEvent.keyDown(dropdownButton, { key: "ArrowDown" });

    const buttons = screen.getAllByRole("menuitem");
    buttons.forEach((button) => {
      expect(button).toHaveAttribute("aria-disabled", "true");
    });
  });

  it("应该正确处理自定义点击事件", () => {
    const mockOnClick = vi.fn();
    const customConfig = [
      {
        key: "action3",
        onClick: mockOnClick,
      },
    ];

    render(
      <IntlProvider messages={{}} locale="en">
        <AuthDropdownAction
          actionConfig={mockActionConfig}
          customActionConfig={customConfig}
          view="test-view"
          selectedList={[{ id: 1 }]}
          refetch={vi.fn()}
        />
      </IntlProvider>,
    );

    const actionButton = screen.getByText("Action 3");
    fireEvent.click(actionButton);
    expect(mockOnClick).toHaveBeenCalled();
  });

  it("应该根据权限过滤动作", () => {
    vi.mocked(useAuth).mockReturnValue({
      hasAuth: (_authKey?: {
        type: "block" | "action" | "view";
        authKey: string;
        resource: string;
      }) => _authKey?.authKey !== "test.action2",
      hasLicenseExpired: () => false,
    });

    renderComponent();

    const dropdownButton = screen.getByTestId("more-actions-dropdown-button");
    fireEvent.keyDown(dropdownButton, { key: "ArrowDown" });

    expect(screen.queryByText("Action 2")).not.toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import {
  normalizeStatementMarkdown,
  TelemetryConsentDialog,
} from "../components/telemetry-consent-dialog";
import type { ValidTelemetrySettingInventory } from "../consent-state";

interface MockButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: string;
}

interface MockCheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  onCheckedChange?: (checked: boolean) => void;
}

vi.mock("@zstack/design", () => ({
  Alert: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Button: ({
    children,
    disabled,
    loading: _loading,
    variant: _variant,
    ...props
  }: MockButtonProps) => (
    <button type="button" disabled={disabled} {...props}>
      {children}
    </button>
  ),
  Checkbox: forwardRef<HTMLInputElement, MockCheckboxProps>(
    ({ checked = false, disabled, onCheckedChange }, ref) => (
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        aria-label="agreement"
        disabled={disabled}
        onChange={() => onCheckedChange?.(!checked)}
      />
    ),
  ),
  MarkdownWithHtml: ({ children }: { children: ReactNode }) => (
    <div data-testid="markdown">{children}</div>
  ),
}));

vi.mock("@zstack/zsphere-design-biz", () => ({
  DialogBase: ({
    children,
    footer,
    setVisible,
    title,
    visible,
  }: {
    children: ReactNode;
    footer: ReactNode;
    setVisible: (visible: boolean) => void;
    title: ReactNode;
    visible: boolean;
  }) =>
    visible ? (
      <div role="dialog" aria-label={String(title)}>
        <button type="button" onClick={() => setVisible(false)}>
          close
        </button>
        {children}
        {footer}
      </div>
    ) : null,
  Spinner: () => <div>loading</div>,
}));

const settings: ValidTelemetrySettingInventory = {
  descriptionKey: "telemetry.setting.description",
  privacyPolicyUrl: "https://example.com/privacy",
};

const baseProps = {
  settings,
  settingsLoading: false,
  settingsError: null,
  actionError: null,
  submitting: false,
  onJoin: vi.fn(),
  onDefer: vi.fn(),
  onRetrySettings: vi.fn(),
};

const renderDialog = (
  props: Partial<Parameters<typeof TelemetryConsentDialog>[0]> = {},
) =>
  render(
    <IntlProvider
      locale="en-US"
      messages={{
        "personal.information.authorization.letter.title":
          "Data Collection Statement",
        "telemetry.dialog.privacyAgreement": "Data Collection Statement",
        "zstack.personal.information.authorization.letter.content":
          "Local data collection statement from Jira.",
      }}
    >
      <TelemetryConsentDialog visible {...baseProps} {...props} />
    </IntlProvider>,
  );

describe("TelemetryConsentDialog", () => {
  it("requires explicit agreement before joining", () => {
    const onJoin = vi.fn();
    renderDialog({ onJoin });

    const joinButton = screen.getByRole("button", {
      name: "Join the Improvement Program",
    }) as HTMLButtonElement;

    expect(joinButton.disabled).toBe(true);

    fireEvent.click(screen.getByRole("checkbox", { name: "agreement" }));

    expect(joinButton.disabled).toBe(false);
    fireEvent.click(joinButton);
    expect(onJoin).toHaveBeenCalledOnce();
  });

  it("resets the agreement whenever the dialog is reopened", () => {
    const view = renderDialog();
    const checkbox = screen.getByRole("checkbox", {
      name: "agreement",
    }) as HTMLInputElement;

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);

    view.rerender(
      <IntlProvider locale="en-US">
        <TelemetryConsentDialog visible={false} {...baseProps} />
      </IntlProvider>,
    );
    view.rerender(
      <IntlProvider locale="en-US">
        <TelemetryConsentDialog visible {...baseProps} />
      </IntlProvider>,
    );

    expect(
      (
        screen.getByRole("checkbox", {
          name: "agreement",
        }) as HTMLInputElement
      ).checked,
    ).toBe(false);
  });

  it("treats normal close as defer and blocks close while submitting", () => {
    const onDefer = vi.fn();
    const view = renderDialog({ onDefer });

    fireEvent.click(screen.getByRole("button", { name: "close" }));
    expect(onDefer).toHaveBeenCalledOnce();

    view.rerender(
      <IntlProvider locale="en-US">
        <TelemetryConsentDialog
          visible
          {...baseProps}
          submitting
          onDefer={onDefer}
        />
      </IntlProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "close" }));

    expect(onDefer).toHaveBeenCalledOnce();
  });

  it("disables every consent control while submitting", () => {
    const view = renderDialog();
    const checkbox = screen.getByRole("checkbox", {
      name: "agreement",
    }) as HTMLInputElement;

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);

    view.rerender(
      <IntlProvider locale="en-US">
        <TelemetryConsentDialog visible {...baseProps} submitting />
      </IntlProvider>,
    );

    expect(
      (
        screen.getByRole("checkbox", {
          name: "agreement",
        }) as HTMLInputElement
      ).disabled,
    ).toBe(true);
    expect(
      (
        screen.getByRole("button", {
          name: "Remind Me Later",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(
      (
        screen.getByRole("button", {
          name: "Join the Improvement Program",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });

  it("opens the local data collection statement instead of the backend privacy URL", () => {
    renderDialog();

    expect(
      document.querySelector('a[href="https://example.com/privacy"]'),
    ).toBeNull();
    expect(
      document.querySelector('a[href="https://www.zstack.io/user-agreement"]'),
    ).toBeNull();
    expect(screen.queryByRole("link", { name: "User Agreement" })).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: "Data Collection Statement" }),
    );

    expect(
      screen.getByRole("dialog", { name: "Data Collection Statement" }),
    ).toBeTruthy();
    expect(
      screen.getByText("Local data collection statement from Jira."),
    ).toBeTruthy();
  });

  it("normalizes accidental code-block indentation from the statement copy", () => {
    expect(
      normalizeStatementMarkdown(
        "正文\n\n    **若您与我们就本声明发生任何争议或纠纷**本声明的成立。",
      ),
    ).toBe(
      "正文\n\n<strong>若您与我们就本声明发生任何争议或纠纷</strong>本声明的成立。",
    );
  });

  it("normalizes strong markers that CommonMark cannot parse next to CJK text", () => {
    expect(
      normalizeStatementMarkdown(
        "**感谢您信任并选择使用ZSvirt开源软件！**本声明由本软件**每日生成**报告。",
      ),
    ).toBe(
      "<strong>感谢您信任并选择使用ZSvirt开源软件！</strong>本声明由本软件<strong>每日生成</strong>报告。",
    );
  });
});

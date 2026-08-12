import { render } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Exception401 from "./401";

interface ExceptionBaseTestProps {
  secondaryAction?: {
    label: string;
    to?: string;
    onClick?: () => void;
  };
}

let capturedProps: ExceptionBaseTestProps | undefined;

vi.mock("@zstack/zsphere-platform-store", () => ({
  usePlatformStore: (
    selector: (state: { currentUser: { sessionId: string } }) => unknown,
  ) => selector({ currentUser: { sessionId: "old-session" } }),
}));

vi.mock("react-intl", () => ({
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage: string }) =>
      defaultMessage,
  }),
}));

vi.mock("./exception-base", () => ({
  default: (props: ExceptionBaseTestProps) => {
    capturedProps = props;
    return <button>{props.secondaryAction?.label}</button>;
  },
}));

describe("Exception401", () => {
  beforeEach(() => {
    capturedProps = undefined;
  });

  it("uses an explicit relogin handler instead of an in-app login link", () => {
    render(<Exception401 />);

    expect(capturedProps?.secondaryAction?.to).toBeUndefined();
    expect(capturedProps?.secondaryAction?.onClick).toEqual(
      expect.any(Function),
    );
  });
});

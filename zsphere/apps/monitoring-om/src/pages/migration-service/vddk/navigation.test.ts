import { describe, expect, it } from "vitest";

import {
  consumeUploadVddkAction,
  shouldOpenUploadVddkDialog,
} from "./navigation";

describe("VDDK deep link", () => {
  it("opens the upload dialog for action=upload-vddk", () => {
    expect(
      shouldOpenUploadVddkDialog(
        new URLSearchParams("tab=service&action=upload-vddk"),
      ),
    ).toBe(true);
  });

  it("consumes only the VDDK action parameter", () => {
    const next = consumeUploadVddkAction(
      new URLSearchParams("tab=overview&action=upload-vddk&source=guard"),
    );

    expect(next.toString()).toBe("tab=overview&source=guard");
  });
});

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

const OFFICIAL_VDDK_MD5 = "007ab979e52f52401f02278b75ab5c74";

const hookMocks = vi.hoisted(() => {
  const submitHandle = vi.fn(async () => null);
  return {
    submitHandle,
    useUploadPackage: vi.fn((_config: Record<string, unknown>) => ({
      submitHandle,
    })),
  };
});

const md5Mocks = vi.hoisted(() => ({
  calculateFileMd5: vi.fn<() => Promise<string>>(),
}));

const formMocks = vi.hoisted(() => {
  const state: {
    selectedFile: File | null;
    rules: Array<{
      required?: boolean;
      message?: string;
      validator?: (rule: unknown, value: File | null) => Promise<void>;
    }>;
  } = {
    selectedFile: null,
    rules: [],
  };

  const form = {
    resetFields: vi.fn(),
    validateFields: vi.fn(async () => {
      for (const rule of state.rules) {
        if (rule.required && !state.selectedFile) {
          throw new Error(rule.message);
        }
        await rule.validator?.({}, state.selectedFile);
      }
      return {
        dragger: state.selectedFile,
        uploadMethod: "local",
      };
    }),
  };

  return { form, state };
});

const dialogMocks = vi.hoisted(() => ({
  latestProps: null as null | { confirmLoading?: boolean },
}));

const fileSelectMocks = vi.hoisted(() => ({
  fileName: "VMware-vix-disklib.tar.gz",
  latestProps: null as null | {
    accept?: string;
    className?: string;
  },
}));

vi.mock("@zstack/zsphere-hooks", () => ({
  useUploadPackage: hookMocks.useUploadPackage,
}));

vi.mock("./vddk-md5", () => ({
  calculateFileMd5: md5Mocks.calculateFileMd5,
}));

vi.mock("@zstack/zsphere-components", () => {
  const FormComponent = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  );
  const FormItem = ({
    children,
    name,
    rules = [],
  }: {
    children?: React.ReactNode;
    name?: string;
    rules?: typeof formMocks.state.rules;
  }) => {
    const [errorMessage, setErrorMessage] = React.useState("");
    if (name === "dragger") {
      formMocks.state.rules = rules;
    }
    if (
      !React.isValidElement<{ onChange?: (file: File | null) => void }>(
        children,
      )
    ) {
      return <div>{children}</div>;
    }

    const originalOnChange = children.props.onChange;
    return (
      <div>
        {React.cloneElement(children, {
          onChange: (file: File | null) => {
            originalOnChange?.(file);
            void (async () => {
              for (const rule of rules) {
                if (rule.required && !file) {
                  throw new Error(rule.message);
                }
                await rule.validator?.({}, file);
              }
            })().then(
              () => setErrorMessage(""),
              (error: unknown) =>
                setErrorMessage(
                  error instanceof Error ? error.message : String(error),
                ),
            );
          },
        })}
        {errorMessage && <span role="alert">{errorMessage}</span>}
      </div>
    );
  };
  const Form = Object.assign(FormComponent, {
    Item: FormItem,
    useForm: () => [formMocks.form],
  });

  return {
    Form,
    Upload: {
      Select: ({
        accept,
        className,
        onChange,
      }: {
        accept?: string;
        className?: string;
        onChange: (file: File) => void;
      }) => {
        fileSelectMocks.latestProps = {
          accept,
          className,
        };
        return (
          <button
            type="button"
            onClick={() => {
              const file = new File(["vddk"], fileSelectMocks.fileName);
              formMocks.state.selectedFile = file;
              onChange(file);
            }}
          >
            select-vddk
          </button>
        );
      },
    },
  };
});

vi.mock("@zstack/zsphere-design-biz", () => ({
  DialogForm: ({
    alertMessage,
    children,
    confirmLoading,
    form,
    onOk,
    title,
  }: {
    alertMessage: React.ReactNode;
    children: React.ReactNode;
    confirmLoading?: boolean;
    form: typeof formMocks.form;
    onOk: (data: Record<string, unknown>) => Promise<void>;
    title: string;
  }) => {
    dialogMocks.latestProps = { confirmLoading };
    return (
      <section>
        <h1>{title}</h1>
        <div>{alertMessage}</div>
        {children}
        <button
          type="button"
          disabled={confirmLoading}
          onClick={() => {
            void form
              .validateFields()
              .then((values) => onOk(values))
              .catch(() => null);
          }}
        >
          submit-vddk
        </button>
      </section>
    );
  },
}));

import UploadVddkDialog from ".";

describe("UploadVddkDialog", () => {
  beforeEach(() => {
    hookMocks.submitHandle.mockReset();
    hookMocks.submitHandle.mockResolvedValue(null);
    hookMocks.useUploadPackage.mockClear();
    md5Mocks.calculateFileMd5.mockReset();
    md5Mocks.calculateFileMd5.mockResolvedValue(OFFICIAL_VDDK_MD5);
    formMocks.state.selectedFile = null;
    formMocks.state.rules = [];
    formMocks.form.resetFields.mockClear();
    formMocks.form.validateFields.mockClear();
    dialogMocks.latestProps = null;
    fileSelectMocks.fileName = "VMware-vix-disklib.tar.gz";
    fileSelectMocks.latestProps = null;
  });

  it("lets the system picker select gzip files with the standard form width", () => {
    render(
      <IntlProvider locale="zh-CN" onError={vi.fn()}>
        <UploadVddkDialog visible setVisible={vi.fn()} />
      </IntlProvider>,
    );

    expect(fileSelectMocks.latestProps).toMatchObject({
      className: "width-320",
    });
    expect(fileSelectMocks.latestProps?.accept).toContain(".gz");
  });

  it("rejects a gzip file that is not a tar.gz package before hashing", async () => {
    fileSelectMocks.fileName = "VMware-vix-disklib.gz";

    render(
      <IntlProvider locale="zh-CN" onError={vi.fn()}>
        <UploadVddkDialog visible setVisible={vi.fn()} />
      </IntlProvider>,
    );

    fireEvent.click(screen.getByText("select-vddk"));

    expect((await screen.findByRole("alert")).textContent).toBe(
      "The VDDK package file must end with .tar.gz.",
    );
    expect(md5Mocks.calculateFileMd5).not.toHaveBeenCalled();
  });

  it("reuses useUploadPackage without session or hashcheck recovery", async () => {
    render(
      <IntlProvider locale="zh-CN" onError={vi.fn()}>
        <UploadVddkDialog visible setVisible={vi.fn()} />
      </IntlProvider>,
    );

    expect(screen.getByText("Upload VDDK")).toBeTruthy();
    expect(
      screen.getByText(
        "VMware licensing requires users to obtain and upload the VDDK component. We recommend VMware Virtual Disk Development Kit (VDDK) 8.0.3 for Linux.",
      ),
    ).toBeTruthy();

    fireEvent.click(screen.getByText("select-vddk"));
    await waitFor(() => {
      expect(screen.getByText("submit-vddk")).toHaveProperty("disabled", false);
    });
    fireEvent.click(screen.getByText("submit-vddk"));

    await waitFor(() => {
      expect(hookMocks.submitHandle).toHaveBeenCalledWith(
        expect.objectContaining({ uploadMethod: "local" }),
        expect.objectContaining({ name: "VMware-vix-disklib.tar.gz" }),
      );
    });

    expect(hookMocks.useUploadPackage).toHaveBeenCalledWith(
      expect.objectContaining({
        jobName: "APIUploadSoftwarePackageToVmMsg",
        recovery: { mode: "memory" },
        uploadType: "migrationServicePackage",
      }),
    );
    const uploadConfig = hookMocks.useUploadPackage.mock.calls[0][0];
    expect(uploadConfig).not.toHaveProperty("hashCheckEndpoint");
    expect(uploadConfig).not.toHaveProperty("registerSession");
    expect(uploadConfig).not.toHaveProperty("resumeEnabled");
    expect(uploadConfig).not.toHaveProperty("trackUploadProcess");
    expect(uploadConfig).not.toHaveProperty("throwOnError");
    expect(uploadConfig).not.toHaveProperty("onStart");
    expect(md5Mocks.calculateFileMd5).toHaveBeenCalledTimes(1);
  });

  it("rejects a selected file whose complete MD5 is not the official VDDK package", async () => {
    md5Mocks.calculateFileMd5.mockResolvedValue(
      "00000000000000000000000000000000",
    );

    render(
      <IntlProvider locale="zh-CN" onError={vi.fn()}>
        <UploadVddkDialog visible setVisible={vi.fn()} />
      </IntlProvider>,
    );

    fireEvent.click(screen.getByText("select-vddk"));
    expect(hookMocks.submitHandle).not.toHaveBeenCalled();

    expect((await screen.findByRole("alert")).textContent).toBe(
      "The selected file is incorrect. Select the VMware Virtual Disk Development Kit (VDDK) 8.0.3 for Linux package.",
    );

    await waitFor(() => {
      expect(screen.getByText("submit-vddk")).toHaveProperty("disabled", false);
    });
    fireEvent.click(screen.getByText("submit-vddk"));

    await waitFor(() => {
      expect(formMocks.form.validateFields).toHaveBeenCalledTimes(1);
    });
    expect(hookMocks.submitHandle).not.toHaveBeenCalled();

    const md5Rule = formMocks.state.rules.at(-1);
    await expect(
      md5Rule?.validator?.({}, formMocks.state.selectedFile),
    ).rejects.toThrow(
      "The selected file is incorrect. Select the VMware Virtual Disk Development Kit (VDDK) 8.0.3 for Linux package.",
    );
  });

  it("keeps confirmation disabled until the selected file MD5 finishes", async () => {
    let resolveMd5!: (value: string) => void;
    md5Mocks.calculateFileMd5.mockReturnValue(
      new Promise((resolve) => {
        resolveMd5 = resolve;
      }),
    );

    render(
      <IntlProvider locale="zh-CN" onError={vi.fn()}>
        <UploadVddkDialog visible setVisible={vi.fn()} />
      </IntlProvider>,
    );

    fireEvent.click(screen.getByText("select-vddk"));

    await waitFor(() => {
      expect(dialogMocks.latestProps?.confirmLoading).toBe(true);
    });
    expect(screen.getByText("submit-vddk")).toHaveProperty("disabled", true);

    resolveMd5(OFFICIAL_VDDK_MD5);

    await waitFor(() => {
      expect(dialogMocks.latestProps?.confirmLoading).toBe(false);
    });
  });

  it("notifies the migration page after the VDDK upload process starts", async () => {
    const onUploadStart = vi.fn();

    render(
      <IntlProvider locale="zh-CN" onError={vi.fn()}>
        <UploadVddkDialog
          visible
          setVisible={vi.fn()}
          onUploadStart={onUploadStart}
        />
      </IntlProvider>,
    );

    fireEvent.click(screen.getByText("select-vddk"));
    await waitFor(() => {
      expect(screen.getByText("submit-vddk")).toHaveProperty("disabled", false);
    });
    fireEvent.click(screen.getByText("submit-vddk"));

    await waitFor(() => {
      expect(onUploadStart).toHaveBeenCalledTimes(1);
    });
  });

  it("does not notify the migration page when creating the upload process fails", async () => {
    hookMocks.submitHandle.mockRejectedValueOnce(
      new Error("failed to create upload process"),
    );
    const onUploadStart = vi.fn();

    render(
      <IntlProvider locale="zh-CN" onError={vi.fn()}>
        <UploadVddkDialog
          visible
          setVisible={vi.fn()}
          onUploadStart={onUploadStart}
        />
      </IntlProvider>,
    );

    fireEvent.click(screen.getByText("select-vddk"));
    await waitFor(() => {
      expect(screen.getByText("submit-vddk")).toHaveProperty("disabled", false);
    });
    fireEvent.click(screen.getByText("submit-vddk"));

    await waitFor(() => {
      expect(hookMocks.submitHandle).toHaveBeenCalledTimes(1);
    });
    expect(onUploadStart).not.toHaveBeenCalled();
  });
});

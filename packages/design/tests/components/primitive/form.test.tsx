import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { useForm } from "react-hook-form";
import { describe, it, expect, vi } from "vitest";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
  FormRowContainer,
  FormHint,
} from "../../../src/components/primitive/form";
import { Input } from "../../../src/components/primitive/input";

// 创建一个测试用的表单组件
const TestForm = ({ onSubmit = vi.fn() }) => {
  const form = useForm({
    defaultValues: {
      username: "",
      email: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} data-testid="test-form">
        <FormField
          control={form.control}
          name="username"
          rules={{ required: "用户名不能为空" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel required>用户名</FormLabel>
              <FormControl>
                <Input {...field} data-testid="username-input" />
              </FormControl>
              <FormDescription>请输入您的用户名</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          rules={{
            required: "邮箱不能为空",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "请输入有效的邮箱地址",
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormRowContainer>
                <FormLabel required>邮箱</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="email-input" />
                </FormControl>
              </FormRowContainer>
              <FormHint>输入您的电子邮箱地址</FormHint>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit" data-testid="submit-button">
          提交
        </button>
      </form>
    </Form>
  );
};

describe("Form 组件", () => {
  it("应正确渲染表单及其子组件", () => {
    render(<TestForm />);

    // 检查表单是否被渲染
    expect(screen.getByTestId("test-form")).toBeDefined();

    // 检查输入字段是否被渲染
    expect(screen.getByTestId("username-input")).toBeDefined();
    expect(screen.getByTestId("email-input")).toBeDefined();

    // 检查标签是否被渲染
    expect(screen.getByText("用户名")).toBeDefined();
    expect(screen.getByText("邮箱")).toBeDefined();

    // 检查描述是否被渲染
    expect(screen.getByText("请输入您的用户名")).toBeDefined();
    expect(screen.getByText("输入您的电子邮箱地址")).toBeDefined();

    // 检查必填标记是否被渲染
    const requiredIndicators = screen.getAllByText("*");
    expect(requiredIndicators.length).toBe(2);
  });

  it("应在表单提交时调用onSubmit回调", async () => {
    const handleSubmit = vi.fn();
    render(<TestForm onSubmit={handleSubmit} />);

    // 填写表单
    const usernameInput = screen.getByTestId("username-input");
    const emailInput = screen.getByTestId("email-input");

    // 使用 await waitFor 包装操作
    await waitFor(() => {
      fireEvent.change(usernameInput, { target: { value: "testuser" } });
    });

    await waitFor(() => {
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    });

    // 提交表单
    await waitFor(() => {
      fireEvent.submit(screen.getByTestId("test-form"));
    });

    // 验证提交回调被调用
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it("应在表单验证失败时显示错误信息", async () => {
    render(<TestForm />);

    // 不填写任何字段直接提交
    await waitFor(() => {
      fireEvent.submit(screen.getByTestId("test-form"));
    });

    // 检查错误消息是否显示
    await waitFor(() => {
      expect(screen.getByText("用户名不能为空")).toBeDefined();
      expect(screen.getByText("邮箱不能为空")).toBeDefined();
    });

    // 填写无效的邮箱格式
    const emailInput = screen.getByTestId("email-input");
    await waitFor(() => {
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    });

    // 再次提交
    await waitFor(() => {
      fireEvent.submit(screen.getByTestId("test-form"));
    });

    // 检查邮箱格式错误消息
    await waitFor(() => {
      expect(screen.getByText("请输入有效的邮箱地址")).toBeDefined();
    });
  });

  it("应正确传递属性到Form元素", () => {
    const TestFormWithClassName = () => {
      const form = useForm();
      return (
        <Form {...form}>
          <form className="custom-form-class" data-testid="form-with-class">
            <FormField
              control={form.control}
              name="test"
              render={() => <div>测试字段</div>}
            />
          </form>
        </Form>
      );
    };

    render(<TestFormWithClassName />);
    const formElement = screen.getByTestId("form-with-class");
    expect(formElement.className).toBe("custom-form-class");
  });

  it("FormRowContainer 应正确应用样式和渲染子元素", () => {
    render(
      <FormRowContainer data-testid="row-container">
        <span>子元素1</span>
        <span>子元素2</span>
      </FormRowContainer>,
    );

    const container = screen.getByTestId("row-container");
    expect(container.className).toContain("flex");
    expect(container.className).toContain("flex-row");
    expect(screen.getByText("子元素1")).toBeDefined();
    expect(screen.getByText("子元素2")).toBeDefined();
  });

  it("FormHint 应正确渲染提示文本和样式", () => {
    render(<FormHint data-testid="form-hint">这是一个提示信息</FormHint>);

    const hint = screen.getByTestId("form-hint");
    expect(hint.textContent).toBe("这是一个提示信息");
    expect(hint.className).toContain("text-neutral-500");
  });
});

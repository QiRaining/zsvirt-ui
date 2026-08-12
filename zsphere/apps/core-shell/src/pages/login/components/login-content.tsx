import {
  Alert,
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
} from "@zstack/design";
import { Icon } from "@zstack/icon";
import type { GetLoginCaptchaResp } from "@zstack/zsphere-types/graphql";
import { Tabs } from "antd";
import React, { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useIntl } from "react-intl";

import type { LoginFormValues } from "../index";
import ThirdPartyLogin from "../third-party-login";

import style from "../style.module.less";

interface LoginContentProps {
  form: UseFormReturn<LoginFormValues>;
  loginLoading: boolean;
  captcha?: GetLoginCaptchaResp;
  alertMessage?: string;
  tabs: { key: string; label: string }[];
  activeTab: string;
  themeConfig?: {
    loginTitle?: string;
  };
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onTabChange: (activeKey: string) => void;
  onRefreshCaptcha: (captchaUuid?: string) => void;
}

const inputContainerClass =
  "flex items-center w-full h-10 rounded-sm border border-solid border-neutral-400 bg-neutral-0 hover:border-theme-600 focus-within:border-theme-600 focus-within:ring-2 focus-within:ring-theme-50 focus-within:ring-offset-0";
const inputClass =
  "flex-1 h-full text-sm text-neutral-700 bg-transparent border-0 outline-none placeholder:text-neutral-500";
const iconContainerClass =
  "flex items-center justify-center w-10 h-full text-neutral-400";

const LoginContent: React.FC<LoginContentProps> = ({
  form,
  loginLoading,
  captcha,
  alertMessage,
  tabs,
  activeTab,
  themeConfig,
  onSubmit,
  onTabChange,
  onRefreshCaptcha,
}) => {
  const intl = useIntl();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={style.loginContainer}>
      <div className={style.login}>
        <Form {...form}>
          <form onSubmit={onSubmit} data-testid="form" className="space-y-4">
            <div className={style.zsvWelcomeTitle}>
              {intl.formatMessage({
                id: "virtualization.welcome.login",
                defaultMessage: "Welcome",
              })}
            </div>
            <div className={style.zsvWelcomeContent}>
              {themeConfig?.loginTitle}
            </div>

            {/* Tabs */}
            <div
              className={style.tab}
              style={{ display: tabs.length <= 1 ? "none" : "block" }}
            >
              <Tabs
                activeKey={activeTab}
                onChange={onTabChange}
                items={tabs.map((tab) => ({
                  key: tab.key,
                  label: tab.label,
                  children: null,
                }))}
              />
            </div>

            {/* Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className={inputContainerClass}>
                      <span className={iconContainerClass}>
                        <Icon className={style.inputPrefixIcon} type="person-fill" />
                      </span>
                      <input
                        {...field}
                        type="text"
                        autoFocus
                        data-testid="username"
                        autoComplete="username"
                        className={inputClass}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className={inputContainerClass}>
                      <span className={iconContainerClass}>
                        <Icon className={style.inputPrefixIcon} type="lock-fill" />
                      </span>
                      <input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        data-testid="password"
                        autoComplete="password"
                        className={`${inputClass} ${style.password}`}
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className={`${iconContainerClass} cursor-pointer`}
                      >
                        {showPassword ? (
                          <Icon className="hover:text-neutral-700" type="eye" />
                        ) : (
                          <Icon className="hover:text-neutral-700" type="eye-off" />
                        )}
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Captcha */}
            {captcha?.captcha && (
              <div className={`flex items-center gap-1 ${style.captcha}`}>
                <FormField
                  control={form.control}
                  name="verifyCode"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={intl.formatMessage({
                            id: "verifycode",
                            defaultMessage: "Authentication Code",
                          })}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div
                  className={style.imgContainer}
                  onClick={() => onRefreshCaptcha(captcha?.captchaUuid)}
                >
                  <img
                    alt="captcha"
                    width="72px"
                    src={`data:image/png;base64,${captcha?.captcha}`}
                  />
                </div>
                <div>
                  <Button
                    onClick={() => onRefreshCaptcha(captcha?.captchaUuid)}
                    variant="primary"
                    icon={<Icon type="refresh" />}
                  />
                </div>
              </div>
            )}

            {/* Alert */}
            {alertMessage && <Alert variant="danger">{alertMessage}</Alert>}

            {/* Submit */}
            <Button
              id="login"
              size="lg"
              variant="primary"
              type="submit"
              disabled={loginLoading}
              className="mt-1 w-full font-bold"
            >
              {/**
               * 使用display属性是为了页面打开的时候就去加载loader icon 否则可能会出现点击后没有icon的情况
               */}
              <Icon
                style={{
                  display: loginLoading ? "inline-block" : "none",
                  verticalAlign: "middle",
                  marginRight: 8,
                }} type="loader"
              />
              {intl.formatMessage({
                id: "virtualization.login",
                defaultMessage: "Login",
              })}
            </Button>
          </form>
        </Form>
        <ThirdPartyLogin />
      </div>
    </div>
  );
};

export default LoginContent;

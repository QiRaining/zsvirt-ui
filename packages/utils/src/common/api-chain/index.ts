import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { get, isNil, isObject } from "lodash-es";

import {
  HttpMethod,
  NextApiParamMapping,
  ResponseMapping,
  ApiConfig,
  ExecuteApiChainPayload,
  ContentType,
} from "./types";

// Template Variable Handling
class TemplateProcessor {
  private static isTemplateString(value: string): boolean {
    return /{{[^}]+}}/.test(value);
  }

  private static extractVariableNames(template: string): string[] {
    const matches = template.match(/{{([^}]+)}}/g) || [];
    return matches.map((match) => match.slice(2, -2));
  }

  static replace(
    template: unknown,
    variables: Record<string, unknown>,
  ): unknown {
    if (typeof template === "string" && this.isTemplateString(template)) {
      const varNames = this.extractVariableNames(template as string);
      for (const varName of varNames) {
        if (!isNil(variables[varName])) {
          return variables[varName];
        }
      }
      return undefined;
    }

    if (Array.isArray(template)) {
      return template.map((item) => this.replace(item, variables));
    }

    if (isObject(template)) {
      return Object.entries(template as Record<string, unknown>).reduce(
        (result, [key, value]) => ({
          ...result,
          [key]: this.replace(value, variables),
        }),
        {},
      );
    }

    return template;
  }
}

// Request Body Formatter
class RequestBodyFormatter {
  static format(
    data: Record<string, unknown>,
    contentType: ContentType,
  ): unknown {
    if (!data) return undefined;

    switch (contentType) {
      case "application/json":
        return data;

      case "application/x-www-form-urlencoded":
        return this.formatUrlEncoded(data);

      case "multipart/form-data":
        return this.formatFormData(data);

      default:
        return data;
    }
  }

  private static formatUrlEncoded(
    data: Record<string, unknown>,
  ): URLSearchParams {
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
    return params;
  }

  private static formatFormData(data: Record<string, unknown>): FormData {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value as string | Blob);
      }
    });
    return formData;
  }
}

const DEFAULT_TIMEOUT = 15 * 1000; // 设置 15s 的超时时间

export class ApiChainService {
  private variables: Record<string, unknown> = {};
  private lastResponse: unknown = null;

  constructor() {}

  private resetState() {
    this.variables = {};
    this.lastResponse = null;
  }

  async executeApis({
    apis,
    globalVars = {},
  }: ExecuteApiChainPayload): Promise<string | boolean | number | unknown> {
    try {
      // 在每次执行开始时重置状态
      this.resetState();

      for (let i = 0; i < apis.length; i++) {
        await this.executeApi(apis[i], i === apis.length - 1, globalVars);
      }
      return this.lastResponse;
    } catch (error) {
      if (error && typeof error === "object" && "errMsg" in error) {
        throw error;
      }
      throw {
        errMsg: "Internal client error",
      };
    }
  }

  private async executeApi(
    api: ApiConfig,
    isLastApi: boolean,
    globalVars: Record<string, unknown>,
  ): Promise<void> {
    const {
      method,
      url,
      data,
      params,
      headers,
      nextApiParamMappings,
      responseMapping,
      apiName,
    } = api;

    const requestConfig = this.prepareRequestConfig(
      method,
      url,
      data,
      params,
      headers,
      globalVars,
    );

    const response = await this.executeRequest(apiName, requestConfig);
    this.processResponse(apiName, response.data, responseMapping, isLastApi);

    if (nextApiParamMappings) {
      this.handleParamMappings(response.data, nextApiParamMappings);
    }
  }

  private prepareRequestConfig(
    method: HttpMethod,
    url: string,
    data?: Record<string, unknown>,
    params?: Record<string, unknown>,
    headers?: Record<string, string>,
    globalVars?: Record<string, unknown>,
  ): AxiosRequestConfig {
    const resolvedUrl = TemplateProcessor.replace(url, {
      ...this.variables,
      ...globalVars,
    }) as string;

    const resolvedData = data
      ? (TemplateProcessor.replace(
          { ...data },
          { ...this.variables, ...globalVars },
        ) as Record<string, unknown>)
      : {};

    const resolvedParams = params
      ? (TemplateProcessor.replace(
          { ...params },
          { ...this.variables, ...globalVars },
        ) as Record<string, unknown>)
      : {};

    return {
      method,
      url: resolvedUrl,
      headers,
      timeout: DEFAULT_TIMEOUT,
      ...(Object.keys(resolvedData).length > 0 && {
        data: RequestBodyFormatter.format(
          resolvedData,
          headers?.["Content-Type"] as ContentType,
        ),
      }),
      ...(Object.keys(resolvedParams).length > 0 && {
        params: resolvedParams,
      }),
    };
  }

  private async executeRequest(
    apiName: string,
    config: AxiosRequestConfig,
  ): Promise<AxiosResponse> {
    try {
      const response = await axios.request(config);
      return response;
    } catch (error) {
      // 只处理来自 axios 内部的报错，如网络错误、超时等
      if (
        error &&
        typeof error === "object" &&
        "name" in error &&
        error.name === "AxiosError"
      ) {
        const axiosError = error as {
          name: string;
          message: string;
          code?: string;
        };
        throw {
          apiName,
          errMsg: {
            name: axiosError.name,
            message: axiosError.message,
            code: axiosError.code,
          },
        };
      }
      // 其他错误（如 API 返回的错误）直接抛出
      throw {
        apiName,
        errMsg: error,
      };
    }
  }

  private processResponse(
    apiName: string,
    responseData: unknown,
    responseMapping: ResponseMapping,
    isLastApi: boolean,
  ): void {
    const { path, expectedValue, isResult } = responseMapping;
    const actualValue = get(responseData, path);

    if (!isNil(expectedValue) && actualValue !== expectedValue) {
      throw {
        apiName,
        errMsg: responseData,
      };
    }

    if (isResult || isLastApi) {
      if (actualValue) {
        this.lastResponse = actualValue;
      } else {
        throw {
          apiName,
          errMsg: responseData,
        };
      }
    }
  }

  private handleParamMappings(
    responseData: unknown,
    mappings: NextApiParamMapping[],
  ): void {
    mappings.forEach(({ key, path }) => {
      const value = get(responseData, path);
      this.variables[key] = value;
    });
  }
}

// 导出单例实例
export const apiChainService = new ApiChainService();

export enum SupportedGlobalVars {
  /** 原文信息，用于验签 */
  RAW_KEY = "RAW_KEY",
  /** PIN 码 */
  PIN_CODE = "PIN_CODE",
}

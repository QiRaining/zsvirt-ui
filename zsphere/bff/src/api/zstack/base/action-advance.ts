import { Inject } from "@nestjs/common";
import { CONTEXT } from "@nestjs/graphql";
import * as _ from "lodash";

import { ZsHttpService } from "@/common/trans/zs-http-service/zs-http-service.service";
import { genUuid } from "@/utils";

import { ActionBase } from "./action-base";
import { ActionInfo } from "./types";
import { WebhookCallbackService } from "./webhook-callback.service";

export class ActionAdvance extends ActionBase {
  @Inject(CONTEXT) protected readonly context;
  @Inject() zsHttpService: ZsHttpService;
  @Inject() webhookCallbackService: WebhookCallbackService;

  // 用于安全地从 context 获取指定的 HTTP 头部信息
  private getHeader(headerName: string): string | undefined {
    const headers = this.context?.req?.headers || this.context?.headers;
    return headers?.[headerName];
  }

  protected getSessionId(req?: any): string {
    const sessionId =
      _.get(req, ["headers", "x-session-id"]) || this.getHeader("x-session-id");
    return sessionId;
  }

  async postAction<T>(
    _info: ActionInfo,
    httpRequestPromise: Promise<any>,
    needRecord: boolean,
    apiRecord,
  ): Promise<T> {
    const apiId = _info?.apiId;
    // 注册 webhook 回调，使用 apiId 作为 key
    const returnPromise = new Promise((resolve, rejects) => {
      this.webhookCallbackService.set(apiId, resolve, rejects);
    });
    const rt = await httpRequestPromise;
    let { apiTimeout } = rt.data;
    apiTimeout = apiTimeout || 30 * 60 * 1000;
    if (rt.status === 200) {
      this.webhookCallbackService.remove(apiId);
      if (needRecord) {
        await this.recordSuccess(rt.data, apiRecord, _info);
      }
      return rt.data;
    } else if (rt.status === 202) {
      // 202 响应表示异步任务已接受，响应体包含 location 和 apiTimeout
      // 最终结果会通过 webhook 回调返回
      let timeout: NodeJS.Timeout | undefined;
      try {
        const pro = new Promise((_resolve, _reject) => {
          timeout = setTimeout(() => {
            rt.data.name = "apiTimeOut";
            const timeoutError = rt.data;
            _reject(timeoutError);
          }, apiTimeout);
        });
        // 等待 webhook 回调或超时
        // webhook 回调时应该使用 x-job-uuid header，值应该等于 apiId
        const resp = await Promise.race([returnPromise, pro]);
        if (needRecord) {
          this.recordSuccess(resp, apiRecord, _info);
        }
        return resp as T;
      } catch (e) {
        if (needRecord) {
          await this.recordFailed(e, apiRecord, _info);
        }
        throw e;
      } finally {
        // 清理超时定时器
        if (timeout) {
          clearTimeout(timeout);
        }
      }
    } else {
      throw rt;
    }
  }

  async preAction(
    _info: ActionInfo,
    needRecord: boolean,
    name: string,
    param: unknown,
  ) {
    const info = { ..._info, apiId: _info.apiId || genUuid() };
    return {
      actionId: info.actionId,
      apiId: info.apiId,
      sessionId: this.getSessionId(),
      apiRecord: needRecord
        ? await this.recordStart(param, info, name)
        : undefined,
    };
  }

  genParamStringForGet(param: unknown, arrangedParams: string[]) {
    const paramKeys = Object.keys(param);
    const unarrangedParams = paramKeys.filter(
      (key) => !arrangedParams.includes(key),
    );
    let paramString = "";
    if (unarrangedParams.length > 0) {
      paramString = "?";
      paramString += unarrangedParams
        .map((key) => {
          const value = param[key];
          if (Array.isArray(value)) {
            return value
              .map((it) => {
                return `${key}=${encodeURIComponent(it)}`;
              })
              .join("&");
          } else {
            return (
              key +
              "=" +
              encodeURIComponent(param[key] as string | number | boolean)
            );
          }
        })
        .join("&");
    }
    return paramString;
  }

  genParamStringForDelete(param: unknown, arrangedParams: string[]) {
    const paramKeys = Object.keys(param);
    const unarrangedParams = paramKeys.filter(
      (key) => !arrangedParams.includes(key),
    );
    let paramString = "";
    if (unarrangedParams.length > 0) {
      paramString = "?";
      paramString += unarrangedParams
        .map((key) => {
          const value = (param as any)[key];
          if (Array.isArray(value)) {
            return value
              .map((it) => {
                return `${key}=${it}`;
              })
              .join("&");
          } else {
            return key + "=" + (param as any)[key];
          }
        })
        .join("&");
    }
    return paramString;
  }
}

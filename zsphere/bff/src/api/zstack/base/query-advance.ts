import { Inject } from "@nestjs/common";

import { ZsHttpService } from "@/common/trans/zs-http-service/zs-http-service.service";
import { genUuid } from "@/utils";

import { QueryBase } from "./query-base";
import { ActionInfo } from "./types";
import { WebhookCallbackService } from "./webhook-callback.service";

export class QueryAdvance extends QueryBase {
  @Inject() zsHttpService: ZsHttpService;
  @Inject() webhookCallbackService: WebhookCallbackService;

  async postAction<T>(
    _info: ActionInfo,
    httpRequestPromise: Promise<any>,
    needRecord: boolean,
    apiRecord,
  ): Promise<T> {
    const returnPromise = new Promise((resolve, rejects) => {
      this.webhookCallbackService.set(_info?.apiId, resolve, rejects);
    });
    const rt = await httpRequestPromise;
    let { apiTimeout } = rt.data;
    apiTimeout = apiTimeout || 30 * 60 * 1000;
    if (rt.status === 200) {
      this.webhookCallbackService.remove(_info?.apiId);
      if (needRecord) {
        await this.recordSuccess(rt.data, apiRecord, _info);
      }
      return rt.data;
    } else if (rt.status === 202) {
      let timeout;
      let resolve;
      try {
        const pro = new Promise((_resolve, _reject) => {
          resolve = _resolve;
          timeout = setTimeout(() => {
            rt.data.name = "apiTimeOut";
            const timeoutError = rt.data;
            _reject(timeoutError);
          }, apiTimeout);
        });
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
        clearTimeout(timeout);
        resolve(timeout);
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
      sessionId: info.sessionId,
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

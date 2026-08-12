// @ts-nocheck
import { Injectable } from "@nestjs/common";
import * as _ from "lodash";

import { genUuid } from "../../utils";
import { ActionBase } from "./base/action-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class LogOutAction extends ActionBase {
  async call(
    param: LogOutActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<LogOutResult> {
    const info = _.cloneDeep(_info);
    if (!info.apiId) info.apiId = genUuid();
    let apiRecord;
    if (needRecord) {
      apiRecord = await this.recordStart(param, info, LogOutAction.name);
    }
    const paramKeys = Object.keys(param);
    const unarrangedParams = paramKeys.filter(
      (key) =>
        ![
          "systemTags",
          "userTags",
          "sessionId",
          "accessKeyId",
          "accessKeySecret",
          "requestIp",
          "timeout",
          "sessionUuid",
        ].includes(key),
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
          } else if (typeof value === "object") {
            return Object.keys(value)
              .map((it) => `${key}.${it}=${value[it]}`)
              .join("&");
          } else {
            return key + "=" + (param as any)[key];
          }
        })
        .join("&");
    }
    const httpRequestPromise = this.zsHttpService.delete(
      `/accounts/sessions/${param.sessionUuid}${paramString}`,
      info.apiId,
      info.actionId,
      info.sessionId,
    );
    const returnPromise = new Promise((resolve, rejects) => {
      this.webhookCallbackService.set(info.apiId, resolve, rejects);
    });
    const rt = await httpRequestPromise;
    let { apiTimeout } = rt.data;
    apiTimeout = apiTimeout || 30 * 60 * 1000;
    if (rt.status === 200) {
      this.webhookCallbackService.remove(info.apiId);
      if (needRecord) {
        await this.recordSuccess(rt.data, apiRecord);
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
          this.recordSuccess(resp, apiRecord);
        }
        return resp;
      } catch (e) {
        if (needRecord) {
          await this.recordFailed(e, apiRecord);
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
}

export interface LogOutActionParam {
  sessionUuid?: string;
  clientInfo?: any;
  systemTags?: any[];
  userTags?: any[];
  requestIp?: any;
  timeout?: number;
}

export interface LogOutResult {}

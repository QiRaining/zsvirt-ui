// @ts-nocheck
import { Injectable } from "@nestjs/common";
import * as _ from "lodash";

import { PreviewResourceStackArgs } from "@/maintenance/resource-stack/resource-stack.model";

import { genUuid } from "../../utils";
import { QueryBase } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class PreviewResourceStackAction extends QueryBase {
  async call(
    param: PreviewResourceStackArgs,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<PreviewResourceStackResult> {
    const info = _.cloneDeep(_info);
    if (!info.apiId) info.apiId = genUuid();
    let apiRecord;
    if (needRecord) {
      apiRecord = await this.recordStart(
        param,
        info,
        PreviewResourceStackAction.name,
      );
    }

    const httpRequestPromise = this.zsHttpService.get(
      this.buildParam("/cloudformation/stack/preview", param),
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

  buildParam(url: string, param: PreviewResourceStackActionParam) {
    let query = `${url}?`;
    if (param.type !== undefined) {
      query += `type=${param.type}&`;
    }
    if (param.templateContent !== undefined) {
      query += `templateContent=${param.templateContent}&`;
    }
    if (param.uuid !== undefined) {
      query += `uuid=${param.uuid.toString()}&`;
    }
    if (param.parameters !== undefined) {
      query += `parameters=${encodeURIComponent(param.parameters)}&`;
    }
    if (query[query.length - 1] === "&") {
      query = query.slice(0, -1);
    }
    if (query[query.length - 1] === "?") {
      query = query.slice(0, -1);
    }
    return query;
  }
}

export interface PreviewResourceStackActionParam {
  type?: string;
  templateContent?: string;
  uuid?: string;
  parameters?: string;
  preParameters?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
}

export interface PreviewResourceStackResult {
  preview?: any;
}

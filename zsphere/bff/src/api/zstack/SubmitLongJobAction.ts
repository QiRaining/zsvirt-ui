// @ts-nocheck
import { Injectable, Inject } from "@nestjs/common";
import * as _ from "lodash";

import { ZsHttpService } from "../../common/trans/zs-http-service/zs-http-service.service";
import { genUuid } from "../../utils";
import { ActionBase } from "./base/action-base";
import { ActionInfo } from "./base/types";
import { WebhookCallbackService } from "./base/webhook-callback.service";
import { LongJobInventory } from "./types";

@Injectable()
export class SubmitLongJobAction extends ActionBase {
  @Inject() zsHttpService: ZsHttpService;
  @Inject() webhookCallbackService: WebhookCallbackService;

  async call(
    param: SubmitLongJobActionParam,
    _info: ActionInfo = {},
    needRecord = true,
    recordTransform: (val: any) => any = (val) => val,
  ): Promise<SubmitLongJobResult> {
    const info = _.cloneDeep(_info);
    if (!info.apiId) info.apiId = genUuid();
    let apiRecord;
    if (needRecord) {
      apiRecord = await this.recordStart(
        recordTransform(param),
        info,
        SubmitLongJobAction.name,
      );
    }
    const httpRequestPromise = this.zsHttpService.post(
      `/longjobs`,
      {
        params: param,
        systemTags: param.systemTags,
      },
      info,
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
          this.recordSuccess(resp, apiRecord, info);
        }
        return resp;
      } catch (e) {
        if (needRecord) {
          await this.recordFailed(e, apiRecord, info);
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

export interface SubmitLongJobActionParam {
  name?: string;
  description?: string;
  jobName: string;
  jobData: string;
  targetResourceUuid?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
  timeout?: number;
}

export interface SubmitLongJobResult {
  inventory?: LongJobInventory;
}

import { Injectable, Inject } from "@nestjs/common";
import * as _ from "lodash";

import { ZsHttpServiceBase } from "@/common/trans/zs-http-service/zs-http-service-base.service";

import { genUuid } from "../../utils";
import { QueryBase, QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";
import { WebhookCallbackService } from "./base/webhook-callback.service";

@Injectable()
export class QueryLongJobActionBase extends QueryBase {
  @Inject() zsHttpService: ZsHttpServiceBase;
  @Inject() webhookCallbackService: WebhookCallbackService;

  async call(
    param: QueryParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<QueryLongJobResult> {
    let info = _.cloneDeep(_info);
    if (!info.apiId) info.apiId = genUuid();
    let apiRecord;
    if (needRecord) {
      apiRecord = await this.recordStart(
        param,
        info,
        QueryLongJobActionBase.name,
      );
    }
    const httpRequestPromise = this.zsHttpService.get(
      this.buildQuery("/longjobs", param),
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
        await this.recordSuccess(rt.data, apiRecord, info);
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

export interface QueryLongJobActionParam {
  timeout?: number;
}

export interface QueryLongJobResult {
  inventories?: any[];
  total?: number;
}

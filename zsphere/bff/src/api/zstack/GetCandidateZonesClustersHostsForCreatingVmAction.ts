// @ts-nocheck
import { Injectable } from "@nestjs/common";
import * as _ from "lodash";

import { genUuid } from "../../utils";
import { QueryBase } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetCandidateZonesClustersHostsForCreatingVmAction extends QueryBase {
  async call(
    param: GetCandidateZonesClustersHostsForCreatingVmActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetCandidateZonesClustersHostsForCreatingVmResult> {
    const info = _.cloneDeep(_info);
    if (!info.apiId) info.apiId = genUuid();
    let apiRecord;
    if (needRecord) {
      apiRecord = await this.recordStart(
        param,
        info,
        GetCandidateZonesClustersHostsForCreatingVmAction.name,
      );
    }
    const paramKeys = Object.keys(param);
    const unarrangedParams = paramKeys.filter(
      (key) =>
        ![
          "userTags",
          "sessionId",
          "accessKeyId",
          "accessKeySecret",
          "requestIp",
          "timeout",
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
                return `${key}=${encodeURIComponent(it)}`;
              })
              .join("&");
          } else {
            return key + "=" + encodeURIComponent((param as any)[key]);
          }
        })
        .join("&");
    }
    const httpRequestPromise = this.zsHttpService.get(
      `/vm-instances/candidate-destinations${paramString}`,
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
        const pro = new Promise((r, j) => {
          resolve = r;
          timeout = setTimeout(() => {
            rt.data.name = "apiTimeOut";
            const timeoutError = rt.data;
            j(timeoutError);
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

export interface GetCandidateZonesClustersHostsForCreatingVmActionParam {
  instanceOfferingUuid?: string;
  imageUuid: string;
  l3NetworkUuids: any[];
  rootDiskOfferingUuid?: string;
  dataDiskOfferingUuids?: any[];
  cpuNum?: number;
  memorySize?: number;
  rootDiskSize?: number;
  zoneUuid?: string;
  clusterUuid?: string;
  defaultL3NetworkUuid?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
  timeout?: number;
}

export interface GetCandidateZonesClustersHostsForCreatingVmResult {
  zones?: any[];
  clusters?: any[];
  hosts?: any[];
}

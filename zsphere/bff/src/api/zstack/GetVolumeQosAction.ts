import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetVolumeQosAction extends QueryAdvance {
  async call(
    params: GetVolumeQosActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetVolumeQosResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetVolumeQosAction.name,
      params,
    );
    const paramString = this.genParamStringForGet(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
      "uuid",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/volumes/${params.uuid}/qos${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetVolumeQosResult>(
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
      httpRequestPromise,
      needRecord,
      apiRecord,
    );
  }
}

export interface GetVolumeQosActionParam {
  uuid: string;
  forceSync?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetVolumeQosResult {
  volumeUuid?: string;
  volumeBandwidth?: number;
  volumeBandwidthRead?: number;
  volumeBandwidthWrite?: number;
  iopsTotal?: number;
  iopsRead?: number;
  iopsWrite?: number;
  volumeBandwidthUpthreshold?: number;
  volumeBandwidthReadUpthreshold?: number;
  volumeBandwidthWriteUpthreshold?: number;
  iopsTotalUpthreshold?: number;
  iopsReadUpthreshold?: number;
  iopsWriteUpthreshold?: number;
}

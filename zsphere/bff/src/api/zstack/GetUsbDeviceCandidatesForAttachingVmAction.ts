import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetUsbDeviceCandidatesForAttachingVmAction extends QueryAdvance {
  async call(
    params: GetUsbDeviceCandidatesForAttachingVmActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetUsbDeviceCandidatesForAttachingVmResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetUsbDeviceCandidatesForAttachingVmAction.name,
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
      "vmInstanceUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/vm-instances/${params.vmInstanceUuid}/candidate-usb-devices${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetUsbDeviceCandidatesForAttachingVmResult>(
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

export interface GetUsbDeviceCandidatesForAttachingVmActionParam {
  vmInstanceUuid: string;
  attachType?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetUsbDeviceCandidatesForAttachingVmResult {
  inventories?: any[];
}

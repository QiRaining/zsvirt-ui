import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class BatchCreateHostKernelInterfaceAction extends ActionAdvance {
  async call(
    params: BatchCreateHostKernelInterfaceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<BatchCreateHostKernelInterfaceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      BatchCreateHostKernelInterfaceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/l3-networks/${params.l3NetworkUuid}/kernel-interfaces`,
      {
        params: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<BatchCreateHostKernelInterfaceResult>(
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

export interface BatchCreateHostKernelInterfaceActionParam {
  structs: any[];
  l3NetworkUuid: string;
  trafficTypes?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
  timeout?: number;
}

export interface BatchCreateHostKernelInterfaceResult {
  results?: any[];
}

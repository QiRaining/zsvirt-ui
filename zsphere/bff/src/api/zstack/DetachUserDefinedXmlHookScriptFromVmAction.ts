import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class DetachUserDefinedXmlHookScriptFromVmAction extends ActionAdvance {
  // 使用 zsHttpService

  async call(
    params: DetachUserDefinedXmlHookScriptFromVmActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DetachUserDefinedXmlHookScriptFromVmResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DetachUserDefinedXmlHookScriptFromVmAction.name,
      params,
    );
    const paramString = this.genParamStringForDelete(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
      "vmInstanceUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/xmlhook/vm-instances/${params.vmInstanceUuid}/detach${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DetachUserDefinedXmlHookScriptFromVmResult>(
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

export interface DetachUserDefinedXmlHookScriptFromVmActionParam {
  vmInstanceUuid: string;
  startupStrategy?: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DetachUserDefinedXmlHookScriptFromVmResult {}

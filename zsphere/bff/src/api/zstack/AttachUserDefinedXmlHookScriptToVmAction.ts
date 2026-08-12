import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class AttachUserDefinedXmlHookScriptToVmAction extends ActionAdvance {
  // 使用 zsHttpService

  async call(
    params: AttachUserDefinedXmlHookScriptToVmActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AttachUserDefinedXmlHookScriptToVmResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AttachUserDefinedXmlHookScriptToVmAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/xmlhook/${params.xmlHookUuid}/vm-instances/${params.vmInstanceUuid}`,
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
    return this.postAction<AttachUserDefinedXmlHookScriptToVmResult>(
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

export interface AttachUserDefinedXmlHookScriptToVmActionParam {
  vmInstanceUuid: string;
  xmlHookUuid: string;
  startupStrategy?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AttachUserDefinedXmlHookScriptToVmResult {}

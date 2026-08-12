import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { XmlHookInventory } from "./types";

@Injectable()
export class CreateVmUserDefinedXmlHookScriptAction extends ActionAdvance {
  // 使用 zsHttpService

  async call(
    params: CreateVmUserDefinedXmlHookScriptActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateVmUserDefinedXmlHookScriptResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateVmUserDefinedXmlHookScriptAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/vm-instances/xml-hook-script`,
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
    return this.postAction<CreateVmUserDefinedXmlHookScriptResult>(
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

export interface CreateVmUserDefinedXmlHookScriptActionParam {
  name: string;
  description?: string;
  hookScript: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CreateVmUserDefinedXmlHookScriptResult {
  inventory?: XmlHookInventory;
}

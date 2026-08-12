import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { XmlHookInventory } from "./types";

@Injectable()
export class UpdateVmUserDefinedXmlHookScriptAction extends ActionAdvance {
  // 使用 zsHttpService

  async call(
    params: UpdateVmUserDefinedXmlHookScriptActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateVmUserDefinedXmlHookScriptResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateVmUserDefinedXmlHookScriptAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/vm-instances/xml-hook-script`,
      {
        updateVmUserDefinedXmlHookScript: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateVmUserDefinedXmlHookScriptResult>(
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

export interface UpdateVmUserDefinedXmlHookScriptActionParam {
  uuid: string;
  name?: string;
  description?: string;
  hookScript?: string;
  startupStrategy?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateVmUserDefinedXmlHookScriptResult {
  inventory?: XmlHookInventory;
}

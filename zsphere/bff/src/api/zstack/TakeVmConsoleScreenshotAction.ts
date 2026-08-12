import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class TakeVmConsoleScreenshotAction extends ActionAdvance {
  async call(
    params: TakeVmConsoleScreenshotActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<TakeVmConsoleScreenshotResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      TakeVmConsoleScreenshotAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/vm-instances/${params.uuid}/actions`,
      {
        takeVmConsoleScreenshot: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<TakeVmConsoleScreenshotResult>(
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

export interface TakeVmConsoleScreenshotActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface TakeVmConsoleScreenshotResult {
  imageData?: string;
}

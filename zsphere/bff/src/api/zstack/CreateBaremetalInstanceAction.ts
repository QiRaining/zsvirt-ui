import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { BaremetalInstanceInventory } from "./types";

@Injectable()
export class CreateBaremetalInstanceAction extends ActionAdvance {
  async call(
    params: CreateBaremetalInstanceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateBaremetalInstanceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateBaremetalInstanceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/baremetal/instances`,
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
    return this.postAction<CreateBaremetalInstanceResult>(
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

export interface CreateBaremetalInstanceActionParam {
  name: string;
  description?: string;
  chassisUuid: string;
  imageUuid: string;
  templateUuid?: string;
  username?: string;
  password: string;
  nicCfgs?: any;
  bondingCfgs?: any;
  customConfigurations?: any;
  strategy?: string;
  platform?: string;
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

export interface CreateBaremetalInstanceResult {
  inventory?: BaremetalInstanceInventory;
}

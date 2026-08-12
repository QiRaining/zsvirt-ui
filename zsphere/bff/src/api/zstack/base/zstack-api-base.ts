import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/sequelize";
// import { ModuleRef, ContextIdFactory } from '@nestjs/core';
import * as _ from "lodash";

import { CacheServiceBase } from "@/common/cache/cache.service.base";
import { Logger } from "@/common/logger/logger.decorator";
import { ZSLoggerService } from "@/common/logger/logger.service";
import { ZsActionApi } from "@/model/zs-action-api.model";

import { ActionInfo } from "./types";

const UUID_LENGTH = 32;
@Injectable()
export class ZStackApiBase {
  // private moduleRef: ModuleRef
  @InjectModel(ZsActionApi) private zsActionApi: typeof ZsActionApi;
  @Inject() private configService: ConfigService;
  @Logger(ZStackApiBase.name) private logger: ZSLoggerService;
  @Inject(CacheServiceBase) private cacheService: CacheServiceBase;

  // @Inject(CacheService) private cacheService: CacheService

  // private cacheService: CacheService;
  // async onModuleInit() {
  //   const contextId = ContextIdFactory.create();
  //   this.cacheService = await this.moduleRef.resolve(
  //     CacheService,
  //     contextId,
  //     { strict: false },
  //   );
  // }

  // constructor(private moduleRef: ModuleRef) {}

  // 遍历所有属性,修改名字中带password的值
  hidePassword(param: any) {
    if (!param) return;
    const clone = _.cloneDeep(param);
    const passwordReg = /password/i;
    const processSystemTag = (array: Array<string>): Array<string> => {
      return array.map((element) => {
        if (_.isString(element)) {
          const [name, value] = _.split(element, "::");
          if (value && passwordReg.test(name)) {
            return `${name}::********`;
          }

          return element;
        } else if (_.isPlainObject(element)) {
          return this.hidePassword(element);
        }

        return element;
      });
    };

    for (const key in clone) {
      if (clone.hasOwnProperty(key)) {
        //ceph 密码的特殊处理
        if (key === "monUrls") {
          clone[key] = clone[key].map((item) => {
            return item.replace(/^.+@/, "******@");
          });
        }
        if (_.isPlainObject(clone[key])) {
          clone[key] = this.hidePassword(clone[key]);
          continue;
        }
        if (_.isArray(clone[key])) {
          if (key === "systemTags") {
            clone[key] = processSystemTag(clone[key]);
          } else {
            clone[key] = clone[key].map((cv) => this.hidePassword(cv));
          }
          continue;
        }
        if (_.isString(clone[key]) && _.includes(clone[key], "::")) {
          const [name, value] = _.split(clone[key], "::");
          if (value && passwordReg.test(name)) {
            clone[key] = `${name}::********`;
          }
        }
        if (passwordReg.test(key)) {
          clone[key] = "********";
        }
        // Vhost 存储密码的特殊处理
        // "http://operator:Admin123@203.0.113.64:443/pool" Admin123 是密码
        if (key === "url" && clone.defaultOutputProtocol === "Vhost") {
          const [userNameAndPwd, ip] = clone[key].split("@");
          const [http, userName, pwd] = userNameAndPwd.split(":");
          clone[key] = `${http}:${userName}:*****@${ip}`;
        }
      }
    }
    return clone;
  }

  private async getResourcesInfo(params: any, info: ActionInfo) {
    let uuids: string[] = [];
    for (const key in params) {
      const value = params[key];

      // 处理longjob的jobData
      if (key === "jobData") {
        try {
          const jobData = JSON.parse(value);
          for (const uuid of jobData) {
            if (this.isValidUid(uuid)) {
              uuids.push(uuid);
            }
          }
        } catch (error) {
          this.logger.error(error);
        }
      }

      if (this.isValidUid(value)) {
        uuids.push(value);
      }
    }
    uuids = _.uniq(uuids);
    const batches = _.chunk(uuids, 50);
    // 防止数组过大,做分批查询
    const res = await Promise.all(
      batches.map((batch) => this.getResourceNameByUuid(batch, info)),
    );
    const resourceInfo = res.reduce((acc, res) => {
      if (!res.error && Array.isArray(res.data)) {
        const batchInfo = res.data.map((item) => ({
          resourceUuid: item.uuid,
          resourceName: item.resourceName,
        }));
        return [...acc, ...batchInfo];
      }
      return acc;
    }, []);

    return resourceInfo;
  }

  private isValidUid(uuid: any): boolean {
    if (typeof uuid !== "string" || uuid.length !== UUID_LENGTH) {
      return false;
    }

    const hexChars = "0123456789abcdefABCDEF";

    for (let i = 0; i < uuid.length; i++) {
      if (hexChars.indexOf(uuid[i]) === -1) {
        return false;
      }
    }
    return true;
  }

  async getResourceNameByUuid(uuidArray: string[], info?: ActionInfo) {
    const actionId = info?.actionId;
    const cachedOperationInfo: any = await this.cacheService.get(actionId);
    const sessionId = info?.sessionId || cachedOperationInfo?.sessionId;

    const paramString =
      "?" +
      uuidArray.map((uuid) => `uuids=${encodeURIComponent(uuid)}`).join("&");
    try {
      const response = await fetch(
        `${this.configService.get<string>("ZS_MN_SERVER")}/zstack/v1/resources/names${paramString}`,
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: `OAuth ${sessionId}`,
          },
          signal: AbortSignal.timeout(5000), // 5秒超时
        },
      );

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const data = await response.json();
      return {
        status: 200,
        data: data?.inventories || [],
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error("未知错误");
      return {
        status: 408,
        error: err.message,
        data: [],
      };
    }
  }

  // async getResourceNameByUuid(uuidArray: string[], sessionId?: string) {
  //   // 构造URL参数字符串
  //   const paramString =
  //     '?' + uuidArray.map(uuid => `uuids=${encodeURIComponent(uuid)}`).join('&')
  //   try {
  //     const res = await axios.get(
  //       `${this.configService.get<string>(
  //         'ZS_MN_SERVER'
  //       )}/zstack/v1/resources/names${paramString}`,
  //       {
  //         headers: {
  //           'Content-Type': 'application/json;charset=UTF-8',
  //           Authorization: `OAuth ${sessionId}`
  //         },
  //         timeout: 5000,
  //         validateStatus: status => status < 500
  //       }
  //     )
  //     return {
  //       status: 200,
  //       data: res.data?.inventories || []
  //     }
  //   } catch (error) {
  //     return {
  //       status: 408,
  //       error: error.message,
  //       data: []
  //     }
  //   }
  // }

  async recordStart(param: any, info: ActionInfo, name: string) {
    // 分别是APIname、actionId、taskId、resourceUuid
    let resourceUuidAndNamesPairs: any[];
    if (info.actionId) {
      resourceUuidAndNamesPairs = await this.getResourcesInfo(param, info);
      const cachedOperationInfo: any = await this.cacheService.get(
        info.actionId,
      );

      delete cachedOperationInfo?.sessionId;

      this.logger.debugJson({
        type: "operationLog",
        ...cachedOperationInfo,
        status: "Running",
        actionId: info.actionId,
        apiName: name,
        taskId: info.taskId,
        resources: resourceUuidAndNamesPairs,
        lastOpDate: new Date(),
      });
      const clone = this.hidePassword(param);
      return await this.zsActionApi.create({
        actionId: info.actionId, // 新加进去
        apiId: info.apiId,
        taskId: info.taskId || "",
        name,
        req: clone,
        status: "Running",
        resources: resourceUuidAndNamesPairs?.length
          ? null
          : JSON.stringify(resourceUuidAndNamesPairs),
        createDate: new Date(),
      });
    }
    return null;
  }

  async recordSuccess(resp: any, record: any, info?: ActionInfo) {
    if (!record) return;
    if (info?.actionId) {
      const cachedOperationInfo: any = await this.cacheService.get(
        info.actionId,
      );
      this.logger.debugJson({
        type: "operationLog",
        ...cachedOperationInfo,
        status: "Success",
        actionId: info.actionId,
        taskId: record?.dataValues?.taskId,
        lastOpDate: new Date(),
      });
    }
    // 是taskId
    const clone = this.hidePassword(resp);
    this.zsActionApi.update(
      {
        resp: clone,
        status: "Success",
        lastOpDate: new Date(),
      },
      {
        where: { apiId: record.apiId },
      },
    );
  }

  async recordFailed(resp: any, record: any, info?: ActionInfo) {
    if (record) {
      if (info?.actionId) {
        const cachedOperationInfo: any = await this.cacheService.get(
          info.actionId,
        );
        this.logger.debugJson({
          type: "operationLog",
          ...cachedOperationInfo,
          status: "Failed",
          actionId: info.actionId,
          taskId: record?.dataValues?.taskId,
          lastOpDate: new Date(),
        });
      }

      // 是taskId
      const clone = this.hidePassword(resp);
      this.zsActionApi.update(
        {
          resp: clone,
          status: "Failed",
          lastOpDate: new Date(),
        },
        {
          where: { apiId: record.apiId },
        },
      );
    }
  }
}

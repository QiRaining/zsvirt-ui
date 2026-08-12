import { Body, Controller, Headers, Inject, Post, Scope } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ContextIdFactory, ModuleRef } from "@nestjs/core";
import { InjectModel } from "@nestjs/sequelize";

import { ZWatchEvent } from "@/common/model/zwatch-event.model";
import { PubSubService } from "@/common/pub-sub/pub-sub.service";
import { ZsSession } from "@/model/zs-session.model";

import { Logger } from "../../../common/logger/logger.decorator";
import { ZSLoggerService } from "../../../common/logger/logger.service";
import { WebhookCallbackService } from "./webhook-callback.service";

@Controller({
  path: "webhook",
  scope: Scope.DEFAULT,
})
export class WebhookController {
  @Inject() private configService: ConfigService;
  @Inject() webhookCallbackService: WebhookCallbackService;
  @InjectModel(ZsSession) private zsSession: typeof ZsSession;
  @Logger(WebhookController.name) private logger: ZSLoggerService;

  private pubSubService: PubSubService;
  async onModuleInit() {
    const contextId = ContextIdFactory.create();
    this.pubSubService = await this.moduleRef.resolve(
      PubSubService,
      contextId,
      { strict: false },
    );
  }

  constructor(private moduleRef: ModuleRef) {}

  @Post("/")
  async webhook(
    @Headers("x-job-success") success: string,
    @Headers("x-job-uuid") actionId: string,
    @Headers("x-job-batch") batchResult: string,
    @Body() body: any,
    @Headers() headers: any,
  ): Promise<any> {
    this.logger.debugJson({
      type: "webhook",
      actionId,
      success,
      body: JSON.stringify(body, null, 2),
    });
    const extraInfo = this.webhookCallbackService.get(actionId);
    if (batchResult) {
      if (batchResult === "SUCCESS") {
        this.webhookCallbackService.success(actionId, body);
      } else {
        this.webhookCallbackService.fail(actionId, body);
      }
    } else {
      if (success === "true") {
        this.webhookCallbackService.success(actionId, body);
      } else {
        this.webhookCallbackService.fail(actionId, body);
      }
    }

    const apiInspector: boolean =
      this.configService.get<string>("API_INSPECTOR") === "true";
    if (apiInspector && extraInfo?.sessionId) {
      this.pubSubService.apiInspector({
        sessionId: extraInfo.sessionId,
        payload: {
          traceId: "",
          apiId: actionId,
          type: "Response",
          method: extraInfo?.method || "POST",
          timestamp: new Date().getTime(),
          response: JSON.stringify(body),
        },
      });
    }
    return { success: true, message: "OK", data: "ack" };
  }

  @Post("/zwatch")
  async zwatchWebhook(@Body() body: any): Promise<void> {
    console.log(
      `{"timestap": "${new Date().getTime()}", "alarmMessage": ${JSON.stringify(body)}}`,
    );
    // 特别挑出haProgress {"haProgress":{"taskName":"VMHA","resourceType":"VmInstanceVO","resourceUuid":"446a7059089644eeb63e56ad9e67004c","accountUuid":"36c27e8ff05c4780bf6d2fa65700f22e","info":"HA is successfully completed","parameters":{"haProcess":"success","fireId":"d536ff68d1d04efaa02ca59927313320"}}}
    /* SessionForceLogout
    {
      "sessionUuid": "5b7f4287f92d46f99e08fe4a5d995f11",
      "accountUuid": "36c27e8ff05c4780bf6d2fa65700f22e",
      "userUuid": "36c27e8ff05c4780bf6d2fa65700f22e",
      "name": "SessionForceLogout",
      "date": "Dec 13, 2023 1:43:16 PM"
    }
    */
    let accountUuid =
      body["EVENT_ACCOUNT_UUID"] ||
      body["ALARM_ACCOUNT_UUID"] ||
      body?.haProgress?.accountUuid;
    // 如果没有accountId 或者haProgress直接退出.
    // SessionForceLogout 结构比较特殊
    if (body?.name === "SessionForceLogout") {
      accountUuid = accountUuid || body?.accountUuid;
    }
    if (!accountUuid) return;
    const sessions = await this.zsSession.findAll({
      // TODO: 确认字段
      where: { accountId: accountUuid },
    });
    for (const session of sessions) {
      this.pubSubService.zwatch({
        sessionId: session.sessionId,
        payload: body,
      } as ZWatchEvent);
    }
  }
}

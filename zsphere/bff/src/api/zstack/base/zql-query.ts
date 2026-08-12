import { HttpService } from "@nestjs/axios";
import { Injectable, Inject, Scope } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CONTEXT } from "@nestjs/graphql";
import { ApolloError } from "apollo-server-errors";

import { WebhookCallbackService } from "@/api/zstack/base/webhook-callback.service";
import { Logger } from "@/common/logger/logger.decorator";
import { ZSLoggerService } from "@/common/logger/logger.service";
import { PubSubService } from "@/common/pub-sub/pub-sub.service";
import { genUuid } from "@/utils";

import { ActionInfo } from "./types";

@Injectable({ scope: Scope.DEFAULT })
export class ZQLService {
  @Inject() private configService: ConfigService;
  @Inject(CONTEXT) private context;
  @Inject() private httpService: HttpService;
  @Inject() private webhookCallbackService: WebhookCallbackService;
  @Inject() pubSubService: PubSubService;
  @Logger(ZQLService.name) private logger: ZSLoggerService;

  // 用于安全地从 context 获取指定的 HTTP 头部信息
  private getHeader(headerName: string): string | undefined {
    const headers = this.context?.req?.headers || this.context?.headers;
    return headers?.[headerName];
  }

  async call(
    zql: string,
    {
      apiId = undefined,
      actionId = undefined,
      sessionId = undefined,
    }: ActionInfo = {},
  ): Promise<any> {
    const logQuery: boolean =
      this.configService.get<string>("LOG_QUERY") === "true";
    const apiInspector: boolean =
      this.configService.get<string>("API_INSPECTOR") === "true";
    const headers = {
      "Content-Type": "application/json",
    };

    // 只添加有效的头部值
    const xForwardedFor = this.getHeader("x-forwarded-for");
    const userAgent = this.getHeader("user-agent");

    const xSessionId = this.getHeader("x-session-id");
    const xJobId = this.getHeader("x-job-id");
    const traceId = this.getHeader("trace_id");

    if (xForwardedFor) headers["X-Forwarded-For"] = xForwardedFor;
    if (userAgent) headers["User-Agent"] = userAgent;

    if (!sessionId) sessionId = xSessionId;
    if (sessionId) headers["Authorization"] = `OAuth ${sessionId}`;

    if (!actionId) actionId = xJobId;

    if (!apiId) apiId = genUuid();

    headers["X-Job-UUID"] = apiId;

    let resp;
    const reqPath = `${this.configService.get<string>(
      "ZS_MN_SERVER",
    )}/zstack/v1/zql?zql=${encodeURIComponent(zql)}`;
    this.logger.debugJson({
      traceId,
      type: "request",
      method: "GET",
      sessionId,
      apiId,
      apiPath: reqPath,
    });
    try {
      if (apiInspector) {
        try {
          this.pubSubService.apiInspector({
            sessionId,
            payload: {
              traceId,
              apiId,
              type: "Request",
              method: "ZQL",
              timestamp: new Date().getTime(),
              reqPath: reqPath,
              zql,
            },
          });
        } catch (error) {
          this.logger.error(error);
        }
      }
      resp = await this.httpService.get(reqPath, { headers }).toPromise();
      if (logQuery) {
        try {
          this.logger.debugJson({
            traceId,
            type: "reponse",
            method: "GET",
            sessionId,
            apiId,
            apiPath: reqPath,
            responseLength: JSON.stringify(resp?.data).length,
          });
        } catch (error) {
          this.logger.error(error);
        }
      }
      const returnPromise = new Promise((resolve, rejects) => {
        this.webhookCallbackService.set(apiId, resolve, rejects);
      });
      if (resp.status === 200) {
        this.webhookCallbackService.remove(apiId);
        if (apiInspector) {
          try {
            this.pubSubService.apiInspector({
              sessionId,
              payload: {
                traceId,
                apiId,
                type: "Response",
                method: "ZQL",
                timestamp: new Date().getTime(),
                response: JSON.stringify(resp.data),
              },
            });
          } catch (error) {
            this.logger.error(error);
          }
        }
        return resp.data;
      } else if (resp.status === 202) {
        return returnPromise as Promise<any>;
      }
    } catch (e) {
      this.logger.errorJson({
        traceId,
        type: "request",
        method: "GET",
        sessionId,
        apiId,
        apiPath: reqPath,
        error: e,
      });
      // todo 优化gql动态字段 1006 无权限访问
      if (e?.response?.data?.error?.code === "SYS.1006") {
        return { results: [{ inventories: [], total: 0 }], status: 200 } as any;
      }
      const data = e?.response?.data;
      throw new ApolloError(JSON.stringify(data?.error || data || e));
    }
  }
}

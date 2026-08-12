import {
  GraphQLRequestContext,
  GraphQLRequestContextWillSendResponse,
  ApolloServerPlugin,
  GraphQLRequestListener,
  BaseContext
} from '@apollo/server'
import { Plugin } from '@nestjs/apollo'
import { Inject } from '@nestjs/common'

import { PubSubService } from '@/common/pub-sub/pub-sub.service'

@Plugin()
export class LoggingForApiInspectorPlugin implements ApolloServerPlugin {
  @Inject() private pubSubService: PubSubService
  async requestDidStart(): Promise<GraphQLRequestListener<BaseContext>> {
    const pubSubService = this.pubSubService
    return {
      async didResolveOperation(requestContext: GraphQLRequestContext<BaseContext>) {
        const request = requestContext?.request
        const traceId = request?.http?.headers?.get('trace_id')
        const sessionId = request?.http?.headers?.get('x-session-id')
        const reqPath = `/${request.http.search}`
        try {
          pubSubService.apiInspector({
            sessionId,
            payload: {
              traceId,
              apiId: traceId,
              type: 'Request',
              method: 'GQL',
              timestamp: new Date().getTime(),
              reqPath: reqPath,
              body: JSON.stringify({
                operationName: request?.operationName,
                query: request?.query,
                variables: request?.variables
              })
            }
          })
        } catch (e) {
          console.log(e)
        }
      },
      async willSendResponse(context: GraphQLRequestContextWillSendResponse<BaseContext>) {
        const { request, response } = context
        const traceId = request?.http?.headers?.get('trace_id')
        const sessionId = request?.http?.headers?.get('x-session-id')
        try {
          pubSubService.apiInspector({
            sessionId,
            payload: {
              traceId,
              apiId: traceId,
              type: 'Response',
              method: 'GQL',
              timestamp: new Date().getTime()
              // TODO: 需要根据实际情况调整
              // response: JSON.stringify(response?.body?.data),
            }
          })
        } catch (e) {
          console.log(e)
        }
      }
    }
  }
}

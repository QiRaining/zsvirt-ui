import { ApolloServerPlugin, BaseContext, GraphQLRequestListener } from '@apollo/server'
import { GraphQLRequestContext } from '@apollo/server'

import { Logger } from '@/common/logger/logger.decorator'
import { ZSLoggerService } from '@/common/logger/logger.service'

interface ExceptionWithStacktrace {
  stacktrace: string[]
}

function hasStacktrace(obj: any): obj is ExceptionWithStacktrace {
  return obj && typeof obj === 'object' && 'stacktrace' in obj
}

export class LoggingPlugin implements ApolloServerPlugin<BaseContext> {
  @Logger(LoggingPlugin.name) private logger: ZSLoggerService

  async requestDidStart(
    requestContext: GraphQLRequestContext<BaseContext>
  ): Promise<GraphQLRequestListener<BaseContext>> {
    const logger = this.logger
    return {
      async didResolveOperation(requestContext: GraphQLRequestContext<BaseContext>) {
        const request = requestContext?.request
        const traceId = request?.http?.headers?.get('trace_id')
        const operationName = request.operationName
        logger.debugJson({ traceId, operationName })
      },
      async willSendResponse(requestContext: GraphQLRequestContext<BaseContext>) {
        const { response } = requestContext
        try {
          if (response.body.kind === 'single' && response.body.singleResult.errors) {
            response.body.singleResult.errors.forEach(ele => {
              // if (ele?.extensions?.exception?.stacktrace) {
              //   ele.extensions.exception.stacktrace = ['-'];
              // }

              if (ele?.extensions?.exception && hasStacktrace(ele.extensions.exception)) {
                ele.extensions.exception.stacktrace = ['-']
              }
            })
          }
        } catch (e) {
          // 错误处理
        }
      }
    }
  }
}

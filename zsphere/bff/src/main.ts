import fastifyMultipart from '@fastify/multipart'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'

import { AppMiddleWare } from './app.middleware'
import { AppModule } from './app.module'
import { mockAuthMiddleware } from './common/mock'
import { getZsvBffPort } from './config/server-port'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true
    })
  )
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 1024 * 1024 * 1024 * 5, // 5GB
      files: 1
    }
  })
  if (process.env.ZSV_MOCK === '1') {
    app.use(mockAuthMiddleware as any)
    console.log('[ZSV_MOCK] Mock mode enabled — schema mocks + bypassed auth')
  } else {
    app.use(new AppMiddleWare().use.bind(new AppMiddleWare()))
  }
  // app.use(new NotFoundFieldsMiddleware(app.get(GraphQLSchemaHost)).use);

  // // 判断用于分析的文件是否存在，如果存在，那么引入
  // const interceptorPath = join(
  //   __dirname,
  //   `common/for-analyze/request-log-to-es-http.interceptor.js`,
  // );
  // if (existsSync(interceptorPath)) {
  //   const { RequestLogToEsHttpInterceptor } = await import(
  //     // @ts-expect-error 动态引入的，没有类型定义
  //     './common/for-analyze/request-log-to-es-http.interceptor'
  //   );
  //   app.useGlobalInterceptors(new RequestLogToEsHttpInterceptor());
  // }

  if (process.env.INSTANCE_ID === undefined) {
    process.env.INSTANCE_ID = '0'
  }

  process.env.BASE_PORT = process.env.BASE_PORT || '3100'
  process.env.PORT = String(getZsvBffPort())
  const port = process.env.PORT
  const host = process.env.HOST || '127.0.0.1'
  await app.listen(port, host)
  // const server = app.getHttpServer();

  // node 14版本以前，header会在60s后timeout 影响上传
  // 详见 https://github.com/nodejs/node/issues/35661
  // server.headersTimeout = 60000 * 60 * 24;

  console.log(`Server starts at http://${host}:${port}/graphql`)
}
bootstrap()

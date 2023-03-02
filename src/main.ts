import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import * as compression from 'compression'

import { AppModule } from '@module/app.module'

async function bootstrap() {
  const configService: ConfigService = new ConfigService()
  const host = await configService.get('EXPRESS_HOST')
  const port = await configService.get('EXPRESS_PORT')
  const cors = await configService.get('EXPRESS_CORS')

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors,
    logger: new Logger(),
  })

  app.use(compression())

  await app.listen(port)

  console.log(`Running a GraphQL API server at: http://${host}:${port}/graphql`)
}

bootstrap()

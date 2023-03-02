import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { ServeStaticModule } from '@nestjs/serve-static'
import { TypeOrmModule } from '@nestjs/typeorm'
import { join } from 'path'

import { AddressModule } from '@module/address/address.module'
import { OrderModule } from '@module/order/order.module'
import { ProductModule } from '@module/product/product.module'
import { UserModule } from '@module/user/user.module'

import { AuthModule } from '@shared/module/auth/auth.module'
import { EmailModule } from '@shared/module/email/email.module'

import { ENV } from '@shared/constant/env.constant'

import { TypeOrmConfig } from '@/src/database/typeorm.config'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [ENV] }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfig,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd() + '/src/schema.graphql'),
      sortSchema: true,
      debug: true,
      playground: true,
      introspection: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'public'),
    }),
    AddressModule,
    AuthModule,
    EmailModule,
    OrderModule,
    ProductModule,
    UserModule,
  ],
  providers: [ConfigService],
})
export class AppModule {}

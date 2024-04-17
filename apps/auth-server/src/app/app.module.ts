import { Module } from '@nestjs/common'

import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from '@js-monorepo/auth'

const ENV = process.env.NODE_ENV

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', `.env.${ENV}`, `environments/.env.${ENV}`],
    }),
    AuthModule.forRoot({
      sessionSecret: 'my-super-secret',
      jwtSercret: 'qwewdasdasd',
      github: {
        clientId: process.env.AUTH_GITHUB_ID,
        clientSecret: process.env.AUTH_GITHUB_SECRET,
        callBackUrl: 'http://localhost:3333/api/auth/github/redirect',
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callBackUrl: 'http://localhost:3333/api/auth/google/redirect',
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Logger, Module } from '@nestjs/common'
import { ChannelService } from './services/channel.service'

import { AuthModule } from '@js-monorepo/auth'
import { ConfigModule } from '@nestjs/config'
import { AuthUser } from '@prisma/client'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AdminController } from './controllers/admin.controller'
import { NotificationController } from './controllers/notification.controller'
import { AdminService } from './services/admin.service'
import { EventsService } from './services/event.service'
import { PrismaService } from './services/prisma.service'

const ENV = process.env.NODE_ENV

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', `.env.${ENV}`, `environments/.env.${ENV}`],
    }),
    AuthModule.forRootAsync({
      imports: [AppModule],
      useFactory: (
        channelService: ChannelService,
        prismaClient: PrismaService
      ) => ({
        dbClient: prismaClient,
        sessionSecret: process.env.SESSION_SECRET,
        jwtSercret: process.env.JWT_SECRET_KEY,
        github: {
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callBackUrl: process.env.GITHUB_REDIRECT_URL,
        },
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callBackUrl: process.env.GOOGLE_REDIRECT_URL,
        },
        redirectUiUrl: process.env.AUTH_LOGIN_REDIRECT,
        onRegister: async (user: AuthUser) => {
          Logger.log(`User: '${user.username}' created successfully 😍`)
          channelService.registerUserToGlobalChannel(user.id)
        },
        onLogin: async (user: AuthUser) => {
          Logger.log(`User: '${user.username}' has successfully logged in 😁`)
        },
      }),
      inject: [ChannelService, PrismaService],
    }),
  ],
  controllers: [AppController, NotificationController, AdminController],
  providers: [
    AppService,
    EventsService,
    PrismaService,
    ChannelService,
    AdminService,
  ],
  exports: [ChannelService, PrismaService],
})
export class AppModule {}

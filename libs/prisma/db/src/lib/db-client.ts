import {
  INestApplication,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    super({
      datasourceUrl: process.env.DATABASE_URL,
      errorFormat: 'pretty',
      log: [
        { level: 'warn', emit: 'event' },
        { level: 'info', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
    })
  }

  async onModuleInit() {
    await this.$connect()
    this.logger.log('Connected to database')

    this.$on('query' as never, (e) => {
      this.logger.log(e)
    })
  }
}

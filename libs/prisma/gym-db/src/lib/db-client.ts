import { Injectable } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { AbstractPrismaService } from '@js-monorepo/prisma-shared'
import { PrismaClient } from './prisma/generated/prisma/client'

const createPrismaClient = (adapter: PrismaPg) => {
  return new PrismaClient({
    adapter,
    errorFormat: 'pretty',
    log: [
      { level: 'query', emit: 'event' },
      { level: 'warn', emit: 'event' },
      { level: 'info', emit: 'event' },
      { level: 'error', emit: 'event' },
    ],
  })
}

type GymPrismaClient = ReturnType<typeof createPrismaClient>

@Injectable()
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class PrismaService extends AbstractPrismaService<GymPrismaClient> {
  protected createPrismaClient(adapter: PrismaPg): GymPrismaClient {
    return createPrismaClient(adapter)
  }
}

// Type augmentation for PrismaService to include PrismaClient methods
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface PrismaService extends GymPrismaClient {}

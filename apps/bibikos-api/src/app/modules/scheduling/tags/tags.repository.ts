import { ClassTag, Prisma } from '@js-monorepo/bibikos-db'

export const ClassTagRepo = Symbol('ClassTagRepo')

export interface ClassTagRepository {
  findAll(): Promise<ClassTag[]>
  findById(id: number): Promise<ClassTag | null>
  findByName(name: string): Promise<ClassTag | null>
  create(data: Prisma.ClassTagCreateInput): Promise<ClassTag>
  update(id: number, data: Prisma.ClassTagUpdateInput): Promise<ClassTag>
  delete(id: number): Promise<void>
}

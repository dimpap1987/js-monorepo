// =============================================================================
// Tag Category Types & Repository
// =============================================================================

export const TagCategoryRepo = Symbol('TagCategoryRepo')

export interface TagCategoryEntity {
  id: number
  createdAt: Date
  updatedAt: Date
  name: string
  slug: string
}

export interface CreateTagCategoryInput {
  name: string
  slug: string
}

export interface UpdateTagCategoryInput {
  name?: string
  slug?: string
}

export interface TagCategoryRepository {
  findAll(): Promise<TagCategoryEntity[]>
  findById(id: number): Promise<TagCategoryEntity | null>
  findBySlug(slug: string): Promise<TagCategoryEntity | null>
  create(data: CreateTagCategoryInput): Promise<TagCategoryEntity>
  update(id: number, data: UpdateTagCategoryInput): Promise<TagCategoryEntity>
  delete(id: number): Promise<void>
}

// =============================================================================
// Tag Types & Repository
// =============================================================================

export const TagRepo = Symbol('TagRepo')

// Mirror of Prisma TagEntityType enum - decoupled from Prisma
export type TagEntityType = 'CLASS' | 'ORGANIZER' | 'LOCATION' | 'PARTICIPANT'

export interface TagEntity {
  id: number
  createdAt: Date
  updatedAt: Date
  name: string
  categoryId: number | null
  applicableTo: TagEntityType[]
}

export interface TagWithCategory extends TagEntity {
  category: TagCategoryEntity | null
}

export interface CreateTagInput {
  name: string
  categoryId?: number
  applicableTo?: TagEntityType[]
}

export interface UpdateTagInput {
  name?: string
  categoryId?: number | null // null to disconnect
  applicableTo?: TagEntityType[]
}

export interface TagRepository {
  findAll(): Promise<TagWithCategory[]>
  findById(id: number): Promise<TagWithCategory | null>
  findByName(name: string): Promise<TagWithCategory | null>
  findByIds(ids: number[]): Promise<TagWithCategory[]>
  findByCategoryId(categoryId: number): Promise<TagWithCategory[]>
  findByEntityType(entityType: TagEntityType): Promise<TagWithCategory[]>
  create(data: CreateTagInput): Promise<TagWithCategory>
  update(id: number, data: UpdateTagInput): Promise<TagWithCategory>
  delete(id: number): Promise<void>
}

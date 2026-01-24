export { TagsModule } from './tags.module'
export { TagService } from './tag.service'
export {
  // Repository interfaces
  TagRepo,
  TagRepository,
  TagCategoryRepo,
  TagCategoryRepository,
  // Entity types
  TagEntity,
  TagCategoryEntity,
  TagWithCategory,
  TagEntityType,
  // Input types
  CreateTagInput,
  UpdateTagInput,
  CreateTagCategoryInput,
  UpdateTagCategoryInput,
} from './repositories/tag.repository'
export {
  // DTOs
  TagResponseDto,
  TagCategoryResponseDto,
  TagEntityTypeDto,
  TAG_ENTITY_TYPES,
  // Zod schemas & types
  CreateTagDto,
  CreateTagSchema,
  UpdateTagDto,
  UpdateTagSchema,
  CreateTagCategoryDto,
  CreateTagCategorySchema,
  UpdateTagCategoryDto,
  UpdateTagCategorySchema,
} from './dto/tag.dto'

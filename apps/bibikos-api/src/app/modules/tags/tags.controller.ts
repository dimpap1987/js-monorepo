import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common'
import { TAG_ENTITY_TYPES, TagEntityTypeDto } from './dto/tag.dto'
import { TagService } from './tag.service'

@Controller('tags')
export class TagsController {
  constructor(private readonly tagService: TagService) {}

  @Get('by-entity-type/:entityType')
  async getTagsByEntityType(@Param('entityType') entityType: string) {
    if (!TAG_ENTITY_TYPES.includes(entityType as TagEntityTypeDto)) {
      return []
    }
    return this.tagService.getTagsByEntityType(entityType as TagEntityTypeDto)
  }

  @Get('tag-categories')
  async getAllTagCategories() {
    return this.tagService.getAllCategories()
  }

  @Get('tag-categories/:id')
  async getTagCategoryById(@Param('id', ParseIntPipe) id: number) {
    return this.tagService.getCategoryById(id)
  }

  @Get('tags')
  async getAllTags() {
    return this.tagService.getAllTags()
  }

  @Get('tags/by-category/:categoryId')
  async getTagsByCategoryId(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.tagService.getTagsByCategoryId(categoryId)
  }

  @Get('tags/:id')
  async getTagById(@Param('id', ParseIntPipe) id: number) {
    return this.tagService.getTagById(id)
  }
}

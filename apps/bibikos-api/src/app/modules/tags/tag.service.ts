import { ApiException } from '@js-monorepo/nest/exceptions'
import { HttpStatus, Inject, Injectable } from '@nestjs/common'
import {
  CreateTagCategoryDto,
  CreateTagDto,
  TagCategoryResponseDto,
  TagEntityTypeDto,
  TagResponseDto,
  UpdateTagCategoryDto,
  UpdateTagDto,
} from './dto/tag.dto'
import {
  TagCategoryRepo,
  TagCategoryRepository,
  TagEntityType,
  TagRepo,
  TagRepository,
  TagWithCategory,
} from './repositories/tag.repository'

@Injectable()
export class TagService {
  constructor(
    @Inject(TagRepo)
    private readonly tagRepo: TagRepository,
    @Inject(TagCategoryRepo)
    private readonly categoryRepo: TagCategoryRepository
  ) {}

  // ===========================================================================
  // Tag Category Operations
  // ===========================================================================

  async getAllCategories(): Promise<TagCategoryResponseDto[]> {
    const categories = await this.categoryRepo.findAll()
    return categories.map((cat) => this.mapCategoryToDto(cat))
  }

  async getCategoryById(id: number): Promise<TagCategoryResponseDto> {
    const category = await this.categoryRepo.findById(id)
    if (!category) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'TAG_CATEGORY_NOT_FOUND')
    }
    return this.mapCategoryToDto(category)
  }

  async createCategory(dto: CreateTagCategoryDto): Promise<TagCategoryResponseDto> {
    const category = await this.categoryRepo.create({
      name: dto.name,
      slug: dto.slug,
    })
    return this.mapCategoryToDto(category)
  }

  async updateCategory(id: number, dto: UpdateTagCategoryDto): Promise<TagCategoryResponseDto> {
    await this.getCategoryById(id)
    const category = await this.categoryRepo.update(id, dto)
    return this.mapCategoryToDto(category)
  }

  async deleteCategory(id: number): Promise<void> {
    await this.getCategoryById(id)
    await this.categoryRepo.delete(id)
  }

  // ===========================================================================
  // Tag Operations
  // ===========================================================================

  async getAllTags(): Promise<TagResponseDto[]> {
    const tags = await this.tagRepo.findAll()
    return tags.map((tag) => this.mapTagToDto(tag))
  }

  async getTagById(id: number): Promise<TagResponseDto> {
    const tag = await this.tagRepo.findById(id)
    if (!tag) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'TAG_NOT_FOUND')
    }
    return this.mapTagToDto(tag)
  }

  async getTagsByIds(ids: number[]): Promise<TagResponseDto[]> {
    const tags = await this.tagRepo.findByIds(ids)
    return tags.map((tag) => this.mapTagToDto(tag))
  }

  async getTagsByCategoryId(categoryId: number): Promise<TagResponseDto[]> {
    const tags = await this.tagRepo.findByCategoryId(categoryId)
    return tags.map((tag) => this.mapTagToDto(tag))
  }

  async getTagsByEntityType(entityType: TagEntityTypeDto): Promise<TagResponseDto[]> {
    const tags = await this.tagRepo.findByEntityType(entityType as TagEntityType)
    return tags.map((tag) => this.mapTagToDto(tag))
  }

  async createTag(dto: CreateTagDto): Promise<TagResponseDto> {
    if (dto.categoryId) {
      await this.getCategoryById(dto.categoryId)
    }
    const tag = await this.tagRepo.create({
      name: dto.name,
      categoryId: dto.categoryId,
      applicableTo: dto.applicableTo as TagEntityType[],
    })
    return this.mapTagToDto(tag)
  }

  async updateTag(id: number, dto: UpdateTagDto): Promise<TagResponseDto> {
    await this.getTagById(id)
    if (dto.categoryId) {
      await this.getCategoryById(dto.categoryId)
    }
    const tag = await this.tagRepo.update(id, {
      name: dto.name,
      categoryId: dto.categoryId,
      applicableTo: dto.applicableTo as TagEntityType[],
    })
    return this.mapTagToDto(tag)
  }

  async deleteTag(id: number): Promise<void> {
    await this.getTagById(id)
    await this.tagRepo.delete(id)
  }

  // ===========================================================================
  // Private Helpers
  // ===========================================================================

  private mapCategoryToDto(category: { id: number; name: string; slug: string }): TagCategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
    }
  }

  private mapTagToDto(tag: TagWithCategory): TagResponseDto {
    return {
      id: tag.id,
      name: tag.name,
      category: tag.category ? this.mapCategoryToDto(tag.category) : null,
      applicableTo: tag.applicableTo as TagEntityTypeDto[],
    }
  }
}

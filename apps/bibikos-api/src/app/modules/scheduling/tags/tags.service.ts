import { ApiException } from '@js-monorepo/nest/exceptions'
import { Prisma } from '@js-monorepo/prisma-shared'
import { HttpStatus, Inject, Injectable } from '@nestjs/common'
import { CreateTagDto, TagResponseDto, UpdateTagDto } from './dto/tag.dto'
import { ClassTagRepo, ClassTagRepository } from './tags.repository'

@Injectable()
export class ClassTagService {
  constructor(
    @Inject(ClassTagRepo)
    private readonly tagRepo: ClassTagRepository
  ) {}

  async getAllTags(): Promise<TagResponseDto[]> {
    const tags = await this.tagRepo.findAll()
    return tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
    }))
  }

  async createTag(dto: CreateTagDto): Promise<TagResponseDto> {
    try {
      const tag = await this.tagRepo.create({ name: dto.name })
      return { id: tag.id, name: tag.name }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = (error.meta as { target?: string[] })?.target
          if (target?.includes('name')) {
            throw new ApiException(HttpStatus.CONFLICT, 'TAG_NAME_ALREADY_EXISTS')
          }
        }
      }
      throw error
    }
  }

  async updateTag(id: number, dto: UpdateTagDto): Promise<TagResponseDto> {
    const updatedTag = await this.tagRepo.update(id, dto)
    return { id: updatedTag.id, name: updatedTag.name }
  }

  async deleteTag(id: number): Promise<void> {
    return this.tagRepo.delete(id)
  }
}

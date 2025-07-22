import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException, // ✅ Thêm để dùng cho fallback error
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { CreateArticleDto } from './dtos/create-article-request.dto';
import { UpdateArticleDto } from './dtos/update-article-request.dto';
import { buildArticleResponse } from './helpers/build-article-response';
import { User } from '@prisma/client';
import { generateSlug } from './helpers/slug-generate';
import { ArticleResponseDto } from './dtos/article-response.dto';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async createArticle(
    currentUser: User,
    dto: CreateArticleDto,
  ): Promise<ArticleResponseDto> {
    try {
      const slug = generateSlug(dto.title);

      const article = await this.prisma.article.create({
        data: {
          ...dto,
          slug,
          authorId: currentUser.id,
          tagList: {
            connectOrCreate: dto.tagList.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        },
        include: {
          tagList: true,
          favoritedBy: true,
          author: {
            include: {
              followers: true,
            },
          },
        },
      });

      return buildArticleResponse(article, currentUser);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to create article');
    }
  }

  async getArticleBySlug(
    slug: string,
    currentUser?: User,
  ): Promise<ArticleResponseDto> {
    try {
      const article = await this.findArticleOrThrow(slug);
      return buildArticleResponse(article, currentUser);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch article');
    }
  }

  async updateArticle(
    slug: string,
    currentUser: User,
    updateDto: UpdateArticleDto,
  ): Promise<ArticleResponseDto> {
    try {
      const article = await this.findArticleOrThrow(slug);

      if (article.authorId !== currentUser.id) {
        throw new ForbiddenException('You are not the author of this article');
      }

      const newSlug = updateDto.title
        ? generateSlug(updateDto.title)
        : undefined;

      const updated = await this.prisma.article.update({
        where: { slug },
        data: {
          ...updateDto,
          slug: newSlug,
        },
        include: {
          tagList: { select: { name: true } },
          author: {
            include: {
              followers: true,
            },
          },
          favoritedBy: true,
        },
      });

      return buildArticleResponse(updated, currentUser);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to update article');
    }
  }

  async deleteArticle(slug: string, currentUserId: number): Promise<void> {
    try {
      const article = await this.findArticleOrThrow(slug);
      if (article.authorId !== currentUserId) {
        throw new ForbiddenException('You are not the author of this article');
      }

      await this.prisma.article.delete({
        where: { slug },
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to delete article');
    }
  }

  private async findArticleOrThrow(slug: string) {
    try {
      const article = await this.prisma.article.findUnique({
        where: { slug },
        include: {
          author: {
            include: {
              followers: true,
            },
          },
          tagList: true,
          favoritedBy: true,
        },
      });

      if (!article) {
        throw new NotFoundException('Article not found');
      }

      return article;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch article');
    }
  }
}

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { CreateArticleDto } from './dtos/create-article-request.dto';
import { UpdateArticleDto } from './dtos/update-article-request.dto';
import { QueryArticlesDto } from './dtos/query-articles.dto';
import {
  buildSingleArticleResponse,
  buildMultipleArticlesResponse,
} from './helpers/build-article-response';
import { User } from '@prisma/client';
import { generateSlug } from './helpers/slug-generate';
import {
  SingleArticleResponseDto,
  MultipleArticlesResponseDto,
} from './dtos/article-response.dto';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async createArticle(
    currentUser: User,
    dto: CreateArticleDto,
  ): Promise<SingleArticleResponseDto> {
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

      return buildSingleArticleResponse(article, currentUser);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to create article');
    }
  }

  async getArticleBySlug(
    slug: string,
    currentUser?: User,
  ): Promise<SingleArticleResponseDto> {
    try {
      const article = await this.findArticleOrThrow(slug);
      return buildSingleArticleResponse(article, currentUser);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch article');
    }
  }

  async updateArticle(
    slug: string,
    currentUser: User,
    updateDto: UpdateArticleDto,
  ): Promise<SingleArticleResponseDto> {
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

      return buildSingleArticleResponse(updated, currentUser);
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

  async favoriteArticle(
    slug: string,
    currentUser: User,
  ): Promise<SingleArticleResponseDto> {
    const userId = currentUser.id;

    const article = await this.findArticleOrThrow(slug);

    const alreadyFavorited = article.favoritedBy.some(
      (user) => user.id === userId,
    );

    if (alreadyFavorited) {
      throw new BadRequestException('You have already favorited this article');
    }

    await this.prisma.article.update({
      where: { id: article.id },
      data: {
        favoritedBy: {
          connect: { id: userId },
        },
      },
    });

    const updatedArticle = await this.findArticleOrThrow(slug);

    return buildSingleArticleResponse(updatedArticle, currentUser);
  }

  async unfavoriteArticle(
    slug: string,
    currentUser: User,
  ): Promise<SingleArticleResponseDto> {
    const userId = currentUser.id;

    const article = await this.findArticleOrThrow(slug);

    const alreadyFavorited = article.favoritedBy.some(
      (user) => user.id === userId,
    );

    if (!alreadyFavorited) {
      throw new BadRequestException('You have not favorited this article');
    }

    await this.prisma.article.update({
      where: { id: article.id },
      data: {
        favoritedBy: {
          disconnect: { id: userId },
        },
      },
    });

    const updatedArticle = await this.findArticleOrThrow(slug);

    return buildSingleArticleResponse(updatedArticle, currentUser);
  }

  async getListArticles(
    query: QueryArticlesDto,
    currentUser?: User | null,
  ): Promise<MultipleArticlesResponseDto> {
    const { tag, author, favorited, limit = 20, offset = 0 } = query;
    const where: any = {};

    if (tag) {
      where.tagList = {
        some: { name: tag },
      };
    }

    if (author) {
      const foundAuthor = await this.prisma.user.findUnique({
        where: { username: author },
      });

      if (!foundAuthor) {
        return { articles: [], articlesCount: 0 };
      }

      where.authorId = foundAuthor.id;
    }

    if (favorited) {
      const favoriter = await this.prisma.user.findUnique({
        where: { username: favorited },
        include: { favorites: true },
      });

      if (!favoriter || favoriter.favorites.length === 0) {
        return { articles: [], articlesCount: 0 };
      }

      const favoritedArticleIds = favoriter.favorites.map((a) => a.id);
      where.id = { in: favoritedArticleIds };
    }

    const [articles, articlesCount] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tagList: true,
          favoritedBy: true,
          author: {
            include: {
              followers: true,
            },
          },
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    return buildMultipleArticlesResponse(articles, articlesCount, currentUser);
  }

  async getFeedArticles(
    query: QueryArticlesDto,
    currentUser: User,
  ): Promise<MultipleArticlesResponseDto> {
    const { limit = 20, offset = 0 } = query;

    const following = await this.prisma.userFollow.findMany({
      where: { followerId: currentUser.id },
      select: { followingId: true },
    });

    const followedUserIds = following.map((f) => f.followingId);

    if (followedUserIds.length === 0) {
      return { articles: [], articlesCount: 0 };
    }

    const [articles, articlesCount] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where: { authorId: { in: followedUserIds } },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tagList: true,
          favoritedBy: true,
          author: {
            include: {
              followers: true,
            },
          },
        },
      }),
      this.prisma.article.count({
        where: { authorId: { in: followedUserIds } },
      }),
    ]);

    return buildMultipleArticlesResponse(articles, articlesCount, currentUser);
  }

  private async findArticleOrThrow(slug: string) {
    console.log('Looking for article with slug:', slug);
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          include: { followers: true },
        },
        tagList: true,
        favoritedBy: true,
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }
}

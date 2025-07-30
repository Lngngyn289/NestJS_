// src/articles/utils/article-response.builder.ts

import { plainToInstance } from 'class-transformer';
import {
  ArticleDto,
  SingleArticleResponseDto,
  MultipleArticlesResponseDto,
} from '../dtos/article-response.dto';
import { Article, User } from '@prisma/client';

type ExtendedArticle = Article & {
  tagList?: { name: string }[];
  author?: Partial<User> & {
    followers?: { followerId: number }[];
  };
  favoritedBy?: { id: number }[];
};

export function buildSingleArticleResponse(
  article: ExtendedArticle,
  currentUser?: User | null,
): SingleArticleResponseDto {
  const articleDto = buildArticleDto(article, currentUser);
  return { article: articleDto };
}

export function buildMultipleArticlesResponse(
  articles: ExtendedArticle[],
  articlesCount: number,
  currentUser?: User | null,
): MultipleArticlesResponseDto {
  const articleDtos = articles.map((article) =>
    buildArticleDto(article, currentUser),
  );

  return {
    articles: articleDtos,
    articlesCount,
  };
}

function buildArticleDto(
  article: ExtendedArticle,
  currentUser?: User | null,
): ArticleDto {
  const tagList = article.tagList?.map((tag) => tag.name) ?? [];
  const favorites = article.favoritedBy ?? [];

  const favorited =
    !!currentUser && favorites.some((user) => user.id === currentUser.id);

  const followers = article.author?.followers ?? [];

  const following =
    !!currentUser &&
    followers.some((follower) => follower.followerId === currentUser.id);

  return plainToInstance(
    ArticleDto,
    {
      slug: article.slug,
      title: article.title,
      description: article.description,
      body: article.body,
      tagList,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      favorited,
      favoritesCount: favorites.length,
      author: {
        username: article.author?.username ?? '',
        bio: article.author?.bio ?? null,
        image: article.author?.image ?? null,
        following,
      },
    },
    { excludeExtraneousValues: true },
  );
}

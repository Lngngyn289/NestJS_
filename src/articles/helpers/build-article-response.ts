import { plainToInstance } from 'class-transformer';
import { ArticleResponseDto } from '../dtos/article-response.dto';
import { ArticleDto } from '../dtos/article.dto';
import { Article, User } from '@prisma/client';

export function buildArticleResponse(
  article: Article & {
    tagList?: { name: string }[];
    author?: Partial<User> & {
      followers?: { followerId: number }[];
    };
    favoritedBy?: { id: number }[];
  },
  currentUser?: User | null,
): ArticleResponseDto {
  const tagList = Array.isArray(article.tagList)
    ? article.tagList.map((tag) => tag.name)
    : [];

  const favorites = Array.isArray(article.favoritedBy)
    ? article.favoritedBy
    : [];

  const favorited =
    !!currentUser && favorites.some((user) => user.id === currentUser.id);

  const followers = Array.isArray(article.author?.followers)
    ? article.author!.followers
    : [];

  const following =
    !!currentUser &&
    followers.some((follower) => follower.followerId === currentUser.id);

  const articleDto = plainToInstance(ArticleDto, {
    ...article,
    tagList,
    favorited,
    favoritesCount: favorites.length,
    author: {
      username: article.author?.username ?? '',
      bio: article.author?.bio ?? '',
      image: article.author?.image ?? '',
      following,
    },
  });

  return { article: articleDto };
}

// helpers/article.helper.ts
import { plainToInstance } from 'class-transformer';
import { ArticleResponseDto } from '../dtos/article-response.dto';
import { ArticleDto } from '../dtos/article.dto';
import { Article, User } from '@prisma/client';

export function buildArticleResponse(
  article: Article & {
    tagList: { name: string }[];
    author: User & {
      followers?: { followerId: number }[];
    };
    favoritedBy: { id: number }[];
  },
  currentUser?: User | null,
): ArticleResponseDto {
  let favorited = false;
  let following = false;

  if (currentUser) {
    favorited = article.favoritedBy.some((user) => user.id === currentUser.id);

    following =
      article.author.followers?.some(
        (follower) => follower.followerId === currentUser.id,
      ) || false;
  }

  const articleDto = plainToInstance(ArticleDto, {
    ...article,
    tagList: article.tagList.map((t) => t.name),
    favorited,
    favoritesCount: article.favoritedBy.length,
    author: {
      username: article.author.username,
      bio: article.author.bio,
      image: article.author.image,
      following,
    },
  });

  return { article: articleDto };
}

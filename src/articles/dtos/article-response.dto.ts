import { Expose, Type } from 'class-transformer';

export class AuthorDto {
  @Expose()
  username: string;

  @Expose()
  bio: string | null;

  @Expose()
  image: string | null;

  @Expose()
  following: boolean;
}

export class ArticleDto {
  @Expose()
  slug: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  body: string;

  @Expose()
  tagList: string[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  favorited: boolean;

  @Expose()
  favoritesCount: number;

  @Expose()
  @Type(() => AuthorDto)
  author: AuthorDto;
}

export class SingleArticleResponseDto {
  @Expose()
  @Type(() => ArticleDto)
  article: ArticleDto;
}

export class MultipleArticlesResponseDto {
  @Expose()
  @Type(() => ArticleDto)
  articles: ArticleDto[];

  @Expose()
  articlesCount: number;
}

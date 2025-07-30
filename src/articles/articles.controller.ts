import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { HttpCode } from '@nestjs/common/decorators/http/http-code.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { User } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { CreateArticleRequestDto } from './dtos/create-article-request.dto';
import { UpdateArticleRequestDto } from './dtos/update-article-request.dto';
import {
  SingleArticleResponseDto,
  MultipleArticlesResponseDto,
} from './dtos/article-response.dto';
import { QueryArticlesDto } from './dtos/query-articles.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get('/feed')
  async getFeedArticles(
    @Query() query: QueryArticlesDto,
    @CurrentUser() currentUser: User,
  ): Promise<MultipleArticlesResponseDto> {
    return this.articlesService.getFeedArticles(query, currentUser);
  }

  @Public()
  @Get(':slug')
  getArticleBySlug(
    @Param('slug') slug: string,
    @CurrentUser() currentUser?: User,
  ): Promise<SingleArticleResponseDto> {
    return this.articlesService.getArticleBySlug(slug, currentUser);
  }

  @Post()
  async createArticle(
    @CurrentUser() currentUser: User,
    @Body() createArticleRequest: CreateArticleRequestDto,
  ): Promise<SingleArticleResponseDto> {
    const dto = createArticleRequest.article;
    return this.articlesService.createArticle(currentUser, dto);
  }

  @Put(':slug')
  async updateArticle(
    @Param('slug') slug: string,
    @Body() body: UpdateArticleRequestDto,
    @CurrentUser() currentUser: User,
  ): Promise<SingleArticleResponseDto> {
    return this.articlesService.updateArticle(slug, currentUser, body.article);
  }

  @Delete(':slug')
  @HttpCode(204)
  async deleteArticleBySlug(
    @Param('slug') slug: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.articlesService.deleteArticle(slug, user.id);
  }

  @Post(':slug/favorite')
  async favoriteArticle(
    @Param('slug') slug: string,
    @CurrentUser() currentUser: User,
  ): Promise<SingleArticleResponseDto> {
    return this.articlesService.favoriteArticle(slug, currentUser);
  }

  @Delete(':slug/favorite')
  async unfavoriteArticle(
    @Param('slug') slug: string,
    @CurrentUser() currentUser: User,
  ): Promise<SingleArticleResponseDto> {
    return this.articlesService.unfavoriteArticle(slug, currentUser);
  }

  @Get()
  async getListArticles(
    @Query() query: QueryArticlesDto,
    @CurrentUser() currentUser?: User | null,
  ): Promise<MultipleArticlesResponseDto> {
    return this.articlesService.getListArticles(query, currentUser);
  }
}

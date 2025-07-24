import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleRequestDto } from './dtos/create-article-request.dto';
import { UpdateArticleRequestDto } from './dtos/update-article-request.dto';
import { HttpCode } from '@nestjs/common/decorators/http/http-code.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { User } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { ArticleResponseDto } from './dtos/article-response.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Public()
  @Get(':slug')
  getArticleBySlug(
    @Param('slug') slug: string,
    @CurrentUser() currentUser?: User,
  ): Promise<ArticleResponseDto> {
    return this.articlesService.getArticleBySlug(slug, currentUser);
  }

  @Post()
  async createArticle(
    @CurrentUser() currentUser: User,
    @Body() createArticleRequest: CreateArticleRequestDto,
  ): Promise<ArticleResponseDto> {
    const dto = createArticleRequest.article;
    return this.articlesService.createArticle(currentUser, dto);
  }

  @Put(':slug')
  async updateArticle(
    @Param('slug') slug: string,
    @Body() body: UpdateArticleRequestDto,
    @CurrentUser() currentUser: User,
  ): Promise<ArticleResponseDto> {
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
  ): Promise<ArticleResponseDto> {
    return this.articlesService.favoriteArticle(slug, currentUser);
  }

  @Delete(':slug/favorite')
  async unfavoriteArticle(
    @Param('slug') slug: string,
    @CurrentUser() currentUser: User,
  ): Promise<ArticleResponseDto> {
    return this.articlesService.unfavoriteArticle(slug, currentUser);
  }
}

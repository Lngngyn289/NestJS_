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
// import { DeleteArticleParamsDto } from './dto/delete-article-params.dto';
import { CurrentUser } from '../common/decorators/user.decorator';
import { User } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Public()
  @Get(':slug')
  getArticleBySlug(@Param('slug') slug: string) {
    return this.articlesService.getArticleBySlug(slug);
  }

  @Post()
  async createArticle(
    @CurrentUser() currentUser: User,
    @Body() createArticleRequest: CreateArticleRequestDto,
  ) {
    const dto = createArticleRequest.article;
    return this.articlesService.createArticle(currentUser, dto);
  }

  @Put(':slug')
  async updateArticle(
    @Param('slug') slug: string,
    @Body() body: UpdateArticleRequestDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.articlesService.updateArticle(slug, currentUser, body.article);
  }

  @Delete(':slug')
  async deleteArticleBySlug(
    @Param('slug') slug: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.articlesService.deleteArticle(slug, user.id);
  }
}

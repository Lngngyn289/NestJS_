import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentRequestDto } from './dtos/create-comment-request.dto';
import { CurrentUser } from '../common/decorators/user.decorator';
import { User } from '@prisma/client';
import {
  SingleCommentResponseDto,
  MultipleCommentsResponseDto,
} from './dtos/comment-response.dto';

@Controller('articles/:slug/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async createComment(
    @Param('slug') slug: string,
    @Body() createCommentRequestDto: CreateCommentRequestDto,
    @CurrentUser() currentUser: User,
  ): Promise<SingleCommentResponseDto> {
    return this.commentsService.createComment(
      slug,
      currentUser.id,
      createCommentRequestDto.comment,
    );
  }

  @Get()
  async getAllCommentsArticle(
    @Param('slug') slug: string,
    @CurrentUser() currentUser: User,
  ): Promise<MultipleCommentsResponseDto> {
    return this.commentsService.getAllCommentsArticle(slug, currentUser?.id);
  }
}

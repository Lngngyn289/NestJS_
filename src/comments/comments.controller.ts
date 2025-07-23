import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentRequestDto } from './dtos/create-comment-request.dto';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { User } from '@prisma/client';
import {
  SingleCommentResponseDto,
  MultipleCommentsResponseDto,
} from './dtos/comment-response.dto';
import { HttpCode } from '@nestjs/common/decorators/http/http-code.decorator';
import { ParseIntPipe } from '@nestjs/common/pipes/parse-int.pipe';
import { CommentOwnerGuard } from '../common/guards/comment-owner.guard';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';

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

  @Public()
  @Get()
  async getAllCommentsArticle(
    @Param('slug') slug: string,
    @CurrentUser() currentUser: User,
  ): Promise<MultipleCommentsResponseDto> {
    return this.commentsService.getAllCommentsArticle(slug, currentUser?.id);
  }

  @UseGuards(CommentOwnerGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteComment(
    @Param('id', new ParseIntPipe()) commentId: number,
  ): Promise<void> {
    return this.commentsService.deleteComment(commentId);
  }
}

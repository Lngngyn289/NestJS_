import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import {
  buildSingleCommentResponse,
  buildMultipleCommentsResponse,
} from './helpers/build-comment-response';
import { User, Article } from '@prisma/client';
import { CreateCommentDto } from './dtos/create-comment-request.dto';
import { PrismaService } from '../prisma/prisma.service';
import {
  SingleCommentResponseDto,
  MultipleCommentsResponseDto,
} from './dtos/comment-response.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createComment(
    slug: string,
    userId: number,
    createCommentDto: CreateCommentDto,
  ): Promise<SingleCommentResponseDto> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const comment = await this.prisma.comment.create({
      data: {
        body: createCommentDto.body,
        author: { connect: { id: userId } },
        article: { connect: { id: article.id } },
      },
      include: {
        author: {
          include: {
            followers: true,
          },
        },
      },
    });

    return buildSingleCommentResponse(comment, userId);
  }

  async getAllCommentsArticle(
    slug: string,
    currentUserId: number | null = null,
  ): Promise<MultipleCommentsResponseDto> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const comments = await this.prisma.comment.findMany({
      where: { articleId: article.id },
      include: {
        author: {
          include: {
            followers: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return buildMultipleCommentsResponse(comments, currentUserId);
  }
}

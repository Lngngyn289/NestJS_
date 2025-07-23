import { Injectable } from '@nestjs/common';
import {
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common/exceptions';
import {
  buildSingleCommentResponse,
  buildMultipleCommentsResponse,
} from './helpers/build-comment-response';
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
    try {
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
    } catch (error) {
      throw new InternalServerErrorException('Failed to create comment');
    }
  }

  async getAllCommentsArticle(
    slug: string,
    currentUserId: number | null = null,
  ): Promise<MultipleCommentsResponseDto> {
    try {
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
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch comments');
    }
  }

  async deleteComment(commentId: number) {
    try {
      await this.prisma.comment.delete({
        where: { id: commentId },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete comment');
    }
  }
}

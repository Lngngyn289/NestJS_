import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommentOwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const currUser = request.user;
    const commentId = parseInt(request.params.id, 10);
    const articleSlug = request.params.slug;

    if (!currUser) {
      throw new ForbiddenException('Unauthorized');
    }

    if (isNaN(commentId)) {
      throw new BadRequestException('Invalid comment ID');
    }

    const article = await this.prisma.article.findUnique({
      where: { slug: articleSlug },
    });

    if (!article) {
      throw new BadRequestException('Article not found');
    }

    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new BadRequestException('Comment not found');
    }

    if (comment.authorId !== currUser.id) {
      throw new ForbiddenException(
        'You are not authorized to modify this comment',
      );
    }

    return true;
  }
}

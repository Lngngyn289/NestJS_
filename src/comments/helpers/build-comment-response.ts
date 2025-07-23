import { Comment, User } from '@prisma/client';

interface CommentWithAuthor extends Comment {
  author: User & {
    followers?: { followerId: number }[];
  };
}

export interface Profile {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
}

function buildAuthorProfile(
  author: User & { followers?: { followerId: number }[] },
  currentUserId: number | null,
): Profile {
  const following =
    currentUserId != null &&
    author.followers?.some((f) => f.followerId === currentUserId) === true;

  return {
    username: author.username,
    bio: author.bio,
    image: author.image,
    following,
  };
}

export function buildSingleCommentResponse(
  comment: CommentWithAuthor,
  currentUserId: number | null,
) {
  return {
    comment: {
      id: comment.id,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      body: comment.body,
      author: buildAuthorProfile(comment.author, currentUserId),
    },
  };
}

export function buildMultipleCommentsResponse(
  comments: CommentWithAuthor[],
  currentUserId: number | null,
) {
  return {
    comments: comments.map((comment) => ({
      id: comment.id,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      body: comment.body,
      author: buildAuthorProfile(comment.author, currentUserId),
    })),
  };
}

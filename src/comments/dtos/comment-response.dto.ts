export class ProfileDto {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
}

export class CommentDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  body: string;
  author: ProfileDto;
}

export class SingleCommentResponseDto {
  comment: CommentDto;
}

export class MultipleCommentsResponseDto {
  comments: CommentDto[];
}

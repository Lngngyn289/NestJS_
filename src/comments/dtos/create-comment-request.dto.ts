import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCommentDto {
  @IsString()
  body: string;
}

export class CreateCommentRequestDto {
  @ValidateNested()
  @Type(() => CreateCommentDto)
  comment: CreateCommentDto;
}

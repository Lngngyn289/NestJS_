import { IsOptional, IsString } from 'class-validator';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateArticleDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  body?: string;
}

export class UpdateArticleRequestDto {
  @ValidateNested()
  @Type(() => UpdateArticleDto)
  article: UpdateArticleDto;
}

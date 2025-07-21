import { IsNotEmpty, IsString, IsArray } from 'class-validator';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateArticleDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  body: string;

  @IsArray()
  @IsString({ each: true })
  tagList: string[];
}

export class CreateArticleRequestDto {
  @ValidateNested()
  @Type(() => CreateArticleDto)
  @IsNotEmpty()
  article: CreateArticleDto;
}

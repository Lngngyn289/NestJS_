import { IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateUserDto } from './update-user.dto';

export class UpdateUserRequestDto {
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateUserDto)
  user: UpdateUserDto;
}

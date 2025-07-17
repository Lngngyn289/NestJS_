import { Type } from 'class-transformer';
import { IsObject, ValidateNested } from 'class-validator';
import { CreateUserDto } from 'src/user/dtos/create-user.dto'

export class RegisterRequestDto {
  @IsObject()
  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;
}
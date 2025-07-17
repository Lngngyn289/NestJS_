import { Type } from 'class-transformer';
import { IsObject, ValidateNested } from 'class-validator';
import { LoginUserDto } from 'src/user/dtos/login-user.dto';
export class LoginRequestDto {
    @IsObject()
    @ValidateNested()
    @Type(() => LoginUserDto)
    user: LoginUserDto;
}
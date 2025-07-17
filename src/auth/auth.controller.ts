import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dtos/create-user.dto';
import { Body, Post } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { RegisterRequestDto } from './dtos/request-register.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
   
    @Public()
    @Post('register')
    register(@Body() registerDto: RegisterRequestDto) {
      return this.authService.register(registerDto.user);
  }

}

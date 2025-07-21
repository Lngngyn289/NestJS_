import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequestDto } from './dtos/request-register.dto';
import { LoginRequestDto } from './dtos/request-login.dto';
import { Body, Post } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterRequestDto) {
    return this.authService.register(registerDto.user);
  }

  @Public()
  @Post('login')
  async login(@Body() loginRequestDto: LoginRequestDto) {
    return this.authService.loginWithCredentials(loginRequestDto);
  }
}

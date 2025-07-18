import { Controller, Body, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly UsersService: UsersService) {}

  @Post()
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.UsersService.createUser(createUserDto);
  }
}

import { Controller, Body, Post, Get, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { User } from '@prisma/client';
import { UpdateUserRequestDto } from './dtos/update-user-request.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getCurrentUser(@CurrentUser() user: User) {
    return this.usersService.getCurrentUser(user.id);
  }

  @Put()
  updateUser(
    @Body() updateUserRequestDto: UpdateUserRequestDto,
    @CurrentUser() user: User,
  ) {
    return this.usersService.updateUser(user.id, updateUserRequestDto.user);
  }
}

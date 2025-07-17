import { Controller, Body, Post } from '@nestjs/common';

import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService){}

    @Post()
    async register(@Body() createUserDto: CreateUserDto) {
        return await this.userService.createUser(createUserDto);
    }
}


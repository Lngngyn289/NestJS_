import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dtos/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
    constructor(
    private usersService: UserService,
    private jwtService: JwtService
  ) {}

  async register(dto: CreateUserDto) {
    const emailExists = await this.usersService.findByEmail(dto.email);
    if (emailExists) throw new BadRequestException('Email already exists');

    const usernameExists = await this.usersService.findByUsername(dto.username);
    if (usernameExists) throw new BadRequestException('Username already exists');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.createUser({
      email: dto.email,
      username: dto.username,
      password: hashed,
    });

    return { message: 'User registered', user: { email: user.email, username: user.username } };
  }
}

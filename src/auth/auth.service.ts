import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { buildUserWithTokenResponse } from 'src/users/helpers/build-user-response';
import { buildUserResponse } from 'src/users/helpers/build-user-response';
import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto) {
    const emailExists = await this.usersService.findByEmail(dto.email);
    if (emailExists) throw new BadRequestException('Email already exists');

    const usernameExists = await this.usersService.findByUsername(dto.username);
    if (usernameExists)
      throw new BadRequestException('Username already exists');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.createUser({
      email: dto.email,
      username: dto.username,
      password: hashed,
    });
    return buildUserWithTokenResponse(user, this.jwtService);
  }

  private async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Email is not registered');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Wrong password');

    const { password: _, ...rest } = user;
    return rest;
  }

  private async login(user: Omit<User, 'password'>) {
    return buildUserWithTokenResponse(user, this.jwtService);
  }

  async loginWithCredentials(loginRequestDto: {
    user: { email: string; password: string };
  }) {
    const { email, password } = loginRequestDto.user;
    const user = await this.validateUser(email, password);
    return this.login(user);
  }
}

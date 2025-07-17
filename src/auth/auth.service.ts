import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dtos/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
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


  async validateUser(email: string, password: string): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.findByEmail(email);
    if(!user) {
      throw new UnauthorizedException('Email is not registered');
    }
    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Wrong Password');
    } 
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(user: Omit<User, 'password'>) {
    const payload = { email: user.email, username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: { email: user.email, username: user.username },
    };
  }
}
